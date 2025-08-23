import CloseIcon from '@mui/icons-material/Close';
import MicIcon from '@mui/icons-material/Mic';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import './AIAssistant.css';

function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('text');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceOnly, setIsVoiceOnly] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      setRecognition(recognition);
    } else {
      console.warn('Speech recognition not supported in this browser');
    }
  }, []);

  const speakResponse = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]); // Auto-scroll when messages change

  const handleSend = async (message, isVoiceInput = false) => {
    try {
      setIsLoading(true);
      setMessages(prev => [...prev, { sender: 'user', text: message }]);
      
      const response = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      let botResponse = '';
      if (
        data &&
        data.candidates &&
        data.candidates.length > 0 &&
        data.candidates[0].content &&
        data.candidates[0].content.parts &&
        data.candidates[0].content.parts.length > 0
      ) {
        botResponse = data.candidates[0].content.parts[0].text;
      } else {
        botResponse = JSON.stringify(data);
      }
      
      setMessages(prev => [...prev, { sender: 'ai', text: botResponse }]);
      
      // Only speak the response if it came from voice input
      if (isVoiceInput) {
        speakResponse(botResponse);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Error: ' + error.message }]);
    } finally {
      setIsLoading(false);
      setIsVoiceOnly(false);
    }
  };

  const handleTextInput = () => {
    if (inputText.trim()) {
      handleSend(inputText, false); // Pass false for isVoiceInput
      setInputText('');
    }
  };

  const handleVoiceInput = async () => {
    // If speech is ongoing, stop it
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    // If recognition is ongoing, stop it
    if (isListening) {
      recognition.stop();
      return;
    }

    try {
      // First request microphone permission explicitly
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());

      if (!recognition) {
        alert('Speech recognition not supported in your browser');
        return;
      }

      setIsVoiceOnly(true);
      recognition.onstart = () => {
        setIsListening(true);
        console.log('Listening...');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('Recognized:', transcript);
        handleSend(transcript, true);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setIsVoiceOnly(false);
        if (event.error === 'not-allowed') {
          alert('Microphone access was denied. Please allow access to use voice input.');
        } else {
          alert('Error occurred in speech recognition: ' + event.error);
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
        console.log('Speech recognition ended');
      };

      recognition.start();
    } catch (error) {
      console.error('Microphone access error:', error);
      if (error.name === 'NotAllowedError') {
        alert('Microphone access was denied. Please allow access to use voice input.');
      } else {
        alert('Error accessing microphone: ' + error.message);
      }
      setIsListening(false);
      setIsVoiceOnly(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const messageVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const userMessageVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="ai-assistant-container">
      {!isOpen && (
        <motion.div 
          className="floating-icon"
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SmartToyIcon style={{ fontSize: 40 }} />
        </motion.div>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="assistant-modal"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            style={{ position: 'fixed', bottom: '20px', right: '20px' }}
          >
            <div className="modal-header">
              <h3>AI Assistant</h3>
              <CloseIcon 
                className="close-icon" 
                onClick={() => setIsOpen(false)}
                whileHover={{ rotate: 90 }}
              />
            </div>

            <div className="chat-container">
              <div className="chat-messages">
                {messages.map((message, index) => (
                  <div key={index} className={`message ${message.sender}`}>
                    <div className="message-icon">
                      {message.sender === 'user' ? (
                        <PersonIcon style={{ color: '#1976d2' }} />
                      ) : (
                        <SmartToyIcon style={{ color: '#4caf50' }} />
                      )}
                    </div>
                    <div className="message-content">
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message ai">
                    <div className="message-icon">
                      <SmartToyIcon style={{ color: '#4caf50' }} />
                    </div>
                    <div className="message-content">
                      <div className="dot-loader">
                        <div className="dot"></div>
                        <div className="dot"></div>
                        <div className="dot"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <motion.div 
                className="chat-input-container"
                whileHover={{ scale: 1.02 }}
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your message..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && inputText.trim()) {
                      handleSend(inputText);
                      setInputText('');
                    }
                  }}
                  disabled={isLoading}
                />
                <div className="button-group">
                  <motion.button 
                    className="icon-button"
                    onClick={() => {
                      if (inputText.trim()) {
                        handleSend(inputText);
                        setInputText('');
                      }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isLoading || !inputText.trim()}
                  >
                    <SendIcon style={{ fontSize: 20 }} />
                  </motion.button>
                  <motion.button 
                    className={`icon-button mic-button ${isListening ? 'listening' : ''} ${isSpeaking ? 'speaking' : ''}`}
                    onClick={handleVoiceInput}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    disabled={isLoading}
                  >
                    <MicIcon style={{ fontSize: 20 }} />
                    {(isListening || isSpeaking) && <div className="listening-animation"></div>}
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIAssistant; 