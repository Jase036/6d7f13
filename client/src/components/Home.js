import React, { useCallback, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Grid, CssBaseline, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import { SidebarContainer } from '../components/Sidebar';
import { ActiveChat } from '../components/ActiveChat';
import { SocketContext } from '../context/socket';

const useStyles = makeStyles((theme) => ({
  root: {
    height: '100vh',
  },
}));

const Home = ({ user, logout }) => {
  const history = useHistory();

  const socket = useContext(SocketContext);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);

  const classes = useStyles();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const addSearchedUsers = (users) => {
    const currentUsers = {};

    // make table of current users so we can lookup faster
    conversations.forEach((convo) => {
      currentUsers[convo.otherUser.id] = true;
    });

    const newState = [...conversations];
    users.forEach((user) => {
      // only create a fake convo if we don't already have a convo with this user
      if (!currentUsers[user.id]) {
        let fakeConvo = { otherUser: user, messages: [] };
        newState.push(fakeConvo);
      }
    });

    setConversations(newState);
  };

  const clearSearchedUsers = () => {
    setConversations((prev) => prev.filter((convo) => convo.id));
  };

  const saveMessage = async (body) => {
    const { data } = await axios.post('/api/messages', body);

    return data;
  };

  //sends message read status to backend for DB storage. By adding type we can update an entire conversation or individual messages as they are being sent.
  const updateReadMessagesDB = async (
    type,
    conversationId,
    messageId,
    userId,
    recipientId
  ) => {
    const body = { conversationId, messageId, userId, recipientId, type };
    const { data } = await axios.patch('/api/messages/read', body);
    return data;
  };

  const sendMessage = (data, body) => {
    socket.emit('new-message', {
      message: data.message,
      recipientId: body.recipientId,
      sender: data.sender,
    });
  };

  const postMessage = async (body) => {
    try {
      const data = await saveMessage(body);

      if (!body.conversationId) {
        addNewConvo(body.recipientId, data.message);
      } else {
        addMessageToConversation(data);
      }

      sendMessage(data, body);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewConvo = useCallback(
    (recipientId, message) => {
      setConversations((prev) => {
        const convoArrCopy = [...prev].map((convo) => {
          const convoCopy = { ...convo };
          if (convoCopy.otherUser.id === recipientId) {
            convoCopy.messages = [...convoCopy.messages, message];
            convoCopy.latestMessageText = message.text;
            convoCopy.id = message.conversationId;
            return convoCopy;
          } else {
            return { ...convo };
          }
        });
        return convoArrCopy;
      });
    },
    [setConversations]
  );

  const addMessageToConversation = useCallback(
    (data) => {
      // if sender isn't null, that means the message needs to be put in a brand new convo
      const { message, sender = null } = data;
      if (sender !== null) {
        const newConvo = {
          id: message.conversationId,
          otherUser: sender,
          messages: [message],
        };
        newConvo.latestMessageText = message.text;

        setConversations((prev) => [newConvo, ...prev]);
      } else {
        setConversations((prev) => {
          const convoArrCopy = [...prev].map((convo) => {
            const convoCopy = { ...convo };
            if (convo.id === message.conversationId) {
              convoCopy.messages = [...convoCopy.messages, message];
              convoCopy.latestMessageText = message.text;
              return convoCopy;
            } else {
              return convo;
            }
          });
          return convoArrCopy;
        });
      }
    },
    [setConversations]
  );

  const setActiveChat = (username) => {
    setActiveConversation(username);
  };

  //updates state with read status
  const markMessagesRead = useCallback(
    (data) => {
      const {
        type,
        conversation,
        userId,
        recipientId,
        messageId = undefined,
      } = data;

      const convoMessages = [...conversation.messages].map((message) => {
        // if batch update we change all the messages received to read, if individual only the matching message id
        const readCondition =
          type === 'batch'
            ? message.senderId !== userId
            : message.id === messageId;

        if (readCondition) {
          return { ...message, isRead: true };
        } else {
          return { ...message };
        }
      });

      setConversations((prev) => {
        const convoArrCopy = [...prev].map((convo) => {
          const convoCopy = { ...convo };
          if (conversation.otherUser.username === convo.otherUser.username) {
            convoCopy.messages = convoMessages;
            return convoCopy;
          } else {
            return { ...convo };
          }
        });
        return convoArrCopy;
      });

      updateReadMessagesDB(
        type,
        conversation.id,
        messageId,
        user.id,
        recipientId
      );
    },
    [setConversations, user.id]
  );

  //updates read status on sent messages based on socket.io events for realtime read indication.
  const sentReadUpdate = useCallback(
    (data) => {
      const { conversation, userId } = data;
      const convoMessages = conversation.messages.map((message) => {
        if (message.senderId === userId) {
          return { ...message, isRead: true };
        } else {
          return { ...message };
        }
      });

      setConversations((prev) => {
        const convoArrCopy = [...prev].map((convo) => {
          const convoCopy = { ...convo };
          if (conversation.id === convo.id) {
            convoCopy.messages = convoMessages;
            return convoCopy;
          } else {
            return { ...convo };
          }
        });

        return convoArrCopy;
      });
    },
    [setConversations]
  );

  const addOnlineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  const removeOfflineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = { ...convo };
          convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
          return convoCopy;
        } else {
          return convo;
        }
      })
    );
  }, []);

  // Lifecycle

  useEffect(() => {
    // Socket init
    socket.on('add-online-user', addOnlineUser);
    socket.on('remove-offline-user', removeOfflineUser);
    socket.on('new-message', addMessageToConversation);
    socket.on('update-message', sentReadUpdate);

    return () => {
      // before the component is destroyed
      // unbind all event handlers used in this component
      socket.off('add-online-user', addOnlineUser);
      socket.off('remove-offline-user', removeOfflineUser);
      socket.off('new-message', addMessageToConversation);
      socket.off('update-message', sentReadUpdate);
    };
  }, [
    addMessageToConversation,
    addOnlineUser,
    removeOfflineUser,
    sentReadUpdate,
    socket,
  ]);

  useEffect(() => {
    // when fetching, prevent redirect
    if (user?.isFetching) return;

    if (user && user.id) {
      setIsLoggedIn(true);
    } else {
      // If we were previously logged in, redirect to login instead of register
      if (isLoggedIn) history.push('/login');
      else history.push('/register');
    }
  }, [user, history, isLoggedIn]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('/api/conversations');
        setConversations(data);
      } catch (error) {
        console.error(error);
      }
    };
    if (!user.isFetching) {
      fetchConversations();
    }
  }, [user]);

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  return (
    <>
      <Button onClick={handleLogout}>Logout</Button>
      <Grid container component="main" className={classes.root}>
        <CssBaseline />
        <SidebarContainer
          conversations={conversations}
          user={user}
          clearSearchedUsers={clearSearchedUsers}
          addSearchedUsers={addSearchedUsers}
          setActiveChat={setActiveChat}
          markMessagesRead={markMessagesRead}
        />
        <ActiveChat
          activeConversation={activeConversation}
          conversations={conversations}
          user={user}
          postMessage={postMessage}
          markMessagesRead={markMessagesRead}
        />
      </Grid>
    </>
  );
};

export default Home;
