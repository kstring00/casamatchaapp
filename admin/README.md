# Casa Matcha Owner Console

This is the deliberately small operations surface for Phase 1.

## Setup
1. Copy `config.example.js` to `config.js`.
2. Set:
   - `supabaseUrl`
   - the public Supabase anon/publishable key
3. Add `ADMIN_PASSWORD` to Supabase Edge Function secrets.
4. Deploy `admin-content` and `send-push`.
5. Host this folder on a Casa Matcha-owned static host/domain.

The owner password is typed at runtime and sent to the Edge Function in `x-admin-password`. It is not embedded in JavaScript or saved to browser storage by this page.

## Post an event
Open **Post an event**, enter title/date/location/ticket URL, then choose **Publish event**.

## Update the seasonal feature
Change title/caption/image URL, then choose **Update feature**.

## Send a push
1. Enter title and message.
2. Add an app route when useful, e.g. `/menu?category=Seasonal`.
3. Choose:
   - All subscribers,
   - One location,
   - One topic.
4. Leave Schedule blank to send now, or set a future time to queue it.
5. Choose **Send / schedule**.

Scheduled messages need the Supabase Cron trigger documented in the root README.

## Guardrails
- Do not paste Toast credentials here.
- Do not paste the Supabase service-role key here.
- Rotate the admin password if it is shared outside the approved owners/managers.
- Verify event dates and URLs before sending a push; pushes cannot be “unsent.”
