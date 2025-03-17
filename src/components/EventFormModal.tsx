import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, IconButton, Box } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import DeleteIcon from "@mui/icons-material/Delete";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import dayjs from "dayjs";
import { Reminder } from "../types";
import { deleteReminder } from "../api";
import "../styles/EventFormModal.css"; // Import the new CSS for EventFormModal

interface EventFormModalProps {
  open: boolean;
  initialData?: Reminder;
  onClose: () => void;
  onSubmit: (data: Reminder) => void;
  onDeleteSuccess?: () => void;
}

const ITEM_HEIGHT = 48;

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

const EventFormModal: React.FC<EventFormModalProps> = ({ open, initialData, onClose, onSubmit, onDeleteSuccess }) => {
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

  const handleDelete = async () => {
    if (initialData && initialData.id !== undefined) {
      if (window.confirm("Are you sure you want to delete this event?")) {
        try {
          await deleteReminder(initialData.id);
          if (onDeleteSuccess) onDeleteSuccess();
          onClose();
        } catch (error) {
          console.error("Failed to delete event", error);
        }
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" className="event-form-modal">
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, pt: 2 }}>
        <DialogTitle sx={{ p: 0, m: 0 }}>
          {initialData ? "Edit Event" : "Add New Event"}
        </DialogTitle>
        {initialData && (
          <IconButton onClick={handleDelete} aria-label="delete event">
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
      <Formik
        initialValues={initialValues}
        validationSchema={EventSchema}
        onSubmit={(values, { setSubmitting }) => {
          const startTime = dayjs(`${values.date} ${values.startHour}`, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm:ss");
          const endTime = dayjs(`${values.date} ${values.endHour}`, "YYYY-MM-DD HH:mm").format("YYYY-MM-DD HH:mm:ss");

          const finalData: Reminder = {
            ...initialData,
            title: values.title,
            description: values.description,
            startTime,
            endTime,
          };

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
              <Autocomplete
                freeSolo
                options={TIME_OPTIONS}
                ListboxProps={{ style: { maxHeight: ITEM_HEIGHT * 6 } }}
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
              <Autocomplete
                freeSolo
                options={TIME_OPTIONS}
                ListboxProps={{ style: { maxHeight: ITEM_HEIGHT * 6 } }}
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
