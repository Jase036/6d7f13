import React from 'react';
import { Box } from '@material-ui/core';
import { SenderBubble, OtherUserBubble } from '.';
import moment from 'moment';

const Messages = (props) => {
  const { messages, otherUser, userId, markMessageRead } = props;
console.log(messages[0])




  return (
    <Box>
      {messages.map((message) => {
        const time = moment(message.createdAt).format('h:mm');

        return message.senderId === userId ? (
          <SenderBubble key={message.id} text={message.text} time={time}/>
        ) : (
          <OtherUserBubble
            key={message.id}
            message={message}
            time={time}
            otherUser={otherUser}
            markMessageRead = {markMessageRead}
          />
        );
      })}
    </Box>
  );
};

export default Messages;
