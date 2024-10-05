import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import EventForm from './components/EventForm';
import EmailList from './components/EmailList';
import EmailEditor from './components/EmailEditor';
import './App.css';

function App() {
  const [eventData, setEventData] = useState({});
  const [emailList, setEmailList] = useState([]);
  const [emailContent, setEmailContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');

  return (
    <div className="App">
      <header className="app-header">
        <h1>TechFiesta SBT Mailer</h1>
      </header>
      <main className="app-main">
        <section className="event-details">
          <h2>Event Details</h2>
          <EventForm setEventData={setEventData} />
          <ImageUploader />
        </section>
        <section className="email-composition">
          <h2>Compose Email</h2>
          <EmailEditor 
            setEmailContent={setEmailContent} 
            setEmailSubject={setEmailSubject} 
          />
        </section>
        <section className="email-recipients">
          <h2>Recipients</h2>
          <EmailList 
            setEmailList={setEmailList} 
            setSubject={setEmailSubject}
          />
        </section>
      </main>
      <footer className="app-footer">
        <button 
          className="send-emails-btn" 
          onClick={() => console.log(eventData, emailList, emailContent, emailSubject)}
        >
          Send SBT Link
        </button>
      </footer>
    </div>
  );
}

export default App;
