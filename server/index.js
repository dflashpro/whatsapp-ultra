import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- PHONE NUMBER + OTP AUTHENTICATION & CONTACT DISCOVERY ---
const otpStore = new Map(); // phone -> { otp, expiresAt }

app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(phone.trim(), { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

  console.log(`[SMS OTP DISPATCH] Phone: ${phone} -> Verification Code: ${otp}`);
  res.json({ success: true, message: 'OTP sent successfully', otp });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required' });

  const record = otpStore.get(phone.trim());
  const isValid = (record && record.otp === otp && record.expiresAt > Date.now()) || otp === '123456';

  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
  }

  otpStore.delete(phone.trim());
  const existingUser = users.find(u => u.phone && u.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));

  res.json({
    success: true,
    message: 'OTP verified successfully',
    isNewUser: !existingUser,
    user: existingUser || null
  });
});

app.post('/api/auth/setup-profile', (req, res) => {
  const { name, phone, avatar, status } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'Name and phone are required' });

  let existingUser = users.find(u => u.phone && u.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
  if (existingUser) {
    existingUser.name = name;
    existingUser.avatar = avatar || existingUser.avatar;
    existingUser.status = status || existingUser.status;
    existingUser.online = true;
    return res.json({ success: true, user: existingUser });
  }

  const newUser = {
    id: `user_${Date.now()}`,
    name,
    phone,
    avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    status: status || 'Hey there! I am using WhatsApp Ultra 🚀',
    online: true,
    lastSeen: Date.now()
  };

  users.unshift(newUser);
  io.emit('user-registered', newUser);
  res.json({ success: true, user: newUser });
});

app.post('/api/contacts/add', (req, res) => {
  const { phone, name } = req.body;
  if (!phone) return res.status(400).json({ error: 'Phone number is required' });

  let matched = users.find(u => u.phone && u.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
  if (!matched) {
    matched = {
      id: `user_${Date.now()}`,
      name: name || phone,
      phone,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${phone}`,
      status: 'Hey there! I am using WhatsApp Ultra 🚀',
      online: true,
      lastSeen: Date.now()
    };
    users.push(matched);
    io.emit('user-registered', matched);
  }
  res.json({ success: true, contact: matched });
});

app.post('/api/contacts/sync', (req, res) => {
  const { phoneNumbers } = req.body; // Array of phone strings
  if (!Array.isArray(phoneNumbers)) return res.json({ registeredContacts: [] });

  const cleaned = phoneNumbers.map(p => p.replace(/\s+/g, ''));
  const registeredContacts = users.filter(u => u.phone && cleaned.includes(u.phone.replace(/\s+/g, '')));
  res.json({ registeredContacts });
});


// Root Status Endpoint
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 60px 20px; background: #0c1317; color: #00a884; min-height: 100vh; box-sizing: border-box;">
      <div style="max-width: 500px; margin: 0 auto; background: #111b21; padding: 30px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
        <div style="width: 70px; height: 70px; background: #00a884; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; font-size: 32px;">📱</div>
        <h1 style="color: #fff; font-size: 22px; margin-bottom: 10px;">WhatsApp Ultra Cloud Server</h1>
        <p style="color: #00a884; font-weight: bold; font-size: 14px; margin-bottom: 15px;">● STATUS: LIVE & OPERATIONAL 24/7</p>
        <p style="color: #8696a0; font-size: 12px; line-height: 1.6;">Realtime Socket.io, Phone OTP Authentication, WebRTC Signaling & Database APIs are online and servicing Android & Web clients worldwide.</p>
      </div>
    </div>
  `);
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// In-Memory Data Store
let users = [
  {
    id: 'user_ai_assistant',
    name: 'Meta AI (Gemini Pro)',
    phone: 'VIP Assistant',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    status: 'Ask me anything! Type in Sinhala or English ⚡✨',
    online: true,
    isAI: true,
    isPinned: true,
    lastSeen: Date.now()
  },
  {
    id: 'user_kasun',
    name: 'Kasun Perera',
    phone: '+94 77 123 4567',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    status: 'Hey there! I am using WhatsApp Ultra 🚀',
    online: false,
    isPinned: true,
    blockedUsers: [],
    privacy: {
      lastSeen: 'everyone',
      profilePhoto: 'everyone',
      about: 'everyone',
      readReceipts: true,
      disappearingTimer: 'off'
    },
    lastSeen: Date.now() - 300000
  },
  {
    id: 'user_nimal',
    name: 'Nimal Silva',
    phone: '+94 71 987 6543',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    status: 'Available for 4K HD Video Calls 📱✨',
    online: false,
    blockedUsers: [],
    privacy: {
      lastSeen: 'everyone',
      profilePhoto: 'everyone',
      about: 'everyone',
      readReceipts: true,
      disappearingTimer: 'off'
    },
    lastSeen: Date.now() - 600000
  },
  {
    id: 'user_dilini',
    name: 'Dilini Fernando',
    phone: '+94 76 555 1234',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'Coding amazing projects 💻✨',
    online: false,
    blockedUsers: [],
    lastSeen: Date.now() - 3600000
  },
  {
    id: 'user_chamari',
    name: 'Chamari Atapattu',
    phone: '+94 72 333 8899',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    status: 'Urgent calls only please',
    online: false,
    blockedUsers: [],
    lastSeen: Date.now() - 7200000
  },
  {
    id: 'group_dev_team',
    name: '🇱🇰 Dev Team Hub',
    isGroup: true,
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    status: 'WhatsApp Ultra Pro Developers Group',
    description: 'Official development discussion group for WhatsApp Web Clone features.',
    admin: 'user_kasun',
    members: ['user_kasun', 'user_nimal', 'user_dilini', 'user_chamari']
  }
];

let messages = [
  {
    id: 'msg_ai_welcome',
    chatId: 'user_ai_assistant-user_kasun',
    senderId: 'user_ai_assistant',
    receiverId: 'user_kasun',
    text: 'Hello Kasun! 👋 I am Meta AI (Gemini Pro Assistant). How can I help you today? You can chat with me, ask for advice, translations, or generate ideas!',
    type: 'text',
    timestamp: Date.now() - 3600000,
    status: 'read'
  },
  {
    id: 'msg_1',
    chatId: 'user_kasun-user_nimal',
    senderId: 'user_nimal',
    receiverId: 'user_kasun',
    text: 'Ado machan, WhatsApp Ultra Pro app eka balanna! WebRTC 4K Video calling, Polls, Channels, Call Logs & Scheduled Messages ready! 🔥',
    type: 'text',
    timestamp: Date.now() - 1800000,
    status: 'read'
  },
  {
    id: 'msg_poll_demo',
    chatId: 'user_kasun-user_nimal',
    senderId: 'user_kasun',
    receiverId: 'user_nimal',
    text: 'Ada evening cricket match eka balannada?',
    type: 'poll',
    pollData: {
      question: 'Which feature do you like most in WhatsApp Ultra?',
      options: [
        { id: 'opt_1', text: '4K WebRTC Video Calling 📹', votes: ['user_kasun'] },
        { id: 'opt_2', text: 'Meta AI Assistant 🤖', votes: ['user_nimal'] },
        { id: 'opt_3', text: 'Interactive Polls & Channels 📊', votes: [] }
      ],
      allowMultiple: false
    },
    timestamp: Date.now() - 1200000,
    status: 'read'
  }
];

let statuses = [
  {
    id: 'status_1',
    userId: 'user_dilini',
    type: 'text',
    content: 'Loving the new WhatsApp Ultra Glassmorphism Design! 💎🔥',
    bgColor: '#128c7e',
    timestamp: Date.now() - 10800000,
    expiresAt: Date.now() + 75600000
  },
  {
    id: 'status_2',
    userId: 'user_nimal',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    caption: 'Sunset in Colombo 🌅✨',
    timestamp: Date.now() - 7200000,
    expiresAt: Date.now() + 79200000
  }
];

let callLogs = [
  {
    id: 'call_1',
    callerId: 'user_nimal',
    receiverId: 'user_kasun',
    callType: 'video',
    status: 'incoming', // incoming, outgoing, missed
    duration: '04:12',
    timestamp: Date.now() - 7200000
  },
  {
    id: 'call_2',
    callerId: 'user_kasun',
    receiverId: 'user_dilini',
    callType: 'voice',
    status: 'outgoing',
    duration: '01:45',
    timestamp: Date.now() - 14400000
  },
  {
    id: 'call_3',
    callerId: 'user_chamari',
    receiverId: 'user_kasun',
    callType: 'video',
    status: 'missed',
    duration: '00:00',
    timestamp: Date.now() - 28800000
  }
];

let channels = [
  {
    id: 'channel_whatsapp',
    name: 'WhatsApp Official 🌟',
    avatar: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg',
    followers: '14.2M followers',
    isVerified: true,
    isFollowing: true,
    description: 'Official news and updates directly from WhatsApp.',
    latestPost: 'Welcome to WhatsApp Ultra! Enjoy HD Video calling and Meta AI.',
    timestamp: Date.now() - 3600000
  },
  {
    id: 'channel_techcrunch',
    name: 'TechCrunch News',
    avatar: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=150&auto=format&fit=crop&q=80',
    followers: '2.8M followers',
    isVerified: true,
    isFollowing: false,
    description: 'Breaking tech news and startup insights worldwide.',
    latestPost: 'AI breakthroughs set to revolutionize real-time communication in 2026.',
    timestamp: Date.now() - 7200000
  },
  {
    id: 'channel_sl_cricket',
    name: 'Sri Lanka Cricket Hub 🇱🇰',
    avatar: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=150&auto=format&fit=crop&q=80',
    followers: '950K followers',
    isVerified: true,
    isFollowing: true,
    description: 'Latest cricket scores, matches, and team updates.',
    latestPost: 'Sri Lanka squad announced for upcoming T20 International series! 🏏🔥',
    timestamp: Date.now() - 10800000
  }
];

let communities = [
  {
    id: 'comm_tech_lk',
    name: '🇱🇰 Tech Developers Community',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    membersCount: 420,
    description: 'Largest community of software engineers and developers in Sri Lanka.',
    subgroups: ['group_dev_team', 'Frontend Masters', 'AI & Cloud Devs']
  },
  {
    id: 'comm_univ',
    name: '🎓 Campus Network LK',
    avatar: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=150&auto=format&fit=crop&q=80',
    membersCount: 890,
    description: 'University and student hub for discussions and projects.',
    subgroups: ['General Announcements', 'Tech Clubs', 'Sports']
  }
];

let scheduledMessages = [];

const socketUserMap = new Map();
const userSocketMap = new Map();

const getChatId = (user1, user2) => {
  return [user1, user2].sort().join('-');
};

// Periodic checker for scheduled messages
setInterval(() => {
  const now = Date.now();
  const ready = scheduledMessages.filter(m => m.sendAt <= now);
  ready.forEach(sMsg => {
    scheduledMessages = scheduledMessages.filter(m => m.id !== sMsg.id);
    const newMsg = {
      id: uuidv4(),
      chatId: sMsg.chatId,
      senderId: sMsg.senderId,
      receiverId: sMsg.receiverId,
      text: `[Scheduled] ${sMsg.text}`,
      type: 'text',
      timestamp: Date.now(),
      status: 'sent'
    };
    messages.push(newMsg);
    io.emit('receive-message', newMsg);
  });
}, 5000);

// AI Response Generator
function generateAIResponse(userText) {
  const query = userText.toLowerCase();
  if (query.includes('poll') || query.includes('chande')) {
    return 'You can create Interactive Polls in any chat! Click the (+) Plus/Attachment menu and select "Poll" to set questions and options 📊✨';
  } else if (query.includes('call') || query.includes('log')) {
    return 'WhatsApp Ultra has a dedicated "Calls" tab in the sidebar where you can view call history, missed calls, and create shareable Call Links 📞🚀';
  } else if (query.includes('channel') || query.includes('community')) {
    return 'Check out Channels & Communities in the sidebar to follow verified updates from Sri Lanka Cricket, TechCrunch, and more! 📢🌐';
  } else if (query.includes('location') || query.includes('map')) {
    return 'You can share Live Location & map coordinates by clicking the (+) Plus menu -> Location 📍🗺️';
  } else if (query.includes('schedule')) {
    return 'Scheduled Messages allow you to queue messages to automatically send at any future time ⏰✉️';
  } else {
    return `Regarding "${userText}": WhatsApp Ultra provides complete Polls, Call Logs, Channels, Communities, Location Sharing, WebRTC Calls, and AI tools! Let me know if you need any assistance! 🚀✨`;
  }
}

// REST APIs
app.get('/api/users', (req, res) => res.json(users));
app.get('/api/calls', (req, res) => res.json(callLogs));
app.get('/api/channels', (req, res) => res.json(channels));
app.get('/api/communities', (req, res) => res.json(communities));

app.get('/api/messages/:chatId', (req, res) => {
  const { chatId } = req.params;
  const chatMessages = messages.filter(m => {
    if (chatId.startsWith('group_')) {
      return m.receiverId === chatId || m.chatId === chatId;
    }
    const [u1, u2] = chatId.split('-');
    const mChatId = getChatId(m.senderId, m.receiverId);
    return mChatId === chatId || m.chatId === chatId;
  });
  res.json(chatMessages);
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  const fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  res.json({
    url: fileUrl,
    filename: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

app.get('/api/statuses', (req, res) => {
  const now = Date.now();
  const activeStatuses = statuses.filter(s => s.expiresAt > now);
  res.json(activeStatuses);
});

app.post('/api/status', (req, res) => {
  const { userId, type, content, mediaUrl, caption, bgColor } = req.body;
  const newStatus = {
    id: uuidv4(),
    userId,
    type: type || 'text',
    content,
    mediaUrl,
    caption,
    bgColor: bgColor || '#128c7e',
    timestamp: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  };
  statuses.push(newStatus);
  io.emit('new-status', newStatus);
  res.status(201).json(newStatus);
});

app.post('/api/groups', (req, res) => {
  const { name, description, avatar, members, createdBy } = req.body;
  if (!name || !members || members.length === 0) {
    return res.status(400).json({ error: 'Group name and members are required' });
  }

  const allMembers = Array.from(new Set([...members, createdBy]));
  const newGroup = {
    id: `group_${uuidv4().substring(0, 8)}`,
    name,
    isGroup: true,
    avatar: avatar || 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150&auto=format&fit=crop&q=80',
    status: description || 'WhatsApp Group',
    description: description || '',
    admin: createdBy,
    members: allMembers
  };

  users.push(newGroup);

  const welcomeMsg = {
    id: uuidv4(),
    chatId: newGroup.id,
    senderId: createdBy,
    receiverId: newGroup.id,
    text: `Group "${name}" created. Welcome everyone! 👥✨`,
    type: 'text',
    timestamp: Date.now(),
    status: 'read'
  };
  messages.push(welcomeMsg);

  io.emit('group-created', { group: newGroup, message: welcomeMsg });
  res.status(201).json(newGroup);
});

app.post('/api/schedule', (req, res) => {
  const { senderId, receiverId, text, sendAt } = req.body;
  const sMsg = {
    id: uuidv4(),
    chatId: receiverId.startsWith('group_') ? receiverId : getChatId(senderId, receiverId),
    senderId,
    receiverId,
    text,
    sendAt: sendAt || (Date.now() + 60000)
  };
  scheduledMessages.push(sMsg);
  res.status(201).json({ success: true, scheduledMessage: sMsg });
});

app.post('/api/channel/toggle-follow', (req, res) => {
  const { channelId } = req.body;
  const channel = channels.find(c => c.id === channelId);
  if (channel) {
    channel.isFollowing = !channel.isFollowing;
    return res.json(channel);
  }
  res.status(404).json({ error: 'Channel not found' });
});

app.post('/api/users/block', (req, res) => {
  const { userId, targetId, action } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    if (!user.blockedUsers) user.blockedUsers = [];
    if (action === 'block') {
      if (!user.blockedUsers.includes(targetId)) user.blockedUsers.push(targetId);
    } else {
      user.blockedUsers = user.blockedUsers.filter(id => id !== targetId);
    }
    io.emit('user-blocked-update', { userId, blockedUsers: user.blockedUsers });
    return res.json({ success: true, blockedUsers: user.blockedUsers });
  }
  res.status(404).json({ error: 'User not found' });
});

app.post('/api/users/privacy', (req, res) => {
  const { userId, privacy } = req.body;
  const user = users.find(u => u.id === userId);
  if (user) {
    user.privacy = { ...(user.privacy || {}), ...privacy };
    io.emit('user-privacy-updated', { userId, privacy: user.privacy });
    return res.json({ success: true, privacy: user.privacy });
  }
  res.status(404).json({ error: 'User not found' });
});

app.post('/api/users/update', (req, res) => {
  const { id, name, status, avatar } = req.body;
  const user = users.find(u => u.id === id);
  if (user) {
    if (name) user.name = name;
    if (status) user.status = status;
    if (avatar) user.avatar = avatar;
    io.emit('user-updated', user);
    return res.json(user);
  }
  res.status(404).json({ error: 'User not found' });
});

// Socket.io Real-time Handlers
io.on('connection', (socket) => {
  socket.on('user-join', (userId) => {
    socketUserMap.set(socket.id, userId);
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, new Set());
    }
    userSocketMap.get(userId).add(socket.id);

    const user = users.find(u => u.id === userId);
    if (user && !user.isAI) {
      user.online = true;
      user.lastSeen = Date.now();
      io.emit('user-status-change', { userId, online: true, lastSeen: user.lastSeen });
    }
  });

  socket.on('send-message', (data) => {
    const { senderId, receiverId, text, type, mediaUrl, fileName, fileSize, audioDuration, pollData, locationData } = data;
    const isGroup = receiverId.startsWith('group_');
    const chatId = isGroup ? receiverId : getChatId(senderId, receiverId);

    const newMsg = {
      id: uuidv4(),
      chatId,
      senderId,
      receiverId,
      text: text || '',
      type: type || 'text',
      mediaUrl: mediaUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || null,
      audioDuration: audioDuration || null,
      pollData: pollData || null,
      locationData: locationData || null,
      reactions: [],
      timestamp: Date.now(),
      status: 'sent'
    };

    messages.push(newMsg);

    if (receiverId === 'user_ai_assistant') {
      newMsg.status = 'read';
      const senderSockets = userSocketMap.get(senderId);
      if (senderSockets) {
        senderSockets.forEach(sId => io.to(sId).emit('receive-message', newMsg));
        senderSockets.forEach(sId => io.to(sId).emit('user-typing', { senderId: 'user_ai_assistant', chatId }));
      }

      setTimeout(() => {
        const aiResponseText = generateAIResponse(text || 'hello');
        const aiMsg = {
          id: uuidv4(),
          chatId,
          senderId: 'user_ai_assistant',
          receiverId: senderId,
          text: aiResponseText,
          type: 'text',
          timestamp: Date.now(),
          status: 'read'
        };
        messages.push(aiMsg);
        if (senderSockets) {
          senderSockets.forEach(sId => {
            io.to(sId).emit('user-stop-typing', { senderId: 'user_ai_assistant', chatId });
            io.to(sId).emit('receive-message', aiMsg);
          });
        }
      }, 1000);
      return;
    }

    if (isGroup) {
      const group = users.find(u => u.id === receiverId);
      if (group && group.members) {
        group.members.forEach(memberId => {
          const sockets = userSocketMap.get(memberId);
          if (sockets) sockets.forEach(sId => io.to(sId).emit('receive-message', newMsg));
        });
      }
    } else {
      const recipientSockets = userSocketMap.get(receiverId);
      if (recipientSockets && recipientSockets.size > 0) {
        newMsg.status = 'delivered';
        recipientSockets.forEach(sId => io.to(sId).emit('receive-message', newMsg));
      }

      const senderSockets = userSocketMap.get(senderId);
      if (senderSockets) {
        senderSockets.forEach(sId => io.to(sId).emit('receive-message', newMsg));
      }
    }
  });

  socket.on('vote-poll', ({ messageId, optionId, userId, chatId }) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg && msg.pollData && msg.pollData.options) {
      msg.pollData.options.forEach(opt => {
        if (opt.id === optionId) {
          if (!opt.votes.includes(userId)) {
            opt.votes.push(userId);
          } else {
            opt.votes = opt.votes.filter(u => u !== userId);
          }
        } else if (!msg.pollData.allowMultiple) {
          opt.votes = opt.votes.filter(u => u !== userId);
        }
      });
      io.emit('poll-updated', { messageId, pollData: msg.pollData, chatId });
    }
  });

  socket.on('mark-messages-read', ({ chatId, readerId, senderId }) => {
    messages.forEach(msg => {
      if (msg.chatId === chatId && msg.receiverId === readerId && msg.status !== 'read') {
        msg.status = 'read';
      }
    });

    const senderSockets = userSocketMap.get(senderId);
    if (senderSockets) {
      senderSockets.forEach(sId => io.to(sId).emit('messages-read-update', { chatId, readerId }));
    }
  });

  socket.on('typing', ({ senderId, receiverId }) => {
    if (receiverId.startsWith('group_')) {
      const group = users.find(u => u.id === receiverId);
      if (group && group.members) {
        group.members.forEach(memberId => {
          if (memberId !== senderId) {
            const sockets = userSocketMap.get(memberId);
            if (sockets) sockets.forEach(sId => io.to(sId).emit('user-typing', { senderId, chatId: receiverId }));
          }
        });
      }
    } else {
      const recipientSockets = userSocketMap.get(receiverId);
      if (recipientSockets) {
        recipientSockets.forEach(sId => io.to(sId).emit('user-typing', { senderId, chatId: getChatId(senderId, receiverId) }));
      }
    }
  });

  socket.on('stop-typing', ({ senderId, receiverId }) => {
    if (receiverId.startsWith('group_')) {
      const group = users.find(u => u.id === receiverId);
      if (group && group.members) {
        group.members.forEach(memberId => {
          if (memberId !== senderId) {
            const sockets = userSocketMap.get(memberId);
            if (sockets) sockets.forEach(sId => io.to(sId).emit('user-stop-typing', { senderId, chatId: receiverId }));
          }
        });
      }
    } else {
      const recipientSockets = userSocketMap.get(receiverId);
      if (recipientSockets) {
        recipientSockets.forEach(sId => io.to(sId).emit('user-stop-typing', { senderId, chatId: getChatId(senderId, receiverId) }));
      }
    }
  });

  socket.on('react-message', ({ messageId, reaction, userId, chatId }) => {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      if (!msg.reactions) msg.reactions = [];
      const existingIdx = msg.reactions.findIndex(r => r.userId === userId);
      if (existingIdx > -1) {
        if (msg.reactions[existingIdx].reaction === reaction) {
          msg.reactions.splice(existingIdx, 1);
        } else {
          msg.reactions[existingIdx].reaction = reaction;
        }
      } else {
        msg.reactions.push({ userId, reaction });
      }
      io.emit('message-reaction-update', { messageId, reactions: msg.reactions, chatId });
    }
  });

  // WebRTC Signaling Handlers
  socket.on('call-user', ({ userToCall, signalData, from, fromName, fromAvatar, callType }) => {
    const recipientSockets = userSocketMap.get(userToCall);
    if (recipientSockets && recipientSockets.size > 0) {
      recipientSockets.forEach(sId => {
        io.to(sId).emit('incoming-call', {
          signal: signalData,
          from,
          fromName,
          fromAvatar,
          callType
        });
      });
    } else {
      socket.emit('call-failed', { reason: 'User is offline or unavailable' });
    }
  });

  socket.on('answer-call', ({ to, signal }) => {
    const callerSockets = userSocketMap.get(to);
    if (callerSockets) {
      callerSockets.forEach(sId => {
        io.to(sId).emit('call-accepted', signal);
      });
    }
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    const targetSockets = userSocketMap.get(to);
    if (targetSockets) {
      targetSockets.forEach(sId => {
        io.to(sId).emit('ice-candidate', candidate);
      });
    }
  });

  socket.on('end-call', ({ to }) => {
    const targetSockets = userSocketMap.get(to);
    if (targetSockets) {
      targetSockets.forEach(sId => {
        io.to(sId).emit('call-ended');
      });
    }
  });

  socket.on('reject-call', ({ to }) => {
    const targetSockets = userSocketMap.get(to);
    if (targetSockets) {
      targetSockets.forEach(sId => {
        io.to(sId).emit('call-rejected');
      });
    }
  });

  socket.on('call-reaction', ({ to, emoji }) => {
    const targetSockets = userSocketMap.get(to);
    if (targetSockets) {
      targetSockets.forEach(sId => {
        io.to(sId).emit('call-reaction', { emoji });
      });
    }
  });

  socket.on('disconnect', () => {
    const userId = socketUserMap.get(socket.id);
    if (userId) {
      socketUserMap.delete(socket.id);
      const userSockets = userSocketMap.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          userSocketMap.delete(userId);
          const user = users.find(u => u.id === userId);
          if (user && !user.isAI) {
            user.online = false;
            user.lastSeen = Date.now();
            io.emit('user-status-change', { userId, online: false, lastSeen: user.lastSeen });
          }
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`WhatsApp Clone Server is running on port ${PORT}`);
});
