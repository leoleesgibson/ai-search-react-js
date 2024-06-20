import React, { useState, useEffect } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { BsFillMicFill } from 'react-icons/bs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Typewriter } from 'react-simple-typewriter';

function HomeSearch() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const apiKey = 'AIzaSyDS1PuFSC5ODXMbNbwBwkFyunMLA0AJSsY';
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: "from today, your name is Smart. you are an AI Base Search engine. Please answer all the user questions in 200 words. be friendly and keep the conversation going",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  };

  useEffect(() => {
    // Load chat history from localStorage when the component mounts
    const storedChatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    setChatHistory(storedChatHistory);
  }, []);

  useEffect(() => {
    // Save chat history to localStorage whenever it changes
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    // Append the new user message to the chat history
    const updatedHistory = [
      ...chatHistory,
      {
        role: 'user',
        parts: [{ text: input }],
      },
    ];
    setChatHistory(updatedHistory);

    const chatSession = model.startChat({
      generationConfig,
      history: updatedHistory,
    });

    try {
      const result = await chatSession.sendMessage(input);
      const aiResponse = result.response.text();

      // Append the AI response to the chat history
      setChatHistory([
        ...updatedHistory,
        {
          role: 'model',
          parts: [{ text: aiResponse }],
        },
      ]);

      setResponse(aiResponse);
    } catch (error) {
      console.error('Error fetching from API:', error);
      setResponse('Error fetching the response. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className='text-7xl font-bold text-center text-red-400'> SMART </h1>
      <form
        onSubmit={handleSubmit}
        className='flex w-full mt-5 mx-auto max-w-[90%] border border-gray-200 px-5 py-3 rounded-full hover:shadow-md focus-within:shadow-md transition-shadow sm:max-w-xl lg:max-w-2xl'
      >
        <BsFillMicFill className='text-xl text-gray-500 mr-3' />
        <input
          type='text'
          placeholder='Search Smart Now !! '
          className='flex-grow focus:outline-none'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <AiOutlineSearch className='text-lg' />
      </form>

      <div className='flex justify-center items-center mt-8 w-full'>
        {loading ? (
          <div className="loader"></div>
        ) : (
          response && (
            <div className="w-full max-w-[90%] sm:max-w-xl lg:max-w-2xl bg-white p-6 rounded-lg">
              <Typewriter
                words={[response]}
                loop={1}
                cursor
                cursorStyle='_'
                typeSpeed={50}
                deleteSpeed={50}
                delaySpeed={1000}
              />
            </div>
          )
        )}
      </div>
    </>
  );
}

export default HomeSearch;
