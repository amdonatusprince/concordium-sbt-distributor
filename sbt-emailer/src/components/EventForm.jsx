import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EventForm.css';

function EventForm({ setEventData }) {
  const [date, setDate] = useState(new Date());
  const [subject, setSubject] = useState('');
  const [awardType, setAwardType] = useState('');
  const [sbtAward, setSbtAward] = useState('');
  const [sponsor, setSponsor] = useState('');
  const [sponsorLink, setSponsorLink] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setEventData({ date, subject, awardType, sbtAward, sponsor, sponsorLink });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="date">Date of event</label>
        <DatePicker
          id="date"
          selected={date}
          onChange={(date) => setDate(date)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="subject">Email subject</label>
        <input
          type="text"
          id="subject"
          placeholder="Enter email subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="awardType">SBT award type</label>
        <select
          id="awardType"
          value={awardType}
          onChange={(e) => setAwardType(e.target.value)}
          className="form-control"
        >
          <option value="">Select award type</option>
          <option value="hackathon">Hackathon</option>
          <option value="education">Education</option>
          <option value="workshop">Workshop</option>
          <option value="work">Work</option>
          <option value="participation">Participation</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="sbtAward">SBT award title</label>
        <input
          type="text"
          id="sbtAward"
          placeholder="Enter award title"
          value={sbtAward}
          onChange={(e) => setSbtAward(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="sponsor">Sponsor</label>
        <input
          type="text"
          id="sponsor"
          placeholder="Enter sponsor"
          value={sponsor}
          onChange={(e) => setSponsor(e.target.value)}
          className="form-control"
        />
      </div>
      <div className="form-group">
        <label htmlFor="sponsorLink">Sponsor Link</label>
        <input
          type="text"
          id="sponsorLink"
          placeholder="Enter sponsor link"
          value={sponsorLink}
          onChange={(e) => setSponsorLink(e.target.value)}
          className="form-control"
        />
      </div>
    </form>
  );
}

export default EventForm;
