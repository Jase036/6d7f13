import React from 'react';
import { Box } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '.';
import moment from 'moment';

const Messages = (props) => {
  const { messages, otherUser, userId, markMessagesRead, conversation } = props;

  const sent = messages.filter((message) => message.senderId === userId);
  const lastSentId = sent.sort((a, b) => b.id - a.id)[0].id;

  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format('h:mm');

        return message.senderId === userId ? (
          <SenderBubble
            key={message.id}
            time={time}
            message={message}
            otherUser={otherUser}
            lastSent={message.id === lastSentId ? true : false}
          />
        ) : (
          <OtherUserBubble
            key={message.id}
            message={message}
            time={time}
            otherUser={otherUser}
            markMessagesRead={markMessagesRead}
            conversation={conversation}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
