import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CallProvider } from './context/CallContext';

import { PhoneAuthScreen } from './components/Auth/PhoneAuthScreen';
import { SidebarHeader } from './components/Sidebar/SidebarHeader';
import { SearchAndFilter } from './components/Sidebar/SearchAndFilter';
import { ChatList } from './components/Sidebar/ChatList';
import { NewChatContactModal } from './components/Sidebar/NewChatContactModal';
import { CallsTab } from './components/Calls/CallsTab';
import { ChannelsTab } from './components/Channels/ChannelsTab';
import { CommunitiesTab } from './components/Communities/CommunitiesTab';

import { EmptyChatState } from './components/Chat/EmptyChatState';
import { ChatHeader } from './components/Chat/ChatHeader';
import { ChatSearchPanel } from './components/Chat/ChatSearchPanel';
import { GlobalSearch } from './components/Chat/GlobalSearch';
import { MessageArea } from './components/Chat/MessageArea';
import { MessageInput } from './components/Chat/MessageInput';
import { ContactInfoDrawer } from './components/Chat/ContactInfoDrawer';
import { StarredMessagesDrawer } from './components/Chat/StarredMessagesDrawer';

import { VideoCallModal } from './components/Calls/VideoCallModal';
import { MiniCallPlayer } from './components/Calls/MiniCallPlayer';
import { IncomingCallNotification } from './components/Calls/IncomingCallNotification';

import { StatusListModal } from './components/Status/StatusListModal';
import { ProfileModal } from './components/Profile/ProfileModal';
import { ThemeCustomizerModal } from './components/Theme/ThemeCustomizerModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { CreateGroupModal } from './components/Groups/CreateGroupModal';
import { LinkedDevicesModal } from './components/Settings/LinkedDevicesModal';
import { ContactQRModal } from './components/Profile/ContactQRModal';
import { ChatLockModal } from './components/Chat/ChatLockModal';
import { Toast } from './components/Common/Toast';

function MainLayout() {
  const { currentUser, setCurrentUser, activeChat, theme, showContactInfoDrawer, setShowContactInfoDrawer } = useAuth();
  const [sidebarSection, setSidebarSection] = useState('chats');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [showStarredDrawer, setShowStarredDrawer] = useState(false);
  const [showLinkedDevicesModal, setShowLinkedDevicesModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // Chat state
  const [replyMessage, setReplyMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [highlightedMsgId, setHighlightedMsgId] = useState(null);

  if (!currentUser) {
    return <PhoneAuthScreen onAuthSuccess={(user) => setCurrentUser(user)} />;
  }

  const handleReply = (msg) => {
    setReplyMessage(msg);
    setEditingMessage(null);
  };

  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setReplyMessage(null);
  };

  const handleScrollToMessage = (msgId) => {
    setHighlightedMsgId(msgId);
    setTimeout(() => setHighlightedMsgId(null), 2500);
  };

  return (
    <div className={`flex h-screen w-screen overflow-hidden ${theme === 'light' ? 'bg-[#f0f2f5] text-[#111b21]' : 'bg-[#0c1317] text-[#e9edef]'}`}>
      {/* Sidebar */}
      <div className={`w-full md:w-[410px] lg:w-[450px] h-full flex flex-col border-r border-white/5 shrink-0 z-10 ${activeChat ? 'hidden md:flex' : 'flex'}`}>
        <SidebarHeader
          onOpenLinkedDevices={() => setShowLinkedDevicesModal(true)}
          onOpenQR={() => setShowQRModal(true)}
          onOpenNewChat={() => setShowNewChatModal(true)}
          onOpenGlobalSearch={() => setShowGlobalSearch(true)}
        />
        <SearchAndFilter
          searchQuery={searchQuery} setSearchQuery={setSearchQuery}
          filterTab={filterTab} setFilterTab={setFilterTab}
          sidebarSection={sidebarSection} setSidebarSection={setSidebarSection}
        />
        {sidebarSection === 'chats' && <ChatList searchQuery={searchQuery} filterTab={filterTab} />}
        {sidebarSection === 'calls' && <CallsTab />}
        {sidebarSection === 'channels' && <ChannelsTab />}
        {sidebarSection === 'communities' && <CommunitiesTab />}
      </div>

      {/* Chat Area */}
      <div className={`flex-1 h-full flex z-10 ${!activeChat ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex-1 h-full flex flex-col min-w-0">
          {activeChat ? (
            <>
              <ChatHeader
                onOpenStarred={() => setShowStarredDrawer(true)}
                onOpenSearch={() => setShowChatSearch(true)}
              />
              {showChatSearch && (
                <ChatSearchPanel
                  onClose={() => setShowChatSearch(false)}
                  onScrollToMessage={handleScrollToMessage}
                />
              )}
              <MessageArea
                onReply={handleReply}
                replyMessage={replyMessage}
                setReplyMessage={setReplyMessage}
                showSearch={showChatSearch}
                highlightedMsgId={highlightedMsgId}
              />
              <MessageInput
                replyMessage={replyMessage}
                onClearReply={() => setReplyMessage(null)}
                editingMessage={editingMessage}
                onClearEdit={() => setEditingMessage(null)}
              />
            </>
          ) : (
            <EmptyChatState />
          )}
        </div>

        {activeChat && showContactInfoDrawer && <ContactInfoDrawer onClose={() => setShowContactInfoDrawer(false)} />}
        {showStarredDrawer && <StarredMessagesDrawer onClose={() => setShowStarredDrawer(false)} />}
      </div>

      {/* All Modals */}
      {showNewChatModal && <NewChatContactModal onClose={() => setShowNewChatModal(false)} />}
      {showGlobalSearch && <GlobalSearch onClose={() => setShowGlobalSearch(false)} />}
      <VideoCallModal />
      <MiniCallPlayer />
      <IncomingCallNotification />
      <StatusListModal />
      <ProfileModal />
      <ThemeCustomizerModal />
      <SettingsModal />
      <CreateGroupModal />
      {showLinkedDevicesModal && <LinkedDevicesModal onClose={() => setShowLinkedDevicesModal(false)} />}
      {showQRModal && <ContactQRModal onClose={() => setShowQRModal(false)} />}
      <ChatLockModal />
      <Toast />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CallProvider>
          <MainLayout />
        </CallProvider>
      </SocketProvider>
    </AuthProvider>
  );
}
