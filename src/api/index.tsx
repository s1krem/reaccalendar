import axios from "axios";
import { Reminder, Holiday } from "../types";

const REMINDERS_API_URL = "http://localhost:8080/reminders";
const HOLIDAYS_API_URL = "https://date.nager.at/api/v3/PublicHolidays/2025/LT";

export const fetchReminders = async (): Promise<Reminder[]> => {
  const response = await axios.get<Reminder[]>(REMINDERS_API_URL);
  return response.data;
};

export const addReminder = async (reminder: Reminder): Promise<Reminder> => {
  const response = await axios.post<Reminder>(REMINDERS_API_URL, reminder);
  return response.data;
};

export const updateReminder = async (id: number, reminder: Reminder) => {
  await axios.put(`${REMINDERS_API_URL}/${id}`, reminder);
};

export const deleteReminder = async (id: number) => {
  await axios.delete(`${REMINDERS_API_URL}/${id}`);
};

export const fetchHolidays = async (): Promise<Holiday[]> => {
  const response = await axios.get<Holiday[]>(HOLIDAYS_API_URL);
  return response.data;
};
