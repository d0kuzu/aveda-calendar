export interface TimeSlot {
  start_time: string;
  end_time: string;
  booked: number;
  available: number;
}

export interface SlotsResponse {
  date: string;
  slots: TimeSlot[];
}

export interface BookingData {
  start_time: string;
  end_time: string;
  guest_name?: string;
  guest_email?: string;
  description?: string;
  title?: string;
}

export interface BookingResponse {
  message: string;
  google_event_id?: string;
  transparency?: string;
  booked?: number;
  max_capacity?: number;
  error?: string;
}

const API_BASE_URL = 'https://api.zerde.co/diaxel';

// In Vite, env variables are accessed via import.meta.env
// The backend requires the secret. For security, we should configure this via .env
// We'll read from VITE_CALENDAR_SECRET
const getSecret = () => import.meta.env.VITE_CALENDAR_SECRET || '';

export const fetchSlots = async (date: string): Promise<TimeSlot[]> => {
  const url = new URL(`${API_BASE_URL}/google/calendar/slots`);
  url.searchParams.append('date', date);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'X-Aveda-Calendar-Secret': getSecret(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching slots: ${response.statusText}`);
  }

  const data: SlotsResponse = await response.json();
  return data.slots || [];
};

export const bookSlot = async (bookingData: BookingData): Promise<BookingResponse> => {
  const url = `${API_BASE_URL}/google/calendar/book`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'X-Aveda-Calendar-Secret': getSecret(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Error booking slot: ${response.statusText}`);
  }

  return data;
};
