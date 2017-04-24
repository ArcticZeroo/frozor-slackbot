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

    edit(text, cb){
        this.bot.api.methods.chat.update({ channel: this.channel, ts: this.ts, text }, cb);
    }
}

module.exports = SlackMessage;