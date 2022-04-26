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
    const { recipientId, text, conversationId, sender, isRead = false } = req.body;

    // if we already know conversation id, we can save time and just add it to message and return
    if (conversationId) {
      const message = await Message.create({ senderId, text, conversationId, isRead });
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
      isRead
    });
    res.json({ message, sender });
  } catch (error) {
    next(error);
  }
});

router.patch("/", async (req, res, next) => {
  try {
    if (!req.user) {
      return res.sendStatus(401);
    }
    
    const { conversationId, messageId, userId } = req.body;

    const readUpdate = await Message.update(
      {isRead: true},
      {where : {
        [Op.and]: {
          conversationId : conversationId,
          id: messageId,
          } 
        }
      }
    )

    res.json({ readUpdate });
  } catch (error) {
      next(error);
    }
  });

  router.put("/", async (req, res, next) => {
    try {
      if (!req.user) {
        return res.sendStatus(401);
      }
      
      const { conversationId, userId } = req.body;
  
      const readUpdate = await Message.update(
        {isRead: true},
        {where :
          { 
            conversationId : conversationId,
            senderId:  {[Op.ne]: userId}
          }
        }        
      )
  

      res.json({ readUpdate });
    } catch (error) {
        next(error);
      }
    });
module.exports = router;
