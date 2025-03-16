import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import { Reminder } from "../types";

interface EventFormModalProps {
  open: boolean;
  initialData?: Reminder; // if provided, we're editing an event
  onClose: () => void;
  onSubmit: (data: Reminder) => void;
}

const ITEM_HEIGHT = 48;

// Generate time options in 15-minute increments (24-hour format)
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      times.push(dayjs().hour(hour).minute(minute).format("HH:mm"));
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

// Validation schema using separate fields
const EventSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  date: Yup.string().required("Date is required"),
  startHour: Yup.string().required("Start time is required"),
  endHour: Yup.string()
    .required("End time is required")
    .test("min-duration", "End time must be at least 15 minutes after start time", function (value) {
      const { date, startHour } = this.parent;
      if (!date || !startHour || !value) return true;
      const start = dayjs(`${date} ${startHour}`, "YYYY-MM-DD HH:mm");
      const end = dayjs(`${date} ${value}`, "YYYY-MM-DD HH:mm");
      return end.diff(start, "minute") >= 15;
    }),
});

const EventFormModal: React.FC<EventFormModalProps> = ({ open, initialData, onClose, onSubmit }) => {
  // Derive initial values for date and time separately.
  const initialDate = initialData?.startTime
    ? dayjs(initialData.startTime).format("YYYY-MM-DD")
    : dayjs().format("YYYY-MM-DD");

  const initialStartHour = initialData?.startTime
    ? dayjs(initialData.startTime).format("HH:mm")
    : dayjs().format("HH:mm");

  const initialEndHour = initialData?.endTime
    ? dayjs(initialData.endTime).format("HH:mm")
    : dayjs().add(1, "hour").format("HH:mm");

  const initialValues = {
    title: initialData?.title || "",
    description: initialData?.description || "",
    date: initialDate,
    startHour: initialStartHour,
    endHour: initialEndHour,
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? "Edit Event" : "Add New Event"}</DialogTitle>
      <Formik
        initialValues={initialValues}
        validationSchema={EventSchema}
        onSubmit={(values, { setSubmitting }) => {
          // Combine date and time fields into full timestamps (seconds set to "00")
          const startTime = dayjs(`${values.date} ${values.startHour}`, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm:ss");
          const endTime = dayjs(`${values.date} ${values.endHour}`, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm:ss");

          const finalData: Reminder = {
            ...initialData, // preserve existing fields (e.g. id) if editing
            title: values.title,
            description: values.description,
            startTime,
            endTime,
          };

          console.log("Submitting Event:", finalData); // Debug log
          onSubmit(finalData);
          setSubmitting(false);
          onClose();
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue }) => (
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

              {/* Date Input */}
              <TextField
                margin="dense"
                id="date"
                name="date"
                label="Date"
                type="date"
                fullWidth
                value={values.date}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.date && Boolean(errors.date)}
                helperText={touched.date && errors.date}
              />

              {/* Start Hour Input as Autocomplete (freeSolo allows manual entry) */}
              <Autocomplete
                freeSolo
                options={TIME_OPTIONS}
                ListboxProps={{
                  style: { maxHeight: ITEM_HEIGHT * 6 },
                }}
                value={values.startHour}
                onChange={(event, newValue) => {
                  setFieldValue("startHour", newValue || "");
                }}
                onInputChange={(event, newInputValue) => {
                  setFieldValue("startHour", newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    id="startHour"
                    name="startHour"
                    label="Start Time (24h format)"
                    fullWidth
                    error={touched.startHour && Boolean(errors.startHour)}
                    helperText={touched.startHour && errors.startHour}
                  />
                )}
              />

              {/* End Hour Input as Autocomplete (freeSolo allows manual entry) */}
              <Autocomplete
                freeSolo
                options={TIME_OPTIONS}
                ListboxProps={{
                  style: { maxHeight: ITEM_HEIGHT * 6 },
                }}
                value={values.endHour}
                onChange={(event, newValue) => {
                  setFieldValue("endHour", newValue || "");
                }}
                onInputChange={(event, newInputValue) => {
                  setFieldValue("endHour", newInputValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="dense"
                    id="endHour"
                    name="endHour"
                    label="End Time (24h format)"
                    fullWidth
                    error={touched.endHour && Boolean(errors.endHour)}
                    helperText={touched.endHour && errors.endHour}
                  />
                )}
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
