const Sequelize = require("sequelize");
const db = require("../db");

const Conversation_Users = db.define('Conversation_Users', {
  ConversationId: {
    type: Sequelize.INTEGER,
    references: {
      model: Conversation,
      key: 'id'
    }
  },
  UserId: {
    type: Sequelize.INTEGER,
    references: {
      model: User, 
      key: 'id'
    }
  }
});

module.exports = Conversation_Users;