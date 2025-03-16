import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { fetchHolidays, fetchReminders } from "../api"; 
import { Reminder, Holiday } from "../types";
import "../styles/Calendar.css";
import dayjs from "dayjs";

const MyCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    fetchHolidays().then((data) => setHolidays(data));
    fetchReminders().then((data) => setReminders(data));
  }, []);

  const dateHasEvent = (date: Date): boolean => {
    const dateString = dayjs(date).format("YYYY-MM-DD")

    const holidayMatch = holidays.some(
      (hol) => hol.date === dateString
    );

    const reminderMatch = reminders.some((rem) => {
      const remDate = dayjs(rem.startTime, "YYYY-MM-DD HH:mm:ss").format("YYYY-MM-DD");
      return remDate === dateString;
    });

    return holidayMatch || reminderMatch;
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <Calendar
        onChange={(date) => setSelectedDate(date as Date)}
        value={selectedDate}
        tileContent={({ date, view }) => {
          if (view === "month") {
            const dateStr = dayjs(date).format("YYYY-MM-DD")
            const holiday = holidays.find((h) => h.date === dateStr);
            const reminder = reminders.find((r) => r.startTime.split("T")[0] === dateStr);

            return (
              <div style={{ fontSize: "0.7rem", textAlign: "center", color: "red" }}>
                {holiday ? "Holiday" : ""}
                {reminder ? " • Reminder" : ""}
              </div>
            );
          }
          return null;
        }}
      />
      <p>Selected date: {selectedDate.toDateString()}</p>
    </div>
  );
};

export default MyCalendar;
