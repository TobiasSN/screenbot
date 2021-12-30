import { REST } from "@discordjs/rest";
import * as functions from "firebase-functions";

export const isDev = process.env.NODE_ENV == "development";

const config = functions.config();

export const discordToken: string = config.discord_token;
export const discordKey: string = config.discord_key;
export const discordAppId: string = config.discord_app_id;

export const discord = new REST({ version: "9" }).setToken(discordToken);
