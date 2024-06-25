import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BsFillMicFill } from 'react-icons/bs';
import './VoiceSearchInput.css';

function VoiceSearchInput({ onVoiceInput }) {
  const [isListening, setIsListening] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const wakeWordRecognitionRef = useRef(null);

  const startVoiceRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window) {
      if (wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current.abort();
      }

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
        startWakeWordRecognition();
      };

      recognition.onend = () => {
        setIsListening(false);
        startWakeWordRecognition();
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onVoiceInput(transcript);
        setIsListening(false);
        startWakeWordRecognition();
      };

      recognition.start();
    } else {
      setErrorMessage('Speech recognition not supported in this browser.');
    }
  }, [onVoiceInput]);

  const startWakeWordRecognition = useCallback(() => {
    if (wakeWordRecognitionRef.current) {
      wakeWordRecognitionRef.current.abort();
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[event.resultIndex][0].transcript.trim().toLowerCase();
      if (transcript === 'smart') {
        startVoiceRecognition();
      }
    };

    recognition.onerror = (event) => {
      console.error('Error occurred in wake word recognition:', event);
      if (event.error !== 'aborted') {
        setErrorMessage(`Error occurred in wake word recognition: ${event.error}`);
      }
    };

    recognition.start();
    wakeWordRecognitionRef.current = recognition;
  }, [startVoiceRecognition]);

  useEffect(() => {
    startWakeWordRecognition();
    return () => {
      if (wakeWordRecognitionRef.current) {
        wakeWordRecognitionRef.current.abort();
      }
    };
  }, [startWakeWordRecognition]);

  return (
    <div className="voice-search-input">
      <BsFillMicFill
        className='text-xl text-gray-500 mr-3 cursor-pointer'
        onClick={startVoiceRecognition}
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
