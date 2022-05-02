const router = require("express").Router();
const { Conversation, Message } = require("../../db/models");
const { Op } = require("sequelize");
const onlineUsers = require("../../onlineUsers");

// expects {recipientId, text, conversationId } in body (conversationId will be null if no conversation exists yet)
router.post("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    const senderId = req.user.id;
    const {
      recipientId,
      text,
      conversationId,
      sender,
      isRead = false,
    } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      const message = await Message.create({
        senderId,
        text,
        conversationId,
        isRead,
      });
      return res.json({ message, sender });
    }
    // if we don't have conversation id, find a conversation to make sure it doesn't already exist
    let conversation = await Conversation.findConversation(
      senderId,
      recipientId
    );

    if (!conversation) {
      // create conversation
      conversation = await Conversation.create({
        user1Id: senderId,
        user2Id: recipientId,
      });
      if (onlineUsers.includes(sender.id)) {
        sender.online = true;
      }
    }
    const message = await Message.create({
      senderId,
      text,
      conversationId: conversation.id,
      isRead,
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

router.patch("/read", async (req, res, next) => {
  const { conversationId, messageId, userId, recipientId, type } = req.body;
console.log(req.user)

  try {
    if (!req.user) {
      return res.sendStatus(401);
    } 
    else if (userId !== req.user.id && recipientId !== req.user.id) {
      return res.sendStatus(403);
    }

    //define where the update operation happens based on the type
    const whereQuery = type === 'individual' ? {
      [Op.and]: {
        conversationId: conversationId,
        id: messageId,
      },
    } : {
      conversationId: conversationId,
      senderId: { [Op.ne]: userId },
    }


    const readUpdate = await Message.update(
      { isRead: true },
      {
        where: whereQuery,
      }
    );

    res.json({ readUpdate });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
