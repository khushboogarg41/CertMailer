import React, { useState } from 'react';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [fullNameColumn, setFullNameColumn] = useState('');
  const [courseColumn, setCourseColumn] = useState('');
  const [percentageColumn, setPercentageColumn] = useState('');
  const [emailColumn, setEmailColumn] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fullNameColumn', fullNameColumn);
    formData.append('courseColumn', courseColumn);
    formData.append('percentageColumn', percentageColumn);
    formData.append('emailColumn', emailColumn);

    try {
      const response = await axios.post('/api/upload', formData);
      alert('Certificates are being generated and sent!');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div>
      <h1>Upload Excel File</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} required />
        <input
          type="text"
          placeholder="Full Name Column"
          value={fullNameColumn}
          onChange={(e) => setFullNameColumn(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Course Column"
          value={courseColumn}
          onChange={(e) => setCourseColumn(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Percentage Column"
          value={percentageColumn}
          onChange={(e) => setPercentageColumn(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Email Column"
          value={emailColumn}
          onChange={(e) => setEmailColumn(e.target.value)}
          required
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default FileUpload;
