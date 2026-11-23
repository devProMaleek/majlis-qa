# Figma inspection and interaction decisions

Source: https://www.figma.com/design/Hy3mVWRxNcOPgTglY5yMyY

Inspected 23 November 2026 using Figma metadata, high-fidelity design context, screenshots and variable definitions before implementing each screen.

| Surface | Figma nodes |
| --- | --- |
| Attendee, mobile / desktop | `1:25`, `1:42` |
| Moderator, desktop / mobile | `1:91`, `1:131` |
| Organisation admin, mobile / desktop | `1:73`, `1:152` |
| Reusable component system | `7:36` |

No visible bitmap or SVG assets occur in these reference screens. Typography, borders, cards and controls form the visual system; no replacement imagery is needed.

## Tokens

Inter, regular / semibold / bold. Ink `#111827`; white `#ffffff`; primary blue `#2563eb`; light slate `#f1f5f9`; muted slate `#64748b`; green `#16a34a`; amber `#d97706`; border `#e2e8f0`; canvas `#f8fafc` (from screen context).

Cards: 12px radius and 16–18px padding. Desktop attendee panel: 16px radius and 30–32px padding. Mobile page gutter: 28px at 390px. Main headings: 26–30px; section headings 17–22px; body 13–15px. Controls: approximately 8–10px radius.

Section navigation uses the ink token on the light-slate surface: the original muted text on that surface measured 4.34:1, below the 4.5:1 requirement for small text. All other core Figma palette values are retained.

## Approved adjustment

The Figma specimens assign a 100px height to primary, secondary, disabled and destructive buttons and status badges. The user explicitly approved 44px minimum-height buttons and compact badges. Navigation targets are also at least 44px. Body text uses readable line heights, and success/warning text uses darker companion tokens where the original token would fail text contrast on a pale background. Destructive controls receive a distinct red treatment rather than looking identical to secondary actions.

## Missing or inconsistent interaction details

| Detail | Handling in this milestone / decision needed later |
| --- | --- |
| Admin overview says published; event details and mobile overview say draft | Consistent draft fixture. Previewing an attendee screen does not publish the fixture. Confirm final publishing prerequisites before Phase 2. |
| Queue badges say 12 new / 5 selected / 8 answered but only three example cards are shown | Use counts derived from the actual sample fixture; no simulated live totals. |
| Search scope, default filter and ordering unspecified | Local preview: New tab by default; case-insensitive search by question text or ID within the active tab, newest first. Documented preview behaviour only. |
| Mobile question detail transition unspecified | Open a labelled modal with focus management and an explicit close control; desktop keeps the master/detail layout. |
| Mobile Home / Events / Team / More and Sessions / Questions / Selected / More are text placeholders | Provide functional in-shell navigation for available content only; defer unspecified destinations. Review links switch previews, not account roles. |
| Error, disabled, loading, focus and keyboard styles incomplete | Use shadcn semantics and visible focus states; disabled mutations explain that the preview is not connected. |
| Submission length minimum, rate limits and retention not defined | Display the designed 1,000-character maximum. Do not invent server rules or accept submissions. Confirm limits, draft storage/expiry and privacy wording before Phase 3. |
| Staff role switching, invitations and organisation picker unspecified | Show organisation context, without a working role switch or tenant-access claims. Confirm membership model during authentication/RLS work. |
| Session close confirmation, restore semantics, reading-mode shortcuts and conflict resolution incomplete | Defer mutations and reading mode until the relevant designs and server-side contracts are reviewed. |
| Dark mode is not designed | Ship the approved light theme only, independent of system theme. |
| QR layout uses a placeholder and example hostname | Do not generate a misleading QR; stable route shape is present, QR generation awaits an actual deployed origin. |

## Scope boundary

Review-only links, sample fixtures and disabled actions are deliberate additions needed to make the shells inspectable. No real attendee draft is stored or sent. Production loading, success, offline/retry, auth and invitation screens must be inspected separately before implementation.
