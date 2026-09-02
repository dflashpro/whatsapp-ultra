import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL, BACKEND_URL } from '../config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { currentUser, activeChat, showToast, setUsers } = useAuth();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const typingTimerRef = useRef(null);

  // Initialize Socket connection
  useEffect(() => {
    const sUrl = SOCKET_URL || (typeof window !== 'undefined' ? window.location.origin : '/');
    const newSocket = io(sUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 50,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  // Join user room on connect or user change
  useEffect(() => {
    if (!socket || !currentUser) return;
    socket.emit('user-join', currentUser.id);

    const onConnect = () => {
      socket.emit('user-join', currentUser.id);
    };

    socket.on('connect', onConnect);
    return () => socket.off('connect', onConnect);
  }, [socket, currentUser]);

  // Real-time user registration & online status sync
  useEffect(() => {
    if (!socket) return;

    socket.on('user-registered', (newUser) => {
      setUsers(prev => {
        const exists = prev.find(u => u.id === newUser.id || (u.phone && newUser.phone && u.phone.replace(/\s+/g, '') === newUser.phone.replace(/\s+/g, '')));
        if (exists) {
          return prev.map(u => (u.id === exists.id ? { ...u, ...newUser } : u));
        }
        return [newUser, ...prev];
      });
    });

    socket.on('user-status-change', ({ userId, online, lastSeen }) => {
      setUsers(prev => prev.map(u => (u.id === userId ? { ...u, online, lastSeen } : u)));
    });

    return () => {
      socket.off('user-registered');
      socket.off('user-status-change');
    };
  }, [socket, setUsers]);

  // Fetch conversation messages on activeChat change
  useEffect(() => {
    if (!activeChat || !currentUser) return;
    const isGroup = Boolean(activeChat.isGroup);
    const chatId = isGroup ? activeChat.id : [currentUser.id, activeChat.id].sort().join('-');

    const fetchMessages = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/messages/${chatId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const newMsgs = data.filter(m => !existingIds.has(m.id));
            return [...prev, ...newMsgs];
          });
        }
      } catch (e) {}
    };

    fetchMessages();
  }, [activeChat, currentUser]);

  // Global socket message listener with instant deduplication
  useEffect(() => {
    if (!socket) return;

    socket.on('receive-message', (msg) => {
      setMessages(prev => {
        const idx = prev.findIndex(m => m.id === msg.id);
        if (idx !== -1) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...msg };
          return updated;
        }
        return [...prev, msg];
      });
    });

    socket.on('message-deleted', ({ messageId, deletedFor }) => {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId) {
          if (deletedFor === 'everyone') return { ...m, text: '', deleted: true, type: 'deleted' };
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
      setTypingUsers(prev => ({ ...prev, [chatId]: senderId, [senderId]: senderId }));
    });

    socket.on('user-stop-typing', ({ senderId, chatId }) => {
      setTypingUsers(prev => {
        const next = { ...prev };
        delete next[chatId];
        delete next[senderId];
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

  // Send message with instant optimistic rendering
  const sendMessage = useCallback((msgData) => {
    if (!currentUser || !activeChat) return;

    const isGroup = Boolean(activeChat.isGroup);
    const chatId = isGroup ? activeChat.id : [currentUser.id, activeChat.id].sort().join('-');

    const tempMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      senderId: currentUser.id,
      receiverId: activeChat.id,
      text: msgData.text || '',
      type: msgData.type || 'text',
      mediaUrl: msgData.mediaUrl || null,
      fileName: msgData.fileName || null,
      fileSize: msgData.fileSize || null,
      audioDuration: msgData.audioDuration || null,
      pollData: msgData.pollData || null,
      locationData: msgData.locationData || null,
      replyTo: msgData.replyTo || null,
      forwarded: msgData.forwarded || false,
      reactions: [],
      timestamp: Date.now(),
      status: 'sent'
    };

    // 1. Optimistically append message immediately on UI
    setMessages(prev => [...prev, tempMsg]);

    // 2. Emit to socket server
    if (socket) {
      socket.emit('send-message', tempMsg);
    }
  }, [socket, currentUser, activeChat]);

  const deleteMessage = useCallback((messageId, deleteFor = 'me') => {
    if (!currentUser) return;
    if (socket) socket.emit('delete-message', { messageId, userId: currentUser.id, deleteFor });
    if (deleteFor === 'me') {
      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, deletedForMe: true } : m
      ));
    }
  }, [socket, currentUser]);

  const editMessage = useCallback((messageId, newText) => {
    if (!currentUser) return;
    if (socket) socket.emit('edit-message', { messageId, newText, userId: currentUser.id });
    setMessages(prev => prev.map(m =>
      m.id === messageId ? { ...m, text: newText, edited: true, editedAt: Date.now() } : m
    ));
  }, [socket, currentUser]);

  const reactToMessage = useCallback((messageId, reaction) => {
    if (!currentUser || !activeChat) return;
    const chatId = activeChat.isGroup ? activeChat.id : [currentUser.id, activeChat.id].sort().join('-');
    if (socket) socket.emit('react-message', { messageId, reaction, userId: currentUser.id, chatId });
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
