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
        this.api.methods.auth.test((err, res)=>{
            if(err){
                this.error(`Unable to authenticate with the Slack API: ${this.log.chalk.red(err)}`);
            }else{
                if(this.rtm){
                    this.api.rtm.start();

                    this.registerEvents();

                    this.api.on('rtmFail', (err)=> this.error('RTM hit a fatal error and was unable to start: ' + this.log.chalk.red(err)));

                    this.api.on('rtmClose', (code, desc)=> this.error(`RTM has closed (Code ${this.log.chalk.magenta(code)}): ${this.log.chalk.cyan(desc)}`));
                    this.api.on('rtmConnectFailed', ()=> this.error('Unable to connect to RTM.'));
                    this.api.on('rtmError', (error)=> this.error(`RTM ran into an error: ${this.log.chalk.error(error)}`));
                }

                this.api.storage.team.get((err,res)=>{
                    if(err){
                        this.log.info(`Authenticated with the Slack API!`);
                    }else{
                        this.log.info(`Authenticated with the Slack API as ${this.log.chalk.cyan(res.name)}!`);
                    }
                });
            }
        });
    }

    isCommand(message){
        return message.text.startsWith(SlackUser.getMention(this.self.id));
    }

    registerEvents(){
        this.api.on('hello', ()=>{
            this.api.storage.team.get((e,team)=>{
                if(!e){
                    this.api.storage.self.get((e,self)=>{
                        if(!e){
                            this.self = self;
                            this.log.info(`Connected to RTM as ${this.log.chalk.cyan(self.name)}@${this.log.chalk.magenta(team.name)}`);
                        }else this.error(e)
                    });
                }else this.error(e)
            });
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

    chat(channel, msg, args, cb){
        if(typeof args === 'function'){
            cb = args;
            args = {};
        }

        this.api.methods.chat.postMessage(Object.assign({
            channel: channel,
            text: msg,
            as_user: true
        }, args), cb);
    }

    sendAttachments(channel, msg, attachments, cb){
        this.chat(channel, msg, {
            attachments: attachments
        }, cb);
    }

    replyWithAttachments(om, msg, attachments, cb){
        this.sendAttachments(om.channel, msg, attachments, cb);
    }
}

module.exports = SlackBot;