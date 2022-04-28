import React, { useContext } from 'react';
import { Box, Typography } from '@material-ui/core';
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
    backgroundColor: '#3F92FF',
    borderRadius: '10px',
    padding: '0 7px',
    marginRight: '5px',
    height: '20px',
    fontFamily: 'Open Sans',
    fontStyle: 'normal',
    fontWeight: 700,
    fontSize: '14px',
    lineHeight: '20px',
    letterSpacing: '-0.5px',
    color: '#FFFFFF',
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
    if (
      conversation.messages.filter(
        (message) => !message.isRead && message.senderId !== user.id
      ).length > 0
    ) {
      const data = {
        type: "batch",
        conversation,
        userId: user.id,
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
      <ChatContent conversation={conversation} />
      {unreadMessages > 0 && (
        <Typography className={classes.unread}>{unreadMessages}</Typography>
      )}
    </Box>
  );
};

export default Chat;
