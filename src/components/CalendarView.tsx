import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/CalendarView.css";
import {
  Grid,
  Box,
  Paper,
  Container,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";

import { fetchHolidays, fetchReminders, addReminder, updateReminder } from "../api";
import { Reminder, Holiday } from "../types";
import EventFormModal from "./EventFormModal";
import DaySchedule from "./DaySchedule";

const CalendarView: React.FC = () => {
  // We'll determine 'today' and 'one year from today' once, upon component mount
  const today = new Date();
  const oneYearFromToday = dayjs(today).add(1, "year").toDate();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<Reminder | null>(null);

  useEffect(() => {
    fetchHolidays().then((data) => setHolidays(data));
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await fetchReminders();
      setReminders(data);
    } catch (error) {
      console.error("Failed to fetch reminders", error);
    }
  };

  const getRemindersForDate = (date: Date) => {
    const dateString = dayjs(date).format("YYYY-MM-DD");
    return reminders.filter(
      (rem) => rem.startTime.substring(0, 10) === dateString
    );
  };

  const getHolidayForDate = (date: Date) => {
    const dateString = dayjs(date).format("YYYY-MM-DD");
    return holidays.find((hol) => hol.date === dateString);
  };

  //so long because react-calendar style css is not working properly
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";
  
    const todayStart = dayjs().startOf("day").toDate();
  
  if (dayjs(date).isSame(todayStart, "day")) {
    return "today-tile";
  }
    const oneYearFromToday = dayjs(today).add(1, "year").toDate();
  
    const isPastDate = date < today;
    const isOutOfRange = date > oneYearFromToday;
    const hasReminders = getRemindersForDate(date).length > 0;
    const hasHoliday = !!getHolidayForDate(date);
  
    if (isPastDate || isOutOfRange) return "disabled-tile";
    if (hasReminders || hasHoliday) return "has-event";
  
    return "";
  };
  

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
    const holiday = getHolidayForDate(date);
    const dayReminders = getRemindersForDate(date);

    return (
      <div className="tile-events">
        {holiday && (
          <div className="holiday-item">
            {holiday.localName || holiday.name}
          </div>
        )}
        {dayReminders.length > 0 && (
          <div className="reminders-list">
            {dayReminders.map((rem) => (
              <div key={rem.id} className="reminder-item">
                {rem.title}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Called when user clicks on a day in the calendar
  const handleDayClick = (date: Date) => {
    // If date is out of range, do nothing
    if (date < today || date > oneYearFromToday) return;
    setSelectedDate(date);
  };

  // Called when user clicks an hour slot in DaySchedule
  const handleAddReminder = (hour: number) => {
    if (!selectedDate) return;
    // Double check the date is within allowed range
    if (selectedDate < today || selectedDate > oneYearFromToday) return;

    const start = dayjs(selectedDate).hour(hour).minute(0).second(0);
    const end = start.add(1, "hour");

    setEditingEvent({
      id: undefined,
      title: "",
      description: "",
      startTime: start.format("YYYY-MM-DD HH:mm:ss"),
      endTime: end.format("YYYY-MM-DD HH:mm:ss"),
    });
    setModalOpen(true);
  };

  // Called when user clicks an existing reminder in DaySchedule
  const handleEditReminder = (rem: Reminder) => {
    if (!selectedDate) return;

    const holiday = getHolidayForDate(selectedDate);
    // If this reminder matches a holiday name, skip editing (our rule)
    if (holiday && rem.title === (holiday.localName || holiday.name)) {
      return;
    }
    setEditingEvent(rem);
    setModalOpen(true);
  };

  // Called when user submits the modal form
  const handleFormSubmit = async (data: Reminder) => {
    try {
      if (data.id) {
        await updateReminder(data.id, data);
      } else {
        await addReminder(data);
      }
      await loadReminders();
    } catch (error) {
      console.error("Failed to add/update event", error);
    }
  };

  // Called when user clicks the close button on the schedule panel
  const handleCloseSchedule = () => {
    setSelectedDate(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              height: 600,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Calendar
              showNeighboringMonth={false}
              onChange={(date) => setSelectedDate(date as Date)}
              value={selectedDate || new Date()}
              tileClassName={tileClassName}
              tileContent={tileContent}
              onClickDay={handleDayClick}
              // Restrict browsing to [today, today+1 year]
              minDate={today}
              maxDate={oneYearFromToday}
            />
          </Paper>
        </Grid>

        {selectedDate && (
          <Grid item xs={12} md={4}>
            <Paper
              sx={{
                height: 600,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <IconButton
                onClick={handleCloseSchedule}
                sx={{ position: "absolute", top: 8, right: 8, zIndex: 2 }}
              >
                <CloseIcon />
              </IconButton>
              <Box sx={{ overflowY: "auto", flexGrow: 1, pt: 4, px: 2, pb: 2 }}>
                <DaySchedule
                  selectedDate={selectedDate}
                  reminders={getRemindersForDate(selectedDate)}
                  holiday={getHolidayForDate(selectedDate)}
                  onAddReminder={handleAddReminder}
                  onEditReminder={handleEditReminder}
                />
              </Box>
            </Paper>
          </Grid>
        )}
      </Grid>

      <EventFormModal
        open={modalOpen}
        initialData={editingEvent || undefined}
        onClose={() => setModalOpen(false)}
        onSubmit={(remData) => {
          setModalOpen(false);
          handleFormSubmit(remData);
        }}
        onDeleteSuccess={loadReminders}
      />
    </Container>
  );
};

export default CalendarView;
