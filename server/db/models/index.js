const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const Conversation_Users_Messages = require("./conversationUsersMessages");

// associations


Conversation.belongsToMany(User, { through: "Conversation_Users_Messages" });
User.belongsToMany(Conversation, { through: "Conversation_Users_Messages" });
Message.belongsToMany(User, { through: "Conversation_Users_Messages" });
Message.belongsTo(Conversation, { through: "Conversation_Users_Messages" });


module.exports = {
  User,
  Conversation,
  Message,
  Conversation_Users_Messages
};
