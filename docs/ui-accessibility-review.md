# FurFinder — UI Accessibility Review

**Review date:** 2026-10-31  
**Scope:** source-level review of the current Vite/React directory UI and CSS.  
**Status:** targeted improvements committed; not a complete WCAG 2.2 AA audit.

## Confirmed implementation

| Area | Current evidence | Status |
|---|---|---|
| Keyboard navigation | Global `:focus-visible` outline for links, buttons, inputs and selects | Present |
| Skip navigation | New “Skip to directory” link targets the directory section | Added in this round |
| Reduced motion | CSS disables transitions/animations and smooth scrolling when reduced motion is requested | Present |
| Touch targets | Category tabs and primary buttons have a 44px minimum height; mobile menu has a 44px minimum target | Added/standardized |
| Search labels | Search input and region selector have accessible labels | Present |
| Category controls | Category filters are buttons with `aria-pressed` state | Present |
| Loading/error feedback | Directory section exposes `aria-busy`; loading and result counts use status roles; errors use alert role | Present |
| Responsive layout | Existing 850px and 600px breakpoints; mobile listing cards stack to one column | Present |

## Remaining audit work

1. Measure text and control contrast against WCAG 2.2 AA thresholds (4.5:1 normal text, 3:1 large text and essential UI graphics). This source review did not calculate every color pairing.
2. Test 200% and 400% zoom, text resizing, reflow and long localized strings on real browsers.
3. Test keyboard-only flows and focus order across search, category filters, listing cards, submission form and moderation console.
4. Test with screen readers on at least one desktop and one mobile platform.
5. Add automated accessibility checks (for example, axe-based tests) to CI and fix findings.
6. Ensure future report/correction controls have labels, field-level errors and clear confirmation states before those workflows ship.

## Scope limitations

This review does not certify legal compliance or WCAG conformance. It does not test assistive technology, every color combination, the production deployment or third-party content. The directory remains a public-entity discovery tool; do not add attendee tracking, private member search or public profiles for minors as part of accessibility work.
