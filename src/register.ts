import {
	APIApplicationCommand,
	APIGuild,
	ApplicationCommandType,
	Routes
} from "discord-api-types/v9";
import { isDev, discord, discordAppId, assertConfig } from "./common";

const command = {
	name: isDev ? "Screenshot links (Dev)" : "Screenshot links",
	type: ApplicationCommandType.Message
} as APIApplicationCommand;

const guilds = assertConfig<string[]>("dev_guilds");

(async () => {
	const body = (process.argv.length >= 3 && process.argv[2] == "clear")
		? []
		: [command];

	if (isDev) {
		for (const guild of guilds) {
			await discord.put(
				Routes.applicationGuildCommands(discordAppId, guild),
				{ body }
			);
		}
	} else {
		await discord.put(
			Routes.applicationCommands(discordAppId),
			{ body }
		);
	}
})();
