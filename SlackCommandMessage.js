const SlackMessage = require('./SlackMessage');

class SlackCommandMessage extends SlackMessage{
    constructor(msg, bot){
        super(msg, bot);

        this.args = this.text.split(' ').slice(1).filter((arg)=> arg.trim() != '');
        this.commandName = this.args[0];
        this.args.shift();
    }
}

module.exports = SlackCommandMessage;
