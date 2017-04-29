const EventEmitter = require('events');

const Logger = require('frozor-logger');
const SlackAPI = require('frozor-slack');
const SlackMessage = require('./SlackMessage');
const SlackCommandMessage = require('./SlackCommandMessage');
const SlackUser = require('./SlackUser');
const ChatHandler = require('./ChatHandler');

class SlackBot extends EventEmitter{
    constructor(token, rtm = true, prefix, options = {}){
        super();
        this.getLogPrefix = ()=> (prefix)?`SLACK|${prefix}`:'SLACK';
        this.api = new SlackAPI(token, this.getLogPrefix());
        this.rtm = rtm;
        this.log = new Logger(this.getLogPrefix(), prefix||'slackbot');
        this.prefix = prefix;
        this.options = options;

        if(this.options.isCommand){
            this.isCommand = this.options.isCommand;
        }

        this.chatHandler = new ChatHandler();

        this.self = null;

        // Legacy handling
        this.initialize = this.init;
    }
    
    error(msg){
        this.emit('error', msg);

        this.log.error(msg);
    }

    init(){
        this.log.debug(`Initializing ${this.log.chalk.cyan(this.prefix||'SlackBot')}...`, 'INIT');
        this.api.methods.auth.test().then(()=>{
            if(this.rtm){
                this.api.rtm.start();

                this.registerEvents();

                this.api.on('rtmFail', (err)=> this.error('RTM hit a fatal error and was unable to start: ' + this.log.chalk.red(err)));

                this.api.on('rtmClose', (code, desc)=> this.error(`RTM has closed (Code ${this.log.chalk.magenta(code)}): ${this.log.chalk.cyan(desc)}`));
                this.api.on('rtmConnectFailed', ()=> this.error('Unable to connect to RTM.'));
                this.api.on('rtmError', (error)=> this.error(`RTM ran into an error: ${this.log.chalk.error(error)}`));
            }

            this.api.storage.team.get().then((team)=>{
                this.log.info(`Authenticated with the Slack API at ${this.log.chalk.cyan(team.name)}!`);
            }).catch(()=>{
                this.log.info(`Authenticated with the Slack API!`);
            })
        }).catch((err)=>{
            this.error(`Unable to authenticate with the Slack API: ${this.log.chalk.red(err)}`);
        });
    }

    isCommand(message){
        return message.text.startsWith(SlackUser.getMention(this.self.id));
    }

    registerEvents(){
        this.api.on('hello', ()=>{
            this.api.storage.team.get().then((team)=>{
                this.api.storage.self.get()
                    .then((self)=>{
                        this.self = self;
                        this.log.info(`Connected to RTM as ${this.log.chalk.cyan(self.name)}@${this.log.chalk.magenta(team.name)}`);
                    }).catch(this.error)
            }).catch(this.error);
        });

        this.api.on('message', (message)=>{
            if(message.subtype) return;

            let slackMessage = new SlackMessage(message, this);

            this.emit('message', slackMessage);

            if(message.user === this.self.id) return;

            this.chatHandler.handle(slackMessage);

            if(!this.options.customCommandHandling){
                if(this.isCommand(message)){
                    let commandMessage = new SlackCommandMessage(message, this, this.options.commandStartPosition);

                    this.emit('command', commandMessage);
                }
            }
        });

        this.api.on('error', this.error);
    }

    chat(channel, msg, args){
        return this.api.methods.chat.postMessage(Object.assign({
            channel: channel,
            text: msg,
            as_user: true
        }, args));
    }

    sendAttachments(channel, msg, attachments){
        return this.chat(channel, msg, { attachments });
    }

    replyWithAttachments(om, msg, attachments){
        return this.sendAttachments(om.channel, msg, attachments);
    }
}

module.exports = SlackBot;