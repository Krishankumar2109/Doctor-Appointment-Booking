import { useState, useMemo } from 'react';
import {
  Button,
  TextField,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import Swal from 'sweetalert2';

import DoctorSelect from '../../components/FormFields/DoctorSelect';
import useAppContext from '../../hooks/useAppContext';
import doctors from '../../data/doctors';
import { getAvailableSlotsForDate, formatSlotRange, generateId } from '../../utils/timeSlots';
import { TimeSlot } from '../../types';
import styles from './BookingPage.module.scss';

const BookingPage = () => {
  const { state, dispatch } = useAppContext();

  const [patientName, setPatientName] = useState('');
  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');

  // Compute available slots whenever doctor or date changes
  const availableSlots = useMemo<TimeSlot[]>(() => {
    if (!doctorId || !date) return [];
    return getAvailableSlotsForDate(
      doctorId,
      date,
      state.availability,
      state.blockedSlots,
      state.appointments
    );
  }, [doctorId, date, state.availability, state.blockedSlots, state.appointments]);

  // Reset slot when doctor/date change
  const handleDoctorChange = (id: number) => {
    setDoctorId(id);
    setSelectedSlot('');
  };

  const handleDateChange = (val: string) => {
    setDate(val);
    setSelectedSlot('');
  };

  const handleSubmit = () => {
    if (!patientName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Patient Name Required', text: 'Please enter the patient\'s name.', confirmButtonColor: '#1565c0' });
      return;
    }
    if (!doctorId) {
      Swal.fire({ icon: 'warning', title: 'Select Doctor', text: 'Please choose a doctor.', confirmButtonColor: '#1565c0' });
      return;
    }
    if (!date) {
      Swal.fire({ icon: 'warning', title: 'Select Date', text: 'Please pick an appointment date.', confirmButtonColor: '#1565c0' });
      return;
    }
    if (!selectedSlot) {
      Swal.fire({ icon: 'warning', title: 'Select Slot', text: 'Please pick an available time slot.', confirmButtonColor: '#1565c0' });
      return;
    }

    const [start, end] = selectedSlot.split('|');

    dispatch({
      type: 'ADD_APPOINTMENT',
      payload: {
        id: generateId(),
        patientName: patientName.trim(),
        doctorId,
        date,
        slot: { start, end },
        notes: notes.trim() || undefined,
        createdAt: new Date().toISOString(),
      },
    });

    const docName = doctors.find((d) => d.id === doctorId)?.name;
    Swal.fire({
      icon: 'success',
      title: 'Appointment Booked!',
      html: `<strong>${patientName.trim()}</strong> with <strong>${docName}</strong><br/>on ${date}`,
      confirmButtonColor: '#1565c0',
      timer: 3000,
    });

    // Reset form
    setPatientName('');
    setSelectedSlot('');
    setNotes('');
    setDate('');
  };

  const handleCancelAppointment = (id: string) => {
    Swal.fire({
      title: 'Cancel Appointment?',
      text: 'This will free up the slot for others.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#c62828',
      confirmButtonText: 'Yes, cancel it',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch({ type: 'CANCEL_APPOINTMENT', payload: id });
        Swal.fire({ icon: 'info', title: 'Cancelled', timer: 1500, showConfirmButton: false });
      }
    });
  };

  const getDoctorName = (id: number) => doctors.find((d) => d.id === id)?.name || 'Unknown';

  // Sort appointments, latest first
  const sortedAppointments = [...state.appointments].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Book an Appointment</h2>
        <p>Schedule a patient visit with an available doctor.</p>
      </div>

      <div className={styles.grid}>
        {/* Booking Form */}
        <div className={styles.formCard}>
          <div className={styles.cardTitle}>
            <BookOnlineIcon /> New Appointment
          </div>

          <div className={styles.fieldGroup}>
            <TextField
              label="Patient Name"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              placeholder="Enter patient's full name"
              fullWidth
              required
            />

            <DoctorSelect value={doctorId} onChange={handleDoctorChange} />

            <TextField
              label="Appointment Date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            {/* Show available slot picker */}
            {doctorId && date && availableSlots.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Available Time Slot</InputLabel>
                <Select
                  value={selectedSlot}
                  label="Available Time Slot"
                  onChange={(e) => setSelectedSlot(e.target.value)}
                >
                  {availableSlots.map((slot) => {
                    const val = `${slot.start}|${slot.end}`;
                    return (
                      <MenuItem key={val} value={val}>
                        {formatSlotRange(slot)}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            )}

            {doctorId && date && availableSlots.length === 0 && (
              <p className={styles.noSlots}>
                No available slots for this doctor on the selected date. Try a different date or check availability.
              </p>
            )}

            <TextField
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              fullWidth
              multiline
              rows={2}
            />

            <div className={styles.submitRow}>
              <Button
                variant="contained"
                size="large"
                startIcon={<BookOnlineIcon />}
                onClick={handleSubmit}
                disabled={!selectedSlot}
                sx={{
                  px: 4,
                  bgcolor: '#ef6c00',
                  '&:hover': { bgcolor: '#e65100' },
                }}
              >
                Confirm Booking
              </Button>
            </div>
          </div>
        </div>

        {/* Existing Appointments */}
        <div className={styles.listCard}>
          <div className={styles.cardTitle}>
            <FormatListBulletedIcon /> Recent Appointments
          </div>

          {sortedAppointments.length === 0 && (
            <div className={styles.emptyState}>
              <EventBusyIcon />
              <p>No appointments booked yet.</p>
            </div>
          )}

          {sortedAppointments.map((appt) => (
            <div key={appt.id} className={styles.appointmentItem}>
              <div className={styles.appointmentInfo}>
                <span className={styles.patientName}>{appt.patientName}</span>
                <span className={styles.details}>
                  {getDoctorName(appt.doctorId)} &middot; {appt.date} &middot; {formatSlotRange(appt.slot)}
                </span>
                {appt.notes && <span className={styles.notes}>{appt.notes}</span>}
              </div>
              <Tooltip title="Cancel appointment">
                <IconButton size="small" onClick={() => handleCancelAppointment(appt.id)}>
                  <DeleteOutlineIcon fontSize="small" color="error" />
                </IconButton>
              </Tooltip>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
