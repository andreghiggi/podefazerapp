// Usa o CMake 3.31.6 do Android SDK (ninja 1.12) no build nativo.
// O CMake 3.22.1 que vem no SDK tem um ninja que estoura o limite de 260 caracteres de caminho no Windows
// (buildCMake falha com os modulos C++ do React Native). Instalar: sdkmanager --install "cmake;3.31.6"
const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withCmakeVersion(config) {
  return withAppBuildGradle(config, (c) => {
    let g = c.modResults.contents;
    if (g.includes('cmake.version') || g.includes('version "3.31.6"')) return c;
    g = g.replace(/android\s*\{/, (m) => `${m}\n    externalNativeBuild {\n        cmake {\n            version "3.31.6"\n        }\n    }`);
    c.modResults.contents = g;
    return c;
  });
};
