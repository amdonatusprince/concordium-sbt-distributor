import React from 'react';

const EventForm = ({ setEventData }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    setEventData(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="eventName" className="block text-sm font-medium text-gray-700">SBT Title</label>
        <input 
          type="text" 
          id="eventName" 
          name="eventName" 
          required 
          placeholder="Enter SBT title"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 placeholder-gray-400 border border-gray-300"
        />
      </div>
      <div>
        <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700">Event Date</label>
        <input 
          type="date" 
          id="eventDate" 
          name="eventDate" 
          required 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 border border-gray-300"
        />
      </div>
      <div>
        <label htmlFor="sponsor" className="block text-sm font-medium text-gray-700">Sponsor</label>
        <input 
          type="text" 
          id="sponsor" 
          name="sponsor" 
          required 
          placeholder="Enter sponsor name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 placeholder-gray-400 border border-gray-300"
        />
      </div>
      <div>
        <label htmlFor="sponsorLink" className="block text-sm font-medium text-gray-700">Sponsor Link</label>
        <input 
          type="url" 
          id="sponsorLink" 
          name="sponsorLink" 
          required 
          placeholder="https://example.com"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 placeholder-gray-400 border border-gray-300"
        />
      </div>
      <div>
        <label htmlFor="sbtAwardType" className="block text-sm font-medium text-gray-700">SBT Award Type</label>
        <select 
          id="sbtAwardType" 
          name="sbtAwardType" 
          required 
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 border border-gray-300"
        >
          <option value="">Select award type</option>
          <option value="hackathon">Hackathon</option>
          <option value="education">Education</option>
          <option value="workshop">Workshop</option>
          <option value="work">Work</option>
          <option value="participation">Participation</option>
        </select>
      </div>
    </form>
  );
};

export default EventForm;
