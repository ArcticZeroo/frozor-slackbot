var EventEmitter   = require('events');

/* Frozor Dependencies */
var Logger         = require('frozor-logger');
var slackAPI       = require('frozor-slack');
var SlackMessages  = require('frozor-slack-messages');
var User           = require('frozor-slack-user');

var SlackMessage   = SlackMessages.SlackMessage;
var CommandMessage = SlackMessages.CommandMessage;

class SlackBot extends EventEmitter{
    constructor(token, auto_rtm, prefix){
        super();
        this.token        = token;
        this.bot          = null;
        this.utils        = null;
        this.auto_rtm     = auto_rtm || false;
        this.user          = null;
        this.log           = new Logger(prefix);
    }

    initialize(){
        this.bot   = slackAPI.createBot(this.getToken());
        this.api   = this.bot;
        this.utils = slackAPI.utils.getUtils(this.bot);

        this.bot.auth.test({}, (response)=>{
           if(response.ok){
               this.log.info(`Successfully authenticated with the Slack API!`);
               this.emit('authSuccess');
               if(this.auto_rtm) this.getBot().rtm.start();
           }
           else{
               this.log.error(`Unable to authenticate with Slack API: ${response.error}`);
               this.emit('authFail');
           }
        });

        this.registerEvents();
        return this;
    }

    registerEvents(){
        var emitter = this.getBot();

        emitter.on('hello', ()=>{
            this.log.info(`Connected to RTM at ${this.log.chalk.cyan(this.getBot().info.getTeamName())} as ${this.log.chalk.magenta(`${this.getBot().info.getUserName()}@${this.getBot().info.getUserID()}`)}`);
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
        return this.bot;
    }

    getToken(){
        return this.token;
    }
    
    getUtils(){
        return this.utils;
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

    /**
     * @param slackMessage
     * @param message
     * @param callback
     */
    reply(slackMessage, message, callback){
        this.chat(slackMessage.getChannel(), message, callback);
    }

    sendWithAttachments(slackMessage, message, attachments, callback){
        this.getUtils().chat.postMessage(slackMessage.getChannel(), message, true, {
            as_user: true,
            attachments: attachments
        }, callback);
    }

    sendAttachmentMessage(slackMessage, attachments, callback){
        this.sendWithAttachments(slackMessage, ' ', attachments, callback);
    }
}

module.exports = SlackBot;