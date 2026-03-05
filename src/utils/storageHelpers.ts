import { AppState } from '../types';

const STORAGE_KEY = 'doctorAppointmentApp';

export const loadFromStorage = (): AppState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AppState;
  } catch (err) {
    console.error('Failed to load data from localStorage:', err);
    return null;
  }
};

export const saveToStorage = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save data to localStorage:', err);
  }
};

export const clearStorage = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
