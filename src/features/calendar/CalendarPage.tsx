import { useState, useMemo, Fragment } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';

import DoctorSelect from '../../components/FormFields/DoctorSelect';
import useAppContext from '../../hooks/useAppContext';
import doctors from '../../data/doctors';
import { getWeekDates, formatTime, doSlotsOverlap } from '../../utils/timeSlots';
import { TimeSlot, CalendarSlot } from '../../types';
import styles from './CalendarPage.module.scss';

dayjs.extend(isoWeek);

// Fixed time rows for the calendar (7 AM to 8 PM)
const TIME_ROWS: TimeSlot[] = [];
for (let h = 7; h <= 20; h++) {
  TIME_ROWS.push({
    start: `${String(h).padStart(2, '0')}:00`,
    end: `${String(h).padStart(2, '0')}:30`,
  });
  TIME_ROWS.push({
    start: `${String(h).padStart(2, '0')}:30`,
    end: `${String(h + 1).padStart(2, '0')}:00`,
  });
}

const CalendarPage = () => {
  const { state } = useAppContext();
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterDoctor, setFilterDoctor] = useState<number | ''>('');

  const referenceDate = dayjs().add(weekOffset, 'week');
  const weekDates = useMemo(() => getWeekDates(referenceDate), [weekOffset]);
  const today = dayjs().format('YYYY-MM-DD');

  const weekStart = dayjs(weekDates[0].date).format('MMM D');
  const weekEnd = dayjs(weekDates[6].date).format('MMM D, YYYY');

  // Build the slot data for each cell
  const getCellSlots = (date: string, dayName: string, timeRow: TimeSlot): CalendarSlot[] => {
    const targetDoctors = filterDoctor
      ? doctors.filter((d) => d.id === filterDoctor)
      : doctors;

    const cellSlots: CalendarSlot[] = [];

    targetDoctors.forEach((doc) => {
      const availability = state.availability.find((a) => a.doctorId === doc.id);
      const daySchedule = availability?.schedule.find((s) => s.day === dayName);

      if (!daySchedule) return;

      // Check if this doctor has availability for this time row
      const matchingSlot = daySchedule.slots.find((s) => doSlotsOverlap(s, timeRow));
      if (!matchingSlot) return;

      // Is it blocked?
      const blocked = state.blockedSlots.find(
        (b) => b.doctorId === doc.id && b.date === date && doSlotsOverlap(b.slot, timeRow)
      );
      if (blocked) {
        cellSlots.push({ time: timeRow, status: 'blocked', blockedSlot: blocked });
        return;
      }

      // Is it booked?
      const booked = state.appointments.find(
        (a) => a.doctorId === doc.id && a.date === date && doSlotsOverlap(a.slot, timeRow)
      );
      if (booked) {
        cellSlots.push({ time: timeRow, status: 'booked', appointment: booked });
        return;
      }

      // Otherwise, available
      cellSlots.push({ time: timeRow, status: 'available' });
    });

    return cellSlots;
  };

  const getDoctorName = (id: number) => doctors.find((d) => d.id === id)?.name || '';

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <h2>Calendar Overview</h2>
        <p>Weekly view of all appointment statuses across doctors.</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div style={{ minWidth: 220 }}>
            <DoctorSelect
              value={filterDoctor}
              onChange={setFilterDoctor}
              onClear={() => setFilterDoctor('')}
              allowAll
              label="Filter by Doctor"
              size="small"
            />
          </div>

          <div className={styles.weekNav}>
            <Tooltip title="Previous week">
              <IconButton size="small" onClick={() => setWeekOffset((w) => w - 1)}>
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            <span className={styles.weekLabel}>{weekStart} – {weekEnd}</span>
            <Tooltip title="Next week">
              <IconButton size="small" onClick={() => setWeekOffset((w) => w + 1)}>
                <ChevronRightIcon />
              </IconButton>
            </Tooltip>
            {weekOffset !== 0 && (
              <Tooltip title="Go to current week">
                <IconButton size="small" onClick={() => setWeekOffset(0)}>
                  <TodayIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>

        <div className={styles.legend}>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.available}`} /> Available
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.booked}`} /> Booked
          </span>
          <span className={styles.legendItem}>
            <span className={`${styles.dot} ${styles.blocked}`} /> Blocked
          </span>
        </div>
      </div>

      <div className={styles.calendarWrapper}>
        <div className={styles.calendarGrid}>
          {/* Header row */}
          <div className={styles.headerCell}>Time</div>
          {weekDates.map(({ day, date }) => (
            <div
              key={date}
              className={`${styles.headerCell} ${date === today ? styles.today : ''}`}
            >
              {day.slice(0, 3)}
              <span className={styles.headerDate}>{dayjs(date).format('MMM D')}</span>
            </div>
          ))}

          {/* Time rows */}
          {TIME_ROWS.map((timeRow) => (
            <Fragment key={`row-${timeRow.start}`}>
              <div className={styles.timeLabel}>
                {formatTime(timeRow.start)}
              </div>

              {weekDates.map(({ day, date }) => {
                const cellSlots = getCellSlots(date, day, timeRow);

                return (
                  <div key={`${date}-${timeRow.start}`} className={styles.cell}>
                    {cellSlots.map((cs, idx) => {
                      if (cs.status === 'booked' && cs.appointment) {
                        return (
                          <div key={idx} className={`${styles.slotCard} ${styles.booked}`}>
                            <span className={styles.patientLabel}>
                              {cs.appointment.patientName}
                            </span>
                            <span className={styles.doctorLabel}>
                              {getDoctorName(cs.appointment.doctorId)}
                            </span>
                          </div>
                        );
                      }
                      if (cs.status === 'blocked') {
                        return (
                          <div key={idx} className={`${styles.slotCard} ${styles.blocked}`}>
                            Blocked
                          </div>
                        );
                      }
                      if (cs.status === 'available') {
                        return (
                          <div key={idx} className={`${styles.slotCard} ${styles.available}`}>
                            Open
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
