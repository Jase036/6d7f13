const { Op } = require("sequelize");
const db = require("../db");


const Conversation = db.define("conversation", {});

// find conversations given an array of user Ids

Conversation.findConversations = async function (userArr) {
  const conversations = await Conversation.findAll({
    include: [{
      model: User,
      through: { where: {
        userId: { [Op.in]: userArr }
      }}
    }],
    
  });

  // return conversation or null if it doesn't exist
  return conversations;
};

module.exports = Conversation;
