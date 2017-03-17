class SlackUser{
    constructor(id){
        this.setId(id);
    }

    setId(id){
        this.id = id;
        this.mention = SlackUser.getMention(id);
    }

    static getMention(id){
        return `<@${id}>`;
    }
}

module.exports = SlackUser;