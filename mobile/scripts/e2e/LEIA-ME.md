# Testes de uso no navegador (Chrome headless)

Rodam o app (versão web) e o protótipo `../../app/index.html` lado a lado, fazem as mesmas ações e comparam o que aparece.

```bash
npx expo export --platform web --output-dir dist-web        # compila o app para web
(cd dist-web && python -m http.server 8765 &)               # app em :8765
(cd .. && python -m http.server 8766 &)                      # protótipo em :8766 (pasta raiz do repositório)
mkdir -p /tmp/e2e && node scripts/e2e/paridade.mjs /tmp/e2e   # 38 estados comparados
node scripts/e2e/paridade2.mjs /tmp/e2e                        # 32 estados + link do WhatsApp
node scripts/e2e/fluxo.mjs /tmp/e2e                            # criar orçamento do começo ao fim (15 passos) + capturas
```
Diferenças esperadas: o aviso do Perfil (no protótipo fala "é um protótipo") e o preço que o app formata como "150,00" ao sair do campo.
O caminho do Chrome está fixo em `cdp.mjs` (Windows).
