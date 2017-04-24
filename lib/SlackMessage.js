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

    edit(text, args = {}, cb){
        this.bot.api.methods.chat.update(Object.assign({ channel: this.channel, ts: this.ts, text }, args), cb);
    }

    delete(cb){
        this.bot.api.methods.chat.delete({ channel: this.channel, ts: this.ts }, cb);
    }
}

module.exports = SlackMessage;