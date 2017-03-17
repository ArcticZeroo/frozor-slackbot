const SlackUser = require('./SlackUser');

class SlackMessage{
    constructor(msg, bot){
        Object.assign(this, msg);

        this.user = new SlackUser(this.user);
        this.bot = bot;
    }

    reply(msg, mention = true, args = {}, cb){
        this.bot.chat(this.channel, (mention)?`${this.user.mention} ${msg}`:msg, args, cb);
    }
}

module.exports = SlackMessage;