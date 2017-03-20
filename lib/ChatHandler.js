class ChatHandler{
    constructor(initial = {}){
        this.actions = initial;
    }

    addMatch(regex, action){
        this.actions[regex] = {
            regex: regex,
            action: action
        };
    }

    handle(message, text = message.text){
        let matches = Object.keys(this.actions);
        if(matches.length > 0){
            for(let match of matches){
                if(this.actions[match].regex.test(text)){
                    this.actions[match].action(message);
                }
            }
        }
    }

    static getWildcardString(inner){
        return `.*(${inner}).*`;
    }

    static getWildcardRegex(inner){
        return new RegExp(ChatHandler.getWildcardString(inner), 'i');
    }
}

module.exports = ChatHandler;