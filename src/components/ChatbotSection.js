import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import React, { useEffect, useRef, useState } from 'react';
import { apiFetch } from '../api';
import './ChatbotSection.css'; // We'll create this file next

function ChatbotSection() {
  const [chatLog, setChatLog] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const didMountRef = useRef(false);

  const formatBotResponse = (text) => {
    // Add console log to see the input text
    console.log('Original text:', text);
    
    // Handle code blocks first - make sure the regex matches correctly
    const formattedText = text.replace(/```([\w]*)\n([\s\S]*?)```/g, (match, language, code) => {
      console.log('Found code block:', { language, code });
      return `<div class="code-block-container">
        <pre class="code-block"><code class="language-${language}">${code.trim()}</code></pre>
        <button class="copy-button" type="button">Copy</button>
      </div>`;
    });

    // Handle bold text with double asterisks
    const withBold = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Handle bullet points (both asterisk and hyphen)
    const withBulletPoints = withBold.replace(/^[\*\-] (.+)$/gm, '<li>$1</li>');
    
    // Handle numbered lists
    const withNumberedLists = withBulletPoints.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Handle paragraphs and wrap lists in <ul> tags
    const withParagraphs = withNumberedLists
      .split('\n\n')
      .map(para => para.trim())
      .filter(para => para)
      .map(para => {
        if (para.includes('<li>')) {
          return `<ul>${para}</ul>`;
        }
        if (!para.startsWith('<pre')) {
          return `<p>${para}</p>`;
        }
        return para;
      })
      .join('');

    return withParagraphs;
  };

  const handleSend = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput;
    setChatLog(prev => [...prev, { sender: 'User', text: userMessage }]);
    setChatInput('');
    setIsLoading(true);
    try {
      const response = await apiFetch('/api/chat/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
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
      const formattedResponse = formatBotResponse(botResponse);
      setChatLog(prev => [...prev, { 
        sender: 'Bot', 
        text: formattedResponse,
        isFormatted: true 
      }]);
    } catch (error) {
      setChatLog(prev => [...prev, { sender: 'Bot', text: 'Error: ' + error }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add event listener for copy buttons
    const handleCopy = (event) => {
      if (event.target.classList.contains('copy-button')) {
        const codeBlock = event.target.closest('.code-block-container').querySelector('code');
        navigator.clipboard.writeText(codeBlock.textContent)
          .then(() => {
            const button = event.target;
            button.textContent = 'Copied!';
            setTimeout(() => {
              button.textContent = 'Copy';
            }, 2000);
          })
          .catch(err => console.error('Failed to copy:', err));
      }
    };

    document.addEventListener('click', handleCopy);
    return () => document.removeEventListener('click', handleCopy);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true; // avoid auto-scroll on first mount
      return;
    }
    scrollToBottom();
  }, [chatLog, isLoading]);

  return (
    <section className="chatbot-container">
      <div className="chatbot-header">
        <SmartToyIcon className="robot-icon" />
        <h2>AI Assistant</h2>
      </div>
      
      <div className="chat-messages">
        {chatLog.map((entry, index) => (
          <div 
            key={index} 
            className={`message-bubble ${entry.sender === 'User' ? 'user-message' : 'bot-message'}`}
          >
            <div className="message-icon">
              {entry.sender === 'User' ? <PersonIcon /> : <SmartToyIcon />}
            </div>
            <div className="message-content">
              {entry.isFormatted ? (
                <div 
                  className="message-text formatted"
                  dangerouslySetInnerHTML={{ __html: entry.text }}
                />
              ) : (
                <div className="message-text">{entry.text}</div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message-bubble bot-message">
            <div className="message-icon">
              <SmartToyIcon />
            </div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          placeholder="Type your message here..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="chat-input"
        />
        <button 
          onClick={handleSend}
          className="send-button"
          disabled={!chatInput.trim()}
        >
          <SendIcon />
        </button>
      </div>
    </section>
  );
}

export default ChatbotSection;
