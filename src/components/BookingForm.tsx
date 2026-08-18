import { useState } from 'react';
import { bookSlot } from '../api';
import type { TimeSlot, BookingResponse } from '../api';

interface BookingFormProps {
  slot: TimeSlot;
  onBack: () => void;
}

/**
 * Normalizes and validates phone numbers.
 * Supports:
 * - 10 digits (e.g. 2045550199) -> +12045550199
 * - 11 digits starting with 1 (e.g. 12045550199) -> +12045550199
 * - Leading + with 1 + 10 digits (+12045550199) or international (10-15 digits)
 * Returns normalized E.164 format (+1XXXXXXXXXX) or null if invalid.
 */
export const normalizePhoneNumber = (raw: string): string | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (trimmed.startsWith('+')) {
    if (digits.startsWith('1')) {
      if (digits.length === 11) {
        return `+${digits}`;
      }
      return null;
    }
    if (digits.length >= 10 && digits.length <= 15) {
      return `+${digits}`;
    }
    return null;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  return null;
};

export const BookingForm: React.FC<BookingFormProps> = ({ slot, onBack }) => {
  // Read and validate ?client= query param for auto-filling phone
  const urlParams = new URLSearchParams(window.location.search);
  const rawClientParam = urlParams.get('client')?.trim() || '';
  const normalizedClientPhone = normalizePhoneNumber(rawClientParam);
  const hasValidClientParam = normalizedClientPhone !== null;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits, plus, spaces, hyphens, and parentheses
    const filtered = val.replace(/[^0-9+\s\-()]/g, '');
    setPhone(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let finalPhone: string;

    if (hasValidClientParam) {
      finalPhone = normalizedClientPhone;
    } else {
      const normalized = normalizePhoneNumber(phone);
      if (!normalized) {
        setError('Please enter a valid phone number (at least 10 digits).');
        return;
      }
      finalPhone = normalized;
    }
    
    setIsSubmitting(true);
    try {
      const response = await bookSlot({
        start_time: slot.start_time,
        end_time: slot.end_time,
        guest_name: name,
        guest_email: email,
        description: `Phone: ${finalPhone}`,
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
          <label className="form-label" htmlFor="name">Name *</label>
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
          <label className="form-label" htmlFor="email">Email *</label>
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

        {!hasValidClientParam && (
          <div className="form-group">
            <label className="form-label" htmlFor="phone">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              className="form-input"
              value={phone}
              onChange={handlePhoneChange}
              required
              placeholder="+1 (204) 555-0199"
            />
          </div>
        )}

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
