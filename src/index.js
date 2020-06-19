const getInteractions = require("./data");
const render = require("./image");
const {getMe, getUser} = require("./api");
const {renderText} = require("./text");

/**
 * This is the main function of the app. It need to be a function because we can't have a top level await.
 */
async function main() {
	// fetch the information of the logged in user
	// instead of getMe you could replace it with another method to get a third user to generate their circles
	const user = await getMe();
	// const user = await getUser(USERNAME);

	// this is how many users we will have for each layer from the inside out
	const layers = [8, 15, 26];

	// fetch the interactions
	const data = await getInteractions(user.screen_name.toLowerCase(), layers);

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
}

// entry point
main();
