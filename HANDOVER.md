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
| **Painel admin** | https://ibacentroudi-svg.github.io/guia-irmaos-iba/aprovar.html |
| **Repositório GitHub** | https://github.com/ibacentroudi-svg/guia-irmaos-iba |
| **Planilha Google** | https://docs.google.com/spreadsheets/d/1vHifdM7VglywBGqIEE_IHNuFaN7LlXODR1zroauRzBU/edit |
| **Planilha antiga (desativada)** | https://docs.google.com/spreadsheets/d/1M-CjN8et6sTCMnpBWrQbjpqj6g8xTvdH4Gc4pTSG8zw/edit |

> O formulário Google está vinculado à planilha acima. O link do formulário pode ser obtido abrindo a planilha e clicando em **Ferramentas > Gerenciar formulário**.

---

## 3. Estrutura de Arquivos

```
guia_irmaos/
├── index.html        ← Site público (listagem de prestadores aprovados)
├── aprovar.html      ← Painel admin (revisão de cadastros pendentes)
├── logo_iba.png      ← Logotipo da igreja
├── CLAUDE.md         ← Instruções para o Claude Code
├── HANDOVER.md       ← Este documento
└── .claude/          ← Configurações do Claude Code
```

---

## 4. Fluxo Completo (do cadastro à publicação)

```
Membro preenche    →   Resposta cai na    →   Admin abre       →   Admin envia via    →   Responsável
o Google Forms         planilha (status        aprovar.html         WhatsApp para o        aprova e admin
                       = Pendente)             e visualiza          responsável da         muda status
                                               os pendentes         unidade                para "Publicado"
                                                                                           na planilha
                                                                            ↓
                                                                    Prestador aparece
                                                                    no site público
                                                                    automaticamente
```

### Passo a passo detalhado

1. **Cadastro**: O membro preenche o Google Forms com seus dados (nome, serviço, WhatsApp, etc.)
2. **Planilha**: A resposta aparece automaticamente na aba `Aguardando aprovação` com status `Pendente`
3. **Revisão**: O admin acessa `aprovar.html` e vê os cadastros pendentes organizados por unidade (Sede, Centro, Oeste)
4. **Envio para aprovação**: O admin clica em `📤 Enviar p/ resp.` (individual) ou `📤 Enviar todas` (lote) para enviar os dados via WhatsApp ao responsável da unidade
5. **Aprovação**: O responsável da unidade responde SIM ou NÃO pelo WhatsApp
6. **Publicação**: O admin muda o status na planilha para `Publicado` — o prestador aparece automaticamente no site público
7. **Rejeição**: Se reprovado, o admin muda o status para `Reprovado/Incorreto` — o cadastro fica oculto em ambas as páginas

---

## 5. Status Possíveis

| Status | Onde aparece | Comportamento |
|--------|-------------|---------------|
| `Pendente` (ou vazio) | `aprovar.html` | Card normal, badge amarelo |
| `Aguardando análise` | `aprovar.html` | Card esmaecido (72% opacidade), badge azul |
| `Publicado` | `index.html` | Visível no site público |
| `Teste` | Nenhum lugar | Oculto em ambas as páginas |
| `Reprovado/Incorreto` | Nenhum lugar | Oculto em ambas as páginas |

> A comparação de status é feita pela função `statusKey()` que remove acentos e converte para minúsculo. Exemplo: `"Publicado"` → `"publicado"`, `"Aguardando análise"` → `"aguardando analise"`.

---

## 6. Planilha — Estrutura

### Aba: `Aguardando aprovação`

Ambas as páginas leem desta mesma aba. O nome deve ser **exatamente** `Aguardando aprovação` (com "a" minúsculo) — a API do Google é case-sensitive.

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

- Deve estar **publicada** como "qualquer pessoa com o link pode ver"
- A aba deve se chamar exatamente `Aguardando aprovação`
- A coluna `Status` deve existir (é preenchida manualmente, não vem do formulário)
- Recomenda-se ter um trigger `onFormSubmit` no Apps Script para preencher status = `Pendente` automaticamente em novas submissões

---

## 7. Unidades

O projeto suporta 3 unidades da igreja:

| Unidade | Cor | Emoji | Responsável WhatsApp |
|---------|-----|-------|---------------------|
| Sede | Azul (#1A6FA8) | 🔵 | _(não configurado)_ |
| Centro | Laranja (#A85F1A) | 🟠 | 5534984418703 |
| Oeste | Verde (#1A8A2E) | 🟢 | 5534996942173 |

### Adicionar/alterar número do responsável

Editar a constante `RESPONSAVEIS` no início do script em `aprovar.html`:

```javascript
const RESPONSAVEIS = {
  'Sede':   '5534999990001',     // ← número com código do país (55) + DDD
  'Centro': '5534984418703',
  'Oeste':  '5534996942173',
};
```

### Adicionar nova unidade

1. Adicionar a nova unidade ao objeto `unitMap` em **ambos os arquivos** (`index.html` e `aprovar.html`)
2. Adicionar o número do responsável em `RESPONSAVEIS` (`aprovar.html`)
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

Editar as funções `gerarMensagem()` (individual) e `gerarMensagemLote()` (lote) em `aprovar.html`.

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

### Alterar o SHEET_ID (trocar planilha)

Atualizar a constante `SHEET_ID` em **ambos** os arquivos:
- `index.html` — buscar `const SHEET_ID`
- `aprovar.html` — buscar `const SHEET_ID`

O ID está na URL da planilha: `docs.google.com/spreadsheets/d/ESTE_ID_AQUI/edit`

### Adicionar uma nova pergunta ao formulário

1. Adicionar a pergunta no Google Forms
2. Se a nova coluna precisar ser usada no código, adicionar o mapeamento em `columnAliases`:
   - Em `aprovar.html` — se a info for relevante para aprovação
   - Em `index.html` — se a info for exibida no site público
3. Adicionar a renderização nos cards/mensagens conforme necessário

### Deploy

Não há build. Basta commitar e fazer push para `main`:

```bash
git add .
git commit -m "Descrição da alteração"
git push origin main
```

O GitHub Pages atualiza automaticamente em 1-3 minutos.

---

## 13. Detalhes Técnicos Importantes

### API do Google Sheets

Ambas as páginas usam a URL:
```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/gviz/tq?tqx=out:json&sheet={SHEET_NAME}
```

A resposta vem envolvida em `google.visualization.Query.setResponse(...)` e é extraída via regex.

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
| Site não carrega dados | Planilha não está pública | Compartilhar como "qualquer pessoa com o link" |
| Prestador publicado não aparece | Nome da aba errado (case-sensitive) | Verificar que a aba se chama exatamente `Aguardando aprovação` |
| Coluna nova não aparece no código | Falta mapeamento em `columnAliases` | Adicionar o cabeçalho (em minúsculo) no objeto `columnAliases` |
| Card abre modal errado | Uso de `p.id - 1` ao invés de `indexOf` | Usar `prestadores.indexOf(p)` |
| WhatsApp não envia para responsável | Número vazio no `RESPONSAVEIS` | Configurar o número na constante em `aprovar.html` |
| Splash aparece toda vez | localStorage limpo ou expirado | Comportamento normal — expira em 1 hora |
| Scrollbar não aparece no mobile | CSS nativo do mobile esconde | Já resolvido com scrollbar customizada via JS |
