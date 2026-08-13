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

const getSecret = () => import.meta.env.VITE_CALENDAR_SECRET || '';

// ─── Generic logger ───────────────────────────────────────────────────────────
const log = {
  request: (method: string, url: string, body?: unknown) => {
    console.group(`%c[API] ▶ ${method} ${url}`, 'color: #1a73e8; font-weight: bold;');
    if (body) console.log('Body:', body);
    console.groupEnd();
  },
  response: (method: string, url: string, status: number, data: unknown) => {
    const ok = status >= 200 && status < 300;
    const style = ok
      ? 'color: #1e8e3e; font-weight: bold;'
      : 'color: #d93025; font-weight: bold;';
    console.group(`%c[API] ◀ ${status} ${method} ${url}`, style);
    console.log('Response:', data);
    console.groupEnd();
  },
  error: (method: string, url: string, err: unknown) => {
    console.group(`%c[API] ✖ ${method} ${url}`, 'color: #d93025; font-weight: bold;');
    console.error('Error:', err);
    console.groupEnd();
  },
};
// ─────────────────────────────────────────────────────────────────────────────

export const fetchSlots = async (date: string): Promise<TimeSlot[]> => {
  const url = new URL(`${API_BASE_URL}/google/calendar/slots`);
  url.searchParams.append('date', date);
  const urlStr = url.toString();

  log.request('GET', urlStr);

  let response: Response;
  try {
    response = await fetch(urlStr, {
      method: 'GET',
      headers: {
        'X-Aveda-Calendar-Secret': getSecret(),
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    log.error('GET', urlStr, err);
    throw err;
  }

  const data: SlotsResponse = await response.json();
  log.response('GET', urlStr, response.status, data);

  if (!response.ok) {
    throw new Error(`Error fetching slots: ${response.statusText}`);
  }

  return data.slots || [];
};

export const bookSlot = async (bookingData: BookingData): Promise<BookingResponse> => {
  const url = `${API_BASE_URL}/google/calendar/book`;

  log.request('POST', url, bookingData);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Aveda-Calendar-Secret': getSecret(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
  } catch (err) {
    log.error('POST', url, err);
    throw err;
  }

  const data = await response.json();
  log.response('POST', url, response.status, data);

  if (!response.ok) {
    throw new Error(data.error || `Error booking slot: ${response.statusText}`);
  }

  return data;
};
