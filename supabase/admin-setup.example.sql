-- Run as postgres in the SQL Editor AFTER creating/inviting the owner in Auth.
-- Replace the email. Never grant membership by user_metadata or a public signup.
insert into private.admin_users (user_id)
select id from auth.users where email = 'replace-with-owner-email@example.com'
on conflict (user_id) do nothing;

-- Verify this returns precisely the intended owner before allowing admin access.
select u.id, u.email from private.admin_users a join auth.users u on u.id = a.user_id;

-- Revoke an administrator immediately at the database authorization layer:
-- delete from private.admin_users where user_id = 'USER_UUID';
