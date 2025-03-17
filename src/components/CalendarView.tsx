import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import dayjs from "dayjs";
import "react-calendar/dist/Calendar.css";
import "../styles/CalendarView.css";
import { fetchHolidays, fetchReminders, addReminder, updateReminder } from "../api";
import { Reminder, Holiday } from "../types";
import EventFormModal from "./EventFormModal";

import {AppBar, Toolbar, Typography, Container, Paper, Box, Button,} from "@mui/material";

const CalendarView: React.FC = () => {
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
    setReminders(data);
  };

  const dateHasReminder = (date: Date): boolean => {
    const dateString = dayjs(date).format("YYYY-MM-DD");
    return reminders.some((rem) => rem.startTime.substring(0, 10) === dateString);
  };

  const getHolidayForDate = (date: Date): Holiday | undefined => {
    const dateString = dayjs(date).format("YYYY-MM-DD");
    return holidays.find((hol) => hol.date === dateString);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingEvent(null); 
    setModalOpen(true);
  };

  const handleEventClick = (eventData: Reminder, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingEvent(eventData);
    setModalOpen(true);
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
  
    const dayReminders = reminders.filter(
      (rem) => rem.startTime.substring(0, 10) === dayjs(date).format("YYYY-MM-DD")
    );
    const holiday = getHolidayForDate(date);
  
    return (
      <div className="tile-events">
        {/* Show holiday name if needed (can keep as-is or also make it smaller) */}
        {holiday && (
          <div className="holiday-item">
            {holiday.localName || holiday.name}
          </div>
        )}
  
        {/* Instead of listing all reminders, just show a small colored pill for each */}
        {dayReminders.map((reminder, index) => (
          <div
            key={reminder.id}
            className="reminder-pill"
            onClick={(e) => handleEventClick(reminder, e)}
          >
            {/* You could show an icon or a short label. Example: first 5 chars of title */}
            {reminder.title.slice(0, 5)}…
          </div>
        ))}
      </div>
    );
  };
  

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === "month" && (getHolidayForDate(date) || dateHasReminder(date))) {
      return "has-event";
    }
    return null;
  };

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

  // Optional: custom navigation example
  // If you want to hide the default react-calendar navigation and replace it with MUI icons:
  //   <Calendar
  //     ...
  //     showNavigation={false}
  //   />
  // Then create your own "previous month" / "next month" handlers using dayjs or react-calendar's onActiveStartDateChange

  return (
    <>
      {/* Top AppBar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            My Professional Calendar
          </Typography>

          <Button color="inherit" onClick={() => setSelectedDate(new Date())}>
            Today
          </Button>
        </Toolbar>
      </AppBar>

      {/* Main Content Container */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 2 }}>
          <Calendar
            onChange={(date) => setSelectedDate(date as Date)}
            value={selectedDate}
            onClickDay={handleDayClick}
            tileContent={tileContent}
            tileClassName={tileClassName}
            // showNavigation={false} // Uncomment if using a custom navigation
          />
        </Paper>

        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Typography variant="subtitle1">
            Selected date: {selectedDate.toDateString()}
          </Typography>
        </Box>
      </Container>

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
    </>
  );
};

export default CalendarView;
