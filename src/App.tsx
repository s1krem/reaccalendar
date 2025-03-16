import React, { useState } from "react";
import Calendar from "./components/CalendarView";
import EventFormModal from "./components/EventFormModal";
import { addReminder } from "./api";

function App() {
  const [modalOpen, setModalOpen] = useState<boolean>(true);

  const handleClose = () => {
    console.log("closed");
    setModalOpen(false);
  };

  const handleSubmit = async (data: any) => {
    try {
      const newEvent = await addReminder(data);
      console.log("Event added:", newEvent);
      // Here, you should also update your local state so the Calendar view can refresh.
      // For example, if your Calendar component holds reminders in state,
      // you can trigger a re-fetch of reminders after adding the event.
    } catch (error) {
      console.error("Failed to add event", error);
    }
    setModalOpen(false); // close the modal after submission
  };

  return (
    <div>
      <Calendar />
      <EventFormModal 
        open={false} 
        onClose={handleClose} 
        onSubmit={handleSubmit} 
      />
    </div>
  );
}

export default App;
