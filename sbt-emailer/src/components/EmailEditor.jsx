import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles

function EmailEditor({ setEmailContent, setEmailSubject }) {
  const [editorHtml, setEditorHtml] = useState('');
  const [subject, setSubject] = useState('');

  const handleContentChange = (html) => {
    setEditorHtml(html);
    setEmailContent(html);
  };

  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setEmailSubject(e.target.value);
  };

  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
       {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image'
  ];

  return (
    <div className="email-editor">
        <input
        type="text"
        value={subject}
        onChange={handleSubjectChange}
        placeholder="Enter email subject"
        className="email-subject"
      />
      <ReactQuill 
        theme="snow"
        onChange={handleContentChange}
        value={editorHtml}
        modules={modules}
        formats={formats}
        bounds={'.app'}
        placeholder="Compose your email here..."
      />
    </div>
  );
}

export default EmailEditor;
