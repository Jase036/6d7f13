const Sequelize = require("sequelize");
const db = require("../db");

const Conversation_Users_Messages = db.define('Conversation_Users_Messages', {
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
  },
  MessageId: {
    type: Sequelize.INTEGER,
    references: {
      model: Message, 
      key: 'id'
    }
  },
  isRead: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
});

module.exports = Conversation_Users_Messages;