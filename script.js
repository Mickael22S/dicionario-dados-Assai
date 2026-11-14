// Colunas: [atributo, descricao, tipo, constraints, privacidade, linhagem?, rbac?]
const PK='[PK] [NOT NULL]', NN='[NOT NULL]', N='[NULL]', FK=' [FK]';
const ADM='Administrador: C,R,U,I.';
const T=[
{n:'cidade',d:'Municípios e UF usados nos endereços de clientes e de lojas.',
 lin:'Origem: cadastro administrativo. Destino: endereco, loja.',rbac:ADM+' Demais perfis: R.',
 c:[['id_cidade','Identificador único da cidade.','INT',PK+' AUTO_INCREMENT','NA'],
 ['nome','Nome do município.','VARCHAR(100)',NN,'NA'],
 ['uf','Sigla da unidade da federação (2 letras).','CHAR(2)',NN,'NA']]},
{n:'categoria',d:'Agrupamento comercial dos produtos do catálogo.',
 lin:'Origem: cadastro do catálogo (RF02). Destino: produto.',rbac:'Gerente e Administrador: C,R,U,I. Cliente: R (ativas).',
 c:[['id_categoria','Identificador único da categoria.','INT',PK+' AUTO_INCREMENT','NA'],
 ['nome','Nome da categoria; não pode repetir.','VARCHAR(80)',NN+' [UNIQUE]','NA'],
 ['ativo','Exclusão lógica: 1 ativa, 0 inativa.','TINYINT',NN+' DEFAULT 1','NA']]},
{n:'forma_pagamento',d:'Formas de pagamento oferecidas no site e escolhidas na finalização do pedido.',
 lin:'Origem: cadastro administrativo (RF09). Destino: pedido.',rbac:ADM+' Cliente: R (ativas).',
 c:[['id_forma_pagamento','Identificador único da forma de pagamento.','INT',PK+' AUTO_INCREMENT','NA'],
 ['descricao','Descrição da forma de pagamento; única.','VARCHAR(60)',NN+' [UNIQUE]','NA'],
 ['ativo','Exclusão lógica; inativa não pode ser usada em novo pedido (RN10).','TINYINT',NN+' DEFAULT 1','NA']]},
{n:'usuario',d:'Colaboradores internos (Gerente e Administrador) com perfil de acesso.',
 lin:'Origem: cadastro pelo Administrador (RF08). Destino: ajuste_estoque, estorno, log_auditoria.',rbac:ADM+' Gerente: sem acesso. Ninguém consulta senha_hash.',
 c:[['id_usuario','Identificador único do usuário interno.','INT',PK+' AUTO_INCREMENT','NA'],
 ['nome','Nome do colaborador.','VARCHAR(100)',NN,'DP'],
 ['login','Credencial de acesso; única.','VARCHAR(50)',NN+' [UNIQUE]','DP'],
 ['senha_hash','Hash da senha (Argon2id/bcrypt); nunca texto claro.','VARCHAR(255)',NN,'DP','Origem: aplicação (hash). Destino: autenticação.','Somente o serviço de autenticação; nenhum perfil consulta.'],
 ['perfil','Perfil de acesso: GERENTE ou ADMINISTRADOR.','VARCHAR(13)',NN,'NA'],
 ['ativo','Exclusão lógica; usuário inativo não autentica.','TINYINT',NN+' DEFAULT 1','NA']]},
{n:'cliente',d:'Pessoa física ou jurídica compradora do site, com dados cifrados e controle de consentimento LGPD.',
 lin:'Origem: autocadastro do cliente (RF01). Destino: endereco, pedido, log_auditoria, solicitacao_lgpd.',rbac:'Cliente: C,R,U,I (próprio). Gerente: R. Administrador: C,R,U,I.',
 c:[['id_cliente','Identificador único do cliente.','INT',PK+' AUTO_INCREMENT','NA'],
 ['nome_razao_social','Nome completo (PF) ou razão social (PJ).','VARCHAR(150)',NN,'DP'],
 ['cpf_cnpj_cifrado','CPF/CNPJ cifrado com AES-256.','VARCHAR(255)',NN,'DP','Origem: formulário de cadastro (cifrado na aplicação). Destino: exportação LGPD.','Cliente (próprio) e Administrador.'],
 ['cpf_cnpj_hash','Hash do CPF/CNPJ que garante unicidade sem expor o dado.','CHAR(64)',NN+' [UNIQUE]','DP'],
 ['tipo_cliente','Tipo do cliente: PF ou PJ (define acesso a produtos exclusivos de atacado).','VARCHAR(2)',NN,'NA'],
 ['email','E-mail de contato e login; único.','VARCHAR(150)',NN+' [UNIQUE]','DP'],
 ['senha_hash','Hash da senha do cliente; excluída da exportação LGPD.','VARCHAR(255)',NN,'DP','Origem: aplicação (hash). Destino: autenticação.','Somente o serviço de autenticação.'],
 ['telefone','Telefone principal.','VARCHAR(20)',NN,'DP'],
 ['data_consentiment','Data e hora do aceite do termo LGPD (grafia atual do DDL; ver ajustes).','TIMESTAMP',NN,'NA'],
 ['data_anonimizacao','Data da anonimização irreversível; nulo enquanto não anonimizado.','TIMESTAMP',N+' DEFAULT NULL','NA'],
 ['ativo','Exclusão lógica; cliente com pedidos nunca é excluído fisicamente.','TINYINT',NN+' DEFAULT 1','NA']]},
{n:'loja',d:'Lojas e centros de distribuição que mantêm estoque, atendem retiradas e originam entregas.',
 lin:'Origem: cadastro administrativo (RF07). Destino: estoque_loja, pedido.',rbac:ADM+' Gerente: R. Cliente: R (ativas).',
 c:[['id_loja','Identificador único da loja.','INT',PK+' AUTO_INCREMENT','NA'],
 ['nome','Nome da unidade.','VARCHAR(100)',NN,'NA'],
 ['tipo_unidade','Tipo da unidade: LOJA ou CD.','VARCHAR(5)',NN,'NA'],
 ['logradouro','Logradouro da unidade.','VARCHAR(150)',NN,'NA'],
 ['numero','Número do endereço da unidade.','VARCHAR(10)',NN,'NA'],
 ['bairro','Bairro da unidade.','VARCHAR(80)',NN,'NA'],
 ['cep','CEP da unidade (8 dígitos).','CHAR(8)',NN,'NA'],
 ['id_cidade','Cidade da unidade.','INT',NN+FK+' -> cidade.id_cidade (RESTRICT)','NA'],
 ['ativo','Exclusão lógica; loja inativa não recebe novos pedidos.','TINYINT',NN+' DEFAULT 1','NA']]},
{n:'endereco',d:'Endereços de entrega ou cobrança vinculados ao cliente.',
 lin:'Origem: cadastro do cliente (RF01). Destino: pedido (entrega), exportação LGPD.',rbac:'Cliente: C,R,U,I (próprio). Administrador: C,R,U,I. Gerente: sem acesso.',
 c:[['id_endereco','Identificador único do endereço.','INT',PK+' AUTO_INCREMENT','NA'],
 ['id_cliente','Cliente dono do endereço.','INT',NN+FK+' -> cliente.id_cliente (RESTRICT)','NA'],
 ['logradouro','Logradouro.','VARCHAR(150)',NN,'DP'],
 ['numero','Número.','VARCHAR(10)',NN,'DP'],
 ['complemento','Complemento opcional.','VARCHAR(60)',N,'DP'],
 ['bairro','Bairro.','VARCHAR(80)',NN,'DP'],
 ['cep','CEP (8 dígitos).','CHAR(8)',NN,'DP'],
 ['id_cidade','Cidade do endereço.','INT',NN+FK+' -> cidade.id_cidade (RESTRICT)','NA'],
 ['tipo_endereco','Tipo: ENTREGA ou COBRANCA.','VARCHAR(10)',NN,'NA'],
 ['ativo','Exclusão lógica do endereço.','TINYINT',NN+' DEFAULT 1','NA']]},
{n:'produto',d:'Itens comercializados, com preço de varejo, preço de atacado e quantidade mínima para o atacado.',
 lin:'Origem: cadastro do catálogo (RF02). Destino: item_pedido, estoque_loja.',rbac:'Gerente e Administrador: C,R,U,I. Cliente: R (ativos).',
 c:[['id_produto','Identificador único do produto (SKU).','INT',PK+' AUTO_INCREMENT','NA'],
 ['id_categoria','Categoria do produto.','INT',NN+FK+' -> categoria.id_categoria (RESTRICT)','NA'],
 ['descricao','Descrição comercial do produto.','VARCHAR(200)',NN,'NA'],
 ['unidade_venda','Unidade de venda: UNIDADE, CAIXA ou FARDO.','VARCHAR(10)',NN,'NA'],
 ['preco_varejo','Preço unitário de varejo; maior que zero.','DECIMAL(12,2)',NN,'NA'],
 ['preco_atacado','Preço unitário de atacado; maior que zero e no máximo igual ao varejo.','DECIMAL(12,2)',NN,'NA'],
 ['quantidade_minima_atacado','Quantidade a partir da qual vale o preço de atacado (RN06).','INT',NN,'NA'],
 ['exclusivo_atacado','1 quando só pode ser vendido a PJ (RN07).','TINYINT',NN+' DEFAULT 0','NA'],
 ['ativo','Exclusão lógica; produto inativo não entra em novos pedidos.','TINYINT',NN+' DEFAULT 1','NA']]},
{n:'estoque_loja',d:'Saldo de cada produto por loja ou centro de distribuição.',
 lin:'Origem: ajuste manual (RF04) e baixas/reposições de pedidos (RN08). Destino: ajuste_estoque, validação de pedido.',rbac:'Gerente: R,U. Administrador: C,R,U,I. Cliente: sem acesso.',
 c:[['id_estoque_loja','Identificador único do registro de estoque.','INT',PK+' AUTO_INCREMENT','NA'],
 ['id_loja','Loja do estoque.','INT',NN+FK+' -> loja.id_loja (RESTRICT)','NA'],
 ['id_produto','Produto em estoque.','INT',NN+FK+' -> produto.id_produto (RESTRICT)','NA'],
 ['saldo_estoque','Saldo atual; nunca negativo (RN04).','INT',NN,'NA']]},
{n:'ajuste_estoque',d:'Registro de cada ajuste manual de saldo, com motivo e responsável.',
 lin:'Origem: ajuste feito por Gerente/Administrador (RF04). Destino: auditoria de estoque.',rbac:'Gerente: C,R. Administrador: C,R,U,I. Cliente: sem acesso.',
 c:[['id_ajuste_estoque','Identificador único do ajuste.','INT',PK+' AUTO_INCREMENT [FK] (ver ajustes)','NA'],
 ['id_estoque_loja','Registro de estoque ajustado.','INT',NN+' (sem FK declarada; ver ajustes)','NA'],
 ['id_usuario','Usuário responsável pelo ajuste.','INT',NN+FK+' -> usuario.id_usuario (RESTRICT)','NA'],
 ['quantidade_ajuste','Quantidade positiva ou negativa; diferente de zero.','INT',NN,'NA'],
 ['motivo','Justificativa obrigatória do ajuste.','VARCHAR(200)',NN,'NA'],
 ['data_hora','Data/hora gravada pelo servidor.','TIMESTAMP',NN+' DEFAULT CURRENT_TIMESTAMP','NA']]},
{n:'pedido',d:'Cabeçalho da venda: cliente, loja, forma de pagamento, entrega, situação e datas de recebimento/cancelamento.',
 lin:'Origem: carrinho do cliente (RF03). Destino: item_pedido, estorno, vw_pedido_total, histórico (RF05).',rbac:'Cliente: C,R (próprios). Gerente: R,U (apenas data_recebimento). Administrador: C,R,U,I.',
 c:[['id_pedido','Identificador único do pedido.','INT',PK+' AUTO_INCREMENT','NA'],
 ['id_cliente','Cliente comprador.','INT',NN+FK+' -> cliente.id_cliente (RESTRICT)','DP'],
 ['id_loja','Loja de retirada ou origem da entrega.','INT',NN+FK+' -> loja.id_loja (RESTRICT)','NA'],
 ['id_forma_pagamento','Forma de pagamento escolhida.','INT',NN+FK+' -> forma_pagamento.id_forma_pagamento (RESTRICT)','NA'],
 ['id_endereco_entrega','Endereço de entrega; nulo na retirada (RN02).','INT',N+FK+' -> endereco.id_endereco (RESTRICT)','DP'],
 ['data_hora','Data/hora da criação, gravada pelo servidor.','TIMESTAMP',NN+' DEFAULT CURRENT_TIMESTAMP','NA'],
 ['situacao','ABERTO, FINALIZADO ou CANCELADO (RN01).','VARCHAR(10)',NN,'NA'],
 ['tipo_entrega','ENTREGA ou RETIRADA.','VARCHAR(8)',NN,'NA'],
 ['valor_desconto','Desconto total; não negativo e não superior ao valor bruto (RN05).','DECIMAL(12,2)',NN+' DEFAULT 0','NA'],
 ['data_recebimento','Data do recebimento; inicia o prazo de 7 dias de arrependimento.','DATE',N,'NA'],
 ['data_cancelamento','Data do cancelamento, até 7 dias após o recebimento (PR02).','DATE',N+' DEFAULT NULL','NA']]},
{n:'item_pedido',d:'Itens de cada pedido, com preço unitário congelado no momento da venda.',
 lin:'Origem: carrinho (RF03) com preço definido pela regra de atacado (RF06). Destino: vw_pedido_total, baixa de estoque.',rbac:'Cliente: C,R (próprios). Gerente: R. Administrador: C,R,U,I.',
 c:[['id_item_pedido','Identificador único do item.','INT',PK+' AUTO_INCREMENT','NA'],
 ['id_pedido','Pedido ao qual o item pertence.','INT',NN+FK+' -> pedido.id_pedido (RESTRICT)','NA'],
 ['id_produto','Produto vendido.','INT',NN+FK+' -> produto.id_produto (RESTRICT)','NA'],
 ['quantidade','Quantidade vendida; maior que zero.','INT',NN,'NA'],
 ['preco_unitario_venda','Preço vigente na venda, nunca recalculado (RN03).','DECIMAL(12,2)',NN,'NA']]},
{n:'estorno',d:'Estorno integral do valor pago de pedido cancelado (CDC art. 49).',
 lin:'Origem: cancelamento de pedido (RF10). Destino: conciliação financeira.',rbac:'Gerente: R,U. Administrador: C,R,U,I. Cliente: sem acesso direto.',
 c:[['id_estorno','Identificador único do estorno.','INT',PK+' AUTO_INCREMENT','NA'],
 ['id_pedido','Pedido estornado; um estorno por pedido.','INT',NN+FK+' [UNIQUE] -> pedido.id_pedido (RESTRICT)','NA'],
 ['id_usuario','Usuário que concluiu o estorno; nulo até a conclusão.','INT',N+FK+' -> usuario.id_usuario (RESTRICT)','NA'],
 ['data_solicitacao','Data/hora da solicitação.','TIMESTAMP',NN+' DEFAULT CURRENT_TIMESTAMP','NA'],
 ['data_conclusao','Data/hora da conclusão.','TIMESTAMP',N,'NA'],
 ['valor_estorno','Valor estornado, igual ao total do pedido.','DECIMAL(12,2)',NN,'NA'],
 ['situacao','SOLICITADO ou CONCLUIDO.','VARCHAR(10)',NN,'NA']]},
{n:'log_auditoria',d:'Trilha de auditoria append-only de operações sensíveis e registros de acesso (Marco Civil, art. 15).',
 lin:'Origem: gatilhos e aplicação (RNF01, PR04). Destino: auditoria e conformidade.',rbac:'Administrador: somente R. Nenhum perfil faz UPDATE ou DELETE (RNF11).',
 c:[['id_log','Identificador único do log.','BIGINT',PK+' AUTO_INCREMENT','NA'],
 ['id_usuario','Usuário autor; nulo quando o autor é cliente.','INT',N+FK+' -> usuario.id_usuario (RESTRICT)','NA'],
 ['id_cliente','Cliente autor; nulo quando o autor é usuário.','INT',N+FK+' -> cliente.id_cliente (RESTRICT)','DP'],
 ['tabela_afetada','Tabela em que ocorreu a operação.','VARCHAR(50)',NN,'NA'],
 ['id_registro_afetado','Chave primária do registro afetado.','INT',NN,'NA'],
 ['operacao','Tipo da operação (inclusão, alteração, exclusão lógica, login).','VARCHAR(10)',NN,'NA'],
 ['data_hora','Data/hora do evento.','TIMESTAMP',NN+' DEFAULT CURRENT_TIMESTAMP','NA'],
 ['valor_anterior','Valor anterior, sem dado pessoal em texto claro (PR03).','TEXT',N,'DP'],
 ['valor_novo','Valor novo, sem dado pessoal em texto claro (PR03).','TEXT',N,'DP'],
 ['endereco_ip','IP de origem do acesso (IPv4/IPv6).','VARCHAR(45)',N,'DP']]},
{n:'solicitacao_lgpd',d:'Solicitações de titulares (exportação e anonimização) e seu andamento (LGPD art. 18).',
 lin:'Origem: pedido do titular (RF11). Destino: atendimento do Administrador.',rbac:'Cliente: C,R (próprias). Administrador: C,R,U,I. Gerente: sem acesso.',
 c:[['id_solicitacao_lgpd','Identificador único da solicitação.','INT',PK+' (sem AUTO_INCREMENT; ver ajustes)','NA'],
 ['id_cliente','Titular solicitante.','INT',NN+FK+' -> cliente.id_cliente (RESTRICT)','DP'],
 ['tipo_solicitacao','Tipo: exportação ou anonimização.','VARCHAR(30)',NN,'NA'],
 ['data_solicitacao','Data/hora da solicitação (prazo de 15 dias).','TIMESTAMP',NN,'NA'],
 ['situacao','Situação do atendimento.','VARCHAR(30)',NN,'NA'],
 ['data_conclusao','Data/hora da conclusão.','TIMESTAMP',N+' DEFAULT NULL','NA']]}
];

const B={DPS:['dps','DPS'],DP:['dp','DP'],NA:['na','N/A']};
const $=s=>document.querySelector(s);
const nav=$('#navList'), box=$('#tables');
T.forEach(t=>{
  nav.insertAdjacentHTML('beforeend',`<a href="#${t.n}">${t.n}</a>`);
  const rows=t.c.map(c=>`<tr data-k="${c[0].toLowerCase()}"><td><code>${c[0]}</code></td><td>${c[1]}</td><td>${c[2]}</td><td><b>${c[3]}</b></td><td><span class="badge ${B[c[4]][0]}">${B[c[4]][1]}</span></td><td>${c[5]||t.lin}</td><td>${c[6]||t.rbac}</td></tr>`).join('');
  box.insertAdjacentHTML('beforeend',`<section class="tsec" id="${t.n}" data-k="${t.n}"><h2>${t.n}</h2><p>${t.d}</p><div class="wrap"><table><thead><tr><th>Atributo</th><th>Descrição / Regra de Negócio</th><th>Tipo e Tamanho</th><th>Constraints</th><th>Privacidade (LGPD)</th><th>Linhagem</th><th>Controle de Acesso (RBAC)</th></tr></thead><tbody>${rows}</tbody></table></div></section>`);
});
$('#search').addEventListener('input',e=>{
  const q=e.target.value.trim().toLowerCase();let any=false;
  document.querySelectorAll('.tsec').forEach(s=>{
    const tm=s.dataset.k.includes(q);let vis=0;
    s.querySelectorAll('tbody tr').forEach(r=>{const m=!q||tm||r.dataset.k.includes(q);r.hidden=!m;if(m)vis++});
    s.hidden=!vis;if(vis)any=true;
  });
  $('#empty').hidden=any;
});
const root=document.documentElement,tb=$('#themeBtn');
tb.onclick=()=>{const d=root.dataset.theme==='dark';root.dataset.theme=d?'light':'dark';tb.textContent=d?'Modo escuro':'Modo claro'};
$('#menuBtn').onclick=()=>$('#sidebar').classList.toggle('open');
nav.addEventListener('click',()=>$('#sidebar').classList.remove('open'));
let pz=null;
const modal=$('#modal');
$('#derBtn').onclick=()=>{
  modal.hidden=false;
  if(!pz){pz=Panzoom($('#derImg'),{maxScale:8,minScale:.3,contain:false});
    $('#stage').addEventListener('wheel',pz.zoomWithWheel);}
  pz.reset({animate:false});
};
$('#zin').onclick=()=>pz&&pz.zoomIn();
$('#zout').onclick=()=>pz&&pz.zoomOut();
$('#zreset').onclick=()=>pz&&pz.reset();
$('#zclose').onclick=()=>modal.hidden=true;
document.addEventListener('keydown',e=>{if(e.key==='Escape')modal.hidden=true});
