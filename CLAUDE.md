# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Guia de Irmãos** — a single-page directory of service providers from Igreja Batista do Amor (IBA), Uberlândia/MG. Members of the church can browse and contact fellow members who offer professional services.

The project has **two HTML pages** (no build step, no dependencies, no server):
- `index.html` — public site listing approved providers
- `aprovar.html` — internal admin page for reviewing pending submissions (not linked from the public site)

## Architecture

Both pages share the same patterns: vanilla JS, fetch from Google Sheets via the Visualization API, all state and rendering rebuilt from scratch on each change.

### `index.html` (public)
Reads from the **`Publicados`** tab. Three layers:
1. **Data source**: `SHEET_ID` + `SHEET_NAME = 'Publicados'`. Columns used (mapped by lowercase label): `nome`, `servico`, `descricao`, `categoria`, `unidade`, `celula`, `whatsapp`, `foto`, `emoji`, `endereco`, `horario`, `instagram`.
2. **State & rendering**: Global state in `prestadores`, `categoriaAtiva`, `unidadeAtiva`. UI rebuilt by `renderCards()` and `renderCats()`.
3. **Units (unidades)**: Three locations — Sede, Centro, Oeste. The spreadsheet may use short (`"Sede"`) or prefixed (`"Iba Sede"`) forms; `unidadeKey()` normalises both.

### `aprovar.html` (admin)
Reads from the **`Aguardando aprovação`** tab (lowercase `a` in "aprovação" — the gviz API is case-sensitive on tab names).

- **Column aliasing**: This tab's headers come straight from the Google Form (e.g. `Seu nome completo`, `Prédio IBA que você faz parte`). A `columnAliases` map normalises them to the same short keys used by `index.html` (`nome`, `unidade`, etc.) so render logic can be shared.
- **Status filter**: Reads the `Status` column. Entries with status `Publicado` are hidden; `Pendente` (or empty) and `Aguardando análise` are shown. `Aguardando análise` cards render dimmed. `statusKey()` strips accents and lowercases for robust matching. New form submissions get `Pendente` automatically via an Apps Script `onFormSubmit` trigger on the spreadsheet.
- **WhatsApp delivery**: Each card has a `📤 Enviar p/ resp.` button (sends one entry to the unit's responsável) and each unit section has a `📤 Enviar todas` button (batch). The destination numbers live in the `RESPONSAVEIS` constant at the top of the script (one per unit, with `55` country code prefix). Empty number → alert.

2. **State & rendering**: Pure vanilla JS. Global state lives in three variables (`prestadores`, `categoriaAtiva`, `unidadeAtiva`). All UI is rebuilt from scratch on each filter/search change by `renderCards()` and `renderCats()`.

3. **Units (unidades)**: Three church locations — Sede, Centro, Oeste. The spreadsheet may use either short form (`"Sede"`) or prefixed form (`"Iba Sede"`); `unidadeKey()` normalises both.

## Key Design Details

- **Splash screen**: Shown on every load. The "Prosseguir" button stays disabled until the checkbox is checked. No localStorage persistence — it always appears.
- **Avatar fallback**: `<img onerror>` falls back to the `emoji` field, then `'👤'`.
- **WhatsApp links**: `limparTel()` strips non-digits and prepends `55` (Brazil country code) if not already present.

## Design System

CSS custom properties (defined in `:root`):
- Colors: `--cream`, `--warm-white`, `--gold`, `--gold-light`, `--gold-pale`, `--brown-dark`, `--brown-mid`, `--text`, `--text-muted`, `--border`
- Fonts: `Playfair Display` (serif, headings/accents) and `DM Sans` (body)

## Deployment

No build step. Deploy by serving the HTML files as static assets (GitHub Pages, Netlify, etc.). The Google Sheet must be published publicly ("anyone with the link can view") — both the `Publicados` and `Aguardando aprovação` tabs.

Live URLs (GitHub Pages):
- Public: `https://ibacentroudi-svg.github.io/guia-irmaos-iba/index.html`
- Admin: `https://ibacentroudi-svg.github.io/guia-irmaos-iba/aprovar.html`

## UI/UX Preferences
- Prefer simple, intuitive solutions over clever ones (e.g., avoid horizontal scroll for mobile navigation, avoid decorative backgrounds like capsules unless requested)
- When styling decisions are ambiguous, propose 2-3 options before implementing rather than picking one
- Mobile layouts should use standard patterns (stacked/wrapped) unless explicitly asked for scroll or carousel behavior

## Git Workflow 
- After completing a feature or fix, stage changes, write a concise commit message, and push to the remote unless told otherwise
- Group related changes into a single commit rather than many small ones