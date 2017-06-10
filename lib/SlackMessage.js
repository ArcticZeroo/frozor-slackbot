const SlackUser = require('./SlackUser');

class SlackMessage{
    constructor(msg, bot){
        Object.assign(this, msg);

        // Get user data, w/ fallback if not exists.
        // This NEEDS to be sync since the constructor
        // must return an instance of the class synchronously.
        const userData = bot.api.cache.users[this.user];

        this.user = new SlackUser(this.user, userData);
        this.bot = bot;
    }

    reply(msg, mention = true, args = {}){
        return this.bot.chat(this.channel, (mention)?`${this.user.mention} ${msg}`:msg, args);
    }

    edit(text, args = {}){
        return this.bot.api.methods.chat.update(Object.assign({ channel: this.channel, ts: this.ts, text }, args));
    }

    delete(){
        return this.bot.api.methods.chat.delete({ channel: this.channel, ts: this.ts });
    }
}

module.exports = SlackMessage;