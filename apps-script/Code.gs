/**
 * Backend do Guia de Irmãos — Google Apps Script
 * Vinculado à planilha (Extensões → Apps Script), aba "Aguardando aprovação".
 *
 * Resolve R1, R2, R5, R6 e a 1ª camada de R3 da auditoria (analise seguranca.md):
 *  - A planilha pode voltar a ser privada: só este script (executando como o
 *    proprietário) precisa ler os dados.
 *  - Uma única implantação (ou as duas que já existem — ambas rodam este mesmo
 *    código, não importa qual URL é usada):
 *      - Sem ?token na URL           → JSON só com dados já publicados (uso do index.html).
 *      - ?token=<valor errado/ausente e alguém tentou> → página "Acesso negado".
 *      - ?token=<valor correto, igual à Script Property ADMIN_TOKEN> → serve a
 *        página HTML do admin, com os pendentes e telefones já embutidos pelo
 *        servidor (sem fetch entre domínios).
 *  - Por quê token em vez de checar e-mail logado: Session.getActiveUser() só é
 *    confiável para o DONO do script; para contas Google externas (o caso normal
 *    de um responsável acessando o painel), o Google não repassa a identidade ao
 *    script por padrão — então checar e-mail não funciona para ninguém além do dono.
 *    Um token secreto na URL funciona para qualquer pessoa com o link certo.
 *  - Nenhum token/telefone fica versionado no Git: tudo em Script Properties.
 *
 * CONFIGURAÇÃO NECESSÁRIA (Configurações do projeto → Propriedades do script):
 *   ADMIN_TOKEN       = (string aleatória longa — gere uma nova, não reaproveite exemplos)
 *   RESPONSAVEIS_JSON = {"Sede":"","Centro":"55XXXXXXXXX","Oeste":"55XXXXXXXXX"}
 *
 * URL do admin = <url-da-implantação>?token=<valor de ADMIN_TOKEN>
 */

const SHEET_NAME = 'Aguardando aprovação';

// Campos que o site público pode ver. Nunca incluir endereco/celula/frequente/jornada/status aqui.
const PUBLIC_FIELDS = ['nome', 'servico', 'descricao', 'categoria', 'unidade', 'whatsapp', 'instagram', 'horario', 'foto', 'emoji'];

const columnAliases = {
  'seu nome completo': 'nome',
  'prédio iba que você faz parte': 'unidade',
  'nome da célula que você participa': 'celula',
  'categoria que seu serviço/produto se enquadra': 'categoria',
  'nome do serviço': 'servico',
  'descrição do serviço': 'descricao',
  'whatsapp (com ddd)': 'whatsapp',
  'endereço / área de atendimento': 'endereco',
  'horário de atendimento': 'horario',
  'marque quais etapas da jornada do vencedor você já concluiu ou está trilhando': 'jornada',
  'você se considera frequente e assíduo nos cultos e células?': 'frequente',
};

function statusKey_(s) {
  if (!s) return '';
  return s.toString().normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

// 1ª camada de defesa contra XSS armazenado (R3): remove caracteres usados para injetar tags/atributos.
// A 2ª camada (escapeHtml no cliente) continua sendo aplicada em index.html e em Admin.html.
function sanitize_(v) {
  if (v === null || v === undefined) return '';
  return String(v).replace(/[<>`]/g, '').trim();
}

// Evita que dados vindos do formulário fechem uma tag <script> quando embutidos como JSON no HTML.
function escapeParaScript_(jsonString) {
  return jsonString.replace(/</g, '\\u003c');
}

function lerLinhas_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(function (h) {
    const key = h.toString().toLowerCase().trim();
    return columnAliases[key] || key;
  });
  return values.slice(1)
    .map(function (row) {
      const obj = {};
      headers.forEach(function (h, i) { obj[h] = sanitize_(row[i]); });
      return obj;
    })
    .filter(function (r) { return r.nome; });
}

function tokenValido_(tokenRecebido) {
  const tokenCorreto = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN') || '';
  return !!tokenCorreto && tokenRecebido === tokenCorreto;
}

function paginaNegada_() {
  return HtmlService.createHtmlOutput(
    '<!doctype html><html><head><meta charset="UTF-8">' +
    '<title>Acesso negado — Guia de Irmãos</title>' +
    '<style>' +
    'body{font-family:sans-serif;background:#FAF7F2;color:#2C1A0E;display:flex;' +
    'align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:1rem}' +
    '.box{max-width:420px}h1{font-size:1.3rem;margin-bottom:0.5rem}' +
    'p{color:#7A6248;font-size:0.9rem;line-height:1.5}' +
    '</style></head><body><div class="box">' +
    '<h1>🔒 Acesso negado</h1>' +
    '<p>O link usado não tem o token de acesso correto para o painel administrativo ' +
    'do Guia de Irmãos. Confira o link com o responsável pelo projeto.</p>' +
    '</div></body></html>'
  ).setTitle('Acesso negado');
}

function doGet(e) {
  const tokenRecebido = (e && e.parameter && e.parameter.token) || '';
  const linhas = lerLinhas_();

  if (tokenRecebido) {
    if (!tokenValido_(tokenRecebido)) {
      return paginaNegada_();
    }
    const pendentes = linhas.filter(function (r) {
      return ['publicado', 'teste', 'reprovado/incorreto'].indexOf(statusKey_(r.status)) === -1;
    });
    const responsaveis = JSON.parse(PropertiesService.getScriptProperties().getProperty('RESPONSAVEIS_JSON') || '{}');

    const template = HtmlService.createTemplateFromFile('Admin');
    template.dadosJson = escapeParaScript_(JSON.stringify(pendentes));
    template.responsaveisJson = escapeParaScript_(JSON.stringify(responsaveis));
    return template.evaluate()
      .setTitle('Aprovações Pendentes — Guia de Irmãos')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  }

  // Sem token na URL → endpoint público, só dados já publicados e com campos públicos.
  const publicados = linhas.filter(function (r) { return statusKey_(r.status) === 'publicado'; });
  const dados = publicados.map(function (r) {
    const out = {};
    PUBLIC_FIELDS.forEach(function (f) { out[f] = r[f] || ''; });
    return out;
  });
  const payload = JSON.stringify({ dados: dados });

  // ContentService não permite configurar o cabeçalho Access-Control-Allow-Origin,
  // então um fetch() de outro domínio (ex.: GitHub Pages) é bloqueado por CORS.
  // JSONP contorna isso: carregar via <script src> não é sujeito a CORS.
  const callback = (e && e.parameter && e.parameter.callback) || '';
  if (callback && /^[a-zA-Z0-9_]+$/.test(callback)) {
    return ContentService.createTextOutput(callback + '(' + payload + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(payload)
    .setMimeType(ContentService.MimeType.JSON);
}
