# Frontend — Guia de Irmãos

## Constraints
- Everything lives in a single file: `index.html`. Never create separate CSS or JS files.
- No external libraries or frameworks — pure HTML, CSS, and vanilla JS only.
- Google Fonts (`Playfair Display`, `DM Sans`) are the only allowed external resources besides the data sheet.

## Design System
Always use the existing CSS custom properties — never hardcode colors or add new variables without good reason:

| Variable | Use |
|---|---|
| `--cream` / `--warm-white` | Page and card backgrounds |
| `--gold` / `--gold-light` / `--gold-pale` | Accents, borders, badges, hover states |
| `--brown-dark` / `--brown-mid` | Header, modal top, strong text |
| `--text` / `--text-muted` | Body copy and secondary labels |
| `--border` | Dividers and card borders |

Typography rules (from the official frontend-design skill):
- `Playfair Display` (serif) → headings, hero, modal names, section titles
- `DM Sans` (sans-serif) → all body copy, buttons, labels, badges
- Never use Arial, Inter, or generic system fonts for new elements

## Aesthetic Principles (adapted from anthropics/skills frontend-design)
- Commit to the existing warm, gold-on-dark palette — don't introduce new color families
- Animations should be subtle and purposeful (`fadeIn`, `modalIn`, `splashPulse` are the established patterns)
- Use `box-shadow`, `border-radius`, and `backdrop-filter` to add depth — avoid flat or overly decorative treatments
- Spatial composition: cards use consistent padding (`1.25rem`), gaps (`1.25rem`), and border-radius (`14px`)

## Mobile Rules
- Layouts must stack vertically on `max-width: 768px` — no horizontal scroll
- Sidebar collapses to an accordion on mobile (chevron toggle, `max-height` transition)
- Touch targets must be comfortably tappable (min ~40px height)
- CTA button uses `.cta-full` / `.cta-short` classes to shorten text on screens under `480px`
