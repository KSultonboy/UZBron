// Monorepo + NativeWind uchun Metro konfiguratsiyasi
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Workspace ildizini kuzatish (shared-types o'zgarishini ko'rish uchun).
// node-linker=hoisted bo'lgani uchun ierarxik qidiruvni o'chirmaymiz —
// Metro paketlarni root node_modules'dan o'zi topadi.
config.watchFolders = [...(config.watchFolders ?? []), workspaceRoot];

module.exports = withNativeWind(config, { input: "./global.css" });
