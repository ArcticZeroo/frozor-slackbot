var EventEmitter   = require('events');

/* Frozor Dependencies */
var Logger         = require('frozor-logger');
var log            = new Logger();
var slackAPI       = require('frozor-slack');
var SlackMessages  = require('frozor-slack-messages');
var User           = require('frozor-slack-user');

var SlackMessage   = SlackMessages.SlackMessage;
var CommandMessage = SlackMessages.CommandMessage;

class SlackBot extends EventEmitter{
    constructor(token, auto_rtm){
        super();
        this._token        = token;
        this._bot          = null;
        this._utils        = null;
        this._auto_rtm     = auto_rtm || false;
    }

    initialize(){
        this._bot   = slackAPI.createBot(this.getToken());
        this._utils = slackAPI.utils.getUtils(this._bot);

        this._bot.auth.test({}, (response)=>{
           if(response.ok){
               log.info(`Successfully authenticated with the Slack API!`);
               if(this._auto_rtm) this.getBot().rtm.start();
           }
           else log.error(`Unable to authenticate with Slack API: ${response.error}`);
        });

        this.registerEvents();
        return this;
    }

    registerEvents(){
        var emitter = this.getBot();

        emitter.on('hello', ()=>{
            log.info(`Connected to RTM at ${log.chalk.cyan(this.getBot().info.getTeamName())} as ${log.chalk.magenta(`${this.getBot().info.getUserName()}@${this.getBot().info.getUserID()}`)}`);
            this.emit('hello');
        });

        emitter.on('message', (message)=>{
            if(message.subtype) return;

            var slackMessage = new SlackMessage(message);

            this.emit('message', slackMessage);

            //Checks to make sure that the sender is not the bot
            if(slackMessage.getUser() == this.getUserID()) return;

            // Checks to see if the message begins with _bot mention (which is command prefix)
            if(slackMessage.getText().startsWith(this.getMention())) this.emit('command', new CommandMessage(message));
        });
    }

    /**
     * @method - Use this before calling initialize() to change the registered events.
     * @param override_function - The function you want to override with. Must take no arguments, and can use anything inside the bot class.
     */
    overrideEvents(override_function){
        this.registerEvents = override_function;
    }

    getBot(){
        return this._bot;
    }

    getToken(){
        return this._token;
    }
    
    getUtils(){
        return this._utils;
    }

    getUserName(){
        return this.getBot().info.getUserName();
    }

    getUserID(){
        return this.getBot().info.getUserID();
    }

    getUser(){
        return new User(this.getUserID());
    }

    getMention(){
        return this.getUser().getMention();
    }

    chat(channel, message, callback){
        this.getUtils().chat.postMessage(channel, message, true, {
            as_user: true
        }, callback);
    }

    reply(slackMessage, message, callback){
        this.chat(slackMessage.getChannel(), message, callback);
    }
}

module.exports = SlackBot;