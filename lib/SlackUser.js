class SlackUser{
    constructor(id, user = {}){
        this.setId(id);

        delete user.id;

        Object.assign(this, user);
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