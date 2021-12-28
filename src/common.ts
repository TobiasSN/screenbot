import { REST } from "@discordjs/rest";

export const isDev = process.env.NODE_ENV == "development";

// Allow separate config for development and production.
const config = isDev ? require("../dev-config.json") : require("firebase-functions").config();

export function assertConfig<T>(key: string): T {
	if (config[key] == null) throw new Error(`Missing config: ${key}`);
	return config[key];
}

export const discordToken = assertConfig<string>("discordToken");
export const discordKey = assertConfig<string>("discordKey");
export const discordAppId = assertConfig<string>("discordAppId");

export const discord = new REST({ version: "9" }).setToken(discordToken);
