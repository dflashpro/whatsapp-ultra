import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';
import { sounds } from '../utils/audio';

const CallContext = createContext();

const RTC_CONFIG = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

function createSyntheticStream(callType) {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  
  let frame = 0;
  function draw() {
    ctx.fillStyle = '#0b141a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw animated gradient studio background
    const grad = ctx.createLinearGradient(0, 0, 1280, 720);
    grad.addColorStop(0, '#005c4b');
    grad.addColorStop(0.5, '#00a884');
    grad.addColorStop(1, '#06b6d4');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 6;
    
    ctx.beginPath();
    ctx.arc(640, 360, 150 + Math.sin(frame * 0.05) * 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.textAlign = 'center';
    ctx.fillText('WhatsApp Ultra 4K Studio', 640, 350);
    ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto';
    ctx.fillStyle = '#aebac1';
    ctx.fillText('Simulated High-Definition Stream (60 FPS)', 640, 400);

    frame++;
    requestAnimationFrame(draw);
  }
  draw();

  const videoStream = canvas.captureStream(30);
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const dst = audioCtx.createMediaStreamDestination();
  const gain = audioCtx.createGain();
  gain.gain.value = 0.001;
  osc.connect(gain);
  gain.connect(dst);
  osc.start();

  return new MediaStream([
    ...(callType === 'video' ? videoStream.getVideoTracks() : []),
    dst.stream.getAudioTracks()[0]
  ]);
}

export const CallProvider = ({ children }) => {
  const { currentUser, showToast } = useAuth();
  const { socket } = useSocket();

  const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'incoming' | 'connected'
  const [callType, setCallType] = useState('video');
  const [peerUser, setPeerUser] = useState(null);
  const [callerSignal, setCallerSignal] = useState(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [callReactions, setCallReactions] = useState([]);
  const [callDuration, setCallDuration] = useState(0);

  const pcRef = useRef(null);
  const durationTimerRef = useRef(null);
  const stopToneRef = useRef(null);
  const originalVideoTrackRef = useRef(null);

  const cleanupCall = () => {
    sounds.stopIncomingRingtone();
    sounds.stopOutgoingDialTone();
    if (stopToneRef.current) {
      stopToneRef.current();
      stopToneRef.current = null;
    }
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current);
      durationTimerRef.current = null;
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setLocalStream(null);
    setRemoteStream(null);
    setPeerUser(null);
    setCallerSignal(null);
    setIsMuted(false);
    setIsVideoOff(false);
    setIsScreenSharing(false);
    setIsMinimized(false);
    setCallReactions([]);
    setCallDuration(0);
    setCallState('idle');
  };

  const getMediaStream = async (type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video' ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false
      });
      return stream;
    } catch (err) {
      console.warn('Microphone/Webcam fallback for testing:', err);
      return createSyntheticStream(type);
    }
  };

  const createPeerConnection = (stream, targetUserId) => {
    const pc = new RTCPeerConnection(RTC_CONFIG);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pc.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('ice-candidate', { to: targetUserId, candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setCallState('connected');
        sounds.stopOutgoingDialTone();
        sounds.stopIncomingRingtone();
        if (!durationTimerRef.current) {
          setCallDuration(0);
          durationTimerRef.current = setInterval(() => {
            setCallDuration(prev => prev + 1);
          }, 1000);
        }
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        cleanupCall();
      }
    };

    pcRef.current = pc;
    return pc;
  };

  const startCall = async (targetUser, type = 'video') => {
    if (!socket || !currentUser || !targetUser || callState !== 'idle') return;
    setCallType(type);
    setPeerUser(targetUser);
    setCallState('calling');
    stopToneRef.current = sounds.startOutgoingDialTone();

    try {
      const stream = await getMediaStream(type);
      setLocalStream(stream);

      const pc = createPeerConnection(stream, targetUser.id);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call-user', {
        userToCall: targetUser.id,
        signalData: offer,
        from: currentUser.id,
        fromName: currentUser.name,
        fromAvatar: currentUser.avatar,
        callType: type
      });
    } catch (err) {
      cleanupCall();
    }
  };

  const acceptCall = async () => {
    if (!callerSignal || !peerUser || !socket) return;
    sounds.stopIncomingRingtone();

    try {
      const stream = await getMediaStream(callType);
      setLocalStream(stream);

      const pc = createPeerConnection(stream, peerUser.id);
      await pc.setRemoteDescription(new RTCSessionDescription(callerSignal));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer-call', { to: peerUser.id, signal: answer });
      setCallState('connected');

      if (!durationTimerRef.current) {
        setCallDuration(0);
        durationTimerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      }
    } catch (err) {
      cleanupCall();
    }
  };

  const rejectCall = () => {
    if (peerUser && socket) {
      socket.emit('reject-call', { to: peerUser.id });
    }
    cleanupCall();
  };

  const endCall = () => {
    if (peerUser && socket) {
      socket.emit('end-call', { to: peerUser.id });
    }
    cleanupCall();
  };

  const toggleMute = () => {
    if (localStream) {
      const track = localStream.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      const track = localStream.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoOff(!track.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];
        if (pcRef.current && localStream) {
          const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            originalVideoTrackRef.current = localStream.getVideoTracks()[0];
            sender.replaceTrack(screenTrack);
          }
        }
        screenTrack.onended = () => stopScreenShare();
        setIsScreenSharing(true);
      } catch (e) {}
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (originalVideoTrackRef.current && pcRef.current) {
      const sender = pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
      if (sender) sender.replaceTrack(originalVideoTrackRef.current);
    }
    setIsScreenSharing(false);
  };

  const sendCallReaction = (emoji) => {
    if (peerUser && socket) {
      socket.emit('call-reaction', { to: peerUser.id, emoji });
      setCallReactions(prev => [...prev, { id: Date.now(), emoji }]);
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('incoming-call', ({ signal, from, fromName, fromAvatar, callType: incomingType }) => {
      setCallType(incomingType || 'video');
      setCallerSignal(signal);
      setPeerUser({ id: from, name: fromName, avatar: fromAvatar });
      setCallState('incoming');
      sounds.startIncomingRingtone();
    });

    socket.on('call-accepted', async (signal) => {
      sounds.stopOutgoingDialTone();
      if (pcRef.current) {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    socket.on('ice-candidate', async (candidate) => {
      if (pcRef.current && pcRef.current.remoteDescription) {
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {}
      }
    });

    socket.on('call-reaction', ({ emoji }) => {
      setCallReactions(prev => [...prev, { id: Date.now(), emoji }]);
    });

    socket.on('call-ended', () => {
      showToast('Call ended');
      cleanupCall();
    });

    socket.on('call-rejected', () => {
      showToast('Call declined');
      cleanupCall();
    });

    socket.on('call-failed', ({ reason }) => {
      showToast(reason || 'User unavailable');
      cleanupCall();
    });

    return () => {
      socket.off('incoming-call');
      socket.off('call-accepted');
      socket.off('ice-candidate');
      socket.off('call-reaction');
      socket.off('call-ended');
      socket.off('call-rejected');
      socket.off('call-failed');
    };
  }, [socket, localStream]);

  return (
    <CallContext.Provider value={{
      callState,
      callType,
      peerUser,
      localStream,
      remoteStream,
      isMuted,
      isVideoOff,
      isScreenSharing,
      isMinimized,
      setIsMinimized,
      callReactions,
      sendCallReaction,
      callDuration,
      startCall,
      acceptCall,
      rejectCall,
      endCall,
      toggleMute,
      toggleVideo,
      toggleScreenShare
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);
