"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.discordInteractions = void 0;
var v9_1 = require("discord-api-types/v9");
var puppeteer = require("puppeteer");
var functions = require("firebase-functions");
var nacl = require("tweetnacl");
var common_1 = require("./common");
var regEx = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;
if (common_1.isDev)
    require("dotenv").config();
exports.discordInteractions = functions.https.onRequest(function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var signature, timestamp, body, isValid, interaction, _a, e_1, response;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                signature = (_b = req.get("X-Signature-Ed25519")) !== null && _b !== void 0 ? _b : "";
                timestamp = (_c = req.get("X-Signature-Timestamp")) !== null && _c !== void 0 ? _c : "";
                body = req.rawBody;
                isValid = nacl.sign.detached.verify(Buffer.from(timestamp + body), Buffer.from(signature, "hex"), Buffer.from(common_1.discordKey, "hex"));
                if (!isValid) {
                    res.status(401).end("Invalid request signature");
                    return [2 /*return*/];
                }
                interaction = req.body;
                _a = interaction.type;
                switch (_a) {
                    case 1 /* Ping */: return [3 /*break*/, 1];
                    case 2 /* ApplicationCommand */: return [3 /*break*/, 2];
                }
                return [3 /*break*/, 8];
            case 1:
                res.status(200).json({
                    type: 1 /* Pong */
                }).end();
                return [3 /*break*/, 8];
            case 2:
                _d.trys.push([2, 4, , 8]);
                return [4 /*yield*/, handleApplicationCommand(interaction, res)];
            case 3:
                _d.sent();
                return [3 /*break*/, 8];
            case 4:
                e_1 = _d.sent();
                // Report the error.
                functions.logger.error(e_1);
                response = {
                    type: 4 /* ChannelMessageWithSource */,
                    data: {
                        content: "An error occured: ```" + String(e_1) + "```"
                    }
                };
                if (!res.destroyed) return [3 /*break*/, 6];
                // Response has already been deferred, edit it.
                return [4 /*yield*/, common_1.discord.patch(v9_1.Routes.webhookMessage(common_1.discordAppId, interaction.token), {
                        body: response
                    })];
            case 5:
                // Response has already been deferred, edit it.
                _d.sent();
                return [3 /*break*/, 7];
            case 6:
                // Response hasn't been deferred yet, send a normal response.
                res.status(200).json(response).end();
                _d.label = 7;
            case 7: return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); });
function handleApplicationCommand(interaction, res) {
    return __awaiter(this, void 0, void 0, function () {
        var permissions, text, screenshots, route;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Ensure that this wasn't called in a way it shouldn't.
                    if (interaction.data.type != 3 /* Message */) {
                        res.status(200).json({
                            type: 4 /* ChannelMessageWithSource */,
                            data: {
                                content: "Oops, you weren't supposed to be able to do that!"
                            }
                        }).end();
                        return [2 /*return*/];
                    }
                    // Ensure that this was done in a guild.
                    if (interaction.member == null) {
                        res.status(200).json({
                            type: 4 /* ChannelMessageWithSource */,
                            data: {
                                content: "This bot is not supposed to be used in DMs.",
                                flags: 64 /* Ephemeral */
                            }
                        }).end();
                        return [2 /*return*/];
                    }
                    permissions = BigInt(interaction.member.permissions);
                    if ((permissions & v9_1.PermissionFlagsBits.AttachFiles) == BigInt(0) ||
                        (permissions & v9_1.PermissionFlagsBits.EmbedLinks) == BigInt(0)) {
                        res.status(200).json({
                            type: 4 /* ChannelMessageWithSource */,
                            data: {
                                content: "Only users who are allowed to embed links and send attachments can use this bot.",
                                flags: 64 /* Ephemeral */
                            }
                        }).end();
                        return [2 /*return*/];
                    }
                    // This will likely take more than 3 seconds, don't timeout.
                    res.status(200).json({
                        type: 5 /* DeferredChannelMessageWithSource */
                    }).end();
                    text = Object.values(interaction.data.resolved.messages)[0].content;
                    return [4 /*yield*/, takeScreenshots(text)];
                case 1:
                    screenshots = _a.sent();
                    route = v9_1.Routes.webhookMessage(common_1.discordAppId, interaction.token);
                    if (!(screenshots.length == 0)) return [3 /*break*/, 3];
                    // Response hasn't been deferred yet, send a normal one.
                    return [4 /*yield*/, common_1.discord.patch(route, {
                            body: {
                                content: "This message contains no links."
                            }
                        })];
                case 2:
                    // Response hasn't been deferred yet, send a normal one.
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, common_1.discord.patch(route, {
                        body: {
                            type: 4 /* ChannelMessageWithSource */
                        },
                        attachments: screenshots.map(function (screenshot) { return ({
                            fileName: "screenshot.png",
                            rawBuffer: screenshot
                        }); })
                    })];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [2 /*return*/];
            }
        });
    });
}
function takeScreenshots(text) {
    return __awaiter(this, void 0, void 0, function () {
        var matches, browser, screenshotPromises, result;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    matches = Array.from(text.matchAll(regEx));
                    if (matches.length == 0)
                        return [2 /*return*/, []];
                    return [4 /*yield*/, puppeteer.launch({
                            headless: !common_1.isDev,
                            defaultViewport: {
                                width: 1920,
                                height: 1080
                            }
                        })];
                case 1:
                    browser = _a.sent();
                    screenshotPromises = matches
                        .map(function (match) { return match[0]; })
                        .filter(function (urlString) {
                        var _a;
                        var url = new URL(urlString);
                        if (["127.0.0.1", "localhost"].includes(url.hostname))
                            return false;
                        // Avoid screenshotting images, as it would be redundant.
                        var parts = url.pathname.split(".");
                        if (parts.length > 1 && // Avoid bug where no extension can trigger a false positive
                            ["png", "jpg", "jpeg", "gif"].includes((_a = parts.pop()) !== null && _a !== void 0 ? _a : ""))
                            return false;
                        return true;
                    })
                        .map(function (urlString) { return __awaiter(_this, void 0, void 0, function () {
                        var page, buffer;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, browser.newPage()];
                                case 1:
                                    page = _a.sent();
                                    return [4 /*yield*/, page.goto(urlString)];
                                case 2:
                                    _a.sent();
                                    return [4 /*yield*/, page.screenshot({
                                            type: "png",
                                            encoding: "binary"
                                        })];
                                case 3:
                                    buffer = _a.sent();
                                    return [4 /*yield*/, page.close()];
                                case 4:
                                    _a.sent();
                                    return [2 /*return*/, buffer];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(screenshotPromises)];
                case 2:
                    result = _a.sent();
                    browser.close();
                    return [2 /*return*/, result];
            }
        });
    });
}
