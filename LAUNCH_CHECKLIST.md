# Casa Matcha App — Pre-Launch Checklist

Legend: **[x]** implemented in the codebase; **[ ] OPEN** requires client verification, real-device QA, production credentials, or final content.

## Message
- [x] Home communicates what Casa Matcha is, the two location choices, and how to order in the first viewport.
- [x] Home has one visually dominant CTA: **Order ahead**.
- [x] Each main screen has a clear primary action rather than competing CTAs.
- [x] Location cards expose both **Call** and **Get directions**.
- [ ] OPEN — Client/usability-test the “under five seconds” comprehension goal with real users.

## Device
- [ ] OPEN — Test on a real iPhone.
- [ ] OPEN — Test on a real Android phone.
- [ ] OPEN — Test the smallest supported phone width.
- [ ] OPEN — Test iOS largest practical Dynamic Type sizes; fix any clipped text.
- [ ] OPEN — Test Android large font/display scaling; fix any clipped text.
- [x] Interactive controls are designed at 44pt minimum.
- [ ] OPEN — Confirm all high-value actions remain thumb-reachable on the target devices.
- [ ] OPEN — Test light/dark OS settings; app intentionally uses its own light brand surface.

## Speed
- [x] Product/editorial images render through `expo-image` for caching.
- [ ] OPEN — Replace demo remote JPEG assets with client-owned, correctly sized WebP/AVIF assets where supported.
- [ ] OPEN — Measure cold start on a mid-range physical Android device; target <3 seconds.
- [ ] OPEN — Measure cold start on a representative iPhone.
- [ ] OPEN — Profile image payload and map loading over cellular.

## Credibility
- [ ] OPEN — Replace concept astronaut/mascot with official approved artwork.
- [ ] OPEN — Replace owner concept photo with the approved real owner/team photo.
- [ ] OPEN — Replace concept testimonial with at least one real, permissioned testimonial.
- [x] Privacy policy screen is present in the app.
- [ ] OPEN — Replace/review the web privacy-policy destination for the production domain.
- [x] About uses the current year dynamically.
- [ ] OPEN — Remove every `// VERIFY` value after client signoff.
- [ ] OPEN — Verify all location contact info, hours, map coordinates, event data, menu/prices, modifiers, and ordering URLs.

## Store listing
- [ ] OPEN — Confirm unique App Store / Play Store app name.
- [ ] OPEN — Write final subtitle.
- [ ] OPEN — Final description mentions Friendswood and Webster, TX naturally and accurately.
- [ ] OPEN — Capture approved iPhone screenshots.
- [ ] OPEN — Capture approved Android screenshots.
- [ ] OPEN — Supply production app icon from official artwork.
- [ ] OPEN — Supply production splash screen from official artwork.
- [ ] OPEN — Complete Apple App Privacy labels against final production data flow.
- [ ] OPEN — Complete Google Play Data Safety against final production data flow.
- [ ] OPEN — Confirm age rating and content declarations.

## Plumbing
- [x] Loading, empty, and error states exist for provider-backed data calls.
- [x] Offline banner is implemented.
- [x] Notification taps can deep-link to an app route.
- [x] Android notification channel is configured.
- [x] Notification topic and location preferences are implemented.
- [x] Test local notification is available through hidden About demo mode.
- [x] Push-token writes go through a server-side Edge Function.
- [x] Owner console can compose immediate/scheduled pushes in the Phase 1 backend scaffold.
- [ ] OPEN — Test every app button/link on physical iOS.
- [ ] OPEN — Test every app button/link on physical Android.
- [ ] OPEN — Test every deep link from cold/foreground/background states.
- [ ] OPEN — Test real remote Expo Push on a development build.
- [ ] OPEN — Test scheduled push cron end-to-end.
- [ ] OPEN — Test owner admin content and push flows on the production Supabase project.
- [ ] OPEN — Confirm Apple Developer, Google Play, Expo, Supabase and Toast accounts are all in the client's name.

## Commerce / Toast
- [x] Commerce is behind one `CommerceProvider` interface.
- [x] `COMMERCE_PROVIDER=mock|toast` controls the provider.
- [x] Phase 1 defaults to MockProvider.
- [x] Toast client credentials are designed to live only in Supabase Edge Function secrets.
- [x] Toast read-only menu/restaurant scaffold and cache are present.
- [x] Phase 2 ordering remains an in-app browser handoff to Toast Online Ordering.
- [x] The README explicitly labels the Phase 1 in-app cart as demo-only.
- [x] Native `placeOrder` throws NotImplemented and is reserved for Phase 3.
- [x] No separate production loyalty ledger is built.
- [ ] OPEN — Obtain/confirm Toast Standard API approval and scopes.
- [ ] OPEN — Validate Toast response mapping against Casa Matcha's real menus.
- [ ] OPEN — Verify Toast Loyalty status and guest loyalty URL.

## Push / admin
- [x] Permission is not requested on first launch.
- [x] A soft pre-prompt is triggered after location choice or favorite action.
- [x] Push token records carry location/topic preferences.
- [x] Push can target all, one location, or one topic.
- [x] Future push can be stored with a scheduled timestamp.
- [x] Scheduled dispatch Edge Function exists.
- [x] Minimal password-gated owner console exists; the password is verified server-side.
- [x] Owner console supports event publishing and seasonal-feature updates.
- [ ] OPEN — Configure production admin host.
- [ ] OPEN — Configure cron trigger for scheduled dispatch.
- [ ] OPEN — Rotate and document admin/cron secrets before launch.

## Handoff
- [x] `SETUP_ACCOUNTS.md` provides the client account/credential handoff structure.
- [x] `admin/README.md` explains how owners publish events and send/schedule a push.
- [ ] OPEN — Record a short owner walkthrough video after the production admin URL is finalized.
- [ ] OPEN — Confirm the client's password manager contains all account ownership/recovery details.
- [ ] OPEN — Send testimonial request on launch day.
