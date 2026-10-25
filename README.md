# AVHA CREATIONS

AVHA CREATIONS is a handmade fashion, accessories and hair-artistry business based in Olievenhoutbosch, Centurion, South Africa. This application is the foundation for a real commerce platform: a public storefront, a locally persisted shopping bag, a protected business studio, and a Supabase database designed for manual EFT orders.

**Current stage: application foundation plus photographic homepage redesign.** The project runs without Supabase credentials. The homepage includes clearly labelled editorial product/service previews while real catalogue data takes priority when connected. These preview cards lead to enquiries, never the cart or simulated checkout. No orders, successful payments or administrator access are simulated. No live Supabase project has been selected, provisioned or migrated, and the application has not been deployed.

## Tech stack

| Technology | Purpose |
| --- | --- |
| Vite | Local development and production bundling |
| React + JavaScript | Reusable interface components and state |
| React Router | Public and protected admin routes |
| HTML5 + modern CSS | Semantic, mobile-first interface without a UI framework |
| Supabase JS | Authentication, PostgreSQL Data API and Storage client |
| Supabase PostgreSQL | Catalogue, settings, historical orders and security policies |
| Node test runner + PGlite | Cart utilities and executable PostgreSQL/RLS tests |
| Playwright | Browser route, responsive and cart smoke checks |
| Sharp (development only) | Resize and encode supplied/generated photographs as WebP assets |

Dependencies are pinned in `package.json`; keep `package-lock.json` in source control. Test tools and Sharp are development dependencies and do not ship in the storefront bundle. Sharp is the only dependency added for the homepage redesign. No Next.js, card gateway, icon package, animation library or additional state framework is used.

## Getting started

Use Node.js **22.12 or newer**, with npm. Development was validated on Node 22.16.0.

```sh
npm install
npm run dev
```

Open the Local URL printed by Vite, normally `http://127.0.0.1:5173`. The app runs immediately without environment variables. Catalogue pages then show preparation states and admin sign in is disabled. Configure Supabase to load real records and authenticate.

On Windows PowerShell, if script execution policy blocks `npm.ps1`, use `npm.cmd install` and `npm.cmd run dev`; changing system execution policy is unnecessary.

```sh
npm run build
npm run preview
npm test
npx playwright install chromium
npm run test:browser
```

Use `npm ci` instead of `npm install` for reproducible CI installs. `build` produces `dist/`; `preview` serves that build. Browser tests launch and stop their own Vite server on port 4173; keep that port free. A Chromium download is required once. Browser checks assume the unconfigured environment described above; temporarily remove local Vite Supabase settings when running this suite. Test screenshots are written to ignored `test-results/`.

## Environment variables

Copy `.env.example` to `.env.local` in the project root, then set:

| Variable | Required for | Value |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Live data and admin authentication | Supabase project HTTPS API URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Live data and admin authentication | Public/publishable browser key from the same project |

Restart Vite after changes. Both variables are optional for the unconnected foundation and required together for a live connection. An invalid configured URL/key should be corrected, not worked around with mock admin access.

Every `VITE_` value is public in the browser bundle. **Never place a service-role key, secret key, database password, admin password or access token in these variables.** The frontend only uses the publishable key; RLS enforces access. Real environment files, logs, local Supabase state, dependencies and build artifacts are ignored. No actual credentials are supplied or committed.

The future trusted checkout endpoint will require server-only credentials and separate setup. It does not exist in this stage; do not add a privileged key to enable the placeholder checkout.

## Architecture

```text
Browser
  React Router
    PublicLayout → photographic homepage / catalogue / bag / checkout placeholders
    ProtectedAdminRoute → database membership check → AdminLayout
  Context
    CartProvider → validated localStorage selections, estimated totals
    AuthProvider → Supabase session + is_admin RPC
    BusinessProvider → shared public settings, supplied launch contacts as fallback
  Services → Supabase publishable client
    public catalogue / safe business settings → RLS active read policies
    admin reads / image helpers → database membership RLS

Next stage (not implemented)
  checkout UI → rate-limited trusted server endpoint → atomic DB transaction
  scoped order capability → saved order / banking instructions / private proof upload
```

Components do not issue database queries. `src/services/` owns data access; `src/lib/supabase.js` owns client creation. `useResource` provides loading, empty, success, retry and visible error states and ignores stale asynchronous results when a route changes. Authentication requests live in the auth context/service. `ErrorBoundary` handles unexpected render failures; unknown routes render a branded 404.

Frontend route protection improves the interface. Database grants, RLS, a non-exposed admin membership table and Storage policies enforce the actual security boundary, including against direct API requests.

## Project structure

```text
public/                  Favicon, local fonts, optimised imagery and SPA rewrite example
src/
  assets/                Official supplied logo, imported with Vite asset hashing
  components/
    common/              Buttons, page containers, form fields, states, error boundary
    layout/              Public header, mobile navigation, footer and layout
    shop/                Product cards/grid, prices and quantity selector
    hair/                Hair service cards
    home/                Hero, benefits, journeys, showcases, story, social and contact
    admin/               Protected routes, sidebar, header, layout and status badge
  pages/
    public/              Customer route components
    admin/               Sign in, dashboard, lists and management placeholders
  hooks/                 Resource loading and title/description metadata
  context/               Authentication, persistent cart and shared business settings
  config/                User-supplied public launch contact defaults
  data/                  Isolated homepage-only preview records (not sellable inventory)
  lib/                   Supabase client and canonical status constants
  services/              Catalogue, auth, orders, uploads, settings and admin access
  utils/                 Cart reducer, Rand formatting, WhatsApp message generation
  styles/                Shared tokens and responsive application styles
  App.jsx                Route composition only
  main.jsx               Providers, router and application entry
supabase/
  config.toml            Local Supabase configuration
  migrations/            Versioned initial schema, grants, RLS and bucket configuration
  admin-setup.example.sql Trusted SQL template for granting/revoking administrators
docs/checkout-contract.md Next-stage security and transaction requirements
docs/licenses/           Open Font Licences for bundled typefaces
docs/image-generation.json Supporting-image provenance and exact generation prompts
scripts/optimise-image.mjs Reusable non-destructive image resizing/WebP encoding
tests/                   Unit, PostgreSQL/RLS and browser checks
.env.example             Empty public configuration template
```

The supplied hero original is retained in `public/Glamorous Mauve Hat Portrait.png`; the website consumes optimised WebP versions in `public/images/`. Supporting preview images are also local WebP assets. The official supplied logo is imported from `src/assets/avha-logo.png`; browser/mobile icons are served from `public/`. Replace illustrative catalogue imagery with actual AVHA photographs through live catalogue records when available. Add checkout-specific components as that workflow is implemented. Cart drawer and dialogs are deferred until there is a real interaction requiring them; the cart currently has its own route.

## Supabase setup

The migration targets a **new Supabase PostgreSQL project**, which already provides `auth.users`, `auth.uid()`, `anon`/`authenticated` roles and the Storage schema. It is not standalone vanilla PostgreSQL SQL.

1. Create or select a dedicated development Supabase project. Avoid applying this initial migration to an existing unrelated database.
2. Install the official Supabase CLI and check `supabase --help` for your version. Local configuration is already initialized. Optional local Supabase requires Docker; Docker was unavailable in this workspace.
3. Authenticate/link through the CLI, choose the intended project reference, then review the pending migration before applying:

   ```sh
   supabase login
   supabase link --project-ref YOUR_PROJECT_REFERENCE
   supabase db push --dry-run
   supabase db push
   supabase db advisors --linked --type all
   ```

4. Alternatively, apply the migration SQL once through the development project's SQL Editor as a trusted owner. If you later switch to CLI migrations, reconcile migration history first; do not re-run the same initial schema or mix histories casually.
5. Keep only the intended schemas exposed through the Data API. `public` is needed; **never expose `private`**. The migration explicitly grants required table/function access and enables RLS.
6. Copy the project URL and publishable key into `.env.local`. Restart Vite. Empty but connected catalogues should return empty states rather than configuration errors.
7. Disable public email signup and anonymous sign-ins for this admin-only Auth deployment. Local `config.toml` already disables both, sets a 12-character minimum password and points Auth at Vite’s local URL; apply equivalent settings separately to the hosted project. Create/invite the owner through the Supabase dashboard. Configure Auth URLs for your eventual domain; no customer accounts or OAuth flow are implemented.
8. Use `supabase/admin-setup.example.sql` in trusted SQL to grant that exact owner membership. Verify the selected ID/email. Signing up or changing user metadata must never grant administrator privileges.
9. Configure public contact information and delivery settings. User-supplied launch defaults in `src/config/business.js` include WhatsApp `27762123234` (076 212 3234), the supplied street address and Instagram `@avha_creation`. Nonempty database settings override these defaults. Configure banking details privately when preparing checkout. There are no invented contact numbers or bank details.
10. Verify Auth sign in, non-admin denial, live RLS, private proof access and Storage behavior on the real development project before any production launch.

For optional local development after installing Docker:

```sh
supabase start
```

This starts local platform services and applies local migrations on a fresh database. Use its local URL and publishable key. For a disposable local database only, `supabase db reset --local --no-seed` rebuilds it from migrations and deletes local data. Never use a reset against a production or shared database. Run `supabase db advisors --local --type all` once services are available.

Migration history is imperative. Generate new migration files through `supabase migration new descriptive_name`; never edit an already applied migration. This initial file may still be revised before its first deployment. No hosted migration or advisor result is claimed by the local tests.

## Database

Money uses exact `numeric(12,2)` Rand amounts. Time values use `timestamptz`. Primary identifiers are UUIDs. Slugs are unique and constrained. Catalogue records default to unpublished. Multiple image URLs use `text[]` (maximum 12). Foreign keys and common list/status queries are indexed. Update triggers maintain timestamps.

| Table | Purpose and important constraints |
| --- | --- |
| `categories` | Name, slug, description, active flag; groups products |
| `products` | Name, slug, description, price, category FK, multiple images, featured/active flags, stock status, timestamps |
| `hair_services` | Name, slug, description, nullable starting price, multiple images, featured/active flags, timestamps |
| `store_settings` | Public-safe singleton: business name, WhatsApp, email, address, delivery fee and delivery enablement |
| `bank_settings` | Admin-only singleton: bank name, holder, account number/type, branch code and EFT instructions |
| `orders` | Customer/contact/address data, fulfilment method, subtotal/fee/total, EFT payment status, fulfilment status, notes and timestamps |
| `order_items` | Order/product references plus immutable-at-client-level name, slug, quantity and price snapshots; generated line total |
| `payment_proofs` | Order reference, private storage path, original filename, upload time and verification status |
| `private.admin_users` | Trusted membership list referencing Auth users; inaccessible through the Data API |

`category_id` is normalized rather than storing free-text categories on products. A product assigned to an inactive category is not publicly visible. `stock_status` is `in_stock`, `out_of_stock` or `made_to_order`; this is not inventory counting or reservation. Made-to-order products currently lead to an enquiry rather than direct addition to the cart. Hair service prices may be null for consultation pricing.

`private.order_number_seq` starts at 1001 and produces references such as `AVHA-1001`. Sequence gaps are normal. Order references are human-readable payment references, **not authorization tokens**.

Order totals must equal subtotal plus delivery fee; collection has zero delivery fee; delivery requires an address. Quantity is an integer from 1 to 99. Item line totals are generated by PostgreSQL. Cross-row order subtotal validation and atomic insertion will be the trusted checkout endpoint's responsibility; there is no browser order INSERT grant to bypass it.

Product updates do not rewrite existing item snapshots. Product deletion nulls the product reference but preserves historical details. Order/item/proof deletion is not granted to clients. Prefer archiving products through `active = false`; document a retention policy before launch.

The only seed is a public-safe business-settings singleton using the supplied business name and locality. Delivery defaults disabled with a zero placeholder fee. No product inventory, test orders, administrator, personal data or banking details are seeded.

## Authentication and administrator access

`/admin/login` uses Supabase email/password sign in. There is no frontend signup or demo-admin bypass. `AuthProvider` subscribes to session changes, clears stale authorization, and calls `public.is_admin()` for authenticated users. Asynchronous authorization results cannot overwrite newer session changes.

`public.is_admin()` is an invoker wrapper over `private.is_admin()`. The private function is a narrowly scoped, stable `SECURITY DEFINER` lookup with an empty search path; it checks `auth.uid()` against private membership. Only `authenticated` can execute it, with no ability to edit membership. All other application functions use invoker privileges.

Neither `user_metadata`, URL paths nor merely being authenticated grant privileges. The guard redirects visitors/non-admins to login and fails closed on authorization errors. A UI session can remain open following revocation, but every subsequent protected database operation checks current membership, so revocation immediately removes access at the database layer.

Provision administrators only through trusted SQL after creating their Auth user. Remove the matching membership row to revoke access. Do not build a public membership editor. Add MFA, recovery procedures and an audited role-management workflow before broadening administration.

## Row Level Security

| Actor | Allowed |
| --- | --- |
| Anonymous visitor | SELECT active public products/categories/services and public-safe store settings |
| Signed-in non-admin | Same public data; no orders, proofs, bank settings or catalogue mutations |
| Administrator | Catalogue/settings CRUD, all order/item/proof metadata reads, limited order/proof status updates, catalogue image operations and proof object reads |
| Trusted server, future | Validated atomic order creation and scoped customer access/upload authorization |

Every table in the exposed schema has RLS enabled. Grants are explicit; anonymous users have no order, proof or banking table privileges. Authenticated users have no order INSERT grant, total/identity update grant or historical item mutation grant. Admin UPDATE policies include both `USING` and `WITH CHECK`, and SELECT policies support those updates. Client status updates require database admin membership.

`bank_settings` is physically separate from public settings so `select('*')` cannot accidentally include banking columns. Customers will receive curated banking instructions only through their authorized order endpoint. No public bank view exists.

## Storage and proof of payment

The migration creates:

| Bucket | Visibility | Rules |
| --- | --- | --- |
| `product-images` | Public asset delivery | Admin-only upload/list/update/delete; JPEG, PNG or WebP; 5 MB limit |
| `payment-proofs` | **Private** | Admin-only object read; JPEG, PNG or PDF; 10 MB limit; no customer writes yet |

Public catalogue image URLs remain public even if their product is archived. Only put material intended for public viewing in that bucket. `uploadProductImage()` validates browser file metadata and uses a random path with no overwrite; server-side upload content validation should be added with the final editor. It is not yet wired to a product-editing form.

`getAdminProofUrl()` requests a signed read URL valid for **60 seconds** and relies on Storage RLS. There is no permanent public proof URL. The signed link itself is a short-lived bearer capability; do not log or publish it. The proof-review UI and customer upload endpoint are not implemented. UI and SQL tests do not substitute for live Storage API validation.

Future customer uploads must validate scoped order authorization, MIME signatures, size/count limits, object ownership and upload completion. Store only paths in proof metadata, use random filenames, define orphan cleanup, and update `proof_uploaded` only after successful verification of the stored object. Full requirements are in [the checkout contract](docs/checkout-contract.md).

## Storefront routes

| Route | Current behavior |
| --- | --- |
| `/` | Photographic campaign homepage, dynamic catalogue previews, social/contact sections |
| `/shop` | Active product query, loading/error/empty states and reusable grid |
| `/shop/:slug` | Active product details, image gallery and add-to-bag for available products |
| `/hair-services` | Active hair service query with reusable cards |
| `/hair-services/:slug` | Service details and contact enquiry link |
| `/about` | AVHA story grounded in supplied business details |
| `/contact` | Shared public settings and supplied contact fallbacks; optional `?creation=` / `?service=` prefill a WhatsApp enquiry |
| `/cart` | Persistent selections, quantity/remove controls and estimated subtotal |
| `/checkout` | Explicit next-stage placeholder; no order creation |
| `/order-success/:orderNumber` | Privacy-preserving placeholder; never fetches by number alone |
| Any unknown route | Branded 404 with a return-home link |

Catalogue and admin list queries currently load up to 100 records. Pagination and filtering belong to the next feature stage. Product records are loaded from services, never hard-coded into UI components.

## Admin dashboard

All routes except login are behind `ProtectedAdminRoute` and server-side RLS:

| Route | Current behavior |
| --- | --- |
| `/admin/login` | Real Supabase password auth when configured; disabled otherwise |
| `/admin` | Protected shell and counts from loaded product/service/order records (up to 100 each, marked 100+) |
| `/admin/products` | Read-only product list including drafts/archived items |
| `/admin/products/new` | Product editor placeholder |
| `/admin/products/:id/edit` | Product editor placeholder |
| `/admin/categories` | Category list; additional route prepared for category management |
| `/admin/services` | Hair service list |
| `/admin/orders` | Order references/payment statuses with detail links |
| `/admin/orders/:id` | Customer/line snapshot/total read-only detail view |
| `/admin/settings` | Business/banking editing placeholder |

The admin shell includes a responsive sidebar, header, current account and sign out with error handling. Dashboard figures are record counts, not invented sales analytics. Product editing, archiving, featured toggles, category/service editing, proof review, payment confirmation, order status controls and settings forms remain planned. SQL permissions support future admin workflows; there are no fake save/confirm buttons.

## Shopping cart

`CartProvider` uses a reducer and versioned `localStorage` key `avha:cart:v1`. Stored data is validated on load, duplicates/bad entries are removed, and corrupt JSON recovers to an empty cart. Storage-write errors show a visible warning. It stores only IDs, slugs, names, quantity and estimated unit-price cents, not checkout personal data or order-access tokens.

Customers can add available live products, combine duplicate selections, remove items, update quantities from 1–99 and see the estimated subtotal. Cart state survives refresh. Currency is formatted as `R250`, `R450`, `R1,250`; browser arithmetic uses integer cents to reduce rounding drift. Delivery and final totals are deferred until authoritative checkout is implemented, so the bag clearly labels delivery as calculated at checkout.

Local storage is untrusted: altered prices must never determine the final order. `checkoutItems()` deliberately emits only product IDs and quantities. Revalidate catalogue availability, prices and fees on the server. Multi-tab cart synchronization, stock reconciliation and migration of future cart formats are not implemented.

## Checkout lifecycle and EFT

The intended lifecycle is:

1. Customer supplies name, phone/WhatsApp, optional email, delivery/collection, address if required, and notes.
2. Trusted server validates products, quantities, availability, delivery settings and idempotency.
3. One transaction creates the order and historical item snapshots with authoritative prices and generates the order reference.
4. Customer receives exact totals, curated EFT instructions and the reference to use with the transfer.
5. A scoped order capability authorizes later order reads and private proof upload; an order number alone never suffices.
6. Validated proof upload moves payment status to `proof_uploaded`.
7. Customer may open WhatsApp with the generated saved-order message.
8. AVHA reviews the payment, confirms/rejects it, and progresses fulfilment.

This lifecycle is **documented, not yet implemented**. `services/orders.js` deliberately throws `CheckoutNotReadyError`; checkout does not gather information it cannot yet persist safely. Do not mark an EFT payment confirmed on submission or upload. Do not clear the cart until real order persistence succeeds.

See [docs/checkout-contract.md](docs/checkout-contract.md) for transaction boundaries, anti-abuse, idempotency, capability authorization, upload constraints and acceptance checks required in the next stage.

## WhatsApp integration

`orderWhatsAppUrl(order, number)` constructs a URL from the **saved** order's item names/quantities/line totals, delivery fee, total, customer name and order/payment reference. It uses the configured store WhatsApp number, encodes the message and rejects missing orders or invalid numbers. Unit tests use clearly isolated test data; no example order is displayed in the application.

The order helper is ready but not connected to the checkout placeholder. General booking/enquiry links in the header, homepage, footer and contact page use the shared public store number, falling back to the supplied `27762123234`. Preview-product/service clicks open Contact with the chosen interest; the WhatsApp link includes that interest. These enquiries are not orders. Opening a link does not send a message; the customer chooses Send in WhatsApp. The application sends no messages automatically.

## Order and payment statuses

Payment and fulfilment have separate columns/constants to avoid mixing financial confirmation with preparation progress.

| Payment status | Meaning |
| --- | --- |
| `awaiting_payment` | EFT instructions issued; payment not verified (default) |
| `proof_uploaded` | Proof received; awaiting admin review |
| `payment_confirmed` | Administrator verified payment |
| `payment_rejected` | Administrator rejected proof/payment; follow up required |

| Order status | Meaning |
| --- | --- |
| `pending` | Created, not yet being prepared (default) |
| `preparing` | AVHA is preparing the order |
| `ready_for_collection` | Available for arranged collection |
| `dispatched` | Sent for delivery |
| `completed` | Fulfilment complete |
| `cancelled` | Cancelled; refunds require a separate business process |

Proof verification is separately `pending`, `confirmed` or `rejected`. SQL constrains valid values; controlled transitions, atomic proof/payment updates, an audit log and fulfilment/payment consistency rules must be implemented with the review workflow. At present only an authenticated database administrator can update allowed status columns; there is no customer status mutation path.

## Design, responsiveness and accessibility

The supplied luxury homepage is a visual direction, not an embedded webpage screenshot. The redesigned homepage uses the supplied woman-in-mauve-hat photograph as its dominant hero, espresso/chocolate gradients, champagne highlights, photographic product/service cards and selective warm glass surfaces. The old abstract monogram artwork and its obsolete styles have been removed. A dedicated local handwritten font renders “Wear your individuality.” in three lines with the fine signature treatment from the reference.

Mobile-first CSS covers mobile, tablet and desktop; navigation becomes a disclosure menu with an Escape-to-close/focus-return behavior, grids reflow, cart rows wrap and admin navigation changes layout. Semantic landmarks, real links/buttons, labels, a skip link, focus indicators, route-focus handling, keyboard-accessible controls and reduced-motion support are included. Cormorant Garamond, DM Sans and Mrs Saint Delafield Latin WOFF2 assets are bundled in `public/fonts/` with their Open Font Licences in `docs/licenses/`. There are no external font requests; system serif/sans fallbacks cover missing glyphs and loading failures.

## Homepage redesign

`HomePage` now composes small dedicated components from `src/components/home/`:

| Component | Purpose |
| --- | --- |
| `HeroSection` | Supplied full-width photographic hero, large AVHA wordmark, signature and working shop/hair links |
| `BrandBenefits` | Four refined line-icon brand promises |
| `JourneySection` | Clickable photographic shop/hair editorial cards |
| `CataloguePreview` | Reusable featured-product or hair-service showcase with loading/error/retry and documented preview fallback |
| `StorySection` | Story copy, large hat portrait and translucent brand-values panel |
| `SocialGallery` | Cream/blush inspiration gallery linking to the supplied Instagram account |
| `ContactCTA` | Location/maps, real WhatsApp enquiry and appointment links |

Shared `Header` and `Footer` provide public navigation, SVG line icons and `SocialLinks`. Every public route uses the same `Header` through `PublicLayout`, matching the Shop page's warm translucent background, rounded lower corners, logo sizing, navigation, socials and booking action. There is no shopping-bag icon or cart counter in the header, and the homepage has no separate floating-header variant. Cart functionality remains available on `/cart`. No Facebook page URL was supplied, so its icon is explicitly labelled as an enquiry and opens `/contact#social`; it does not invent a Facebook profile. The contact page explains this fallback. The social gallery is a curated editorial inspiration gallery, **not a live Instagram feed or a claim that generated portraits are AVHA clients**.

### Dynamic content and preview boundaries

`src/services/home.js` reuses the existing catalogue service. It requests featured active records, falls back to active catalogue records if none are featured, and limits the result to five products or six services. Existing Supabase RLS still applies. Real records use the existing `/shop/:slug` and `/hair-services/:slug` links and their database prices/images. No migration, RLS, auth, cart, checkout or admin behavior was replaced for the redesign.

If Supabase is unconfigured or a successful query finds no catalogue content, the home service uses isolated records in `src/data/homePreview.js`. They use the supplied example categories/indicative starting prices and clearly labelled illustrative imagery. These are not SQL seed data, not inventory and never appear as purchasable detail records. Preview cards route to a named Contact enquiry; they cannot be added to the cart. The shop and service catalogue routes keep their real database/empty behavior. A failed request shows an error/retry state rather than silently substituting previews.

`BusinessProvider` shares the existing public-settings service between navigation, footer, Contact and homepage. It merges nonempty public settings over user-supplied launch defaults; an invalid configured WhatsApp number is not converted into a fabricated link. Public settings failures are visible with retry on Contact and the homepage contact section. Banking settings remain private and are never part of this context. Social links currently use supplied code configuration because the existing settings schema has no social URL columns; a future admin social editor will need its own reviewed migration.

### Images and signature assets

- **Supplied hero:** `public/Glamorous Mauve Hat Portrait.png`, preserved without retouching or regeneration. `avha-hero-768.webp`, `avha-hero-1024.webp` and `avha-hero-1536.webp` are resized/encoded derivatives in `public/images/`. The 1536px version is about 120 KB versus the 1.95 MB source PNG. The `<img>` uses `srcSet`, viewport sizes, explicit dimensions and `fetchPriority="high"`; it is not lazy-loaded.
- **Supporting illustrative images:** `crochet-bag.webp`, `beaded-earrings.webp`, `fascinator.webp`, `crochet-bow.webp`, `braids.webp`, `cornrows.webp`, `wig-installation.webp`, `hair-colour.webp`, `hair-washing.webp`, `custom-styling.webp` and `story-portrait.webp`, all in `public/images/`. Created with the built-in image-generation tool, then resized/encoded without retouching. The exact final prompt set and provenance are retained in [docs/image-generation.json](docs/image-generation.json). These must be replaced by genuine product/client photography before representing specific sellable pieces or client work.
- **Signature:** `public/fonts/mrs-saint-delafield-latin.woff2`, with [its OFL licence](docs/licenses/Mrs-Saint-Delafield-OFL.txt). The phrase is real selectable HTML text, accessible as “Wear your individuality.”, with a small underline and restrained rotation. No signature text is burned into the hero image.
- Supporting images are lazy-loaded. Explicit aspect ratios, image dimensions, `object-fit` and deliberate `object-position` values reserve space and protect the important subjects. The original user PNG remains available but is not fetched by the homepage.

To optimise a future asset without overwriting its source:

```sh
node scripts/optimise-image.mjs path/to/original.png public/images/meaningful-name.webp 800
```

This tool only resizes and encodes; it does not generate, composite or retouch images. Asset prompts and ownership/provenance documentation should be updated when replacing images.

### Responsive composition and motion

Desktop uses a cinematic 92svh hero (bounded between 720–960px), with copy on the left, an undarkened photographic subject on the right and the signature beside her. Mobile separately crops the image toward the face/hat, fades its lower edge into the copy area and places the signature in the open left area. Two journey cards stack on mobile. Product, service and social tracks use native horizontal scrolling, focusable labelled regions, touch scrolling and scroll snapping; desktop presents five products and six services across the row. The story places imagery before copy on mobile and layers the portrait between copy and the glass panel on desktop. Contact blocks stack on mobile.

`src/styles/home.css` contains the campaign and shared navigation/footer enhancements, imported after the foundation stylesheet. Icon shapes are native SVG in `Icon`, not a new icon dependency. Hover effects use small image zooms, slight lifts and arrow movement. `useScrollReveal` progressively animates sections with IntersectionObserver/Web Animations without hiding content when observers or JavaScript are unavailable. Reduced-motion preferences disable animation/transition effects and cancel active reveals. Full-page and hero screenshots are captured in ignored `test-results/`.

No modal is currently required; implement a focus-managed accessible dialog when adding the future cart drawer or image viewer.

## SEO foundation and hosting

### Official brand assets

The user-supplied `public/AVHA Creations Monogram Logo.png` is the official logo. `src/assets/avha-logo.png` is an unchanged, byte-for-byte copy, consumed by the shared `BrandLogo` component in the storefront header/footer, admin sidebar and admin sign-in screen. Vite imports and hashes it into `dist/assets/`; no hand-written asset hash is used. Every logo links to `/` and has an accessible name. The original aspect ratio (1727 × 910) is preserved with `width: 100%`, `height: auto` and `object-fit: contain`, with explicit intrinsic dimensions to reserve space. There is no cropping, recolouring, filtering or generated replacement.

The current supplied logo appears without a separate background plate. The shared Shop-style header uses the same logo sizing on every public page: 160px wide on desktop, 135px on mobile and 112px on very narrow screens. It preserves its aspect ratio; footer and business-studio branding keep their own appropriate sizes. The business-studio label remains separate interface text.

The square user-supplied `public/Blush Rose-Gold AVHA Creations Icon.png` is the only favicon/app-icon source. The horizontal logo is never used for browser icons. Resizing with the existing Sharp development dependency preserves the complete icon without cropping or recolouring:

| Asset | Size / use |
| --- | --- |
| `public/favicon-16.png` | 16 × 16 browser favicon |
| `public/favicon-32.png` | 32 × 32 browser favicon |
| `public/favicon.png` | 48 × 48 browser favicon |
| `public/apple-touch-icon.png` | 180 × 180 Apple touch icon |

`index.html` declares PNG icon types/sizes, the Apple touch icon and application-name/Apple-title metadata. The old generated `favicon.svg` has been removed. There is no existing web manifest, so none was introduced; this does not add PWA install/offline behavior. Supplied originals remain intact. If a browser retains an older favicon, hard-refresh or reopen the tab to refresh its favicon cache.

The production browser check can be run after a build using `$env:AVHA_TEST_PRODUCTION = '1'; npm.cmd run test:browser` in PowerShell (or `AVHA_TEST_PRODUCTION=1 npm run test:browser` in a POSIX shell). It serves the built `dist/` through Vite preview and checks the actual hashed logo and all declared favicon/touch-icon PNG URLs, including correct aspect ratios at 320–1920px. Generated screenshots remain in ignored `test-results/`.

`index.html` includes baseline title, description, Open Graph type/title/description/locale, theme colour and language. `usePageTitle` updates page titles/descriptions and OG title/description on navigation. Product/service URLs use slugs. Real canonical URLs, share images, robots directives, sitemap, structured product data and prerendering should be configured once the domain/catalogue exist.

This is a client-rendered SPA; client-updated metadata has crawler limitations and a route-level 404 currently returns the host's SPA HTTP 200. Static hosting must rewrite application paths to `index.html` so direct route refreshes work. `public/_redirects` is a Netlify/Cloudflare-style example; configure the equivalent on other hosts. Vite's preview server is for local verification, not production serving. Set the two public environment variables at build time on the chosen host. No deployment was requested or performed in this bootstrap stage.

## Validation

`npm test` runs 13 passing checks including nested database cases. The PGlite suite applies the complete migration to an embedded PostgreSQL instance with minimal Auth/Storage stand-ins, then switches between anonymous, signed-in customer and administrator roles. It verifies active-only catalogue reads, RLS enablement, private banking/order denial, blocked self-promotion, blocked client order/total writes, preserved item snapshots, admin operations, private proof policies, constraints and immediate membership revocation. Cart tests cover mutation/persistence normalization, Rand arithmetic and dynamic WhatsApp content.

PGlite uses real PostgreSQL SQL/RLS execution but **does not emulate the full Supabase platform**. Hosted Auth cookies/sessions, PostgREST grants, real Storage signed URLs/uploads and platform advisors still need checks on a designated development project. A local migration pass does not mean Supabase is connected.

The browser suite checks all public routes at 375px, 768px, 1024px, 1440px and 1920px; direct protected-admin navigation; mobile navigation and Escape/focus handling; persisted quantity changes/removal; corrupt storage recovery; hero loading priority; all loaded homepage images; the signature font; five/six preview cards; product/service enquiry destinations and WhatsApp message contents; native mobile gallery scrolling; reduced-motion styles; and console/runtime errors. Mobile/desktop full-page, hero and collection screenshots were captured and visually reviewed. The homepage redesign passed these checks with zero console/runtime errors. The production build and all 13 utility/database checks also passed after the final changes.

## Development progress

The Shop category row uses square image areas (`aspect-ratio: 1`) for taller product photography, with `object-fit: cover`, unchanged category labels and horizontal mobile scrolling. At the same card width, this is 35% taller than the previous 1.35 landscape crop. The shared public header follows the Shop appearance on all routes and contains no bag/counter.

- [x] Vite + React JavaScript project and pinned dependencies/lockfile
- [x] Organised components, pages, hooks, context and service layer
- [x] Public and admin routing, unknown-route handling
- [x] Protected-admin architecture and real Auth integration code
- [x] Public Supabase client configuration and `.env.example`
- [x] Initial versioned schema, constraints, indexes and timestamp triggers
- [x] RLS, admin membership, explicit grants and private proof bucket policies
- [x] Local PostgreSQL migration/security verification
- [x] Branded responsive storefront placeholders and admin shell
- [x] Loading, empty, retry/error states and application error boundary
- [x] Local cart architecture, add/remove/quantity controls and Rand estimates
- [x] Live catalogue/detail/list read implementations, pending real connection
- [x] Dynamic saved-order WhatsApp utility, tested and not wired to fake data
- [x] Comprehensive README and next-stage checkout contract
- [x] Production build
- [ ] Connected/verified live Supabase development project
- [ ] Live Auth and Storage end-to-end verification and platform advisors
- [x] Browser verification: responsive routes, admin redirects, persistent cart, no console errors; screenshots reviewed
- [x] Photographic homepage redesign with separate hero, benefits, journeys, showcases, story, social and contact components
- [x] Supplied hero preserved, responsive WebP derivatives, handwritten reference-style signature and local font
- [x] Live-first homepage service integration with labelled non-purchasable editorial previews
- [x] Supplied WhatsApp number, address and Instagram integrated through shared public settings
- [x] Official supplied logo integrated in public/admin branding; supplied square icon used for browser favicons and Apple touch icon, with production asset verification
- [x] Mobile swipe galleries, keyboard menu handling, reduced motion and image/link browser checks
- [ ] Product/category/service editing and image-upload UI
- [ ] Authoritative checkout, delivery totals and atomic order creation
- [ ] Secure order access and EFT instructions
- [ ] Private customer proof upload and admin proof/payment review
- [ ] Checkout WhatsApp handoff
- [ ] Full admin order management and audited status transitions
- [ ] Public business and private banking settings editors
- [ ] Replace generated editorial previews with actual AVHA catalogue/client photography and verify live homepage data
- [ ] Supply the official Facebook page URL
- [ ] Production deployment and operational review

## Decisions / architecture notes

- Build the requested first stage; keep unfinished workflows explicit and non-operational rather than presenting fake success.
- Store all sellable business records in Supabase. Keep homepage-only editorial previews isolated, labelled and routed to enquiries, with no cart/checkout access or invented banking details.
- Use database-owned admin membership so privilege revocation does not wait for a JWT claim refresh.
- Split public contacts from sensitive banking details rather than relying on UI field hiding.
- Deny browser order writes until a trusted endpoint exists; RLS cannot make browser-supplied prices authoritative by itself.
- Preserve order item snapshots independently of catalogue changes and restrict client column updates.
- Keep payment state separate from fulfilment state and retain proof verification independently.
- Use decimal money in PostgreSQL and cents for browser estimates; recalculate every final amount on the server.
- Keep abstractions small. Add edit forms, drawers/dialogs and checkout components as real features arrive.
- Use executable database tests without Docker to verify this foundation locally, while explicitly retaining live-platform verification as unfinished.

## Known issues / unfinished work

- No live Supabase project/key was supplied or selected. Authentication/data code and migration exist but are not connected to a hosted business database.
- The homepage uses documented illustrative preview imagery and indicative prices until actual catalogue content is supplied. It is not evidence of inventory, exact custom pricing or AVHA client work. The Instagram gallery is curated, not an API feed. An official Facebook page is still needed.
- Checkout, EFT instructions, scoped order access and customer proof upload are deliberately unavailable. The app is not yet ready to accept real orders.
- Admin editors, archive/featured controls, settings changes, proof review and status-management UI are placeholders. Dashboard counts are capped list lengths, not aggregate business reporting.
- The shop loads products in 12-item batches as visitors scroll. Its local preview catalogue and estimated prices do not seed Supabase; verify final prices and create active database records with public image URLs before connecting a live catalogue. Image-specific alt descriptions, stock reservation, multi-tab cart syncing and made-to-order lead times still need work.
- Public catalogue images are public independently of product active state; never upload private material to that bucket.
- Detailed transitions/audit logging, anti-abuse limits, file-content validation, recovery workflows, privacy/retention decisions and transactional cross-table subtotal validation are next-stage work.
- Full local Supabase services/platform advisors were not run because Docker/a selected live project were unavailable. PGlite verification covers SQL/RLS with stand-ins only.
- Canonical domain, OG share image, sitemap, product structured data and crawler rendering are not configured.

## Future improvements

Automated card payments; optional customer accounts; secure order tracking; courier/delivery integration; stock counting/reservations; email/SMS notifications; business analytics; admin MFA and recovery; audit history; automated backups/restore drills; CI build/security checks; managed social links; actual AVHA catalogue photography and a connected content workflow.

## Documentation rule

Whenever an architectural, database, setup, route, feature or workflow change is made, **update this README in the same change**. Keep implemented behavior separate from planned behavior, update the progress checklist and known issues, and preserve the security decisions another developer will need.

## Primary implementation references

[Vite setup](https://vite.dev/guide/), [React Router declarative installation](https://reactrouter.com/start/declarative/installation), [Supabase client setup](https://supabase.com/docs/reference/javascript/initializing), [password authentication](https://supabase.com/docs/reference/javascript/auth-signinwithpassword), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [database function security](https://supabase.com/docs/guides/database/functions), and [Storage access control](https://supabase.com/docs/guides/storage/security/access-control). Check current documentation before expanding these workflows.
