import type { TimeSlot } from '../api';

interface TimeSlotPickerProps {
  date: Date;
  slots: TimeSlot[];
  isLoading: boolean;
  onSelectSlot: (slot: TimeSlot) => void;
}

export const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({ date, slots, isLoading, onSelectSlot }) => {
  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const formatTime = (timeString: string) => {
    const dateObj = new Date(timeString);
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/Winnipeg',
    });
  };

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
