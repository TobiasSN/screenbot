# Screenbot

Discord bot that sends a screenshot of any website that is linked to.

## Running

1. Make sure you're running a version of Node.js between v16.13 and v17. I recommend [n](https://www.npmjs.com/package/n) for this. Simply install it and run `n engine`.
2. Make sure you have Yarn 1.22 or newer installed (`npm install -g yarn`).
3. Run `yarn` to ensure all dependencies are installed.
3. Create a file called `dev-config.json` with the following contents:
   ```json
   {
	   "discordToken": "<bot token here>",
	   "discordKey": "<app public key here>",
	   "discordAppId": "<app id here>",
	   "devGuilds:" [/* IDs of test guilds as strings */]
   }
   ```
   You can get the first 3 from the dashboard of your Discord app.
4. Run `yarn dev:register` to register the command in all the test guilds. This will need to be redone every time the command data changes or you add a test guild.
4. Run `yarn dev`.
