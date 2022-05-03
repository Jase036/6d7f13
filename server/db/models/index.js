const Conversation = require("./conversation");
const User = require("./user");
const Message = require("./message");
const Conversation_Users = require("./conversationUsers");

// associations


Conversation.belongsToMany(User, { through: "Conversation_Users" });
User.belongsToMany(User, { through: "Conversation_Users" });
Message.belongsTo(Conversation);
Conversation.hasMany(Message);

module.exports = {
  User,
  Conversation,
  Message,
  Conversation_Users
};
