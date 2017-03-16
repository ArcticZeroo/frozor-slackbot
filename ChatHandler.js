class ChatHandler{
    constructor(){
        this.actions = {};
    }

    addMatch(regex, action){
        this.actions[regex] = action;
    }

    handle(message){
        if(this.actions.size > 0){
            for(let regex in this.actions){
                if(regex.test(message.text)){
                    this.actions[regex](message);
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