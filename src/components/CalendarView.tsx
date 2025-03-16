import React, { useEffect, useState } from 'react';
import {
  fetchReminders,
  fetchHolidays,
  deleteReminder,
} from '../api';
import { Reminder, Holiday } from '../types';
import { Box, Typography, Card, CardContent, Button, List, ListItem } from '@mui/material';
import AddReminderForm from './AddReminderForm';

const CalendarView: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  // Fetch holidays once on mount
  useEffect(() => {
    fetchHolidays()
      .then((data) => setHolidays(data))
      .catch((error) => console.error("Error fetching holidays:", error));
  }, []);

  // Fetch reminders once on mount
  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const data = await fetchReminders();
      setReminders(data);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    try {
      await deleteReminder(id);
      await loadReminders(); // Refresh the list
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", p: 2 }}>
      <Typography variant="h4" gutterBottom>
        Calendar View
      </Typography>

      {/* Holidays */}
      <Typography variant="h6" mt={4}>
        Lithuanian Holidays
      </Typography>
      <List>
        {holidays.map((holiday) => (
          <ListItem key={holiday.date}>
            {holiday.localName} ({holiday.date})
          </ListItem>
        ))}
      </List>

      {/* Reminders */}
      <Typography variant="h6" mt={4}>
        Your Reminders
      </Typography>
      <List>
        {reminders.map((reminder) => (
          <ListItem key={reminder.id}>
            <Card sx={{ width: "100%" }}>
              <CardContent>
                <Typography variant="h6">{reminder.title}</Typography>
                <Typography>Description: {reminder.description}</Typography>
                <Typography>Start Time: {reminder.startTime}</Typography>
                <Button
                  variant="contained"
                  color="error"
                  sx={{ mt: 1 }}
                  onClick={() => handleDelete(reminder.id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>

      <AddReminderForm onAdd={loadReminders} />
    </Box>
  );
};

export default CalendarView;
