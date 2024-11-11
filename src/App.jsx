import React, { useState, useEffect, useRef } from 'react';
import { HfInference } from '@huggingface/inference';
import './App.css';
const client = new HfInference('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');
console.log(import.meta.env.REACT_APP_HUGGINGFACE_API_KEY);

const ChatComponent = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const responseBoxRef = useRef(null); 

  useEffect(() => {
    if (responseBoxRef.current) {
      responseBoxRef.current.scrollTop = responseBoxRef.current.scrollHeight; 
    }
  }, [output]); 

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!input) return;

    setLoading(true);
    setError(false);
    setOutput('');

    try {
      const stream = client.chatCompletionStream({
        model: 'Qwen/Qwen2.5-72B-Instruct',
        messages: [{ role: 'user', content: input }],
        max_tokens: 5000,
      });

      let fullResponse = '';

      for await (const chunk of stream) {
        if (chunk.choices && chunk.choices[0].delta.content) {
          const newContent = chunk.choices[0].delta.content;
          fullResponse += newContent;
          setOutput(fullResponse);
        }
      }

      setLoading(false);
      setInput('');
    } catch (error) {
      console.error(error);
      setError(true);
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-card">
        <h2 className="chat-title">Chat with AI</h2>
        <p className="chat-description">
          Type your message below and press "Send". The AI will respond based on your input.
        </p>

        <div className="response-box" ref={responseBoxRef}>
          {output && <div className="response-item">{output}</div>}
        </div>

        {error && <div className="error-message">Error: Unable to get response. Please try again later.</div>}

        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea
            required
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="chat-input"
          />
          <button type="submit" disabled={loading} className="chat-button">
            {loading ? 'Loading...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;
