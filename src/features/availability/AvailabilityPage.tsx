import { useState, useCallback } from 'react';
import {
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import EventNoteIcon from '@mui/icons-material/EventNote';
import InboxIcon from '@mui/icons-material/Inbox';
import CloseIcon from '@mui/icons-material/Close';
import Swal from 'sweetalert2';

import DoctorSelect from '../../components/FormFields/DoctorSelect';
import useAppContext from '../../hooks/useAppContext';
import doctors from '../../data/doctors';
import { DAYS_OF_WEEK } from '../../data/doctors';
import { TimeSlot, DayAvailability } from '../../types';
import { generateTimeOptions, formatSlotRange, doSlotsOverlap } from '../../utils/timeSlots';
import styles from './AvailabilityPage.module.scss';

const timeOptions = generateTimeOptions();

interface SlotEntry {
  start: string;
  end: string;
}

const AvailabilityPage = () => {
  const { state, dispatch } = useAppContext();

  const [selectedDoctor, setSelectedDoctor] = useState<number | ''>('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [slots, setSlots] = useState<SlotEntry[]>([{ start: '09:00', end: '10:00' }]);

  const toggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleSlotChange = (index: number, field: 'start' | 'end', value: string) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], [field]: value };
    setSlots(updated);
  };

  const addSlotRow = () => {
    setSlots((prev) => [...prev, { start: '10:00', end: '11:00' }]);
  };

  const removeSlotRow = (index: number) => {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, i) => i !== index));
  };

  const validateAndSubmit = useCallback(() => {
    if (!selectedDoctor) {
      Swal.fire({ icon: 'warning', title: 'Missing Doctor', text: 'Please select a doctor first.', confirmButtonColor: '#1565c0' });
      return;
    }
    if (selectedDays.length === 0) {
      Swal.fire({ icon: 'warning', title: 'No Days Selected', text: 'Pick at least one day of the week.', confirmButtonColor: '#1565c0' });
      return;
    }

    // Validate each slot
    for (const slot of slots) {
      if (slot.start >= slot.end) {
        Swal.fire({ icon: 'error', title: 'Invalid Time Slot', text: `Start time must be before end time (${slot.start} – ${slot.end}).`, confirmButtonColor: '#1565c0' });
        return;
      }
    }

    // Check for overlaps within the new slots
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        if (doSlotsOverlap(slots[i], slots[j])) {
          Swal.fire({ icon: 'error', title: 'Overlapping Slots', text: 'Two or more time slots overlap. Please fix them.', confirmButtonColor: '#1565c0' });
          return;
        }
      }
    }

    const schedule: DayAvailability[] = selectedDays.map((day) => ({
      day,
      slots: slots.map((s) => ({ start: s.start, end: s.end })),
    }));

    dispatch({
      type: 'SET_AVAILABILITY',
      payload: { doctorId: selectedDoctor, schedule },
    });

    Swal.fire({
      icon: 'success',
      title: 'Availability Saved',
      text: `Schedule updated for ${doctors.find((d) => d.id === selectedDoctor)?.name}.`,
      confirmButtonColor: '#1565c0',
      timer: 2500,
    });

    // Reset form
    setSelectedDays([]);
    setSlots([{ start: '09:00', end: '10:00' }]);
  }, [selectedDoctor, selectedDays, slots, dispatch]);

  const handleRemoveSlot = (doctorId: number, day: string, slotIndex: number) => {
    Swal.fire({
      title: 'Remove this slot?',
      text: 'This will delete the time slot from availability.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#c62828',
      confirmButtonText: 'Remove',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch({ type: 'REMOVE_AVAILABILITY', payload: { doctorId, day, slotIndex } });
      }
    });
  };

  // Get the selected doctor's current availability
  const currentAvailability = selectedDoctor
    ? state.availability.find((a) => a.doctorId === selectedDoctor)
    : null;

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Manage Doctor Availability</h2>
        <p>Configure weekly schedules and time slots for each doctor.</p>
      </div>

      <div className={styles.grid}>
        {/* Form Section */}
        <div className={styles.formCard}>
          <div className={styles.cardTitle}>
            <EditCalendarIcon /> Add Availability
          </div>

          <div className={styles.fieldGroup}>
            <DoctorSelect value={selectedDoctor} onChange={setSelectedDoctor} />

            {/* Day Selection */}
            <div>
              <InputLabel sx={{ mb: 1, fontSize: '0.85rem', fontWeight: 600 }}>
                Days of Week
              </InputLabel>
              <div className={styles.daysGrid}>
                {DAYS_OF_WEEK.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className={`${styles.dayChip} ${selectedDays.includes(day) ? styles.selected : ''}`}
                    onClick={() => toggleDay(day)}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div>
              <InputLabel sx={{ mb: 1, fontSize: '0.85rem', fontWeight: 600 }}>
                Time Slots
              </InputLabel>
              <div className={styles.slotsList}>
                {slots.map((slot, idx) => (
                  <div key={idx} className={styles.slotRow}>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Start</InputLabel>
                      <Select
                        value={slot.start}
                        label="Start"
                        onChange={(e) => handleSlotChange(idx, 'start', e.target.value)}
                      >
                        {timeOptions.map((t) => (
                          <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <span className={styles.slotDash}>—</span>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>End</InputLabel>
                      <Select
                        value={slot.end}
                        label="End"
                        onChange={(e) => handleSlotChange(idx, 'end', e.target.value)}
                      >
                        {timeOptions.map((t) => (
                          <MenuItem key={t} value={t}>{t}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {slots.length > 1 && (
                      <Tooltip title="Remove slot">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => removeSlotRow(idx)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="text"
                size="small"
                startIcon={<AddCircleOutlineIcon />}
                onClick={addSlotRow}
                className={styles.addSlotBtn}
                sx={{ mt: 1 }}
              >
                Add Another Slot
              </Button>
            </div>

            <div className={styles.submitRow}>
              <Button
                variant="contained"
                size="large"
                onClick={validateAndSubmit}
                disabled={!selectedDoctor}
                sx={{
                  px: 4,
                  bgcolor: '#1565c0',
                  '&:hover': { bgcolor: '#0d47a1' },
                }}
              >
                Save Availability
              </Button>
            </div>
          </div>
        </div>

        {/* Current Schedule */}
        <div className={styles.scheduleCard}>
          <div className={styles.cardTitle}>
            <EventNoteIcon /> Current Schedule
          </div>

          {!selectedDoctor && (
            <div className={styles.emptyState}>
              <InboxIcon />
              <p>Select a doctor to view their schedule</p>
            </div>
          )}

          {selectedDoctor && !currentAvailability?.schedule.length && (
            <div className={styles.emptyState}>
              <InboxIcon />
              <p>No availability set yet. Add slots using the form.</p>
            </div>
          )}

          {currentAvailability?.schedule.map((daySchedule) => (
            <div key={daySchedule.day} className={styles.dayBlock}>
              <div className={styles.dayLabel}>{daySchedule.day}</div>
              <div>
                {daySchedule.slots.map((slot: TimeSlot, idx: number) => (
                  <span key={idx} className={styles.slotChip}>
                    {formatSlotRange(slot)}
                    <CloseIcon
                      className={styles.removeSlot}
                      onClick={() =>
                        handleRemoveSlot(currentAvailability.doctorId, daySchedule.day, idx)
                      }
                    />
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityPage;
