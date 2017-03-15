class SlackUser{
    constructor(id){
        this.id = id;
        this.mention = SlackUser.getMention(id);
    }

    static getMention(id){
        return `<@${id}>`;
    }
}

module.exports = SlackUser;