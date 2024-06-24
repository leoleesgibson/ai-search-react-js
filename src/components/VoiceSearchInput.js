import React, { useState } from 'react';
import { BsFillMicFill } from 'react-icons/bs';
import './VoiceSearchInput.css'; // Import the CSS file for animations

function VoiceSearchInput({ onVoiceInput }) {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleVoiceClick = () => {
    setErrorMessage('');

    if ('webkitSpeechRecognition' in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onerror = (event) => {
        setErrorMessage(`Error occurred in recognition: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onVoiceInput(transcript);
        setIsListening(false);
      };

      recognition.start();
    } else {
      setErrorMessage('Speech recognition not supported in this browser.');
    }
  };

  return (
    <div className="voice-search-input">
      <BsFillMicFill
        className='text-xl text-gray-500 mr-3 cursor-pointer'
        onClick={handleVoiceClick}
      />
      {isListening && (
        <div className="dialog-box animate__animated animate__fadeIn">
          <p>Listening...</p>
        </div>
      )}
      {errorMessage && (
        <div className="error-message animate__animated animate__shakeX">
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

export default VoiceSearchInput;
