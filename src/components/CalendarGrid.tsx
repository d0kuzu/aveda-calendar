import { useState } from 'react';

interface CalendarGridProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

export const getWinnipegToday = (): Date => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Winnipeg',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return new Date(Number(map.year), Number(map.month) - 1, Number(map.day));
};

export const CalendarGrid: React.FC<CalendarGridProps> = ({ selectedDate, onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const today = getWinnipegToday();

  // Max bookable date: 5 days from today
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 5);

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  // Disable prev button if current month is the same as today's month
  const prevDisabled = year <= today.getFullYear() && month <= today.getMonth();
  // Disable next button if first day of next month is beyond maxDate
  const firstOfNextMonth = new Date(year, month + 1, 1);
  const nextDisabled = firstOfNextMonth > maxDate;

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const grid = [];
  let dayCounter = 1;
  let hasStarted = false;

  for (let row = 0; row < 6; row++) {
    const cells = [];
    for (let col = 0; col < 7; col++) {
      if (row === 0 && col === firstDay) {
        hasStarted = true;
      }
      if (hasStarted && dayCounter <= daysInMonth) {
        const date = new Date(year, month, dayCounter);
        const dayOfWeek = date.getDay();
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 1; // Sunday (0) and Monday (1) are days off
        const isPast = date < today;
        const isBeyondMax = date > maxDate;
        const isSelectable = !isPast && !isBeyondMax && !isWeekend;
        const isSelected = date.getTime() === selectedDate.getTime();
        const isInRange = isSelectable;

        const prevDay = new Date(year, month, dayCounter - 1);
        const isPrevInRange = prevDay >= today && prevDay <= maxDate && !(prevDay.getDay() === 0 || prevDay.getDay() === 1);
        const isRangeStart = isInRange && (!isPrevInRange || col === 0);

        const nextDay = new Date(year, month, dayCounter + 1);
        const isNextInRange = nextDay >= today && nextDay <= maxDate && !(nextDay.getDay() === 0 || nextDay.getDay() === 1);
        const isRangeEnd = isInRange && (!isNextInRange || col === 6);

        const tdClasses = [
          isInRange ? 'in-range' : '',
          isRangeStart ? 'range-start' : '',
          isRangeEnd ? 'range-end' : '',
        ].filter(Boolean).join(' ');
        
        cells.push(
          <td key={col} className={tdClasses}>
            <button
              className={`day-button ${isSelected ? 'selected' : ''}`}
              disabled={!isSelectable}
              onClick={() => onSelectDate(date)}
              aria-label={`${date.toDateString()}`}
            >
              {dayCounter}
            </button>
          </td>
        );
        dayCounter++;
      } else {
        cells.push(<td key={col}></td>);
      }
    }
    grid.push(<tr key={row}>{cells}</tr>);
    if (dayCounter > daysInMonth) break;
  }

  return (
    <div className="calendar-grid-container">
      <div className="calendar-controls">
        <div className="current-month">
          {monthNames[month]} {year}
        </div>
        <div className="nav-buttons">
          <button className="icon-button" onClick={prevMonth} disabled={prevDisabled} aria-label="Previous month">
            <span className="material-icons">chevron_left</span>
          </button>
          <button className="icon-button" onClick={nextMonth} disabled={nextDisabled} aria-label="Next month">
            <span className="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
      <table className="calendar-table">
        <thead>
          <tr>
            {daysOfWeek.map(day => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid}
        </tbody>
      </table>
    </div>
  );
};
