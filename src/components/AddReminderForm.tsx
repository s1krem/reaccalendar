import React from "react";
import { Formik, Form, Field } from 'formik';
import { Box, Button, TextField } from '@mui/material';
import * as Yup from 'yup';
import { addReminder } from '../api';
import { Reminder } from '../types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const ReminderSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  startTime: Yup.date().required("Start time is required"),
});

interface AddReminderFormProps {
  onAdd: () => void; 
}

const AddReminderForm: React.FC<AddReminderFormProps> = ({ onAdd }) => {
  return (
    <Formik
      initialValues={{
        title: "",
        description: "",
        startTime: new Date(),
      }}
      validationSchema={ReminderSchema}
      onSubmit={async (values, { resetForm }) => {
        try {
          // Convert Date object to ISO string
          const reminderData: Reminder = {
            title: values.title,
            description: values.description,
            startTime: values.startTime.toISOString(),
            endTime: values.startTime.toISOString(),
          };
          await addReminder(reminderData);
          onAdd();       // Refresh parent reminder list
          resetForm();   // Clear form
        } catch (error) {
          console.error("Error adding reminder:", error);
        }
      }}
    >
      {({ values, errors, touched, setFieldValue, handleChange, handleSubmit }) => (
        <Form onSubmit={handleSubmit}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 4 }}>
            <TextField
              label="Title"
              name="title"
              value={values.title}
              onChange={handleChange}
              error={touched.title && Boolean(errors.title)}
              helperText={touched.title && errors.title}
            />

            <TextField
              label="Description"
              name="description"
              value={values.description}
              onChange={handleChange}
              error={touched.description && Boolean(errors.description)}
              helperText={touched.description && errors.description}
            />

            {/* React DatePicker for startTime */}
            <DatePicker
              selected={values.startTime}
              onChange={(date) => setFieldValue("startTime", date)}
              showTimeSelect
              dateFormat="Pp"
            />
            {touched.startTime && errors.startTime && (
              <div style={{ color: "red" }}>{String(errors.startTime)}</div>
            )}

            <Button variant="contained" color="primary" type="submit">
              Add Reminder
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default AddReminderForm;
