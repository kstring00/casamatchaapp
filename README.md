# Casa Matcha Native App

Phase 1 of a native iOS/Android app concept for Casa Matcha. The visual system follows the pitch concept: warm cream paper, deep forest green, muted gold, editorial food photography, a subtle astronaut motif, serif display typography, and a five-slot bottom navigation with the astronaut as the center **Order ahead** action.

## What is built

### Phase 1 — built
- Expo + React Native + TypeScript + expo-router.
- Home, Menu, Rewards, Community, notification Inbox, notification Preferences, About, Privacy, and menu item detail modal.
- Persistent Friendswood/Webster location selection.
- Searchable 2-column menu, favorites, demo cart, quantity controls, recent-order reorder, and modifier UI.
- Toast order handoff through `expo-web-browser`.
- Native map with both concept locations, call, directions, events, story, testimonial, and Instagram handoff.
- Offline banner, loading, empty, and error states for data calls.
- Push soft prompt only after a location choice or a favorite action.
- Android notification channel, push preference storage, deep-link routing on push taps.
- Hidden pitch demo: tap the About version row five times to reveal **Send test notification**. This uses a local notification and works for Expo Go demos.
- Supabase schema + Edge Functions for push registration, immediate/scheduled push, scheduled dispatch, admin content, and Toast read-only access.
- Minimal owner admin web page under `/admin`.

### Phase 2 — scaffolded, not activated by default
Set `COMMERCE_PROVIDER=toast` only after Toast Standard API access and Supabase are configured.

The Toast adapter:
- Authenticates server-side with client-credentials OAuth.
- Reads Toast menus v2 and restaurant configuration through a Supabase Edge Function.
- Keeps Toast credentials out of the mobile bundle.
- Caches mapped menu responses for five minutes in Supabase.
- Maps menu groups to Matcha / Coffee / Bakery / Seasonal.
- Uses Toast item images when the API provides them.
- Keeps ordering as a location-specific Toast Online Ordering handoff.
- Does **not** create a second loyalty ledger. If Casa Matcha uses Toast Loyalty, configure `TOAST_LOYALTY_URL` and hand off to the Toast guest loyalty surface.

### Phase 3 — intentionally not built
`placeOrder()` throws `NotImplemented`. Native Toast order submission and native loyalty require the appropriate Toast Partner API approval and write scopes. Do not remove that guard until Casa Matcha has the required commercial/API approval.

## Run it

Requirements: current Node LTS, npm, Expo CLI/EAS account.

```bash
npm install
npx expo install --fix
cp .env.example .env
npm start
```

Scan the QR code with Expo Go for Phase 1 UI demos. Local test notifications work in Expo Go. Remote push-token registration requires a development build, so use EAS when testing real push:

```bash
npx eas build --profile development --platform ios
npx eas build --profile development --platform android
```

## Environment variables

App:
- `COMMERCE_PROVIDER=mock|toast` — one switch for the commerce adapter.
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_EAS_PROJECT_ID`

Server-only Supabase secrets:
- `ADMIN_PASSWORD`
- `CRON_SECRET`
- `TOAST_API_HOSTNAME`
- `TOAST_CLIENT_ID`
- `TOAST_CLIENT_SECRET`
- `TOAST_FRIENDSWOOD_GUID`
- `TOAST_WEBSTER_GUID`
- `TOAST_FRIENDSWOOD_ORDER_URL`
- `TOAST_WEBSTER_ORDER_URL`
- `TOAST_LOYALTY_URL`

Never prefix Toast credentials, service-role keys, admin passwords, or cron secrets with `EXPO_PUBLIC_`.

## Supabase setup

1. Create the project in the client's Supabase organization.
2. Run `supabase/migrations/0001_phase1.sql`.
3. Set the Edge Function secrets listed above.
4. Deploy:
   ```bash
   supabase functions deploy register-push
   supabase functions deploy send-push
   supabase functions deploy dispatch-scheduled-push
   supabase functions deploy admin-content
   supabase functions deploy toast-readonly
   ```
5. Configure Supabase Cron to call `dispatch-scheduled-push` every minute with `Authorization: Bearer <CRON_SECRET>`. Scheduled pushes are stored first and become deliverable when their scheduled time passes.
6. Keep Row Level Security enabled. The mobile app does not receive public write access to push-token, scheduled-push, admin-content, or Toast-cache tables.

## Owner admin console

The static console is in `admin/`.

1. Copy `admin/config.example.js` to `admin/config.js`.
2. Add the Supabase project URL and public anon key.
3. Host `admin/` on a private/static site of the client's choice.
4. Enter the owner password at runtime. It is sent to the Edge Function as `x-admin-password` and is not stored by the page.
5. Owners can:
   - publish an event,
   - update the current seasonal feature,
   - send a push immediately,
   - target all subscribers, one location, or one topic,
   - schedule a push for later.

The admin password itself lives only in Supabase secrets.

## Architecture

```
app/                         expo-router screens
src/theme/                   design tokens
src/data/mock.ts             every concept-derived sample/VERIFY value
src/providers/               CommerceProvider + mock/Toast adapters
src/notifications/           permission, token, local demo, preference sync
src/state/                   persistent app state
supabase/migrations/         RLS + Phase 1 tables
supabase/functions/          push, admin, Toast read-only
admin/                       owner web console
```

### CommerceProvider contract
```ts
getLocations()
getMenu(locationId)
getOrderHandoffUrl(locationId)
getRewards(userId)
placeOrder(cart)
```

Phase 1 uses `MockProvider`. Phase 2 switches to `ToastReadOnlyProvider` with the single environment flag.

## VERIFY list

All concept/mock content is isolated in `src/data/mock.ts`. Nothing below should be treated as client-approved until it is verified.

### Locations
- Friendswood street address, city/state/ZIP.
- Friendswood phone.
- Friendswood published hours.
- Friendswood latitude/longitude.
- Friendswood Toast Online Ordering URL.
- Friendswood Toast Loyalty URL if applicable.
- Webster street address, city/state/ZIP.
- Webster phone.
- Webster published hours.
- Webster latitude/longitude.
- Webster Toast Online Ordering URL.
- Webster Toast Loyalty URL if applicable.

### Menu and modifiers
- Iced Matcha Latte name, descriptor, $6.50 price, image.
- Dirty Matcha name, descriptor, $6.75 price, image.
- Strawberry Matcha name, descriptor, $6.75 price, image.
- Sea-Salt Cold Brew name, descriptor, $6.25 price, image.
- Concha name, descriptor, $3.75 price, image.
- Ube Concha name, descriptor, $3.95 price, and real Ube photo.
- Size names and the +$1.00 large upcharge.
- Milk options and +$0.75 oat/almond upcharges.
- Sweetness options.

### Seasonal / event / story
- “Pumpkin Drop,” its caption, and image.
- “Matcha, Café y Perreo,” Oct 26 · 8 PM, Webster location, ticket URL, event photo.
- “More Than Drinks, A Community” title and story copy.
- Owner photo.
- Testimonial, attribution, and permission to use it.
- Instagram handle.
- Concept astronaut/mascot artwork must be replaced with the official approved brand asset.

### Rewards / notifications
- 350-point balance is concept-only.
- 500-point free-drink threshold is concept-only.
- Recent-order date/content is concept-only.
- Inbox sample copy is concept-only.
- Confirm whether Casa Matcha actually uses Toast Loyalty and the exact guest loyalty URL.
- Confirm notification topics and legal/marketing consent language with the client.

## Demo cart rule

The Phase 1 cart is presentation UX only. The mock provider calculates Texas 8.25% tax only to make the concept screen realistic. **The app does not place a native order or calculate production tax.** Checkout opens Toast Online Ordering. Production totals, taxes, availability, modifiers, fulfillment, and payments belong to Toast until Phase 3 approval exists.

## Accessibility
- 44pt minimum interactive controls.
- Dynamic Type is enabled on text.
- Images and icon-only buttons have accessibility labels.
- Explicit loading/error/empty states.
- High-contrast cream/forest combinations; muted gold is used primarily for accents rather than small body copy.

## Handoff
Read:
- `SETUP_ACCOUNTS.md`
- `LAUNCH_CHECKLIST.md`
- `admin/README.md`

Do not launch until every open item in `LAUNCH_CHECKLIST.md` is closed.
