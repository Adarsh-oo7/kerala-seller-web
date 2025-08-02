"use client"
import { useEffect, useState, useCallback, useRef } from 'react';
import { Upload, Send, Image, Video, Mic, X, Play, Pause, Download } from 'lucide-react';

const CONVERSATIONS_URL = 'http://localhost:8000/api/chat/conversations/';
const PROFILE_URL = 'http://localhost:8000/user/dashboard/';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userType, setUserType] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({
    image: null,
    video: null,
    audio: null
  });
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch conversations and current user's info
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    Promise.all([
      fetch(CONVERSATIONS_URL, { headers: { Authorization: `Token ${token}` } }),
      fetch(PROFILE_URL, { headers: { Authorization: `Token ${token}` } })
    ]).then(async ([convosResponse, profileResponse]) => {
      const convosData = await convosResponse.json();
      const profileData = await profileResponse.json();
      
      setConversations(convosData);
      
      if (profileData.seller) {
        setCurrentUserId(profileData.seller.id);
        setUserType('seller');
      } else if (profileData.buyer) {
        setCurrentUserId(profileData.buyer.id);
        setUserType('buyer');
      }
      
      if (convosData.length > 0) {
        setActiveConvo(convosData[0]);
      }
    }).catch(err => console.error("Failed to fetch initial data", err))
      .finally(() => setIsLoading(false));
  }, []);

  const fetchMessages = useCallback(() => {
    if (!activeConvo) return;
    const token = localStorage.getItem('accessToken');
    fetch(`${CONVERSATIONS_URL}${activeConvo.id}/messages/`, { 
      headers: { Authorization: `Token ${token}` } 
    })
      .then(response => response.json())
      .then(data => setMessages(data))
      .catch(err => console.error("Failed to fetch messages", err));
  }, [activeConvo]);

  // Polling for new messages
  useEffect(() => {
    if (!activeConvo) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [activeConvo, fetchMessages]);

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFiles.image && !selectedFiles.video && !selectedFiles.audio) || !activeConvo) return;
    
    setIsSending(true);
    const token = localStorage.getItem('accessToken');
    const formData = new FormData();
    
    if (newMessage.trim()) {
      formData.append('text', newMessage);
    }
    
    if (selectedFiles.image) {
      formData.append('image', selectedFiles.image);
    }
    
    if (selectedFiles.video) {
      formData.append('video', selectedFiles.video);
    }
    
    if (selectedFiles.audio) {
      formData.append('audio', selectedFiles.audio);
    }

    try {
      const response = await fetch(`${CONVERSATIONS_URL}${activeConvo.id}/send/`, {
        method: 'POST',
        headers: { 
          Authorization: `Token ${token}`
          // Don't set Content-Type for FormData, let browser set it
        },
        body: formData
      });

      if (response.ok) {
        setNewMessage('');
        setSelectedFiles({ image: null, video: null, audio: null });
        fetchMessages();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      console.error("Send message error:", err);
      alert("Failed to send message.");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (type, file) => {
    if (file) {
      // Validate file size (50MB limit)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`File size must be less than 50MB`);
        return;
      }
      
      setSelectedFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const removeFile = (type) => {
    setSelectedFiles(prev => ({ ...prev, [type]: null }));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], `audio-${Date.now()}.wav`, { type: 'audio/wav' });
        handleFileSelect('audio', file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const isMyMessage = (message) => {
    return message.sender_type === userType && message.sender_id === currentUserId;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessage = (msg) => {
    const isMine = isMyMessage(msg);
    
    return (
      <div 
        key={msg.id} 
        className={`flex ${isMine ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div 
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isMine 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          {/* Text content */}
          {msg.text && (
            <div className="mb-2">{msg.text}</div>
          )}
          
          {/* Image content */}
          {msg.image_url && (
            <div className="mb-2">
              <img 
                src={msg.image_url} 
                alt="Shared image" 
                className="max-w-full h-auto rounded cursor-pointer"
                onClick={() => window.open(msg.image_url, '_blank')}
              />
            </div>
          )}
          
          {/* Video content */}
          {msg.video_url && (
            <div className="mb-2">
              <video 
                src={msg.video_url} 
                controls 
                className="max-w-full h-auto rounded"
              />
              {msg.file_name && (
                <div className="text-xs mt-1 opacity-75">
                  {msg.file_name} ({msg.file_size_mb}MB)
                </div>
              )}
            </div>
          )}
          
          {/* Audio content */}
          {msg.audio_url && (
            <div className="mb-2">
              <audio 
                src={msg.audio_url} 
                controls 
                className="max-w-full"
              />
              {msg.file_name && (
                <div className="text-xs mt-1 opacity-75">
                  {msg.file_name} ({msg.file_size_mb}MB)
                </div>
              )}
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-xs mt-1 ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: '2-digit', 
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    );
  };
  
  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-lg">Loading conversations...</div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Conversations</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {conversations.map(convo => (
            <div 
              key={convo.id} 
              onClick={() => setActiveConvo(convo)} 
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                activeConvo?.id === convo.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="font-medium">
                {convo.buyer.full_name || convo.buyer.email}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white p-4 border-b border-gray-200">
          {activeConvo ? (
            <h3 className="text-lg font-semibold">
              Chat with {activeConvo.buyer.full_name || activeConvo.buyer.email}
            </h3>
          ) : (
            <h3 className="text-lg font-semibold text-gray-500">Select a conversation</h3>
          )}
        </div>
        
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(renderMessage)}
          <div ref={messagesEndRef} />
        </div>
        
        {/* File Preview */}
        {(selectedFiles.image || selectedFiles.video || selectedFiles.audio) && (
          <div className="bg-gray-50 p-3 border-t border-gray-200">
            <div className="text-sm font-medium mb-2">Attachments:</div>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.image && (
                <div className="flex items-center bg-white p-2 rounded border">
                  <Image className="w-4 h-4 mr-2" />
                  <span className="text-sm">{selectedFiles.image.name}</span>
                  <button onClick={() => removeFile('image')} className="ml-2">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
              {selectedFiles.video && (
                <div className="flex items-center bg-white p-2 rounded border">
                  <Video className="w-4 h-4 mr-2" />
                  <span className="text-sm">{selectedFiles.video.name}</span>
                  <button onClick={() => removeFile('video')} className="ml-2">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
              {selectedFiles.audio && (
                <div className="flex items-center bg-white p-2 rounded border">
                  <Mic className="w-4 h-4 mr-2" />
                  <span className="text-sm">{selectedFiles.audio.name}</span>
                  <button onClick={() => removeFile('audio')} className="ml-2">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <div className="bg-white p-4 border-t border-gray-200">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea 
                placeholder="Type a message..." 
                value={newMessage} 
                onChange={e => setNewMessage(e.target.value)} 
                onKeyPress={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="1"
                disabled={!activeConvo || isSending}
              />
            </div>
            
            {/* File Upload Buttons */}
            <div className="flex space-x-1">
              {/* Image Upload */}
              <input 
                type="file" 
                accept="image/*" 
                onChange={e => handleFileSelect('image', e.target.files[0])}
                className="hidden"
                ref={ref => fileInputRef.current = { ...fileInputRef.current, image: ref }}
              />
              <button 
                onClick={() => fileInputRef.current?.image?.click()}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded"
                disabled={!activeConvo || isSending}
              >
                <Image className="w-5 h-5" />
              </button>
              
              {/* Video Upload */}
              <input 
                type="file" 
                accept="video/*" 
                onChange={e => handleFileSelect('video', e.target.files[0])}
                className="hidden"
                ref={ref => fileInputRef.current = { ...fileInputRef.current, video: ref }}
              />
              <button 
                onClick={() => fileInputRef.current?.video?.click()}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded"
                disabled={!activeConvo || isSending}
              >
                <Video className="w-5 h-5" />
              </button>
              
              {/* Audio Recording */}
              <button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`p-2 rounded ${
                  isRecording 
                    ? 'text-red-500 bg-red-50' 
                    : 'text-gray-500 hover:text-blue-500 hover:bg-blue-50'
                }`}
                disabled={!activeConvo || isSending}
              >
                <Mic className="w-5 h-5" />
              </button>
              
              {/* Audio File Upload */}
              <input 
                type="file" 
                accept="audio/*" 
                onChange={e => handleFileSelect('audio', e.target.files[0])}
                className="hidden"
                ref={ref => fileInputRef.current = { ...fileInputRef.current, audio: ref }}
              />
              <button 
                onClick={() => fileInputRef.current?.audio?.click()}
                className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded"
                disabled={!activeConvo || isSending}
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
            
            {/* Send Button */}
            <button 
              onClick={handleSendMessage} 
              className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!activeConvo || isSending || (!newMessage.trim() && !selectedFiles.image && !selectedFiles.video && !selectedFiles.audio)}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
          
          {isRecording && (
            <div className="mt-2 text-sm text-red-500 flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
              Recording... Click the mic again to stop
            </div>
          )}
        </div>
      </div>
    </div>
  );
}