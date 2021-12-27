import { Client, Intents, Permissions, MessageAttachment } from "discord.js";
import * as puppeteer from "puppeteer";

const regEx = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;

const isDev = process.env.NODE_ENV == "development";

if (isDev) require("dotenv").config();

const discordToken = process.env.DISCORD_TOKEN;

const client = new Client({
	intents: [
		Intents.FLAGS.GUILDS,
		Intents.FLAGS.GUILD_MESSAGES
	]
});

(async () => {
	const browser = await puppeteer.launch({
		headless: !isDev,
		defaultViewport: {
			width: 1920,
			height: 1080
		}
	});

	client.on("ready", () => {
		console.log(`Logged in as ${client?.user?.tag}!`);
	});

	client.on("messageCreate", async message => {
		if (message.author.bot) return;
		if (message.member == null) return; // Ensures this is in a guild and provides type-safety

		if (!message.member.permissions.has([
			Permissions.FLAGS.EMBED_LINKS,
			Permissions.FLAGS.ATTACH_FILES
		])) return;

		const matches = Array.from(message.content.matchAll(regEx)); // Convert to array

		const attachmentPromises = matches
			.map(match => match[0])
			.filter(urlString => {
				const url = new URL(urlString);

				if (["127.0.0.1", "localhost"].includes(url.hostname)) return false;

				// Avoid screenshotting images, as it would be redundant.
				const parts = url.pathname.split(".");
				if (
					parts.length > 1 && // Avoid bug where no extension can trigger a false positive
					["png", "jpg", "jpeg", "gif"].includes(parts.pop() ?? "")
				) return false;

				return true;
			})
			.map(async urlString => {
				const page = await browser.newPage();
				await page.goto(urlString);

				const buffer = await page.screenshot({
					type: "png"
				});
				await page.close();

				return new MessageAttachment(buffer, "screenshot.png");
			});

		if (attachmentPromises.length == 0) return;

		await message.reply({
			files: await Promise.all(attachmentPromises)
		});
	});

	client.login(discordToken);
})();
