<?php
/**
 * Alternativa ao FormSubmit: envia o lead da Black Guará pelo servidor do próprio site.
 * Para usar, em js/app.js troque CONFIG.leadEndpoint por 'enviar-lead.php'.
 * Requer PHP com mail() configurado (ou troque por SMTP do servidor/WordPress).
 */
header('Content-Type: application/json; charset=utf-8');

$destino = 'contato@guaraequipamentos.com.br';
$assunto = 'Lead BlackFriday';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false]);
    exit;
}

$dados = json_decode(file_get_contents('php://input'), true);
if (!is_array($dados)) $dados = $_POST;

// Campo armadilha preenchido = robô
if (!empty($dados['_honey'])) {
    echo json_encode(['ok' => true]);
    exit;
}

function limpa($v, $max = 200) {
    $v = trim((string)$v);
    $v = str_replace(["\r", "\n"], ' ', $v); // impede injeção de cabeçalhos
    return mb_substr(strip_tags($v), 0, $max);
}

$nome     = limpa($dados['Nome'] ?? '');
$whatsapp = limpa($dados['WhatsApp'] ?? '', 40);
$email    = limpa($dados['E-mail'] ?? '', 120);
$cidade   = limpa($dados['Cidade'] ?? '', 120);
$origem   = limpa($dados['Origem'] ?? 'direto');
$pagina   = limpa($dados['Pagina'] ?? '', 300);
$data     = limpa($dados['Data'] ?? date('d/m/Y H:i'));

if (mb_strlen($nome) < 2 || strlen(preg_replace('/\D/', '', $whatsapp)) < 10 || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($cidade) < 2) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'erro' => 'dados_invalidos']);
    exit;
}

$corpo = "Novo lead da Black Guará\n\n"
       . "Nome: $nome\n"
       . "WhatsApp: $whatsapp\n"
       . "E-mail: $email\n"
       . "Cidade: $cidade\n"
       . "Origem: $origem\n"
       . "Página: $pagina\n"
       . "Data: $data\n";

$cabecalhos = [
    'From: Black Guara <no-reply@guaraequipamentos.com.br>',
    'Reply-To: ' . $email,
    'Content-Type: text/plain; charset=UTF-8',
];

$ok = mail($destino, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $corpo, implode("\r\n", $cabecalhos));

// Resposta automática para o lead (mesmo texto do CONFIG.autoResposta em js/app.js)
$resposta = isset($dados['_autoresponse']) ? mb_substr(strip_tags((string)$dados['_autoresponse']), 0, 3000) : '';
if ($ok && $resposta !== '') {
    $cabResp = [
        'From: Guara Equipamentos <contato@guaraequipamentos.com.br>',
        'Reply-To: contato@guaraequipamentos.com.br',
        'Content-Type: text/plain; charset=UTF-8',
    ];
    @mail($email, '=?UTF-8?B?' . base64_encode('Recebemos seu contato - Black Guará') . '?=', $resposta, implode("\r\n", $cabResp));
}
http_response_code($ok ? 200 : 500);
echo json_encode(['ok' => $ok]);
