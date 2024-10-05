'use client'

import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import EventForm from './components/EventForm';
import EmailList from './components/EmailList';
import EmailEditor from './components/EmailEditor';

export default function Home() {
  const [eventData, setEventData] = useState({});
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4 text-center shadow-md">
        <h1 className="text-2xl font-bold">TechFiesta SBT Mailer</h1>
      </header>
      <main className="flex-grow p-4 md:p-8 space-y-8 md:space-y-0 md:flex md:space-x-8">
        <section className="bg-white rounded-lg shadow-md p-6 md:w-1/3">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">SBT Details</h2>
          <EventForm setEventData={setEventData} />
          <ImageUploader />
        </section>
        <div className="md:w-2/3 space-y-8">
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Compose Email</h2>
            <EmailEditor 
              setEmailContent={setEmailContent} 
              setEmailSubject={setEmailSubject} 
            />
          </section>
          <section className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Recipients</h2>
            <EmailList 
              setEmailList={setEmailList} 
              setSubject={setEmailSubject}
            />
          </section>
        </div>
      </main>
      <footer className="bg-blue-500 text-white p-4 text-center">
        <button 
          className="bg-gray-100 hover:bg-gray-200 text-blue-500 font-bold py-2 px-4 rounded transition duration-300"
          onClick={() => console.log(eventData, emailList, emailContent, emailSubject)}
        >
          Send SBT Link
        </button>
      </footer>
    </div>
  );
}
