import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CalendarGrid } from './components/CalendarGrid';
import { TimeSlotPicker } from './components/TimeSlotPicker';
import { BookingForm } from './components/BookingForm';
import { fetchSlots } from './api';
import type { TimeSlot } from './api';

function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Load slots when date changes
  useEffect(() => {
    const loadSlots = async () => {
      setIsLoadingSlots(true);
      setSelectedSlot(null); // Reset selected slot when date changes
      try {
        // Format date as YYYY-MM-DD
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        
        const data = await fetchSlots(dateString);
        setSlots(data);
      } catch (error) {
        console.error("Failed to fetch slots:", error);
        setSlots([]); // Default to empty on error
      } finally {
        setIsLoadingSlots(false);
      }
    };

    loadSlots();
  }, [selectedDate]);

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        {!selectedSlot ? (
          <>
            <div className="content-header">
              <h2>Select a Date & Time</h2>
              <div className="timezone-info">
                Central Time - Winnipeg
              </div>
            </div>
            <div className="calendar-wrapper">
              <CalendarGrid
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
              <TimeSlotPicker
                date={selectedDate}
                slots={slots}
                isLoading={isLoadingSlots}
                onSelectSlot={setSelectedSlot}
              />
            </div>
          </>
        ) : (
          <BookingForm 
            slot={selectedSlot} 
            onBack={() => setSelectedSlot(null)} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
