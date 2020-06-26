
/**
 * Fetch a single page of the timeline
 * @param screen_name
 * @param page
 * @param max_id
 * @returns {Promise<[]>} Returns an array of posts
 */
async function getTimelinePage(screen_name, page, max_id = null) {
	let params = {
		screen_name,
		count: 200,
		...(!!max_id && {max_id}),
	};

	console.log("Fetching Timeline page " + page);
	const res = await globalThis.TwitterClient.get("statuses/user_timeline", params);
	return res;
}

/**
 * Fetch the whole timeline available for a user. That is, up to 3000 tweets.
 * @param screen_name
 * @returns {Promise<[]>}
 */
async function getTimeline(screen_name) {
	let page = 1;
	let posts = await getTimelinePage(screen_name, page++);
	let timeline = [...posts];

	// in debug mode we fetch only one page
	while (posts.length > 0 && (!process.env.DEBUG || page <= 1)) {
		timeline = [...timeline, ...posts];
		const max_id = "" + (BigInt(posts[posts.length - 1].id_str) - 1n);
		posts = await getTimelinePage(screen_name, page++, max_id);
	}

	return timeline;
}

/**
 * Fetch a single page of liked posts by the user
 * @param screen_name
 * @param page
 * @param max_id
 * @returns {Promise<any>} Returns a list of up to 200 posts liked by the user.
 */
async function getLikedPage(screen_name, page, max_id = null) {
	let params = {
		screen_name,
		count: 200,
		...(!!max_id && {max_id}),
	};

	console.log("Fetching Liked page " + page);
	const res = await globalThis.TwitterClient.get("favorites/list", params);
	return res;
}

/**
 * Get all the liked posts by the user (up to 3000 as limited by the API)
 * @param screen_name
 * @returns {Promise<*[]>}
 */
async function getLiked(screen_name) {
	let page = 1;
	let posts = await getLikedPage(screen_name, page++);
	let timeline = [...posts];

	while (posts.length > 0 && (!process.env.DEBUG || page <= 1)) {
		timeline = [...timeline, ...posts];
		const max_id = "" + (BigInt(posts[posts.length - 1].id_str) - 1n);
		posts = await getLikedPage(screen_name, page++, max_id);
	}

	return timeline;
}

/**
 * Get a list of users avatars based on a list of IDs
 * @param ids an array of ID strings
 * @returns {Promise<any>}
 */
async function getAvatars(ids) {
	let params = {
		user_id: ids,
		include_entities: false,
	};

	console.log("Fetching avatars " + ids.length);

	const res = await globalThis.TwitterClient.get("users/lookup", params);

	return Object.fromEntries(
		res.map((user) => [
			user.id_str,
			user.profile_image_url_https.replace("normal", "400x400"),
		])
	);
}

/**
 * Return information about a single specific user
 * @returns {Promise<{screen_name: string, id: string, avatar: string}>}
 */
async function getUser(screen_name) {
	let params = {
		screen_name,
		include_entities: false,
	};

	console.log("Fetching user " + screen_name);
	const res = (await globalThis.TwitterClient.get("users/lookup", params))[0];

	return {
		id: res.id_str,
		screen_name: res.screen_name,
		avatar: res.profile_image_url_https.replace("normal", "400x400"),
	};
}

module.exports = {
	getLiked,
	getTimeline,
	getAvatars,
	getUser
};
