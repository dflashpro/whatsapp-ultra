import { BACKEND_URL } from '../config';
import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wa_current_user')); } catch { return null; }
  });
  const [theme, setTheme] = useState(() => localStorage.getItem('wa_theme_style') || 'emerald');
  const [wallpaper, setWallpaper] = useState(() => localStorage.getItem('wa_wallpaper') || 'doodle');
  const [activeChat, setActiveChat] = useState(null);
  const [pinnedChats, setPinnedChats] = useState(['user_ai_assistant']);
  const [archivedChats, setArchivedChats] = useState([]);
  const [mutedChats, setMutedChats] = useState([]);
  const [lockedChats, setLockedChats] = useState([]);
  const [unlockedSessionChats, setUnlockedSessionChats] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [starredMessages, setStarredMessages] = useState([]);
  const [disappearingSettings, setDisappearingSettings] = useState({});
  const [chatLabels, setChatLabelsState] = useState({});
  const [perChatWallpapers, setPerChatWallpapers] = useState({});
  const [onlineStatus, setOnlineStatusState] = useState('online');

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showContactInfoDrawer, setShowContactInfoDrawer] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [pendingLockChat, setPendingLockChat] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users`);
      const data = await res.json();
      setUsers(data);
    } catch (e) {}
  };

  useEffect(() => { fetchUsers(); }, []);

  const logout = () => {
    localStorage.removeItem('wa_current_user');
    setCurrentUser(null);
    setActiveChat(null);
    showToast('Logged out successfully 🚪');
  };

  const switchUser = (userId) => {
    const found = users.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('wa_current_user', JSON.stringify(found));
      setActiveChat(null);
      showToast(`Switched to ${found.name}`);
    }
  };

  const changeTheme = (t) => { setTheme(t); localStorage.setItem('wa_theme_style', t); };
  const changeWallpaper = (w) => { setWallpaper(w); localStorage.setItem('wa_wallpaper', w); };

  const setOnlineStatus = (status) => {
    setOnlineStatusState(status);
    setUsers(prev => prev.map(u => u.id === currentUser?.id ? { ...u, online: status === 'online' } : u));
  };

  const setChatLabel = (chatId, label) => {
    setChatLabelsState(prev => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []).filter(l => l.id !== label.id), label]
    }));
  };

  const removeChatLabel = (chatId, labelId) => {
    setChatLabelsState(prev => ({
      ...prev,
      [chatId]: (prev[chatId] || []).filter(l => l.id !== labelId)
    }));
  };

  const setChatWallpaper = (chatId, wallpaperName) => {
    setPerChatWallpapers(prev => ({ ...prev, [chatId]: wallpaperName }));
    showToast('Chat wallpaper updated 🎨');
  };

  const togglePinChat = (chatId) => {
    setPinnedChats(prev => {
      const has = prev.includes(chatId);
      showToast(has ? 'Chat unpinned' : 'Chat pinned to top 📌');
      return has ? prev.filter(id => id !== chatId) : [...prev, chatId];
    });
  };

  const archiveChat = (chatId) => {
    setArchivedChats(prev => {
      const has = prev.includes(chatId);
      showToast(has ? 'Chat unarchived' : 'Chat archived 📦');
      if (!has && activeChat?.id === chatId) setActiveChat(null);
      return has ? prev.filter(id => id !== chatId) : [...prev, chatId];
    });
  };

  const muteChat = (chatId, duration) => {
    setMutedChats(prev => [...prev.filter(id => id !== chatId), chatId]);
    if (duration !== -1) {
      setTimeout(() => setMutedChats(prev => prev.filter(id => id !== chatId)), duration);
    }
  };

  const unmuteChat = (chatId) => setMutedChats(prev => prev.filter(id => id !== chatId));

  const setDisappearingTimer = (chatId, value) => {
    setDisappearingSettings(prev => ({ ...prev, [chatId]: value }));
  };

  const toggleStarMessage = (msgId) => {
    setStarredMessages(prev => {
      const has = prev.includes(msgId);
      showToast(has ? 'Message unstarred' : 'Message starred ⭐');
      return has ? prev.filter(id => id !== msgId) : [...prev, msgId];
    });
  };

  const openChat = (chat) => {
    if (lockedChats.includes(chat.id) && !unlockedSessionChats.includes(chat.id)) {
      setPendingLockChat(chat);
      setShowLockModal(true);
    } else {
      setActiveChat(chat);
    }
  };

  const unlockChatWithPin = (chatId) => {
    setUnlockedSessionChats(prev => [...prev, chatId]);
    setShowLockModal(false);
    if (pendingLockChat) { setActiveChat(pendingLockChat); setPendingLockChat(null); }
    showToast('Chat unlocked 🔓');
  };

  const toggleLockChat = (chatId) => {
    setLockedChats(prev => {
      const has = prev.includes(chatId);
      showToast(has ? 'Chat lock disabled' : 'Chat locked with PIN 🔒');
      return has ? prev.filter(id => id !== chatId) : [...prev, chatId];
    });
  };

  const createGroup = async (groupData) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/groups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      });
      const newGroup = await res.json();
      setUsers(prev => [newGroup, ...prev]);
      setActiveChat(newGroup);
      showToast(`Group "${newGroup.name}" created! 👥✨`);
    } catch (e) { showToast('Failed to create group'); }
  };

  const blockUser = async (targetId) => {
    try {
      await fetch(`${BACKEND_URL}/api/users/block`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, targetId, action: 'block' })
      });
      setBlockedUsers(prev => [...prev, targetId]);
      showToast('Contact blocked 🚫');
    } catch (e) {}
  };

  const unblockUser = async (targetId) => {
    try {
      await fetch(`${BACKEND_URL}/api/users/block`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, targetId, action: 'unblock' })
      });
      setBlockedUsers(prev => prev.filter(id => id !== targetId));
      showToast('Contact unblocked ✅');
    } catch (e) {}
  };

  const updatePrivacy = async (privacyUpdates) => {
    try {
      await fetch(`${BACKEND_URL}/api/users/privacy`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, privacy: privacyUpdates })
      });
    } catch (e) {}
  };

  const updateProfile = async (updated) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/update`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentUser.id, ...updated })
      });
      const data = await res.json();
      setCurrentUser(data);
      localStorage.setItem('wa_current_user', JSON.stringify(data));
      setUsers(prev => prev.map(u => u.id === data.id ? data : u));
      showToast('Profile updated');
    } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{
      users, setUsers, currentUser, setCurrentUser, switchUser, logout,
      theme, changeTheme, wallpaper, changeWallpaper,
      activeChat, setActiveChat, openChat,
      onlineStatus, setOnlineStatus,
      pinnedChats, togglePinChat,
      archivedChats, archiveChat,
      mutedChats, muteChat, unmuteChat,
      lockedChats, toggleLockChat, unlockChatWithPin,
      showLockModal, setShowLockModal, pendingLockChat,
      blockedUsers, blockUser, unblockUser, updatePrivacy,
      starredMessages, toggleStarMessage,
      disappearingSettings, setDisappearingTimer,
      chatLabels, setChatLabel, removeChatLabel,
      perChatWallpapers, setChatWallpaper,
      createGroup, updateProfile,
      showProfileModal, setShowProfileModal,
      showStatusModal, setShowStatusModal,
      showThemeModal, setShowThemeModal,
      showSettingsModal, setShowSettingsModal,
      showCreateGroupModal, setShowCreateGroupModal,
      showContactInfoDrawer, setShowContactInfoDrawer,
      toastMessage, showToast,
      refreshUsers: fetchUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
