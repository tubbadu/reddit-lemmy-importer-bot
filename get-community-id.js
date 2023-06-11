// run with node index.js
// main id: 41369
// memes id: 41370

/*
 TODO
 * when posting, also write comments
 * when called under one of its post, sync comments (perhaps only reddit->lemmy, not the opposite or it would get banned real quick)
 
 */


const community = {
	name: "insert community name here",
	instance: "insert instance here" // use "lemmy.ml" not "https://lemmy.ml"
}

import LemmyBot from 'lemmy-bot';
import snoowrap from "snoowrap";

import Config from "./credentials.js"

const config = Config.Config


/* reddit part */
/*const r = new snoowrap({
	userAgent: reddit_useragent,
	clientId: reddit_id,
	clientSecret: reddit_secret,
	username: reddit_username,
	password: reddit_password
});*/

/* lemmy part */
function refresh(botActions){
	// this function is triggered periodically.
	botActions.getCommunityId(community).then(id => console.warn("communityID:", id));
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
