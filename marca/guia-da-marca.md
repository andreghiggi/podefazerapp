# Pode Fazer

Orçamento profissional em 30 segundos, direto do celular para o WhatsApp do cliente.

Pode Fazer é um app para eletricistas, encanadores, pintores, pedreiros, técnicos de ar-condicionado e outros prestadores de serviço montarem um orçamento bonito, gerarem o PDF e mandarem pelo WhatsApp sem sair da obra. Site: podefazer.com.br.

## O nome

"Pode fazer!" é o que o cliente responde quando aprova o orçamento. O nome promete o resultado que o profissional quer: mandar o orçamento e ouvir o sim. O balão com visto do símbolo é essa resposta chegando no WhatsApp.

- Escreva sempre **Pode Fazer**, com as duas palavras em maiúscula, sem ponto de exclamação no logo.
- Em frases e campanhas, a expressão pode aparecer em minúscula e entre aspas: *Do orçamento ao "pode fazer" em minutos.*
- Na Google Play: **Pode Fazer – Orçamento em PDF**.

## Quem usa e onde

O usuário é o profissional no meio do serviço: celular na mão, às vezes com luva, sol batendo na tela, cliente esperando. Tudo nesta identidade parte disso:

- **Contraste alto.** Texto principal em `ink` sobre `reboco` ou `superficie`; nunca cinza claro sobre branco.
- **Alvos grandes.** Botões e campos com no mínimo `alvo-toque` (52px) de altura.
- **Uma ação principal por tela**, em `amarelo-fita`.
- **Números grandes.** O valor total aparece em `valor-total` (32px, Archivo 800).

## Voz

Fala como o profissional fala: direto, de igual para igual, sem termo de escritório.

| Em vez de | Escreva |
| --- | --- |
| Gerar documento de proposta comercial | Fazer orçamento |
| Compartilhar via aplicativo de mensagens | Enviar no WhatsApp |
| Operação concluída com sucesso | Orçamento pronto! Agora é só mandar. |
| Inserir item | Adicionar serviço |
| Status: pendente de aprovação | Esperando o cliente |
| Status: aprovado | O cliente disse "pode fazer"! |

Regras:

- Verbos no começo dos botões: *Adicionar serviço*, *Enviar no WhatsApp*, *Duplicar*.
- Frases curtas. Uma ideia por linha.
- Expressões do dia a dia ("pra", "pode fazer", "fechou") podem aparecer em mensagens de sucesso e dicas, nunca no PDF que vai para o cliente. O PDF fala em português padrão, porque representa o profissional.
- Valores sempre em reais com centavos: R$ 180,00.

## Fundamentos visuais

### Cores

O amarelo vem da fita de sinalização da obra e do capacete. É a cor da marca e do botão principal; texto sobre ele é sempre `asfalto`, nos dois temas.

- **Marca:** `amarelo-fita`, com `amarelo-claro` para destaques suaves, como a caixa do total.
- **Texto:** `ink` para o principal, `ink-suave` para o secundário.
- **Fundos:** `reboco` nas telas, `superficie` em cartões e no papel do PDF, `linha` para bordas.
- **Estados:** `verde-aprovado` para aprovado e para o botão do WhatsApp; `vermelho-recusado` só para recusado, erro e excluir.

Nada de degradê nem sombra pesada: cartões se separam do fundo pela cor `superficie` e uma borda `linha` de 1px.

### Tipografia

- **Archivo** (display, 700–800) para títulos, nome do app e valores. Pesada e um pouco larga, como letreiro de loja de material.
- **Inter** (sans, 400–600) para todo o resto: campos, listas, textos do PDF.

Use os estilos do token: `display`, `titulo-1`, `titulo-2`, `valor-total`, `corpo`, `corpo-forte`, `pequeno`. Valores em dinheiro usam números tabulares (`font-variant-numeric: tabular-nums`).

### Espaço e forma

- Margem lateral das telas: `espaco-4` (16px). Entre blocos: `espaco-6`.
- Cantos: `raio-sm` em campos e etiquetas, `raio-md` em botões e cartões, `raio-lg` nas folhas que sobem de baixo.
- A fita zebrada (faixas diagonais amarelo e asfalto) é o único padrão gráfico da marca. Use em capas, site, display de balcão e materiais impressos, nunca dentro das telas de trabalho.

## Logo

O símbolo é um balão de conversa amarelo com um visto: o "pode fazer" do cliente chegando no WhatsApp. A palavra é "Pode Fazer" em Archivo 800, já convertida em contorno.

- `pode-fazer-logo.svg`: logo completo para fundos claros.
- `pode-fazer-logo-negativo.svg`: logo completo para fundos escuros.
- `pode-fazer-simbolo.svg`: só o balão, para avatar, favicon e rodapé do PDF.
- `pode-fazer-icone-app.png`: ícone do app, 512 × 512, balão amarelo sobre `asfalto`. É o arquivo pedido pela Google Play.

Não mude as cores do balão, não ponha o símbolo sobre amarelo e deixe em volta um respiro de pelo menos metade da altura do balão.

## Iconografia

Ícones de traço com 2px de espessura e pontas arredondadas, no estilo do visto do símbolo. Tamanho padrão 24px. Ainda não há um conjunto próprio; até lá, use [Lucide](https://lucide.dev), que tem o mesmo desenho.

## Onde a marca aparece

- **App:** fundo `reboco`, cabeçalho com o símbolo, botão principal amarelo.
- **PDF do orçamento:** papel branco, nome do profissional em cima; no plano grátis, o rodapé "Feito com Pode Fazer · podefazer.com.br" com o símbolo.
- **Site (podefazer.com.br):** uma página só, com o botão para baixar na Google Play.
- **Display de balcão:** fundo `amarelo-fita`, faixa zebrada embaixo, QR code grande e a frase "Orçamento profissional em 30 segundos. Grátis."

## O que ainda falta

Ainda não há componentes, conjunto de ícones próprio nem a arte de destaque da Google Play (1024 × 500). A próxima rodada deve trazer os componentes do app (botão, campo, item de orçamento, etiqueta de status) a partir do protótipo.
