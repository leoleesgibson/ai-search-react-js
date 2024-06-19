import React, { useState } from 'react';
import { AiOutlineSearch } from 'react-icons/ai';
import { BsFillMicFill } from 'react-icons/bs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Typewriter } from 'react-simple-typewriter';

function HomeSearch() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const apiKey = 'AIzaSyDS1PuFSC5ODXMbNbwBwkFyunMLA0AJSsY';
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro',
  });

  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: 'text/plain',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse('');

    const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: 'user',
          parts: [{ text: input }],
        },
      ],
    });

    try {
      const result = await chatSession.sendMessage(input);
      setResponse(result.response.text());
    } catch (error) {
      console.error('Error fetching from API:', error);
      setResponse('Error fetching the response. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className='flex w-full mt-5 mx-auto max-w-[90%] border border-gray-200 px-5 py-3 rounded-full hover:shadow-md focus-within:shadow-md transition-shadow sm:max-w-xl lg:max-w-2xl'
      >
        <BsFillMicFill className='text-xl text-gray-500 mr-3' />
        <input
          type='text'
          placeholder='Search Smart Now and Get Instant Answers.'
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
