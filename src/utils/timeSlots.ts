import dayjs from 'dayjs';
import { TimeSlot, DoctorAvailability, BlockedSlot, Appointment } from '../types';

/* Generate hour-based time slots between a range */
export const generateTimeOptions = (): string[] => {
  const options: string[] = [];
  for (let hour = 6; hour <= 21; hour++) {
    options.push(`${String(hour).padStart(2, '0')}:00`);
    options.push(`${String(hour).padStart(2, '0')}:30`);
  }
  return options;
};

/* Check if two time slots overlap */
export const doSlotsOverlap = (slotA: TimeSlot, slotB: TimeSlot): boolean => {
  return slotA.start < slotB.end && slotB.start < slotA.end;
};

/* Format time for display - 09:00 → 9:00 AM */
export const formatTime = (time: string): string => {
  const [hourStr, minute] = time.split(':');
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minute} ${ampm}`;
};

/* Format slot range for display */
export const formatSlotRange = (slot: TimeSlot): string => {
  return `${formatTime(slot.start)} – ${formatTime(slot.end)}`;
};

/* Get the day name from a date string */
export const getDayFromDate = (dateStr: string): string => {
  return dayjs(dateStr).format('dddd');
};

/* Find available slots for a given doctor on a date */
export const getAvailableSlotsForDate = (
  doctorId: number,
  date: string,
  availability: DoctorAvailability[],
  blockedSlots: BlockedSlot[],
  appointments: Appointment[]
): TimeSlot[] => {
  const dayName = getDayFromDate(date);
  const doctorAvail = availability.find((a) => a.doctorId === doctorId);

  if (!doctorAvail) return [];

  const daySchedule = doctorAvail.schedule.find((s) => s.day === dayName);
  if (!daySchedule) return [];

  // Filter out blocked and booked slots
  return daySchedule.slots.filter((slot) => {
    const isBlocked = blockedSlots.some(
      (b) => b.doctorId === doctorId && b.date === date && doSlotsOverlap(b.slot, slot)
    );
    const isBooked = appointments.some(
      (a) => a.doctorId === doctorId && a.date === date && doSlotsOverlap(a.slot, slot)
    );
    return !isBlocked && !isBooked;
  });
};

/* Get all dates in a week starting from a reference date */
export const getWeekDates = (referenceDate: dayjs.Dayjs): { day: string; date: string }[] => {
  const startOfWeek = referenceDate.startOf('week').add(1, 'day'); // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const current = startOfWeek.add(i, 'day');
    return {
      day: current.format('dddd'),
      date: current.format('YYYY-MM-DD'),
    };
  });
};

/* Generate a unique id */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};
