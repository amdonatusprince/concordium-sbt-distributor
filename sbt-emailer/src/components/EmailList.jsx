import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import './EmailList.css';

function EmailList({ setEmailList, setSubject }) {
  const [emails, setEmails] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const [subject, setLocalSubject] = useState('');

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      const emailColumn = json.slice(1).map(row => row[0]);
      setEmails(prevEmails => [...new Set([...prevEmails, ...emailColumn])]);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleEmailInput = (e) => {
    if (e.key === 'Enter') {
      const email = e.target.value.trim();
      if (email && !emails.includes(email)) {
        setEmails(prevEmails => [...prevEmails, email]);
        e.target.value = '';
      }
    }
  };

  const removeEmail = (index) => {
    setEmails(prevEmails => prevEmails.filter((_, i) => i !== index));
  };


  React.useEffect(() => {
    setEmailList(emails);
  }, [emails, setEmailList]);

  return (
    <div className="email-list-container">
      <div className="email-list-section">
        <div
          className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => handleFileUpload(e.target.files[0])}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <div className="file-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 15.5l1.5-1.5L11 15.5V12h2v3.5l1.5-1.5L16 15.5 12 19l-4-3.5z"/>
            </svg>
          </div>
          <p>Drag and drop an Excel file here, or click to select</p>
        </div>

        {emails.length > 0 && (
          <ul className="email-list">
            {emails.map((email, index) => (
              <li key={index} className="email-item">
                <span>{email}</span>
                <button onClick={() => removeEmail(index)} className="remove-email">
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default EmailList;
