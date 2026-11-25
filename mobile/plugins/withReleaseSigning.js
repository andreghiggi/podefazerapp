// Assina o build de release com a chave de upload da Play Store.
// Caminho e senhas vem de variaveis de ambiente (nada de senha em arquivo):
//   PODEFAZER_KEYSTORE, PODEFAZER_KEYSTORE_PASSWORD, PODEFAZER_KEY_ALIAS, PODEFAZER_KEY_PASSWORD
const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (c) => {
    let g = c.modResults.contents;
    if (g.includes('PODEFAZER_KEYSTORE')) return c;
    const bloco = `
        release {
            if (System.getenv("PODEFAZER_KEYSTORE")) {
                storeFile file(System.getenv("PODEFAZER_KEYSTORE"))
                storePassword System.getenv("PODEFAZER_KEYSTORE_PASSWORD")
                keyAlias System.getenv("PODEFAZER_KEY_ALIAS")
                keyPassword System.getenv("PODEFAZER_KEY_PASSWORD")
            }
        }`;
    g = g.replace(/signingConfigs\s*\{/, (m) => m + bloco);
    // o buildType release passa a usar a chave de release quando ela estiver configurada
    g = g.replace(/(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)signingConfig signingConfigs\.debug/, '$1signingConfig System.getenv("PODEFAZER_KEYSTORE") ? signingConfigs.release : signingConfigs.debug');
    c.modResults.contents = g;
    return c;
  });
};
