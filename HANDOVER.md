# Handover — Guia de Irmãos IBA

Documento de referência para qualquer pessoa que precise manter, atualizar ou entender o projeto.

---

## 1. Visão Geral

**Guia de Irmãos** é um diretório de prestadores de serviço da Igreja Batista do Amor (IBA), Uberlândia/MG. Membros da igreja divulgam seus serviços e outros membros podem encontrá-los e contatá-los.

- **Tipo**: Site estático (HTML + CSS + JS vanilla). Sem build, sem dependências, sem servidor.
- **Hospedagem**: GitHub Pages
- **Dados**: Google Sheets (via Google Visualization API)
- **Cadastro**: Google Forms

---

## 2. Links Importantes

| Recurso | URL |
|---------|-----|
| **Site público** | https://ibacentroudi-svg.github.io/guia-irmaos-iba/index.html |
| **Painel admin** | Não é mais uma página do site. É servido pelo Apps Script — peça a URL + token ao responsável pelo projeto, ou veja `PLANO_EXECUCAO.md` (não versionado). |
| **Repositório GitHub** | https://github.com/ibacentroudi-svg/guia-irmaos-iba |
| **Planilha Google** | https://docs.google.com/spreadsheets/d/1vHifdM7VglywBGqIEE_IHNuFaN7LlXODR1zroauRzBU/edit |
| **Planilha antiga (desativada)** | https://docs.google.com/spreadsheets/d/1M-CjN8et6sTCMnpBWrQbjpqj6g8xTvdH4Gc4pTSG8zw/edit |

> O formulário Google está vinculado à planilha acima. O link do formulário pode ser obtido abrindo a planilha e clicando em **Ferramentas > Gerenciar formulário**.
>
> **Atualizado (2026-07-26):** a planilha é **privada** desde a migração de segurança (ver seção 6). Só quem já tem acesso direto (ou o Apps Script, que executa como o proprietário) consegue abrir o link acima.

---

## 3. Estrutura de Arquivos

```
guia_irmaos/
├── index.html            ← Site público (listagem de prestadores aprovados)
├── logo_iba.png          ← Logotipo da igreja
├── apps-script/
│   ├── Code.gs           ← Backend (Google Apps Script Web App) — cópia de referência,
│   │                        não é sincronizada automaticamente com o que está implantado
│   └── Admin.html        ← Painel admin, servido pelo Apps Script (substitui o antigo aprovar.html)
├── CLAUDE.md             ← Instruções para o Claude Code (não versionado)
├── HANDOVER.md           ← Este documento
└── .claude/              ← Configurações do Claude Code (não versionado)
```

> **Atualizado (2026-07-26):** `aprovar.html` foi removido. O painel admin agora vive só dentro do projeto Apps Script (não faz parte deste repositório rodando no GitHub Pages) — `apps-script/Admin.html` é uma cópia de referência que precisa ser colada manualmente no editor do Apps Script depois de qualquer alteração.

---

## 4. Fluxo Completo (do cadastro à publicação)

```
Membro preenche    →   Resposta cai na    →   Admin abre       →   Admin envia via    →   Responsável
o Google Forms         planilha (status        o painel admin       WhatsApp para o        aprova e admin
                       = Pendente)             (Apps Script,         responsável da         muda status
                                               URL com token)        unidade                para "Publicado"
                                                                                           na planilha
                                                                            ↓
                                                                    Prestador aparece
                                                                    no site público
                                                                    automaticamente
```

### Passo a passo detalhado

1. **Cadastro**: O membro preenche o Google Forms com seus dados (nome, serviço, WhatsApp, etc.)
2. **Planilha**: A resposta aparece automaticamente na aba `Aguardando aprovação` com status `Pendente`
3. **Revisão**: O admin acessa a URL do painel (Apps Script, com `?token=...`) e vê os cadastros pendentes organizados por unidade (Sede, Centro, Oeste)
4. **Envio para aprovação**: O admin clica em `📤 Enviar p/ resp.` (individual) ou `📤 Enviar todas` (lote) para enviar os dados via WhatsApp ao responsável da unidade
5. **Aprovação**: O responsável da unidade responde SIM ou NÃO pelo WhatsApp
6. **Publicação**: O admin muda o status na planilha para `Publicado` — o prestador aparece automaticamente no site público
7. **Rejeição**: Se reprovado, o admin muda o status para `Reprovado/Incorreto` — o cadastro fica oculto em ambas as páginas

---

## 5. Status Possíveis

| Status | Onde aparece | Comportamento |
|--------|-------------|---------------|
| `Pendente` (ou vazio) | Painel admin | Card normal, badge amarelo |
| `Aguardando análise` | Painel admin | Card esmaecido (72% opacidade), badge azul |
| `Publicado` | `index.html` | Visível no site público |
| `Teste` | Nenhum lugar | Oculto em ambas as páginas |
| `Reprovado/Incorreto` | Nenhum lugar | Oculto em ambas as páginas |

> A comparação de status é feita pela função `statusKey()` que remove acentos e converte para minúsculo. Exemplo: `"Publicado"` → `"publicado"`, `"Aguardando análise"` → `"aguardando analise"`.

---

## 6. Planilha — Estrutura

### Aba: `Aguardando aprovação`

Tanto o endpoint público quanto o painel admin leem desta mesma aba, mas só através do backend Apps Script (`apps-script/Code.gs`) — nenhuma página HTML acessa a planilha diretamente. O nome da aba deve ser **exatamente** `Aguardando aprovação` (com "a" minúsculo).

| Coluna | Cabeçalho | Chave no código | Origem |
|--------|-----------|-----------------|--------|
| A | Status | `status` | Manual (admin) |
| B | Carimbo de data/hora | `carimbo de data/hora` | Automático (Forms) |
| C | Seu nome completo | `nome` | Formulário |
| D | Prédio IBA que você faz parte | `unidade` | Formulário |
| E | Você se considera frequente e assíduo nos cultos e células? | `frequente` | Formulário |
| F | Nome da Célula que você participa | `celula` | Formulário |
| G | Marque quais etapas da Jornada do vencedor você já concluiu ou está trilhando | `jornada` | Formulário |
| H | Categoria que seu serviço/produto se enquadra | `categoria` | Formulário |
| I | Nome do serviço | `servico` | Formulário |
| J | Descrição do serviço | `descricao` | Formulário |
| K | WhatsApp (com DDD) | `whatsapp` | Formulário |
| L | Endereço / Área de atendimento | `endereco` | Formulário |
| M | Horário de atendimento | `horario` | Formulário |
| N | Instagram | `instagram` | Formulário |

### Como o mapeamento funciona

O código **não usa posição de coluna** (A, B, C...). Usa o **nome do cabeçalho** para encontrar cada campo. Isso significa que:

- Reordenar colunas na planilha **não quebra** o código
- Adicionar colunas novas **não quebra** o código
- Renomear cabeçalhos **quebra** o código (o texto deve bater com o `columnAliases`)

O mapeamento é feito pelo objeto `columnAliases` que converte o texto do cabeçalho (em minúsculo) para uma chave curta:

```javascript
const columnAliases = {
  'seu nome completo':                             'nome',
  'prédio iba que você faz parte':                 'unidade',
  // ... etc
};
```

### Requisitos da planilha

- **Atualizado (2026-07-26):** a planilha agora é **privada**. Só o Apps Script (executando como o proprietário) precisa acessá-la — não a torne pública de novo, isso reabriria a vulnerabilidade R1 da auditoria de segurança.
- A aba deve se chamar exatamente `Aguardando aprovação`
- A coluna `Status` deve existir (é preenchida manualmente, não vem do formulário)
- Recomenda-se ter um trigger `onFormSubmit` no Apps Script para preencher status = `Pendente` automaticamente em novas submissões

---

## 7. Unidades

O projeto suporta 3 unidades da igreja:

| Unidade | Cor | Emoji | Responsável WhatsApp |
|---------|-----|-------|---------------------|
| Sede | Azul (#1A6FA8) | 🔵 | _(não configurado)_ |
| Centro | Laranja (#A85F1A) | 🟠 | _(ver Script Properties do Apps Script)_ |
| Oeste | Verde (#1A8A2E) | 🟢 | _(ver Script Properties do Apps Script)_ |

### Adicionar/alterar número do responsável

> **Atualizado (2026-07-26):** `aprovar.html` foi removido e substituído por um painel servido pelo Apps Script (`apps-script/Admin.html`), protegido por token. Os números dos responsáveis não ficam mais no código — vivem na Script Property `RESPONSAVEIS_JSON`, editável em **Apps Script → Configurações do projeto → Propriedades do script**. Ver `apps-script/Code.gs` e `PLANO_EXECUCAO.md`/`SPEC_SEGURANCA.md` (não versionados, só locais) para o histórico completo dessa migração.

### Adicionar nova unidade

1. Adicionar a nova unidade ao objeto `unitMap` em `index.html` e em `apps-script/Admin.html`
2. Adicionar o número do responsável na Script Property `RESPONSAVEIS_JSON`
3. Adicionar cor CSS para os badges da nova unidade

---

## 8. Categorias de Serviço

As categorias vêm do Google Forms e são mapeadas para emojis no objeto `catIcons` em `index.html`. Categorias atuais:

| Categoria | Emoji |
|-----------|-------|
| Alimentação, confeitaria e sobremesas | 🍱 |
| Ar condicionado (manutenção e instalação) | ❄️ |
| Arquitetura e Design de interiores | 🏠 |
| Assistência técnica (Celular / Eletrodomésticos, etc) | 🔧 |
| Aulas e reforço escolar | 📚 |
| Auto Elétrica | 🚗 |
| Beleza e estética | 💇 |
| Cerimonial e Eventos | 🎉 |
| Consultoria e Assessoria | 💼 |
| Construção e Reforma | 🧱 |
| Contabilidade e Finanças | 💰 |
| Costura e customização | 🧵 |
| Dentista | 🦷 |
| Desenvolvedor de Sites e aplicativos | 💻 |
| Elétrica predial ou residencial | ⚡ |
| Energia Solar | ☀️ |
| Fotografia e Video | 📸 |
| Jardinagem e Paisagismo | 🌿 |
| Limpeza e Organização | 🧹 |
| Marcenaria e Móveis | 🪵 |
| Mecânica e automóveis | 🔩 |
| Moda e Vestuário | 👗 |
| Nutrição e Saúde | 🥗 |
| Pet Shop | 🐾 |
| Pintura residencial ou automotiva | 🎨 |
| Saúde e bem estar | 🌸 |
| Segurança e Câmeras | 🔒 |
| Social mídia | 📱 |
| Tecnologia e informática | 💻 |
| Transporte e fretes | 🚚 |
| Veterinária | 🐕 |
| Outros | 🔧 |

### Adicionar nova categoria

1. Adicionar a opção no Google Forms
2. Adicionar a entrada no objeto `catIcons` em `index.html` (buscar por `const catIcons`)

---

## 9. Splash Screen (Termos de Uso)

Ao acessar o site público, o visitante vê uma tela com os termos de uso antes de entrar no guia.

### Comportamento

- O texto dos termos aparece em um box com barra de rolagem customizada (funciona em desktop e mobile)
- O checkbox "Li e compreendi..." **só fica disponível** depois que o usuário rola o texto até o final
- O botão "Prosseguir" **só fica disponível** depois que o checkbox é marcado
- Após clicar em "Prosseguir", o aceite é salvo no `localStorage` por **1 hora**
- Se o usuário voltar dentro de 1 hora, a splash é pulada automaticamente

### Alterar o tempo de expiração

No script de `index.html`, buscar por `UMA_HORA`:

```javascript
const UMA_HORA = 60 * 60 * 1000;  // 1 hora em milissegundos
```

### Alterar o texto dos termos

O texto está no HTML de `index.html`, dentro da div `class="splash-text"`. Basta editar o conteúdo, usar `<br><br>` para separar parágrafos.

---

## 10. Mensagens WhatsApp

### Envio Individual

Quando o admin clica em `📤 Enviar p/ resp.`, a mensagem enviada ao responsável contém:

1. Nome
2. Serviço
3. Unidade
4. Frequente (assiduidade nos cultos)
5. Etapas da Jornada Vencedor concluídas
6. Célula
7. WhatsApp (link direto)
8. Instagram

### Envio em Lote

Quando o admin clica em `📤 Enviar todas`, a mensagem contém os mesmos 8 campos para cada pendente da unidade, com cabeçalho indicando quantidade.

### Alterar campos da mensagem

Editar as funções `gerarMensagem()` (individual) e `gerarMensagemLote()` (lote) em `apps-script/Admin.html`. Depois de editar, colar o conteúdo atualizado no editor do Apps Script e implantar uma **Nova versão** (editar o arquivo aqui no repositório não atualiza o painel em produção por si só).

---

## 11. Design System

### Cores

| Variável CSS | Valor | Uso |
|-------------|-------|-----|
| `--cream` | #FAF7F2 | Fundo da página |
| `--warm-white` | #FFFDF9 | Fundo dos cards |
| `--gold` | #C8963E | Cor de destaque, botões |
| `--gold-light` | #E8B86D | Destaques suaves |
| `--gold-pale` | #F5E6CC | Badges, fundos sutis |
| `--brown-dark` | #2C1A0E | Header, textos fortes |
| `--brown-mid` | #5C3D1E | Textos médios |
| `--text` | #1E1209 | Texto do corpo |
| `--text-muted` | #7A6248 | Textos secundários |
| `--border` | #E8D9C4 | Bordas |

### Fontes

- **Playfair Display** (serif) — títulos, destaques
- **DM Sans** (sans-serif) — corpo, interface

---

## 12. Como Fazer Alterações Comuns

### Publicar um prestador

1. Abrir a planilha
2. Encontrar a linha do prestador
3. Mudar a coluna `Status` para `Publicado`
4. O prestador aparece no site público automaticamente (sem deploy)

### Reprovar um cadastro

1. Mudar status para `Reprovado/Incorreto` na planilha
2. O cadastro desaparece do painel admin automaticamente

### Trocar de planilha

**Atualizado (2026-07-26):** não existe mais um `SHEET_ID` configurável em `index.html` — o Apps Script é **vinculado** (container-bound) diretamente à planilha, então "trocar de planilha" significa recriar o projeto Apps Script vinculado à nova planilha (Extensões → Apps Script na planilha nova), colar `apps-script/Code.gs` e `apps-script/Admin.html`, reconfigurar as Script Properties (`ADMIN_TOKEN`, `RESPONSAVEIS_JSON`) e reimplantar — o que gera URLs novas, então `PUBLIC_ENDPOINT` em `index.html` também precisa ser atualizado.

### Adicionar uma nova pergunta ao formulário

1. Adicionar a pergunta no Google Forms
2. Se a nova coluna precisar ser usada no código, adicionar o mapeamento em `columnAliases` **dentro de `apps-script/Code.gs`** (única fonte agora — `index.html` não tem mais esse objeto)
3. Se o campo for sensível ou só relevante pra aprovação (como `frequente`/`jornada`), garantir que ele **não** está na lista `PUBLIC_FIELDS` do `Code.gs`
4. Adicionar a renderização nos cards/mensagens do `apps-script/Admin.html` conforme necessário
5. Colar o `Code.gs`/`Admin.html` atualizado no editor do Apps Script e implantar uma **Nova versão** nas duas implantações

### Deploy

`index.html` não tem build — commit e push pra `main` atualiza o GitHub Pages em 1-3 minutos:

```bash
git add .
git commit -m "Descrição da alteração"
git push origin main
```

O backend (`apps-script/Code.gs` e `apps-script/Admin.html`) **não é publicado pelo git** — commitar aqui só guarda o histórico. Pra valer em produção, é preciso colar o conteúdo no editor do Apps Script e, em **Implantar → Gerenciar implantações**, escolher **Nova versão** e **Implantar** em cada uma das implantações existentes.

---

## 13. Detalhes Técnicos Importantes

### Backend (Apps Script) — como os dados chegam até a página

**Atualizado (2026-07-26):** nenhuma página HTML fala mais direto com a API `gviz` do Google Sheets — essa abordagem foi abandonada porque exigia a planilha pública (ver `analise seguranca.md`, achado R1). Hoje:

- `apps-script/Code.gs` lê a planilha internamente via `SpreadsheetApp`, filtra e devolve JSON.
- `index.html` busca esse JSON via **JSONP** (`jsonp()`, carregando um `<script src="...&callback=...">`), **não** via `fetch()` — um `fetch()` cross-origin pra esse endpoint é bloqueado por CORS, já que `ContentService` do Apps Script não permite configurar `Access-Control-Allow-Origin`. Se for tocar nessa parte do código, mantenha o JSONP.
- O painel admin (`apps-script/Admin.html`) é servido inteiro pelo Apps Script — os dados já chegam embutidos no HTML, sem fetch nenhum.

### Índice do Modal (index.html)

Os cards usam `prestadores.indexOf(p)` para abrir o modal — **nunca** `p.id - 1`. Isso porque `prestadores` é um array filtrado (só Publicados), e o `p.id` original da planilha não corresponde à posição no array.

### Botão Instagram

O botão Instagram é **sempre renderizado** nos cards e no modal. Quando o campo está vazio, ele aparece com opacidade reduzida e sem link — nunca é escondido com `display:none`.

### Normalização de Unidades

A planilha pode ter `"Sede"` ou `"Iba Sede"`. A função `unidadeKey()` normaliza ambas para `"Sede"`. O mesmo vale para Centro e Oeste.

### WhatsApp — Formatação do Número

A função `limparTel()` remove todos os caracteres não numéricos e adiciona o prefixo `55` (Brasil) se não estiver presente.

---

## 14. Troubleshooting

| Problema | Causa provável | Solução |
|----------|---------------|---------|
| Site não carrega dados | Endpoint Apps Script fora do ar, ou implantação sem "Nova versão" após editar o código | Testar a URL do `PUBLIC_ENDPOINT` direto no navegador; deve devolver `{"dados":[...]}`. **Não** torne a planilha pública para "resolver" isso. |
| Prestador publicado não aparece | Nome da aba errado (case-sensitive) | Verificar que a aba se chama exatamente `Aguardando aprovação` |
| Coluna nova não aparece no código | Falta mapeamento em `columnAliases` | Adicionar o cabeçalho (em minúsculo) no objeto `columnAliases` **em `apps-script/Code.gs`** |
| Card abre modal errado | Uso de `p.id - 1` ao invés de `indexOf` | Usar `prestadores.indexOf(p)` |
| WhatsApp não envia para responsável | Número vazio/errado em `RESPONSAVEIS_JSON` | Configurar o número na Script Property `RESPONSAVEIS_JSON` do Apps Script (não fica mais em nenhum arquivo de código) |
| Painel admin mostra "Acesso negado" | Token errado ou ausente na URL | Confirmar que a URL termina em `?token=` seguido do valor exato da Script Property `ADMIN_TOKEN` |
| Painel admin quebra com "Invalid or unexpected token" no console | `https://` literal dentro de um `<script>` em `Admin.html`, truncado pelo editor do Apps Script | Reconstruir a URL a partir de fragmentos concatenados (ver constante `WA_PREFIXO`) em vez de escrever `https://` direto no código |
| Edições em `apps-script/*` não aparecem em produção | Faltou reimplantar | No editor do Apps Script: Implantar → Gerenciar implantações → ✏️ → Versão: Nova versão → Implantar (repetir pra cada implantação) |
| Splash aparece toda vez | localStorage limpo ou expirado | Comportamento normal — expira em 1 hora |
| Scrollbar não aparece no mobile | CSS nativo do mobile esconde | Já resolvido com scrollbar customizada via JS |
