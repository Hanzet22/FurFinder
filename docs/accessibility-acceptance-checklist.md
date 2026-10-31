# FurFinder — Accessibility Acceptance Checklist

**Status:** manual test plan; not a completed WCAG 2.2 AA audit.

## Test scope

Run against the directory landing page, search/filter controls, listing cards, listing detail dialog, submission form and any future report flow. Test mobile viewport, tablet, desktop and browser zoom.

## Visual and responsive checks

- [ ] Body text contrast meets 4.5:1; large text and meaningful UI boundaries meet 3:1.
- [ ] Focus indicators remain visible against every surface and are not clipped.
- [ ] Information is not conveyed by color alone.
- [ ] Layout reflows at 320 CSS pixels without horizontal page scrolling, except where two-dimensional content is essential.
- [ ] Text can be resized to 200% without clipping or loss of controls.
- [ ] Controls remain usable at narrow viewport widths and with enlarged system text.
- [ ] Reduced-motion preference suppresses non-essential animation.
- [ ] No flashing content or rapid motion is used.

## Keyboard and focus

- [ ] All links, buttons, filters and form controls are reachable by keyboard.
- [ ] Tab order follows the visual and semantic order.
- [ ] Focus is visible and never trapped outside a modal dialog.
- [ ] Opening the detail dialog moves focus into it.
- [ ] Escape closes the detail dialog.
- [ ] Closing the dialog restores focus to the control that opened it.
- [ ] Disabled and loading controls expose their state and cannot trigger duplicate actions.

## Semantics and assistive technology

- [ ] One descriptive page-level heading is present.
- [ ] Section headings are nested logically.
- [ ] Navigation landmarks have accessible names.
- [ ] Icon-only buttons have accessible labels.
- [ ] Search and region controls have persistent labels, not placeholder-only labels.
- [ ] Listing names and link purposes are understandable out of context.
- [ ] Loading, empty, success and error states are announced appropriately.
- [ ] Dialog title and description are programmatically associated.
- [ ] Decorative graphics are hidden from assistive technology.
- [ ] Meaningful images have useful alternative text.

## Forms and error handling

- [ ] Every field has a visible label and appropriate autocomplete/input semantics.
- [ ] Required fields are identified in text and programmatically.
- [ ] Validation errors identify the affected field and explain how to fix it.
- [ ] Errors are not communicated only through color.
- [ ] Submission status is announced without moving focus unexpectedly.
- [ ] Repeated submission is prevented while a request is in flight.
- [ ] Report and correction forms do not require unnecessary personal information.

## Touch and pointer

- [ ] Interactive targets meet WCAG 2.2 minimum target-size requirements or documented exceptions.
- [ ] Primary controls aim for 44×44 CSS pixels where practical.
- [ ] Controls have adequate spacing to prevent accidental activation.
- [ ] Drag-only interactions have a single-pointer alternative.

## Manual assistive-technology matrix

| Platform | Minimum verification |
|---|---|
| Android | TalkBack + Chrome, font scaling, switch access where available |
| iOS | VoiceOver + Safari, Dynamic Type |
| Windows | NVDA + Firefox or Chrome |
| macOS | VoiceOver + Safari |
| Keyboard-only | Chrome/Firefox/Safari where supported |

## Release gate

Do not claim WCAG 2.2 AA conformance from source inspection alone. Record browser/OS versions, assistive technology, test date, defects, severity, screenshots or reproducible steps, and retest status. Critical blockers include keyboard traps, inaccessible form errors, missing names for controls and content that becomes unusable at 200% zoom.
