import { REST } from "@discordjs/rest";

export const isDev = process.env.NODE_ENV == "development";

// Allow separate config for development and production.
const config = isDev ? require("../dev-config.json") : require("firebase-functions").config().screenbot;

export function assertConfig<T>(key: string): T {
	if (config[key] == null) throw new Error(`Missing config: ${key}`);
	return config[key];
}

export const discordToken = assertConfig<string>("discord_token");
export const discordKey = assertConfig<string>("discord_key");
export const discordAppId = assertConfig<string>("discord_app_id");

export const discord = new REST({ version: "9" }).setToken(discordToken);
