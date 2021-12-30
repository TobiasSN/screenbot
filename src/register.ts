import { execFileSync } from "child_process";

import { REST } from "@discordjs/rest";
import {
	APIApplicationCommand,
	APIGuild,
	ApplicationCommandType,
	Routes
} from "discord-api-types/v9";

const isDev = process.env.NODE_ENV == "development";

const command = {
	name: isDev ? "Screenshot links (Dev)" : "Screenshot links",
	type: ApplicationCommandType.Message
} as APIApplicationCommand;

// The normal way of accessing the config isn't available here.
const configString = execFileSync("firebase", ["functions:config:get", "--json"]).toString();
const config = JSON.parse(configString).result.screenbot;

const discord = new REST({ version: "9" }).setToken(config.discord_token);

(async () => {
	const body = (process.argv.length >= 3 && process.argv[2] == "clear")
		? []
		: [command];

	if (isDev) {
		const devConfig = await import("../dev-config.json");

		for (const guild of devConfig.guilds) {
			await discord.put(
				Routes.applicationGuildCommands(config.discord_app_id, guild),
				{ body }
			);
		}
	} else {
		await discord.put(
			Routes.applicationCommands(config.discord_app_id),
			{ body }
		);
	}
})();
