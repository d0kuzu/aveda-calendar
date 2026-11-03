import type { TimeSlot } from '../api';

interface TimeSlotPickerProps {
  date: Date;
  slots: TimeSlot[];
  isLoading: boolean;
  onSelectSlot: (slot: TimeSlot) => void;
}

export const formatSlotWallTime = (timeString: string): string => {
  // Parse wall-clock hour and minute directly from RFC3339 (e.g. "2026-11-03T11:00:00-05:00")
  // so client OS/browser tzdata differences never shift the displayed Winnipeg time.
  const match = timeString.match(/T(\d{2}):(\d{2})/);
  if (match) {
    const h24 = parseInt(match[1], 10);
    const m = match[2];
    const period = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 || 12;
    return `${h12}:${m} ${period}`;
  }
  const dateObj = new Date(timeString);
  return dateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Winnipeg',
  });
};

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ date, slots, isLoading, onSelectSlot }) => {
  const formattedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const formatTime = (timeString: string) => formatSlotWallTime(timeString);

  return (
    <div className="time-slots-container">
      <div className="time-slots-header">
        {formattedDate}
      </div>
      
      {isLoading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : slots.length === 0 ? (
        <div className="no-slots">
          No available times for this date.
        </div>
      ) : (
        <div className="time-slots-list">
          {slots.map((slot, index) => (
            <button
              key={index}
              className="time-slot-button"
              disabled={slot.available <= 0}
              onClick={() => onSelectSlot(slot)}
            >
              {formatTime(slot.start_time)}
              {slot.available <= 0 && ' (Full)'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
