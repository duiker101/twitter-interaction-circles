const dotenv = require("dotenv");
const getInteractions = require("./data");
const render = require("./image");
const {getUser} = require("./api");
const {renderText} = require("./text");
const Twitter = require("twitter-lite");

/**
 * Load the environment variables from the .env file
 */
dotenv.config();

/**
 * This is the main function of the app. It need to be a function because we can't have a top level await.
 */
async function main() {
	// Create an instance of the API client using the consumer keys for your app
	const client = new Twitter({
		consumer_key: process.env.CONSUMER_KEY,
		consumer_secret: process.env.CONSUMER_SECRET,
	});
	// Use the previous client to fetch the bearer token
	// This method gives you an application-only token specifically for read-only access to public information.
	try {
		const bearer = await client.getBearerToken();
		// Create a new twitter client with this token.
		// We assign this client to a global variable so we can access it in the api module
		globalThis.TwitterClient = new Twitter({
			bearer_token: bearer.access_token,
		});

		// fetch the information of the logged in user
		// instead of getMe you could replace it with another method to get a third user to generate their circles
		const user = await getUser("foliverofficial");

		// this is how many users we will have for each layer from the inside out
		const layers = [8, 15, 26];

		// fetch the interactions
		const data = await getInteractions(
			user.screen_name.toLowerCase(),
			layers
		);

		// render the image
		await render([
			{distance: 0, count: 1, radius: 110, users: [user]},
			{distance: 200, count: layers[0], radius: 64, users: data[0]},
			{distance: 330, count: layers[1], radius: 58, users: data[1]},
			{distance: 450, count: layers[2], radius: 50, users: data[2]},
		]);

		// Look at the arguments passed to the cli. If one of them is --text then we want to render a text version of the image too
		const shouldRenderText = process.argv.find((arg) => arg === "--text");
		if (shouldRenderText) await renderText(data);
	} catch (err) {
		console.log(err.errors[0]);
	}
}

// entry point
main();
