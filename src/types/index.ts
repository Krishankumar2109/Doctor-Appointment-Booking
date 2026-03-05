export interface Doctor {
  id: number;
  name: string;
  specialization: string;
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "10:00"
}

export interface DayAvailability {
  day: string; // "Monday", "Tuesday", etc.
  slots: TimeSlot[];
}

export interface DoctorAvailability {
  doctorId: number;
  schedule: DayAvailability[];
}

export interface BlockedSlot {
  id: string;
  doctorId: number;
  date: string; // "YYYY-MM-DD"
  slot: TimeSlot;
  reason?: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  doctorId: number;
  date: string; // "YYYY-MM-DD"
  slot: TimeSlot;
  notes?: string;
  createdAt: string;
}

export type SlotStatus = 'available' | 'booked' | 'blocked';

export interface CalendarSlot {
  time: TimeSlot;
  status: SlotStatus;
  appointment?: Appointment;
  blockedSlot?: BlockedSlot;
}

// Reducer types
export type AppAction =
  | { type: 'SET_AVAILABILITY'; payload: DoctorAvailability }
  | { type: 'REMOVE_AVAILABILITY'; payload: { doctorId: number; day: string; slotIndex: number } }
  | { type: 'ADD_BLOCKED_SLOT'; payload: BlockedSlot }
  | { type: 'REMOVE_BLOCKED_SLOT'; payload: string }
  | { type: 'ADD_APPOINTMENT'; payload: Appointment }
  | { type: 'CANCEL_APPOINTMENT'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

export interface AppState {
  availability: DoctorAvailability[];
  blockedSlots: BlockedSlot[];
  appointments: Appointment[];
}
