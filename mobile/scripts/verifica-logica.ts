// Confere a lógica do app (valores, totais, texto do WhatsApp, banco) contra o que o protótipo HTML faz.
// Rodar (na pasta mobile): npx -y tsx scripts/verifica-logica.ts
import { lerBanco } from '../src/lib/banco';
import { DIA, data, fmtQtd, juntarProfs, lerDinheiro, lerQtd, nomeDoMes, numero, quando, reais, semRS } from '../src/lib/format';
import { condicoesDe, linkZap, listaDe, mensagem, mesclarLista, novoRascunho, ordenarItens, qtdUn, resumoItens, subtotal, total, bancoVazio, novoCadastro, precisaServico, profCanonica, temServico } from '../src/lib/orcamento';
import { seed } from './exemplos';
import { htmlDoPdf } from '../src/lib/pdf';

let ok = 0;
const falhas: string[] = [];
const check = (nome: string, cond: boolean, extra = '') => {
  if (cond) { ok++; console.log('  ok  ' + nome); } else { falhas.push(nome); console.log('  FALHOU  ' + nome + ' ' + extra); }
};
const igual = (nome: string, a: unknown, b: unknown) => check(nome, a === b, `(veio ${JSON.stringify(a)}, esperava ${JSON.stringify(b)})`);

console.log('== Dinheiro e números');
igual('reais(18000)', reais(18000), 'R$ 180,00');
igual('reais(123456) com milhar', reais(123456), 'R$ 1.234,56');
igual('reais(0)', reais(0), 'R$ 0,00');
igual('semRS(4500)', semRS(4500), '45,00');
igual('lerDinheiro("R$ 1.234,50")', lerDinheiro('R$ 1.234,50'), 123450);
igual('lerDinheiro("12,5")', lerDinheiro('12,5'), 1250);
igual('lerDinheiro("12.50")', lerDinheiro('12.50'), 1250);
igual('lerDinheiro("")', lerDinheiro(''), 0);
igual('lerDinheiro("abc")', lerDinheiro('abc'), 0);
igual('lerDinheiro("-5")', lerDinheiro('-5'), 0);
igual('fmtQtd(1.5)', fmtQtd(1.5), '1,5');
igual('fmtQtd(3)', fmtQtd(3), '3');
igual('fmtQtd(1000)', fmtQtd(1000), '1.000');
igual('lerQtd("2,5")', lerQtd('2,5'), 2.5);
igual('lerQtd("0")', lerQtd('0'), 1);
igual('lerQtd("")', lerQtd(''), 1);
igual('numero(15)', numero(15), '0015');
igual('juntarProfs 1', juntarProfs(['Eletricista']), 'Eletricista');
igual('juntarProfs 3', juntarProfs(['Eletricista', 'Encanador', 'Pintor']), 'Eletricista, encanador e pintor');

console.log('== Datas');
const t0 = new Date(2026, 10, 25, 15, 0, 0).getTime();
igual('data()', data(t0), '25/11/2026');
igual('quando hoje', quando(t0, t0), 'Hoje');
igual('quando ontem', quando(t0 - DIA, t0), 'Ontem');
igual('quando antigo', quando(new Date(2026, 10, 10).getTime(), t0), '10 de nov');
igual('nomeDoMes', nomeDoMes(t0), 'novembro');

console.log('== Orçamentos de exemplo (mesmos valores do protótipo)');
const b = seed(t0);
const [o15, o14, o13, o12] = b.orcamentos;
igual('o15 subtotal', subtotal(o15), 35020);
igual('o15 total (com desconto de R$ 10,20)', total(o15), 34000);
igual('o14 total', total(o14), 128000);
igual('o13 total', total(o13), 62000);
igual('o12 total', total(o12), 15000);
igual('próximo número', b.proxNum, 16);
igual('resumo o15', resumoItens(o15), 'Instalação de chuveiro + 1 serviço');
igual('resumo o13', resumoItens(o13), 'Troca da fiação da sala');
igual('desconto maior que subtotal não fica negativo', total({ ...o12, desconto: 99999999 }), 0);
igual('qtdUn com unidade', qtdUn({ tipo: 'servico', nome: 'x', qtd: 12.5, preco: 1, un: 'm²' }), '12,5 m²');

console.log('== Cadastro novo e regras do orçamento');
const sujo = seed(t0);
const cad = novoCadastro(sujo, ['Eletricista'], undefined);
check('cadastro novo não herda orçamento e volta ao nº 1', cad.orcamentos.length === 0 && cad.proxNum === 1);
igual('cadastro novo já traz os serviços da área', cad.catalogo.length, listaDe('Eletricista').length);
const vid = novoCadastro(bancoVazio(), ['Vidraceiro'], { prof: 'Vidraceiro', nome: ' Troca de vidro ', preco: 15000 });
check('profissão nova entra com o serviço cadastrado', vid.catalogo.length === 1 && vid.catalogo[0].nome === 'Troca de vidro' && vid.catalogo[0].cat === 'Vidraceiro');
check('profissão nova sem serviço pede cadastro', precisaServico([], 'Vidraceiro'));
check('profissão com lista pronta não pede', !precisaServico([], 'Pintor'));
check('profissão que já tem serviço não pede', !precisaServico(vid.catalogo, 'Vidraceiro'));
igual('grafia de profissão conhecida é padronizada', profCanonica('  eletricista '), 'Eletricista');
const soMaterial = { ...novoRascunho(1), itens: [{ tipo: 'material' as const, nome: 'Cabo', qtd: 1, preco: 100 }] };
check('orçamento vazio ou só com material não pode ser gerado', !temServico(novoRascunho(1)) && !temServico(soMaterial));
check('com serviço pode', temServico(sujo.orcamentos[0]));

console.log('== Texto do WhatsApp');
const msg = mensagem(o15, b.perfil);
check('começa com o número', msg.startsWith('*Orçamento nº 0015*'));
check('traz o cliente', msg.includes('Cliente: Dona Marta Ribeiro'));
check('serviço com ×', msg.includes('• 3× Troca de tomada — R$ 135,00'));
check('material', msg.includes('• 1× Disjuntor 32A — R$ 38,50'));
check('subtotal e desconto', msg.includes('Subtotal: R$ 350,20') && msg.includes('Desconto: − R$ 10,20'));
check('total em negrito', msg.includes('*Total: R$ 340,00*'));
check('validade', msg.includes('Válido até ' + data(o15.criadoEm + 15 * DIA)));
check('condições do perfil', msg.includes('Garantia de 90 dias'));
check('rodapé', msg.endsWith('_Feito com Pode Fazer · podefazer.com.br_'));
const semDesc = mensagem(o14, b.perfil);
check('sem desconto não mostra subtotal', !semDesc.includes('Subtotal'));
const pintura = mensagem({ ...o12, itens: [{ tipo: 'servico', nome: 'Pintura de parede', qtd: 20, preco: 2500, un: 'm²' }] }, b.perfil);
check('serviço com unidade usa "de"', pintura.includes('• 20 m² de Pintura de parede — R$ 500,00'));

console.log('== Link do WhatsApp');
check('telefone com DDD vira 55…', linkZap(o15, b.perfil).startsWith('https://wa.me/5511977775678?text='));
check('sem telefone abre sem número', linkZap(o14, b.perfil).startsWith('https://wa.me/?text='));
check('texto vai codificado', linkZap(o15, b.perfil).includes(encodeURIComponent('*Orçamento nº 0015*')));
check('já com 55 não duplica', linkZap({ ...o15, tel: '+55 54 99999-1234' }, b.perfil).startsWith('https://wa.me/5554999991234?text='));

console.log('== Catálogo por profissão');
const eletr = listaDe('Eletricista');
igual('Eletricista tem 10 serviços', eletr.length, 10);
igual('Pintor: unidade m²', listaDe('Pintor')[0].un, 'm²');
const mesclado = mesclarLista(eletr, 'Encanador');
igual('mescla traz os do encanador (menos o repetido "Visita técnica")', mesclado.length, 10 + 8);
igual('profissão desconhecida: lista vazia', listaDe('Serralheiro').length, 0);

console.log('== Rascunho e itens');
const r = novoRascunho(16);
check('rascunho novo', r.num === 16 && r.status === 'esperando' && r.validade === 15 && r.condicoes === null && r.itens.length === 0);
igual('condições padrão quando nulas', condicoesDe(r, 'PADRAO'), 'PADRAO');
igual('condições próprias quando preenchidas', condicoesDe({ ...r, condicoes: 'X' }, 'PADRAO'), 'X');
const ord = ordenarItens([{ tipo: 'material', nome: 'm', qtd: 1, preco: 1 }, { tipo: 'servico', nome: 's', qtd: 1, preco: 1 }]);
igual('serviços vêm antes dos materiais', ord[0].tipo, 'servico');

console.log('== Banco no aparelho');
const novoAparelho = lerBanco(null);
check('aparelho novo começa vazio, sem cliente e sem perfil', novoAparelho.orcamentos.length === 0 && novoAparelho.catalogo.length === 0 && novoAparelho.perfil.nome === '' && novoAparelho.perfil.profissoes.length === 0 && novoAparelho.proxNum === 1);
igual('dado corrompido: recomeça vazio', lerBanco('{lixo').orcamentos.length, 0);
igual('forma errada: recomeça vazio', lerBanco('{"v":1}').orcamentos.length, 0);
const antigo = lerBanco(JSON.stringify(b));
check('instalação antiga: exemplos e perfil fictício saem', antigo.orcamentos.length === 0 && antigo.perfil.nome === '' && antigo.proxNum === 1);
const real = { ...b, proxNum: 99, perfil: { ...b.perfil, exemplo: false }, orcamentos: [{ ...o15, exemplo: false }, o14] };
const salvo = lerBanco(JSON.stringify(real));
check('dados reais são mantidos (só o exemplo sai)', salvo.proxNum === 99 && salvo.orcamentos.length === 1 && salvo.perfil.nome === 'Carlos Mendes');

console.log('== PDF');
const html = htmlDoPdf(o15, b.perfil);
check('PDF traz o nome do profissional e o número', html.includes('Carlos Mendes') && html.includes('Nº 0015'));
check('PDF traz total e rodapé', html.includes('R$ 340,00') && html.includes('Feito com'));
const perigoso = htmlDoPdf({ ...o15, cliente: '<script>alert(1)</script>' }, b.perfil);
check('PDF escapa texto digitado (sem injeção de HTML)', !perigoso.includes('<script>alert(1)') && perigoso.includes('&lt;script&gt;'));

console.log(`\nLÓGICA DO APP: ${ok} ok, ${falhas.length} falhas`);
falhas.forEach((x) => console.log(' - ' + x));
process.exit(falhas.length ? 1 : 0);
