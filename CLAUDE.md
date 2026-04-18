# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Guia de Irmãos** — a single-page directory of service providers from Igreja Batista do Amor (IBA), Uberlândia/MG. Members of the church can browse and contact fellow members who offer professional services.

The entire app is a **single HTML file** (`index.html`) with no build step, no dependencies to install, and no server — it runs directly in the browser.

## Architecture

The app has three layers, all in `index.html`:

1. **Data source — Google Sheets**: Data is fetched at runtime via the Google Visualization API from a public spreadsheet. The two config constants at the top of the `<script>` block are the only things that need changing to point to a different sheet:
   ```js
   const SHEET_ID   = '...';
   const SHEET_NAME = 'Publicados';
   ```
   The sheet columns (mapped by lowercase label) used in code: `nome`, `servico`, `descricao`, `categoria`, `unidade`, `celula`, `whatsapp`, `foto`, `emoji`, `endereco`, `horario`, `instagram`.

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

No build step. Deploy by serving `index.html` as a static file (GitHub Pages, Netlify, etc.). The Google Sheet must be published publicly ("anyone with the link can view").

## UI/UX Preferences
- Prefer simple, intuitive solutions over clever ones (e.g., avoid horizontal scroll for mobile navigation, avoid decorative backgrounds like capsules unless requested)
- When styling decisions are ambiguous, propose 2-3 options before implementing rather than picking one
- Mobile layouts should use standard patterns (stacked/wrapped) unless explicitly asked for scroll or carousel behavior

## Git Workflow 
- After completing a feature or fix, stage changes, write a concise commit message, and push to the remote unless told otherwise
- Group related changes into a single commit rather than many small ones