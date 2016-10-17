#Frozor SlackBot

This is a higher-level Slack Bot written from scratch by me in node.

Depdendencies:
* frozor-logger
* frozor-slack
* frozor-slack-messages
* frozor-slack-user

I would recommend you use `frozor-logger` when using this slackbot, but I'm probably biased.
If you want to change the logger, feel free to do so by just editing the module after installation, or by forking the [repo](http://github.com/ArcticZeroo/Frozor-Slackbot) and changing the logger. It's easiest to do so when your logger has an .info and .error method present, or you can remap.

##Installation
`npm i --save frozor-slackbot`

Then, in your app:
`var SlackBot = require('frozor-slackbot')`

##Usage:
```
var log      = require('frozor-logger);
var SlackBot = require('frozor-slackbot');

/** 
/* Setting the second argument to true makes it start RTM automatically
/* When it initializes
**/

var slackBot = new SlackBot(YOUR_TOKEN, true);
slackBot.initialize();

slackBot.on('hello', ()=>{
    log.info(`Slack said hello!`);
});

```

If you have [Frozor-Commands](http://npmjs.com/package/frozor-commands) installed, you can also set up commands very easily.

**/commands/slack.js:**
```
var CommandUtil = require('frozor-commands').CommandUtil;

var commands = {
    hello:{
        args:{
            min: 0,
            max: 1000
        },
        process: (slackBot, commandMessage, extra)=>{
            //Reply automatically inserts the sender's mention and a space.
            commandMessage.reply(slackBot, `Hello there!`);
        }
    }
}

module.exports = new CommandUtil(commands);
```

**In main.js (or wherever your bot is)**:
```
var log        = require('frozor-logger);
var SlackBot   = require('frozor-slackbot');
var RunCommand = require('frozor-commands').RunCommand;

/** 
/* Setting the second argument to true makes it start RTM automatically
/* When it initializes
**/

var slackBot = new SlackBot(YOUR_TOKEN, true);

//Require the commands JS file
var slackCommands = require('./commands/slack');

slackBot.initialize();

slackBot.on('hello', ()=>{
    log.info(`Slack said hello!`);
});

//Slack bot defaults to the bot being mentioned as the command's prefix
//E.g. @bot hello

slackBot.on('command', (commandMessage)=>{
    RunCommand.handle(slackCommands, commandMessage, slackBot, extra_args);
});

```
The `RunCommand.handle` method is pretty useful and will automatically handle most things like disabled commands, incorrect arguments, etc. 

Extra_args should always be an object, e.g. if you want to include a random picture of a cat in each message, you would get the random cat picture then
```
{
    cat_picture: URL
}
```

And in the command process for whatever command it is:

```
commandMessage.reply(slackBot, extra.cat_picture);
```