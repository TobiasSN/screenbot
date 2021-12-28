"use strict";
exports.__esModule = true;
exports.discord = exports.discordAppId = exports.discordKey = exports.discordToken = exports.assertConfig = exports.isDev = void 0;
var rest_1 = require("@discordjs/rest");
exports.isDev = process.env.NODE_ENV == "development";
// Allow separate config for development and production.
var config = exports.isDev ? require("../dev-config.json") : require("firebase-functions").config();
function assertConfig(key) {
    if (config[key] == null)
        throw new Error("Missing config: ".concat(key));
    return config[key];
}
exports.assertConfig = assertConfig;
exports.discordToken = assertConfig("discordToken");
exports.discordKey = assertConfig("discordKey");
exports.discordAppId = assertConfig("discordAppId");
exports.discord = new rest_1.REST({ version: "9" }).setToken(exports.discordToken);
