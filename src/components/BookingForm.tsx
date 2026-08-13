import { useState } from 'react';
import { bookSlot } from '../api';
import type { TimeSlot, BookingResponse } from '../api';

interface BookingFormProps {
  slot: TimeSlot;
  onBack: () => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ slot, onBack }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<BookingResponse | null>(null);

  const formatTimeRange = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    const dateStr = startDate.toLocaleDateString('en-US', {
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      timeZone: 'America/Winnipeg',
    });
    
    const timeOptions: Intl.DateTimeFormatOptions = { 
      hour: 'numeric', 
      minute: '2-digit',
      timeZone: 'America/Winnipeg',
    };
    const startTimeStr = startDate.toLocaleTimeString('en-US', timeOptions);
    const endTimeStr = endDate.toLocaleTimeString('en-US', timeOptions);
    
    return `${dateStr} ⋅ ${startTimeStr} – ${endTimeStr}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await bookSlot({
        start_time: slot.start_time,
        end_time: slot.end_time,
        guest_name: name,
        guest_email: email,
        description: description,
      });
      setSuccessData(response);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="success-message">
        <div className="material-icons success-icon">check_circle</div>
        <h2 className="success-title">Booking Confirmed</h2>
        <p className="success-text">
          You are scheduled for the Aveda Campus Tour.
          <br />
          {formatTimeRange(slot.start_time, slot.end_time)}
        </p>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="booking-form">
      <div className="form-header">
        <button className="back-button" onClick={onBack} aria-label="Go back">
          <span className="material-icons">arrow_back</span>
        </button>
        <div style={{color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 500}}>
          {formatTimeRange(slot.start_time, slot.end_time)}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            className="form-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="John Doe"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            className="form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="john@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="description">Phone number / Additional info</label>
          <textarea
            id="description"
            className="form-textarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="+1 234 567 8900"
          ></textarea>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Booking...' : 'Book'}
          </button>
        </div>
      </form>
    </div>
  );
};
