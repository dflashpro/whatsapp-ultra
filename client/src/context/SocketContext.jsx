import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { currentUser, activeChat, showToast } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimerRef = useRef(null);

  useEffect(() => {
    const newSocket = io('/', { transports: ['websocket', 'polling'] });
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.emit('user-join', currentUser.id);
  }, [socket, currentUser]);

  useEffect(() => {
    if (!socket) return;

    const fetchMessages = async () => {
      if (!activeChat) return;
      const isGroup = activeChat.isGroup;
      const chatId = isGroup ? activeChat.id : [currentUser?.id, activeChat?.id].sort().join('-');
      try {
        const res = await fetch(`/api/messages/${chatId}`);
        const data = await res.json();
        setMessages(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const newMsgs = data.filter(m => !existingIds.has(m.id));
          return [...prev, ...newMsgs];
        });
      } catch (e) {}
    };

    fetchMessages();
  }, [activeChat, socket]);

  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (msg) => {
      setMessages(prev => {
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('message-deleted', ({ messageId, deletedFor }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          if (deletedFor === 'everyone') {
            return { ...m, text: '', deleted: true, type: 'deleted' };
          }
          return { ...m, deletedForMe: true };
        }
        return m;
      }));
    });

    socket.on('message-edited', ({ messageId, newText, editedAt }) => {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, text: newText, edited: true, editedAt } : m
      ));
    });

    socket.on('message-reaction-update', ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, reactions } : m
      ));
    });

    socket.on('poll-updated', ({ messageId, pollData }) => {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, pollData } : m
      ));
    });

    socket.on('messages-read-update', ({ chatId, readerId }) => {
      setMessages(prev => prev.map(m => {
        const mChatId = m.chatId || [m.senderId, m.receiverId].sort().join('-');
        if (mChatId === chatId && m.receiverId === readerId) {
          return { ...m, status: 'read' };
        }
        return m;
      }));
    });

    socket.on('user-typing', ({ senderId, chatId }) => {
      setTypingUsers(prev => ({ ...prev, [chatId]: senderId }));
    });

    socket.on('user-stop-typing', ({ senderId, chatId }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        if (next[chatId] === senderId) delete next[chatId];
        return next;
      });
    });

    socket.on('group-created', ({ group, message }) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      socket.off('receive-message');
      socket.off('message-deleted');
      socket.off('message-edited');
      socket.off('message-reaction-update');
      socket.off('poll-updated');
      socket.off('messages-read-update');
      socket.off('user-typing');
      socket.off('user-stop-typing');
      socket.off('group-created');
    };
  }, [socket]);

  const sendMessage = useCallback((msgData) => {
    if (!socket || !currentUser || !activeChat) return;
    socket.emit('send-message', {
      ...msgData,
      senderId: currentUser.id,
      receiverId: activeChat.id
    });
  }, [socket, currentUser, activeChat]);

  const deleteMessage = useCallback((messageId, deleteFor = 'me') => {
    if (!socket || !currentUser) return;
    socket.emit('delete-message', { messageId, userId: currentUser.id, deleteFor });
    if (deleteFor === 'me') {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, deletedForMe: true } : m
      ));
    }
  }, [socket, currentUser]);

  const editMessage = useCallback((messageId, newText) => {
    if (!socket || !currentUser) return;
    socket.emit('edit-message', { messageId, newText, userId: currentUser.id });
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, text: newText, edited: true, editedAt: Date.now() } : m
    ));
  }, [socket, currentUser]);

  const reactToMessage = useCallback((messageId, reaction) => {
    if (!socket || !currentUser || !activeChat) return;
    const chatId = activeChat.isGroup ? activeChat.id : [currentUser.id, activeChat.id].sort().join('-');
    socket.emit('react-message', { messageId, reaction, userId: currentUser.id, chatId });
  }, [socket, currentUser, activeChat]);

  const sendTyping = useCallback(() => {
    if (!socket || !currentUser || !activeChat) return;
    socket.emit('typing', { senderId: currentUser.id, receiverId: activeChat.id });
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      socket.emit('stop-typing', { senderId: currentUser.id, receiverId: activeChat.id });
    }, 1500);
  }, [socket, currentUser, activeChat]);

  const markAsRead = useCallback(() => {
    if (!socket || !currentUser || !activeChat) return;
    const chatId = activeChat.isGroup ? activeChat.id : [currentUser.id, activeChat.id].sort().join('-');
    socket.emit('mark-messages-read', { chatId, readerId: currentUser.id, senderId: activeChat.id });
  }, [socket, currentUser, activeChat]);

  return (
    <SocketContext.Provider value={{
      socket,
      messages,
      setMessages,
      typingUsers,
      sendMessage,
      deleteMessage,
      editMessage,
      reactToMessage,
      sendTyping,
      markAsRead
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
