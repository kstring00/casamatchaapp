# Casa Matcha App — Client Account & Credentials Handoff

All production accounts should be owned by Casa Matcha, not by the freelancer/developer. Invite the developer with the minimum role needed.

## Apple
- [ ] OPEN — Casa Matcha Apple Developer Organization account created.
- [ ] OPEN — Legal entity / D-U-N-S details verified.
- [ ] OPEN — App Store Connect app record created.
- [ ] OPEN — Bundle ID `com.casamatcha.app` approved or changed to the client's preferred identifier.
- [ ] OPEN — Push notification capability enabled.
- [ ] OPEN — App Privacy answers completed from the final data flow, not from assumptions.

Record in the client's password manager:
- Apple Developer owner/admin email
- Team ID
- App Store Connect app ID
- Bundle ID
- Recovery/2FA ownership procedure

## Google Play
- [ ] OPEN — Casa Matcha Google Play Console organization account created.
- [ ] OPEN — App record created.
- [ ] OPEN — Package name `com.casamatcha.app` approved or changed.
- [ ] OPEN — Data Safety form completed against the final app.
- [ ] OPEN — Internal testing track configured.

Record:
- Play Console owner/admin email
- Developer account ID
- Package name
- Service account details if CI submission is later enabled

## Expo / EAS
- [ ] OPEN — Expo organization owned by Casa Matcha.
- [ ] OPEN — Project created and linked with `eas init`.
- [ ] OPEN — `EXPO_PUBLIC_EAS_PROJECT_ID` added to deployment environment.
- [ ] OPEN — iOS/Android signing credentials stored in the client's EAS organization.
- [ ] OPEN — Development builds installed on at least one real iPhone and Android device.

Record:
- Expo organization
- Project ID
- Project slug
- Who can manage credentials/builds/submissions

## Supabase
- [ ] OPEN — Project created in Casa Matcha-owned organization.
- [ ] OPEN — Migration applied.
- [ ] OPEN — Edge Functions deployed.
- [ ] OPEN — RLS reviewed.
- [ ] OPEN — `ADMIN_PASSWORD` stored as a Supabase secret.
- [ ] OPEN — `CRON_SECRET` stored as a Supabase secret.
- [ ] OPEN — Cron configured for scheduled push dispatch.
- [ ] OPEN — Database backups / recovery settings reviewed.

Record:
- Project ref
- Project URL
- Public anon/publishable key
- Owner/admin account
- Where service-role access is stored (do not paste the service-role key into this repository)

## Toast
Phase 2 only.

- [ ] OPEN — Confirm Casa Matcha owns the Toast restaurant accounts for both locations.
- [ ] OPEN — Toast Standard API access approved for the client/integration.
- [ ] OPEN — Client credentials created.
- [ ] OPEN — Required read scopes confirmed: menus/config/restaurants as available for the approved integration.
- [ ] OPEN — Friendswood restaurant GUID verified.
- [ ] OPEN — Webster restaurant GUID verified.
- [ ] OPEN — Friendswood Online Ordering URL verified.
- [ ] OPEN — Webster Online Ordering URL verified.
- [ ] OPEN — Determine whether Toast Loyalty is active.
- [ ] OPEN — If active, verify the guest loyalty URL.

Store only in Supabase Edge Function secrets:
- `TOAST_CLIENT_ID`
- `TOAST_CLIENT_SECRET`
- `TOAST_API_HOSTNAME`
- restaurant GUIDs
- ordering URLs if the API does not provide the desired public URL

Do **not** put Toast client credentials in Expo environment variables or the app bundle.

## Brand / content
- [ ] OPEN — Official Casa Matcha astronaut/wordmark vector files received.
- [ ] OPEN — Written permission/ownership confirmed for app photography.
- [ ] OPEN — Real owner/team photo received.
- [ ] OPEN — Real testimonial selected with permission.
- [ ] OPEN — Menu/prices/modifiers verified per location.
- [ ] OPEN — Hours/phones/addresses verified.
- [ ] OPEN — Event source of truth established.
- [ ] OPEN — Privacy policy reviewed by the business/legal counsel as appropriate.

## Admin console
- [ ] OPEN — Static admin page hosted on a Casa Matcha-owned domain/account.
- [ ] OPEN — Owner password shared through the client's password manager, not email/chat.
- [ ] OPEN — At least two owners/managers trained to publish an event and send/schedule a push.

## Launch-day ownership
- [ ] OPEN — Client confirms access to Apple, Google, Expo, Supabase, Toast, domain/DNS, analytics (if added), and source repository.
- [ ] OPEN — Developer access is reduced to the agreed maintenance role after handoff.
