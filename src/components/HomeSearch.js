import React, { useState, useEffect } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';
import VoiceSearchInput from './VoiceSearchInput';

function HomeSearch() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showInstruction, setShowInstruction] = useState(true); // State to control instruction visibility

  // Load API key from environment variables
  const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
    systemInstruction: "from today, Your name is Smart. you are an AI-powered search engine. Please answer all the user questions in 200 words. Be a friendly research assistant and brainstorming buddy. keep the research going , by giving references to external resources on the internet .",
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  };

  useEffect(() => {
    const storedChatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    setChatHistory(storedChatHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    fetchResponse(input);
  };

  const fetchResponse = async (query) => {
    setLoading(true);
    setResponse('');

    const updatedHistory = [
      ...chatHistory,
      {
        role: 'user',
        parts: [{ text: query }],
      },
    ];
    setChatHistory(updatedHistory);

    const chatSession = model.startChat({
      generationConfig,
      history: updatedHistory,
    });

    try {
      const result = await chatSession.sendMessage(query);
      const aiResponse = result.response.text();

      setChatHistory([
        ...updatedHistory,
        {
          role: 'model',
          parts: [{ text: aiResponse }],
        },
      ]);

      setResponse(aiResponse);
      setShowInstruction(false); // Hide instruction after getting a response
    } catch (error) {
      console.error('Error fetching from API:', error);
      setResponse('Error fetching the response. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = (voiceInput) => {
    setInput(voiceInput);
    fetchResponse(voiceInput);
  };

  // Custom renderers to style Markdown components
  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter style={darcula} language={match[1]} PreTag="div" {...props}>
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    a({ href, children }) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          {children}
        </a>
      );
    },
  };

  return (
    <>
      <h1 className='text-7xl font-bold text-center text-red-400'> SMART </h1>
      {showInstruction && (
        <div className="text-center mt-4 text-gray-600">
          <p>Say "Smart" or Search by typing below!</p>
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className='flex w-full mt-5 mx-auto max-w-[90%] border border-gray-200 px-5 py-3 rounded-full hover:shadow-md focus-within:shadow-md transition-shadow sm:max-w-xl lg:max-w-2xl'
      >
        <VoiceSearchInput onVoiceInput={handleVoiceInput} />
        <input
          type='text'
          placeholder='Search Smart Now !! '
          className='flex-grow focus:outline-none'
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <AiOutlineSearch className='text-lg cursor-pointer' onClick={handleSubmit} />
      </form>

      <div className='flex justify-center items-center mt-8 w-full'>
        {loading ? (
          <div className="loader"></div>
        ) : (
          response && (
            <div className="w-full max-w-[90%] sm:max-w-xl lg:max-w-2xl bg-white p-6 rounded-lg">
              <ReactMarkdown components={renderers} className="markdown prose prose-sm sm:prose lg:prose-lg xl:prose-2xl">
                {response}
              </ReactMarkdown>
            </div>
          )
        )}
      </div>
    </>
  );
}

export default HomeSearch;
