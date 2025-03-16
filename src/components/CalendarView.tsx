// ... other imports
import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/CalendarView.css";
import { fetchHolidays, fetchReminders, addReminder, updateReminder } from "../api";
import { Reminder, Holiday } from "../types";
import dayjs from "dayjs";
import EventFormModal from "./EventFormModal";

const CalendarView: React.FC = () => {
  // existing state declarations
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Reminder | null>(null);

  useEffect(() => {
    fetchHolidays().then((data) => setHolidays(data));
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const data = await fetchReminders();
    console.log("Fetched reminders after update:", data);
    setReminders(data);
  };

  // Check if a given date has a reminder.
  const dateHasReminder = (date: Date): boolean => {
    const dateString = dayjs(date).format("YYYY-MM-DD");
    return reminders.some((rem) => rem.startTime.substring(0, 10) === dateString);
  };

  // Get the holiday for a specific date, if any.
  const getHolidayForDate = (date: Date): Holiday | undefined => {
    const dateString = dayjs(date).format("YYYY-MM-DD");
    return holidays.find((hol) => hol.date === dateString);
  };

  // When a day (empty area) is clicked, open the modal for adding an event.
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null); // new event
    setModalOpen(true);
  };

  // When an event (reminder) is clicked, open the modal to edit it.
  const handleEventClick = (eventData: Reminder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(eventData);
    setModalOpen(true);
  };

  // tileContent: render both user reminders and holiday information.
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dayReminders = reminders.filter(
      (rem) => rem.startTime.substring(0, 10) === dayjs(date).format("YYYY-MM-DD")
    );
    const holiday = getHolidayForDate(date);

    return (
      <div className="tile-events">
        {holiday && (
          <div className="holiday-item">
            {holiday.localName || holiday.name}
          </div>
        )}
        {dayReminders.map((reminder) => (
          <div
            key={reminder.id}
            className="reminder-item"
            onClick={(e) => handleEventClick(reminder, e)}
          >
            {reminder.title}
          </div>
        ))}
      </div>
    );
  };

  // Handler for form submission.
  const handleFormSubmit = async (data: Reminder) => {
    try {
      if (editingEvent && editingEvent.id) {
        await updateReminder(editingEvent.id, data);
      } else {
        await addReminder(data);
      }
      await loadReminders();
    } catch (error) {
      console.error("Failed to add/update event", error);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: "1rem" }}>
      <Calendar
        onChange={(date) => setSelectedDate(date as Date)}
        value={selectedDate}
        tileContent={tileContent}
        onClickDay={(date) => handleDayClick(date)}
        tileClassName={({ date, view }) => {
          if (view === "month" && (getHolidayForDate(date) || dateHasReminder(date))) {
            return "has-event";
          }
          return null;
        }}
      />
      <p>Selected date: {selectedDate.toDateString()}</p>
      <EventFormModal
        open={modalOpen}
        initialData={
          editingEvent
            ? editingEvent
            : {
                title: "",
                description: "",
                startTime: dayjs(selectedDate).format("YYYY-MM-DD HH:mm:ss"),
                endTime: dayjs(selectedDate).add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
              }
        }
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
};

export default CalendarView;
