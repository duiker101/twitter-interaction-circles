const fs = require("fs");

/**
 * Generate an text version of the circle data with the names of the users that are presented in the image
 * @param data
 * @returns {Promise<void>}
 */
async function renderText(data) {
	let output = "";

	// loop over each layer and add a header for the current one
	for (let i = 1; i < 4; i++) {
		const layer = data[i - 1];
		output += "---- Circle " + i + " ---- \n";

		// For each user add a line with the username
		for (const user of layer) {
			output += "@" + user.screen_name + "\n";
		}

		output += "\n";
	}

	// output everything in a users file
	fs.writeFileSync("users.txt", output);
}

module.exports = {renderText};
