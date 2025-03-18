import React, { useEffect, useRef } from "react";
import { Box, Typography, Paper } from "@mui/material";
import dayjs from "dayjs";
import { Reminder, Holiday } from "../types";
import "../styles/DaySchedule.css";

interface DayScheduleProps {
  selectedDate: Date;
  reminders: Reminder[];
  holiday?: Holiday;
  onAddReminder: (hour: number) => void;
  onEditReminder: (rem: Reminder) => void;
}

const hoursInDay = Array.from({ length: 24 }, (_, i) => i);

const DaySchedule: React.FC<DayScheduleProps> = ({
  selectedDate,
  reminders,
  holiday,
  onAddReminder,
  onEditReminder,
}) => {
  const scheduleRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to ~8 AM
  useEffect(() => {
    if (scheduleRef.current) {
      scheduleRef.current.scrollTop = 8 * 50; // each hour ~50px tall
    }
  }, [selectedDate]);

  return (
    <Paper className="day-schedule" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box className="day-schedule-header">
        <Typography variant="h6" className="day-schedule-title">
          {dayjs(selectedDate).format("dddd, MMM D, YYYY")}
        </Typography>
        {holiday && (
          <Box className="day-schedule-holiday">
            <Typography variant="body1" sx={{ fontWeight: "bold" }}>
              {holiday.localName || holiday.name} (All Day)
            </Typography>
            <Typography variant="body2">
              National Holiday.
            </Typography>
          </Box>
        )}
      </Box>

      <Box ref={scheduleRef} sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        {hoursInDay.map((hour) => {

          const hourReminders = reminders.filter((rem) => {
            const startHour = dayjs(rem.startTime).hour();
            return startHour === hour;
          });

          return (
            <Box
              key={hour}
              className="day-schedule-hour"
              onClick={() => onAddReminder(hour)}
            >
              <Typography variant="subtitle2" className="hour-label">
                {hour}:00
              </Typography>
              {hourReminders.map((rem) => (
                <Box
                  key={rem.id}
                  className="day-schedule-reminder"
                  onClick={(e) => {
                    e.stopPropagation(); // avoid triggering onAddReminder
                    onEditReminder(rem);
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                    {dayjs(rem.startTime).format("HH:mm")} - {rem.title}
                  </Typography>
                  <Typography variant="caption">{rem.description}</Typography>
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default DaySchedule;
