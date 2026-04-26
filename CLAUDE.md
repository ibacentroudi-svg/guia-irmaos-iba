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
Reads from the **`Aguardando aprovação`** tab (same tab as the admin page), filtering for `status = "Publicado"`. Marcar uma entrada como `Publicado` na planilha já a exibe no site automaticamente — não é necessário copiar para nenhuma aba separada.

1. **Data source**: `SHEET_ID` + `SHEET_NAME = 'Aguardando aprovação'`. Uses the same `columnAliases` map (shared logic with `aprovar.html`) to normalise form headers to short keys: `nome`, `servico`, `descricao`, `categoria`, `unidade`, `celula`, `whatsapp`, `endereco`, `horario`, `instagram`.
2. **Status filter**: `statusKey(p.status) === 'publicado'` — strips accents, lowercases. Only `Publicado` entries reach the public site.
3. **State & rendering**: Global state in `prestadores`, `categoriaAtiva`, `unidadeAtiva`. UI rebuilt by `renderCards()` and `renderCats()`.
4. **Units (unidades)**: Three locations — Sede, Centro, Oeste. The spreadsheet may use short (`"Sede"`) or prefixed (`"Iba Sede"`) forms; `unidadeKey()` normalises both.

> **Note:** A aba `Publicados` existe na planilha mas não é mais usada pelo código.

### `aprovar.html` (admin)
Reads from the **`Aguardando aprovação`** tab (lowercase `a` in "aprovação" — the gviz API is case-sensitive on tab names).

- **Column aliasing**: This tab's headers come straight from the Google Form (e.g. `Seu nome completo`, `Prédio IBA que você faz parte`). The `columnAliases` map normalises them to short keys (`nome`, `unidade`, etc.). Current aliases also cover the two newer form questions: `jornada` (etapas da Jornada do Vencedor) and `frequente` (assiduidade nos cultos/células).
- **Status filter**: Entries with status `Publicado` are hidden; `Pendente` (or empty) and `Aguardando análise` are shown. `Aguardando análise` cards render dimmed. `statusKey()` strips accents and lowercases for robust matching. New form submissions get `Pendente` automatically via an Apps Script `onFormSubmit` trigger on the spreadsheet.
- **WhatsApp delivery**: Each card has a `📤 Enviar p/ resp.` button (sends one entry to the unit's responsável) and each unit section has a `📤 Enviar todas` button (batch). The destination numbers live in the `RESPONSAVEIS` constant at the top of the script (one per unit, with `55` country code prefix). Empty number → alert.
- **State & rendering**: Pure vanilla JS. Global state lives in `pendentes`. All UI rebuilt from scratch on load by `renderSecoes()`.
- **Units (unidades)**: Three church locations — Sede, Centro, Oeste. The spreadsheet may use either short form (`"Sede"`) or prefixed form (`"Iba Sede"`); `unidadeKey()` normalises both.

## Key Design Details

- **Splash screen**: Shown on every load. The "Prosseguir" button stays disabled until the checkbox is checked. No localStorage persistence — it always appears.
- **Avatar fallback**: `<img onerror>` falls back to the category emoji via `getIcon(p.categoria)`, then `'👤'`. The `emoji` field (from the old `Publicados` tab) is checked first if present.
- **WhatsApp links**: `limparTel()` strips non-digits and prepends `55` (Brazil country code) if not already present.

## Design System

CSS custom properties (defined in `:root`):
- Colors: `--cream`, `--warm-white`, `--gold`, `--gold-light`, `--gold-pale`, `--brown-dark`, `--brown-mid`, `--text`, `--text-muted`, `--border`
- Fonts: `Playfair Display` (serif, headings/accents) and `DM Sans` (body)

## Deployment

No build step. Deploy by serving the HTML files as static assets (GitHub Pages, Netlify, etc.). The Google Sheet must be published publicly ("anyone with the link can view") — the `Aguardando aprovação` tab must be public (both pages read from it).

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