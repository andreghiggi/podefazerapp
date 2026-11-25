# Pode Fazer — app (Expo / React Native)

Versão de verdade do protótipo `../app/index.html`, com o mesmo visual e as mesmas funções. Android primeiro; o mesmo código serve para iPhone.

## O que já tem (etapa 1 — piloto)

- Boas-vindas: escolher profissão(ões) e já vir com os serviços da área (Eletricista, Encanador, Pintor, Pedreiro, Técnico de ar-condicionado ou outra).
- Início: saudação, resumo do mês (feitos e fechados), filtro por situação, lista de orçamentos.
- Montar orçamento: cliente e WhatsApp, serviços (folha com busca, categorias e "criar na hora"), materiais, quantidade com vírgula, desconto, validade e condições. Total fixo embaixo.
- Dica "usar este preço sempre" quando o preço do orçamento difere do da lista.
- Detalhe: situação (esperando, aprovado, recusado), papel do orçamento, duplicar, editar, copiar texto, excluir.
- Enviar no WhatsApp (abre a conversa com o texto pronto) e compartilhar PDF (A4, gerado no aparelho).
- Meus serviços (editar nome e preço, tirar, adicionar) e Perfil (dados, profissões, condições padrão, apagar exemplos/tudo).
- Tema claro e escuro automático, tokens da marca em `src/theme.ts` (de `../marca/tokens.json`).
- Dados só no aparelho (AsyncStorage). Sem servidor, funciona offline.

## Rodar

```bash
cd mobile
npm install
npx expo start          # abra no celular com o app Expo Go, ou: npm run web
```

## Conferir

```bash
npx tsc --noEmit                       # tipos
npx -y tsx scripts/verifica-logica.ts  # 64 conferências: valores, totais, texto do WhatsApp, banco, PDF
```

## Gerar o app Android

```bash
npm i -g eas-cli && eas login
eas build -p android --profile preview   # APK para instalar direto no celular do piloto
```
(`eas.json` já está no projeto.) Para a Google Play usar `--profile production` (gera .aab).

## Estrutura

```
App.tsx                 navegação e ações (novo, gerar, duplicar, excluir…)
src/theme.ts            cores claro/escuro, raios, fontes
src/types.ts            Orcamento, Item, Servico, Perfil, Banco
src/data/listas.ts      serviços iniciais por profissão
src/lib/format.ts       reais, datas, quantidades (pt-BR, sem depender do Intl)
src/lib/orcamento.ts    totais, texto do WhatsApp, link, dados de exemplo
src/lib/pdf.ts          HTML do PDF (A4)
src/lib/banco.ts        leitura segura do que está guardado no aparelho
src/store.tsx           guarda tudo no aparelho
src/components/         Icone, ui (botões, campos, folha, diálogo, aviso)
src/screens/            Inicio, Editor, Detalhe, Servicos, Perfil, BoasVindas
scripts/                conferência da lógica
```

## Próximas etapas (ver `../docs/estrategia.md`)

P1: logo no PDF, plano grátis com limite e rodapé, assinatura pela loja, backup na nuvem, política de privacidade. P2: lojas parceiras, lembrete de resposta, recibo, aceite por link.

## Gerar o APK/AAB no Windows (estado em 25/11/2026)

Projeto Android gerado por `npx expo prebuild --platform android` (pasta `android/` não vai para o git). A assinatura de release vem do plugin `plugins/withReleaseSigning.js`, que lê variáveis de ambiente (nenhuma senha em arquivo): `PODEFAZER_KEYSTORE`, `PODEFAZER_KEYSTORE_PASSWORD`, `PODEFAZER_KEY_ALIAS`, `PODEFAZER_KEY_PASSWORD`. A chave de upload **não está no repositório** e a que foi criada em 25/11/2026 foi descartada (nunca foi usada). Para o primeiro envio à Play Store, gere uma nova (`keytool -genkeypair -v -keystore podefazer-upload.keystore -alias podefazer-upload -keyalg RSA -keysize 2048 -validity 10000`), guarde o arquivo e a senha em local seguro (gerenciador de senhas) e use as variáveis acima. Com o Play App Signing ativo, uma chave de upload perdida pode ser trocada pelo suporte da Google.

Comando: `cd android && gradlew.bat assembleRelease bundleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a` (JDK 17, Android SDK 34–36, NDK 27). Para a Play Store o arquivo certo é o `.aab` (`app/build/outputs/bundle/release`), não o APK.

**Pendência:** o build compila o JavaScript e os módulos Kotlin/Java, mas para na parte C++ (`buildCMake`) por limite de caminho do Windows (260 caracteres) no `ninja` 1.10 do CMake 3.22.1 do SDK. Já testado: mover o projeto para `C:\pfa` (curto) não bastou; unidade `subst` não funciona com o autolinking. Próximo passo sugerido: instalar o CMake 3.31.6 (`sdkmanager --install "cmake;3.31.6"`, traz ninja 1.12.1; já instalado nesta máquina) e apontar o app para ele (`externalNativeBuild.cmake.version "3.31.6"` no `app/build.gradle`, via config plugin), ou gerar o build em Linux/macOS/EAS (`eas build -p android --profile production`).
