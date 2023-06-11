// run with node index.js
// main id: 41369
// memes id: 41370

/*
 TODO
 * when posting, also write comments
 * when called under one of its post, sync comments (perhaps only reddit->lemmy, not the opposite or it would get banned real quick)
 
 */

import LemmyBot from 'lemmy-bot';
import snoowrap from "snoowrap";

import Config from "./credentials.js"

const config = Config.Config


var pendingPosts = [];

console.warn(config)

/* reddit part */
const r = new snoowrap({
	userAgent: config.reddit_useragent,
	clientId: config.reddit_id,
	clientSecret: config.reddit_secret,
	username: config.reddit_username,
	password: config.reddit_password
});

function getCreditLine(author, sub, link){
	return "[Original](https://reddit.com" + link + ") posted by [u/" + author + "](https://reddit.com/user/" + author + ") in [" + sub + "](https://reddit.com/" + sub + ")";
}

function fetchRedditPosts(){
	r.getSubreddit('memes').getNew({limit: 25}).then(posts => {
		posts.forEach(post => {
			if(!post.saved){
				post.save();
				pendingPosts.push({
					name: "meme by u/" + post.author.name,//post.title,
					url: post.url_overridden_by_dest,
					body: getCreditLine(post.author.name, post.subreddit_name_prefixed, post.permalink),
					nsfw: post.over_18,
					community_id: config.reddit_shitjustworks_reddit_memes_id
				});
			} else {
				// TODO check if has been banned and in case remove/write it
			}
		});
	})
}


/* lemmy part */
function refresh(botActions){
	// this function is triggered periodically. it should check if new reddit post in the desired subreddit has been posted, and if yes dump them to lemmy
	
	/*botActions.createPost({
		name: "Reddit r/memes mirror",
		body: "Fellow Lemmings, welcome to the **Reddit r/memes** mirror here on Lemmy! I'm a bot, and will periodically check reddit's r/memes posts to get the latest post, and then link them here on Lemmy! In order to avoid breaking any copyright law, I will only post the image url, with no title, and then give credits to the original authorin the body. If you come across any post or content that you believe may infringe upon copyright laws, please contact me immediately and I will remove it as soon as possible.\n\nFeel free to comment under this post with any question or tips.",
		nsfw: false,
		community_id: config.reddit_shitjustworks_reddit_memes_id
	})
	return;*/
	while(pendingPosts.length > 0){ // post everything on pending
		let post = pendingPosts[0];
		pendingPosts.shift();
		botActions.createPost(post)
		console.log(post.name)
	}
	
	fetchRedditPosts();
}

const bot = new LemmyBot.LemmyBot({
  // Pass configuration options here
	credentials: {
		username: config.lemmy_username,
		password: config.lemmy_password
	},
	instance: config.lemmy_instance,
	schedule: {
		cronExpression: "*/10 * * * * *",
		doTask: (botActions) => {
			refresh(botActions)
		},
		timezone: "Europe/London"
	}
});

bot.start()





/* other functions */

function sleep(milliseconds) {
	const date = Date.now();
	let currentDate = null;
	do {
		currentDate = Date.now();
	} while (currentDate - date < milliseconds);
}