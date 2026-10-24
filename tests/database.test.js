import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

test('foundation migration and database security', async t => {
  const db = new PGlite();
  try {
    // Minimal Supabase platform stand-ins; these tests execute actual PostgreSQL RLS.
    // They do not verify Supabase Auth, HTTP APIs, signed URLs or Storage service behavior.
    await db.exec(`
      create role anon nologin;
      create role authenticated nologin;
      create schema auth;
      create table auth.users (id uuid primary key, email text);
      create function auth.uid() returns uuid language sql stable as $$
        select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
      $$;
      grant usage on schema auth to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;
      create schema storage;
      create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
      create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets(id), name text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to anon, authenticated;
      grant select, insert, update, delete on storage.objects to anon, authenticated;
    `);
    const files = (await readdir(new URL('../supabase/migrations/', import.meta.url))).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) await db.exec(await readFile(new URL(`../supabase/migrations/${file}`, import.meta.url), 'utf8'));
    const admin = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const customer = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    await db.exec(`
      insert into auth.users values ('${admin}', 'admin@example.test'), ('${customer}', 'customer@example.test');
      insert into private.admin_users (user_id) values ('${admin}');
      insert into public.categories (id, name, slug, active) values
        ('11111111-1111-4111-8111-111111111111','Published','published', true),
        ('22222222-2222-4222-8222-222222222222','Hidden','hidden',false);
      insert into public.products (name, slug, price, category_id, active) values
        ('Visible bag','visible-bag',450,'11111111-1111-4111-8111-111111111111',true),
        ('Draft bag','draft-bag',450,null,false),
        ('Hidden category bag','hidden-category-bag',450,'22222222-2222-4222-8222-222222222222',true);
      insert into public.hair_services (name,slug,active) values ('Braids','braids',true),('Draft','draft',false);
      insert into public.bank_settings (bank_name,account_holder,account_number,branch_code,account_type) values ('Test','Test','0000','0000','Test');
      insert into public.orders (customer_name,customer_phone,fulfilment_method,subtotal,total) values ('Test customer','0123456789','collection',450,450);
      insert into public.order_items (order_id,product_id,product_name,product_slug,quantity,unit_price)
        select o.id,p.id,p.name,p.slug,1,p.price from public.orders o cross join public.products p where p.slug='visible-bag';
      insert into public.payment_proofs (order_id,storage_path,original_filename) select id,'order/proof.pdf','proof.pdf' from public.orders;
      insert into storage.objects (bucket_id,name) values ('payment-proofs','order/proof.pdf'),('product-images','bag.jpg');
    `);
    async function asRole(role, user, operation) {
      await db.exec(`set role ${role}; set request.jwt.claim.sub = '${user || ''}';`);
      try { return await operation(); } finally { await db.exec('reset role; reset request.jwt.claim.sub;'); }
    }
    await t.test('all public tables and private membership enable RLS', async () => {
      const { rows } = await db.query("select relname from pg_class c join pg_namespace n on c.relnamespace=n.oid where n.nspname in ('public','private') and c.relkind='r' and not c.relrowsecurity");
      assert.deepEqual(rows, []);
    });
    await t.test('anonymous users read only public active catalogue and safe settings', () => asRole('anon', null, async () => {
      assert.deepEqual((await db.query('select slug from public.products')).rows, [{ slug: 'visible-bag' }]);
      assert.equal((await db.query('select * from public.categories')).rows.length, 1);
      assert.equal((await db.query('select * from public.hair_services')).rows.length, 1);
      assert.equal((await db.query('select * from public.store_settings')).rows.length, 1);
      for (const table of ['orders', 'order_items', 'payment_proofs', 'bank_settings']) {
        await assert.rejects(db.query(`select * from public.${table}`), /permission denied/i);
      }
      await assert.rejects(db.query("insert into public.products(name,slug,price) values('Attack','attack',0)"), /permission denied/i);
    }));
    await t.test('ordinary signed-in users cannot read private records, self-promote or mutate catalogue', () => asRole('authenticated', customer, async () => {
      assert.equal((await db.query('select public.is_admin() as allowed')).rows[0].allowed, false);
      for (const table of ['orders', 'order_items', 'payment_proofs', 'bank_settings']) assert.equal((await db.query(`select * from public.${table}`)).rows.length, 0);
      await assert.rejects(db.query(`insert into private.admin_users(user_id) values('${customer}')`), /permission denied/i);
      await assert.rejects(db.query("insert into public.products(name,slug,price) values('Attack','attack',0)"), /row-level security/i);
      assert.equal((await db.query("update public.products set price=0 returning id")).rows.length, 0);
      assert.equal((await db.query("update public.orders set payment_status='payment_confirmed' returning id")).rows.length, 0);
    }));
    await t.test('clients cannot create orders, forge totals or rewrite snapshots', () => asRole('authenticated', admin, async () => {
      await assert.rejects(db.query("insert into public.orders(customer_name,customer_phone,fulfilment_method,subtotal,total) values('Bad','0123456789','collection',0,0)"), /permission denied/i);
      await assert.rejects(db.query('update public.orders set total=0'), /permission denied/i);
      await assert.rejects(db.query("update public.order_items set product_name='Rewrite'"), /permission denied/i);
    }));
    await t.test('administrators can read private records, edit catalogue, and confirm payment', () => asRole('authenticated', admin, async () => {
      assert.equal((await db.query('select public.is_admin() as allowed')).rows[0].allowed, true);
      assert.equal((await db.query('select * from public.products')).rows.length, 3);
      assert.equal((await db.query('select * from public.bank_settings')).rows.length, 1);
      await db.query("update public.products set name='Updated bag' where slug='visible-bag'");
      assert.equal((await db.query('select product_name from public.order_items')).rows[0].product_name, 'Visible bag');
      assert.equal((await db.query("update public.orders set payment_status='payment_confirmed' returning payment_status")).rows[0].payment_status, 'payment_confirmed');
      await db.query("update public.bank_settings set bank_name='Updated'");
    }));
    await t.test('proof bucket is private; only administrators can read its objects', async () => {
      assert.equal((await db.query("select public from storage.buckets where id='payment-proofs'")).rows[0].public, false);
      await asRole('anon', null, async () => assert.equal((await db.query("select * from storage.objects where bucket_id='payment-proofs'")).rows.length, 0));
      await asRole('authenticated', customer, async () => {
        assert.equal((await db.query('select * from storage.objects')).rows.length, 0);
        await assert.rejects(db.query("insert into storage.objects(bucket_id,name) values('payment-proofs','attack.pdf')"), /row-level security/i);
      });
      await asRole('authenticated', admin, async () => assert.equal((await db.query("select * from storage.objects where bucket_id='payment-proofs'")).rows.length, 1));
    });
    await t.test('database validates money, quantity, delivery and order snapshots', async () => {
      await assert.rejects(db.query("update public.products set price=-1"), /check constraint/i);
      await assert.rejects(db.query('update public.order_items set quantity=0'), /check constraint/i);
      await assert.rejects(db.query('update public.orders set total=1'), /check constraint/i);
      await assert.rejects(db.query("update public.orders set fulfilment_method='delivery',delivery_address=null"), /check constraint/i);
      const { rows } = await db.query('select order_number,payment_method from public.orders');
      assert.match(rows[0].order_number, /^AVHA-\d+$/);
      assert.equal(rows[0].payment_method, 'eft');
      await db.query('update public.order_items set quantity=2');
      assert.equal(Number((await db.query('select total_price from public.order_items')).rows[0].total_price), 900);
    });
    await t.test('admin revocation immediately removes database authorization', async () => {
      await db.query('delete from private.admin_users where user_id=$1', [admin]);
      await asRole('authenticated', admin, async () => {
        assert.equal((await db.query('select public.is_admin() as allowed')).rows[0].allowed, false);
        assert.equal((await db.query('select * from public.orders')).rows.length, 0);
      });
    });
  } finally { await db.close(); }
});
