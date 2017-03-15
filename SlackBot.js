const EventEmitter = require('events');

const Logger = require('frozor-logger');
const SlackAPI = require('frozor-slack');
const SlackMessage = require('./SlackMessage');
const SlackCommandMessage = require('./SlackCommandMessage');
const SlackUser = require('./SlackUser');

class SlackBot extends EventEmitter{
    constructor(token, rtm = true, prefix){
        super();
        this.api = new SlackAPI(token);
        this.rtm = rtm;
        this.log = new Logger((prefix)?`SLACK|${prefix}`:'SLACK', prefix||'slackbot');

        this.initialize = this.init;
    }

    init(){
        this.api.methods.auth.test((err, res)=>{
            if(err){
                this.log.error(`Unable to authenticate with the Slack API: ${this.log.chalk.red(err)}`);
            }else{
                if(this.rtm){
                    this.api.rtm.start();

                    this.registerEvents();

                    this.api.on('rtmFail', ()=> this.log.error('RTM hit a fatal error and was unable to start.'));

                    this.api.on('rtmClose', (code, desc)=> this.log.error(`RTM has closed (Code ${this.log.chalk.magenta(code)}): ${this.log.chalk.cyan(desc)}`));
                    this.api.on('rtmConnectFailed', ()=> this.log.error('Unable to connect to RTM.'));
                    this.api.on('rtmError', (error)=> this.log.error(`RTM ran into an error: ${this.log.chalk.error(error)}`));
                }

                this.api.storage.team.get((err,res)=>{
                    if(err){
                        this.log.info(`Authenticated with the Slack API!`);
                    }else{
                        this.log.info(`Authenticated with the Slack API for ${this.log.chalk.cyan(res.name)}!`);
                    }
                });
            }
        });
    }

    registerEvents(){
        this.api.on('hello', ()=>{
            this.api.storage.team.get((e,team)=>{
                if(!e){
                    this.api.storage.self.get((e,self)=>{
                        if(!e){
                            this.log.info(`Connected to RTM as ${this.log.chalk.cyan(self.name)}@${this.log.chalk.magenta(team.name)}`);
                        }else this.log.error(e)
                    });
                }else this.log.error(e)
            });
        });

        this.api.on('message', (message)=>{
            if(message.subtype) return;

            this.api.storage.self.get((err, self)=>{
                if(err) return;

                if(message.user == self.id) return;

                let slackMessage = new SlackMessage(message, this);

                this.emit('message', slackMessage);

                if(message.text.startsWith(SlackUser.getMention(self.id))){
                    let commandMessage = new SlackCommandMessage(message, this);

                    this.emit('command', commandMessage);
                }
            });
        });
    }

    chat(channel, msg, args, cb){
        if(typeof args == 'function'){
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