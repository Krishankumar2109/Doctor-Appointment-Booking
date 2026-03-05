import { AppState, AppAction } from '../types';

export const initialState: AppState = {
  availability: [],
  blockedSlots: [],
  appointments: [],
};

const appReducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'SET_AVAILABILITY': {
      const { doctorId, schedule } = action.payload;
      const existing = state.availability.findIndex((a) => a.doctorId === doctorId);

      if (existing >= 0) {
        // Merge new schedule with existing one
        const updated = [...state.availability];
        const currentSchedule = updated[existing].schedule;

        schedule.forEach((newDay) => {
          const dayIdx = currentSchedule.findIndex((d) => d.day === newDay.day);
          if (dayIdx >= 0) {
            // Append new slots, avoid exact duplicates
            const existingSlots = currentSchedule[dayIdx].slots;
            const uniqueNew = newDay.slots.filter(
              (ns) => !existingSlots.some((es) => es.start === ns.start && es.end === ns.end)
            );
            currentSchedule[dayIdx].slots = [...existingSlots, ...uniqueNew];
          } else {
            currentSchedule.push(newDay);
          }
        });

        updated[existing] = { ...updated[existing], schedule: currentSchedule };
        return { ...state, availability: updated };
      }

      return {
        ...state,
        availability: [...state.availability, action.payload],
      };
    }

    case 'REMOVE_AVAILABILITY': {
      const { doctorId, day, slotIndex } = action.payload;
      const updated = state.availability.map((avail) => {
        if (avail.doctorId !== doctorId) return avail;

        const updatedSchedule = avail.schedule
          .map((d) => {
            if (d.day !== day) return d;
            const updatedSlots = d.slots.filter((_, idx) => idx !== slotIndex);
            return { ...d, slots: updatedSlots };
          })
          .filter((d) => d.slots.length > 0); // Remove empty days

        return { ...avail, schedule: updatedSchedule };
      });

      return { ...state, availability: updated };
    }

    case 'ADD_BLOCKED_SLOT':
      return {
        ...state,
        blockedSlots: [...state.blockedSlots, action.payload],
      };

    case 'REMOVE_BLOCKED_SLOT':
      return {
        ...state,
        blockedSlots: state.blockedSlots.filter((b) => b.id !== action.payload),
      };

    case 'ADD_APPOINTMENT':
      return {
        ...state,
        appointments: [...state.appointments, action.payload],
      };

    case 'CANCEL_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.filter((a) => a.id !== action.payload),
      };

    case 'LOAD_STATE':
      return { ...action.payload };

    default:
      return state;
  }
};

export default appReducer;
