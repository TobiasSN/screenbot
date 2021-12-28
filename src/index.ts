import { REST } from "@discordjs/rest";
import {
	APIApplicationCommandInteraction,
	APIInteraction,
	APIInteractionResponse,
	APIInteractionResponseCallbackData,
	APIInteractionResponsePong,
	APIMessage,
	ApplicationCommandType,
	InteractionResponseType,
	InteractionType,
	MessageFlags,
	PermissionFlagsBits,
	Routes
} from "discord-api-types/v9";
import * as puppeteer from "puppeteer";
import * as functions from "firebase-functions";
import * as nacl from "tweetnacl";

import { isDev, discord, discordKey, discordAppId } from "./common";

const regEx = /(https?:\/\/(?:www\.|(?!www))[^\s\.]+\.[^\s]{2,}|www\.[^\s]+\.[^\s]{2,})/g;

if (isDev) require("dotenv").config();


export const discordInteractions = functions.https.onRequest(async (req, res) => {
	// Validate request

	const signature = req.get("X-Signature-Ed25519") ?? "";
	const timestamp = req.get("X-Signature-Timestamp") ?? "";
	const body = req.rawBody;

	const isValid = nacl.sign.detached.verify(
		Buffer.from(timestamp + body),
		Buffer.from(signature, "hex"),
		Buffer.from(discordKey, "hex")
	);

	if (!isValid) {
		res.status(401).end("Invalid request signature");
		return;
	}

	const interaction = req.body as APIInteraction;

	switch (interaction.type) {
		case InteractionType.Ping:
			res.status(200).json({
				type: InteractionResponseType.Pong
			} as APIInteractionResponsePong).end();
			break;

		case InteractionType.ApplicationCommand:
			try {
				await handleApplicationCommand(interaction, res);
			} catch (e) {
				// Report the error.

				functions.logger.error(e);

				const response = {
					type: InteractionResponseType.ChannelMessageWithSource,
					data: {
						content: "An error occured: ```" + String(e) + "```"
					}
				} as APIInteractionResponse;

				if (res.destroyed) {
					// Response has already been deferred, edit it.
					await discord.patch(
						Routes.webhookMessage(discordAppId, interaction.token),
						{
							body: response
						}
					);
				} else {
					// Response hasn't been deferred yet, send a normal response.
					res.status(200).json(response).end();
				}
			}
	}
});

async function handleApplicationCommand(
	interaction: APIApplicationCommandInteraction,
	res: functions.Response
) {
	// Ensure that this wasn't called in a way it shouldn't.
	if (interaction.data.type != ApplicationCommandType.Message) {
		res.status(200).json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "Oops, you weren't supposed to be able to do that!"
			}
		} as APIInteractionResponse).end();
		return;
	}

	// Ensure that this was done in a guild.
	if (interaction.member == null) {
		res.status(200).json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "This bot is not supposed to be used in DMs.",
				flags: MessageFlags.Ephemeral
			}
		} as APIInteractionResponse).end();
		return;
	}

	// Ensure that the user has the correct permissions.
	const permissions = BigInt(interaction.member.permissions);
	if ((permissions & PermissionFlagsBits.AttachFiles) == BigInt(0) ||
		(permissions & PermissionFlagsBits.EmbedLinks) == BigInt(0)
	) {
		res.status(200).json({
			type: InteractionResponseType.ChannelMessageWithSource,
			data: {
				content: "Only users who are allowed to embed links and send attachments can use this bot.",
				flags: MessageFlags.Ephemeral
			}
		} as APIInteractionResponse).end();
		return;
	}

	// This will likely take more than 3 seconds, don't timeout.
	res.status(200).json({
		type: InteractionResponseType.DeferredChannelMessageWithSource
	} as APIInteractionResponse).end();

	// `resolved.messages` is an object containing only the selected message.
	const text = Object.values(interaction.data.resolved.messages)[0].content;

	const screenshots = await takeScreenshots(text);

	const route = Routes.webhookMessage(discordAppId, interaction.token);

	//console.log(`Amount of screenshots: ${screenshots.length}`);

	if (screenshots.length == 0) {
		// Response hasn't been deferred yet, send a normal one.
		await discord.patch(route, {
			body: {
				content: "This message contains no links."
			} as APIInteractionResponseCallbackData
		});
	} else {
		await discord.patch(route, {
			body: {
				type: InteractionResponseType.ChannelMessageWithSource
			} as APIInteractionResponseCallbackData,
			attachments: screenshots.map(screenshot => ({
				fileName: "screenshot.png",
				rawBuffer: screenshot
			}))
		});
	}
}

async function takeScreenshots(text: string): Promise<Buffer[]> {
	const matches = Array.from(text.matchAll(regEx)); // Convert to array

	if (matches.length == 0) return [];

	const browser = await puppeteer.launch({
		headless: !isDev,
		defaultViewport: {
			width: 1920,
			height: 1080
		}
	});

	const screenshotPromises = matches
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
				type: "png",
				encoding: "binary"
			}) as Buffer;
			await page.close();

			return buffer;
		});

	const result = await Promise.all(screenshotPromises);
	browser.close();

	return result;
}
