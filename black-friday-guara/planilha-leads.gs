/**
 * Planilha de leads da Black Guará (Google Apps Script)
 *
 * Como instalar (5 minutos):
 * 1. Crie uma planilha no Google Sheets (ex.: "Leads Black Guará").
 * 2. Menu Extensões > Apps Script. Apague o que estiver lá e cole este arquivo inteiro. Salve.
 * 3. Clique em Implantar > Nova implantação > engrenagem > App da Web.
 *    - Executar como: Eu
 *    - Quem pode acessar: Qualquer pessoa
 *    Clique em Implantar e autorize com sua conta Google.
 * 4. Copie a "URL do app da Web" (termina em /exec) e envie para quem cuida da LP,
 *    que cola em CONFIG.planilhaEndpoint no arquivo js/app.js.
 *
 * Opcional: preencha AVISAR_EMAIL para receber um e-mail a cada lead (sai da sua própria conta Google,
 * sem precisar de ativação).
 */
var AVISAR_EMAIL = '';
var ABA = 'Leads';
var CABECALHO = ['Data', 'Nome', 'WhatsApp', 'E-mail', 'Cidade', 'Origem (UTM)', 'Página'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var p = (e && e.parameter) || {};
    if (p._honey) return resposta({ ok: true }); // robô
    var planilha = SpreadsheetApp.getActiveSpreadsheet();
    var aba = planilha.getSheetByName(ABA) || planilha.insertSheet(ABA);
    if (aba.getLastRow() === 0) {
      aba.appendRow(CABECALHO);
      aba.getRange(1, 1, 1, CABECALHO.length).setFontWeight('bold');
      aba.setFrozenRows(1);
    }
    var limpa = function (v) {
      v = String(v || '').slice(0, 300);
      // evita que a planilha interprete o texto como fórmula
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    };
    var linha = [p.data || new Date(), p.nome, p.whatsapp, p.email, p.cidade, p.origem, p.pagina].map(limpa);
    aba.appendRow(linha);

    if (AVISAR_EMAIL) {
      MailApp.sendEmail({
        to: AVISAR_EMAIL,
        subject: 'Lead BlackFriday',
        replyTo: p.email || undefined,
        body: CABECALHO.map(function (c, i) { return c + ': ' + linha[i]; }).join('\n')
      });
    }
    return resposta({ ok: true });
  } catch (err) {
    return resposta({ ok: false, erro: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return resposta({ ok: true, status: 'Planilha de leads Black Guará ativa' });
}

function resposta(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
