// src/components/EventFormModal.tsx
import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { Reminder } from "../types";
import dayjs from "dayjs";

interface EventFormModalProps {
  open: boolean;
  initialData?: Reminder; // for editing; if undefined, it’s for adding
  onClose: () => void;
  onSubmit: (data: Reminder) => void;
}

// Validation schema using Yup
const EventSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  startTime: Yup.date().required("Start time is required"),
  endTime: Yup.date().required("End time is required"),
});

const EventFormModal: React.FC<EventFormModalProps> = ({ open, initialData, onClose, onSubmit }) => {
  const initialValues: Reminder = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    startTime: initialData?.startTime || dayjs().format("YYYY-MM-DD HH:mm:ss"),
    endTime: initialData?.endTime || dayjs().add(1, "hour").format("YYYY-MM-DD HH:mm:ss"),
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? "Edit Event" : "Add New Event"}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={EventSchema}
        onSubmit={(values, { setSubmitting }) => {
          onSubmit(values);
          setSubmitting(false);
          onClose();
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur }) => (
          <Form>
            <DialogContent dividers>
              <TextField
                autoFocus
                margin="dense"
                id="title"
                name="title"
                label="Title"
                type="text"
                fullWidth
                value={values.title}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.title && Boolean(errors.title)}
                helperText={touched.title && errors.title}
              />
              <TextField
                margin="dense"
                id="description"
                name="description"
                label="Description"
                type="text"
                fullWidth
                multiline
                rows={3}
                value={values.description}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.description && Boolean(errors.description)}
                helperText={touched.description && errors.description}
              />
              <TextField
                margin="dense"
                id="startTime"
                name="startTime"
                label="Start Time"
                type="datetime-local"
                fullWidth
                value={dayjs(values.startTime).format("YYYY-MM-DD HH:mm")}
                onChange={(e) => {
                  // Convert the local input value back to our string format
                  const dateVal = dayjs(e.target.value).format("YYYY-MM-DD HH:mm:ss");
                  handleChange({ target: { name: "startTime", value: dateVal } });
                }}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                margin="dense"
                id="endTime"
                name="endTime"
                label="End Time"
                type="datetime-local"
                fullWidth
                value={dayjs(values.endTime).format("YYYY-MM-DD HH:mm")}
                onChange={(e) => {
                  const dateVal = dayjs(e.target.value).format("YYYY-MM-DD HH:mm:ss");
                  handleChange({ target: { name: "endTime", value: dateVal } });
                }}
                InputLabelProps={{ shrink: true }}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="secondary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {initialData ? "Save Changes" : "Add Event"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default EventFormModal;
