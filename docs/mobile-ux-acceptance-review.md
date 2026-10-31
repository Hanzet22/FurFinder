# FurFinder — Mobile UX and Accessibility Acceptance Review

**Round:** 95  
**Review type:** documentation and acceptance-criteria review; not a live browser, device, screen-reader or WCAG conformance audit.  
**Status:** Yellow Flag — implementation and manual verification remain outstanding.

## UX baseline

The web directory and planned Flutter companion should share a simple discovery model:

1. Explore public entities by category and broad region.
2. Search with clearly labeled filters and predictable reset behavior.
3. Open a detail view with a concise description, official website, supported location/date facts, source state and last-checked date.
4. Report an error or request a correction through a moderated path; do not expose a public discussion or direct-message feature.
5. Understand loading, empty, offline, stale and error states without relying on color alone.

## Responsive and interaction acceptance

- Reflow at 320 CSS pixels without horizontal page scrolling for ordinary content.
- Preserve readable content and operable controls at 200% text zoom.
- Keep touch targets adequately sized and spaced; aim for 44×44 CSS pixels where practical.
- Provide visible keyboard focus, logical tab order, skip navigation and focus restoration after dialogs.
- Search, region and category controls require persistent accessible labels.
- Announce result counts, validation errors and asynchronous status changes to assistive technology.
- Respect reduced-motion settings; do not use flashing or rapid animation.
- Avoid color-only status communication; pair status colors with text labels.
- Keep source and last-reviewed metadata readable at narrow widths.
- Use clear empty/offline states that preserve access to cached public metadata without implying that stale data is current.

## Mobile companion boundary

The Flutter companion remains **PRD-only** and is not claimed as implemented or build-tested in this round.

For its first implementation milestone:
- Read-only public directory browsing only.
- Consume the same versioned HTTPS API as the web client.
- Cache public listing metadata only, with a visible refresh timestamp.
- Never bundle Supabase secret/service-role credentials.
- Do not add attendee/member discovery, direct messaging, private meetups, real-time personal location, adult-content discovery or public profiles for minors.
- Keep report/correction actions behind a separately reviewed, rate-limited and moderated API contract.
- Keep profile features out of the MVP; adult profiles, if ever introduced, require voluntary registration, eligibility controls, explicit consent, preview, withdrawal and deletion.

## Required manual test evidence

Record the exact app build/commit, browser or OS version, assistive technology and version, viewport, test date, result, defect severity, reproduction steps and retest status.

| Platform / mode | Required checks |
|---|---|
| Android + Chrome | TalkBack, font scaling, narrow layout, switch access where available |
| iOS + Safari | VoiceOver, Dynamic Type, narrow layout |
| Windows | NVDA with a supported browser |
| macOS | VoiceOver with Safari |
| Keyboard only | Full navigation, dialog focus, Escape and focus restoration |
| Browser zoom | 200% zoom and 320 CSS-pixel reflow |
| Motion | Reduced-motion preference and no flashing content |

## Release decision

No manual device or assistive-technology test was performed as part of this documentation pass. Do not claim WCAG 2.2 AA conformance. Keep the release gate Yellow until the checklist has been executed against the exact candidate build and defects have been retested.
