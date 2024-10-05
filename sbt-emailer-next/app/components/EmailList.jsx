import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const EmailList = ({ setEmailList, setSubject }) => {
  const [emails, setEmails] = useState([]);
  const [subject, setLocalSubject] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 10;
  const fileInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const emailList = json.flat().filter((email) => typeof email === 'string' && email.includes('@'));
        
        setEmails((prevEmails) => {
          const newEmails = [...new Set([...prevEmails, ...emailList])];
          setEmailList(newEmails);
          return newEmails;
        });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleEmailInput = (e) => {
    if (e.key === 'Enter' && emailInputRef.current) {
      const email = emailInputRef.current.value.trim();
      if (email && !emails.includes(email)) {
        setEmails((prevEmails) => {
          const newEmails = [...prevEmails, email];
          setEmailList(newEmails);
          return newEmails;
        });
        emailInputRef.current.value = '';
      }
    }
  };

  const handleSubjectChange = (e) => {
    setLocalSubject(e.target.value);
    setSubject(e.target.value);
  };

  const removeEmail = (emailToRemove) => {
    setEmails((prevEmails) => {
      const newEmails = prevEmails.filter(email => email !== emailToRemove);
      setEmailList(newEmails);
      return newEmails;
    });
  };

  const indexOfLastEmail = currentPage * emailsPerPage;
  const indexOfFirstEmail = indexOfLastEmail - emailsPerPage;
  const currentEmails = emails.slice(indexOfFirstEmail, indexOfLastEmail);

  const pageNumbers = Math.ceil(emails.length / emailsPerPage);

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="emailInput" className="block text-sm font-medium text-gray-700">Add Email</label>
        <input
          type="email"
          id="emailInput"
          ref={emailInputRef}
          onKeyPress={handleEmailInput}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 placeholder-gray-400 border border-gray-300"
          placeholder="Enter email and press Enter"
        />
      </div>
      <div>
        <label htmlFor="fileUpload" className="block text-sm font-medium text-gray-700">Upload Email List</label>
        <input
          type="file"
          id="fileUpload"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx,.xls,.csv"
          className="mt-1 block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-indigo-50 file:text-indigo-700
            hover:file:bg-indigo-100
            border border-gray-300 rounded-md"
        />
      </div>
      {emails.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Email List:</h3>
          <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
            {currentEmails.map((email, index) => (
              <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                <div className="w-0 flex-1 flex items-center">
                  <span className="ml-2 flex-1 w-0 truncate">{email}</span>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => removeEmail(email)}
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {pageNumbers}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, pageNumbers))}
              disabled={currentPage === pageNumbers}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailList;