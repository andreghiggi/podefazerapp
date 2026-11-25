# Pode Fazer

App de orçamento para prestador de serviço: monte o orçamento no celular, gere o PDF com o seu nome e mande no WhatsApp do cliente.

Site: [podefazer.com.br](https://podefazer.com.br)

## O que tem aqui

| Pasta | Conteúdo |
| --- | --- |
| `index.html` | Página do site (podefazer.com.br). Um arquivo só, sem dependências além do Google Fonts. |
| `app/` | Protótipo funcional do app, que roda no navegador do celular. Gera o PDF e manda no WhatsApp. É o que vai para o profissional piloto antes do app Android. |
| `mobile/` | App de verdade (Expo / React Native), feito a partir do protótipo. Ver `mobile/README.md`. |
| `marca/` | Logo, símbolo, ícone do app (512 × 512, para a Google Play), guia da marca e tokens de cor e tipografia. |
| `docs/` | Estratégia: concorrência, nome, backlog, roadmap e próximos passos. |

## Rodar localmente (XAMPP)

1. Copie esta pasta para `C:\xampp\htdocs\podefazerapp`.
2. Com o Apache ligado no XAMPP, abra:
   - Site: http://localhost/podefazerapp/
   - Protótipo do app: http://localhost/podefazerapp/app/

Também funciona abrindo os arquivos direto no navegador ou em qualquer hospedagem de arquivos estáticos (GitHub Pages, Netlify, a hospedagem do domínio).

## Sobre o protótipo

- Os dados ficam só no navegador do celular (localStorage). Limpar os dados do navegador apaga os orçamentos.
- O PDF usa a biblioteca jsPDF carregada do cdnjs, então precisa de internet na primeira vez que abre.
- Para testar o primeiro uso, vá em Perfil → "Apagar exemplos e começar".

## Antes de publicar o site

- O e-mail `contato@podefazer.com.br` aparece na página: crie esse endereço no domínio ou troque pelo seu.
- O botão da Google Play está como "Em breve" até o app sair.
- O limite de 20 orçamentos grátis por mês ainda é provisório.

## Próximo passo

Etapa 1 do app pronta em `mobile/` (React Native com Expo). Falta: teste no celular do profissional piloto, APK pelo EAS e as etapas P1 do backlog. Ver `docs/estrategia.md`.
