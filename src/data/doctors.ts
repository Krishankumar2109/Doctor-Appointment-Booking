import { Doctor } from '../types';

const doctors: Doctor[] = [
  { id: 1, name: 'Dr. Subramanya', specialization: 'Cardiology' },
  { id: 2, name: 'Dr. Sarah', specialization: 'Cardiology' },
  { id: 3, name: 'Dr. Krishna', specialization: 'Pediatrics' },
];

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export default doctors;
