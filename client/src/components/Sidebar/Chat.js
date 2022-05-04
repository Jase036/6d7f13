import React, { useContext } from 'react';
import { Badge, Box } from '@material-ui/core';
import { BadgeAvatar, ChatContent } from '../Sidebar';
import { makeStyles } from '@material-ui/core/styles';
import { SocketContext } from '../../context/socket';

const useStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 8,
    height: 80,
    boxShadow: '0 2px 10px 0 rgba(88,133,196,0.05)',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    '&:hover': {
      cursor: 'grab',
    },
  },
  unread: {
    left: '-20px',
  },
}));

const Chat = ({
  conversation,
  setActiveChat,
  unreadMessages,
  user,
  markMessagesRead,
}) => {
  const socket = useContext(SocketContext);
  const classes = useStyles();
  const { otherUser } = conversation;

  const handleClick = async (conversation) => {
    if (conversation.unreadCount > 0) {
      const data = {
        type: 'batch',
        conversation,
        userId: user.id,
        recipientId: otherUser.id,
      };

      //sends socket event to update all messages in conversation have been read
      socket.emit('update-message', {
        conversation,
        userId: otherUser.id,
      });

      markMessagesRead(data);
    }
    await setActiveChat(conversation.otherUser.username);
  };

  return (
    <Box onClick={() => handleClick(conversation)} className={classes.root}>
      <BadgeAvatar
        photoUrl={otherUser.photoUrl}
        username={otherUser.username}
        online={otherUser.online}
        sidebar={true}
      />
      <ChatContent
        conversation={conversation}
        unreadMessages={unreadMessages}
      />
      {unreadMessages > 0 && (
        <Badge
          badgeContent={unreadMessages}
          color="primary"
          overlap="rectangular"
          className={classes.unread}
        />
      )}
    </Box>
  );
};

export default Chat;
