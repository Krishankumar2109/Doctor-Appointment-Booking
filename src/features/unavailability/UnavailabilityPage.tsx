import { useState } from 'react';
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
import BlockIcon from '@mui/icons-material/Block';
import ListAltIcon from '@mui/icons-material/ListAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Swal from 'sweetalert2';

import DoctorSelect from '../../components/FormFields/DoctorSelect';
import useAppContext from '../../hooks/useAppContext';
import doctors from '../../data/doctors';
import { generateTimeOptions, formatSlotRange, generateId } from '../../utils/timeSlots';
import styles from './UnavailabilityPage.module.scss';

const timeOptions = generateTimeOptions();

const UnavailabilityPage = () => {
  const { state, dispatch } = useAppContext();

  const [doctorId, setDoctorId] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (!doctorId) {
      Swal.fire({ icon: 'warning', title: 'Select Doctor', text: 'Please choose a doctor.', confirmButtonColor: '#1565c0' });
      return;
    }
    if (!date) {
      Swal.fire({ icon: 'warning', title: 'Select Date', text: 'Please pick a date.', confirmButtonColor: '#1565c0' });
      return;
    }
    if (startTime >= endTime) {
      Swal.fire({ icon: 'error', title: 'Invalid Time', text: 'Start time must be earlier than end time.', confirmButtonColor: '#1565c0' });
      return;
    }

    // Check if already blocked
    const alreadyBlocked = state.blockedSlots.some(
      (b) =>
        b.doctorId === doctorId &&
        b.date === date &&
        b.slot.start === startTime &&
        b.slot.end === endTime
    );

    if (alreadyBlocked) {
      Swal.fire({ icon: 'info', title: 'Already Blocked', text: 'This slot is already marked as unavailable.', confirmButtonColor: '#1565c0' });
      return;
    }

    dispatch({
      type: 'ADD_BLOCKED_SLOT',
      payload: {
        id: generateId(),
        doctorId,
        date,
        slot: { start: startTime, end: endTime },
        reason: reason.trim() || undefined,
      },
    });

    Swal.fire({
      icon: 'success',
      title: 'Slot Blocked',
      text: `Unavailability marked for ${doctors.find((d) => d.id === doctorId)?.name}.`,
      confirmButtonColor: '#1565c0',
      timer: 2500,
    });

    // Reset partial form
    setDate('');
    setReason('');
  };

  const handleRemoveBlock = (id: string) => {
    Swal.fire({
      title: 'Remove block?',
      text: 'This will make the slot available again.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1565c0',
      confirmButtonText: 'Yes, remove',
    }).then((result) => {
      if (result.isConfirmed) {
        dispatch({ type: 'REMOVE_BLOCKED_SLOT', payload: id });
      }
    });
  };

  const getDoctorName = (id: number) => doctors.find((d) => d.id === id)?.name || 'Unknown';

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Block Doctor Slots</h2>
        <p>Mark specific time slots as unavailable for a doctor.</p>
      </div>

      <div className={styles.grid}>
        {/* Form */}
        <div className={styles.formCard}>
          <div className={styles.cardTitle}>
            <BlockIcon /> Block a Time Slot
          </div>

          <div className={styles.fieldGroup}>
            <DoctorSelect value={doctorId} onChange={setDoctorId} />

            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />

            <div className={styles.timeRow}>
              <FormControl size="medium" sx={{ flex: 1 }}>
                <InputLabel>Start</InputLabel>
                <Select value={startTime} label="Start" onChange={(e) => setStartTime(e.target.value)}>
                  {timeOptions.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <span className={styles.dash}>—</span>
              <FormControl size="medium" sx={{ flex: 1 }}>
                <InputLabel>End</InputLabel>
                <Select value={endTime} label="End" onChange={(e) => setEndTime(e.target.value)}>
                  {timeOptions.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>

            <TextField
              label="Reason (optional)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Personal leave, conference..."
              fullWidth
              multiline
              rows={2}
            />

            <div className={styles.submitRow}>
              <Button
                variant="contained"
                size="large"
                startIcon={<BlockIcon />}
                onClick={handleSubmit}
                sx={{
                  px: 4,
                  bgcolor: '#546e7a',
                  '&:hover': { bgcolor: '#37474f' },
                }}
              >
                Block Slot
              </Button>
            </div>
          </div>
        </div>

        {/* Blocked Slots List */}
        <div className={styles.listCard}>
          <div className={styles.cardTitle}>
            <ListAltIcon /> Blocked Slots
          </div>

          {state.blockedSlots.length === 0 && (
            <div className={styles.emptyState}>
              <CheckCircleOutlineIcon />
              <p>No blocked slots. All doctors fully available.</p>
            </div>
          )}

          {state.blockedSlots.map((block) => (
            <div key={block.id} className={styles.blockedItem}>
              <div className={styles.blockedInfo}>
                <span className={styles.doctorName}>{getDoctorName(block.doctorId)}</span>
                <span className={styles.slotInfo}>
                  {block.date} &middot; {formatSlotRange(block.slot)}
                </span>
                {block.reason && (
                  <span className={styles.reason}>&ldquo;{block.reason}&rdquo;</span>
                )}
              </div>
              <Tooltip title="Remove block">
                <IconButton size="small" onClick={() => handleRemoveBlock(block.id)}>
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

export default UnavailabilityPage;
