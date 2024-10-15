"use client";
import { Field } from "formik";
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";

interface Emaillist {
  setEmailList: React.Dispatch<React.SetStateAction<string[]>>;
  emailList: string[];
}

const EmailList = ({ setEmailList, emailList }: Emaillist) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [subject, setLocalSubject] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const emailsPerPage = 10;
  // const fileInputRef = useRef(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileInput = e.target;
    const file = e.target.files && e.target.files[0];
    if (file && e.target) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const allemailList = json
          .flat()
          .filter(
            (email) => typeof email === "string" && email.includes("@")
          ) as string[];

        setEmailList((prevEmail) => {
          const newEmails = [...prevEmail, ...allemailList]; // Spread the array
          return newEmails;
        });

        // Reset the input value here to allow re-uploading the same file
        fileInput.value = "";
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setEmailList((prevEmails) => {
      const newEmails = prevEmails.filter((email) => email !== emailToRemove);
      // setEmailList(newEmails);
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
        <label
          htmlFor="emailInput"
          className="block text-[16px] font-medium text-gray-700"
        >
          Add Email
        </label>
        <div className="flex items-center mt-2 gap-3">
          <Field
            type="email"
            name="emailInput"
            id="emailInput"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmailInput(e.target.value)
            }
            required
            className="border border-gray-300 w-full p-2 rounded-md outline-none"
            placeholder="Enter email and press Enter"
          />
          <button
            type="button"
            onClick={() => {
              if (emailInput && !emails.includes(emailInput)) {
                setEmailList((prevEmails) => {
                  const newEmails = [...prevEmails, emailInput];
                  // setEmailList(newEmails);
                  return newEmails;
                });
              }
            }}
            className="border w-[200px] p-2 rounded-md bg-blue-500 text-white font-normal "
          >
            Add email
          </button>
        </div>
      </div>
      <div>
        <label
          htmlFor="fileUpload"
          className="block text-sm font-medium text-gray-700"
        >
          Upload Email List
        </label>
        <input
          type="file"
          id="fileUpload"
          // ref={fileInputRef}
          onChange={(e) => handleFileUpload(e)}
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
      {emailList.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700">Email List:</h3>
          <ul className="mt-2 border border-gray-200 rounded-md divide-y divide-gray-200">
            {emailList.map((email, index) => (
              <li
                key={index}
                className="pl-3 pr-4 py-3 flex items-center justify-between text-sm"
              >
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
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {pageNumbers}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, pageNumbers))
              }
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
