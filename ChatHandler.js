class ChatHandler{
    constructor(){
        this.actions = new Map();
    }

    addMatch(regex, action){
        this.actions.set(regex, action);
    }

    handle(message){
        if(this.actions.size > 0){
            this.actions.forEach((match, action)=>{
                if(match.test(message)){
                    action(message);
                }
            });
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