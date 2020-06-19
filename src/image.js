const {createCanvas, loadImage} = require("canvas");
const fs = require("fs");

const toRad = (x) => x * (Math.PI / 180);

/**
 *
 * @param config is an array with 4 entries
 * Each entry is an object with the following properties:
 * distance: from the middle of the image to the middle of the circle at the current layer. The bigger the number, the further is the layer from the center
 * count: circles in the current layer
 * radius: of the circles in this layer
 * users: list of users to render in the format {avatar:string}
 * @returns {Promise<void>}
 */
module.exports = async function render(config) {
	const width = 1000;
	const height = 1000;

	const canvas = createCanvas(width, height);
	const ctx = canvas.getContext("2d");

	// fill the background
	ctx.fillStyle = "#C5EDCE";
	ctx.fillRect(0, 0, width, height);

	// loop over the layers
	for (const [layerIndex, layer] of config.entries()) {
		const {count, radius, distance, users} = layer;

		const angleSize = 360 / count;

		// loop over each circle of the layer
		for (let i = 0; i < count; i++) {
			// We need an offset or the first circle will always on the same line and it looks weird
			// Try removing this to see what happens
			const offset = layerIndex * 30;

			// i * angleSize is the angle at which our circle goes
			// We need to converting to radiant to work with the cos/sin
			const r = toRad(i * angleSize + offset);

			const centerX = Math.cos(r) * distance + width / 2;
			const centerY = Math.sin(r) * distance + height / 2;

			// if we are trying to render a circle but we ran out of users, just exit the loop. We are done.
			if (!users[i]) break;

			ctx.save();
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
			ctx.clip();

			const img = await loadImage(users[i].avatar);
			ctx.drawImage(
				img,
				centerX - radius,
				centerY - radius,
				radius * 2,
				radius * 2
			);

			ctx.restore();
		}
	}

	// write the resulting canvas to file
	const out = fs.createWriteStream("./circle.png");
	const stream = canvas.createPNGStream();
	stream.pipe(out);
	out.on("finish", () => console.log("Done!"));
};
