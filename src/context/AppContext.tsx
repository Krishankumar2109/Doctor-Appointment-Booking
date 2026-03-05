import { createContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, AppAction } from '../types';
import appReducer, { initialState } from './appReducer';
import { loadFromStorage, saveToStorage } from '../utils/storageHelpers';

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

interface ProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: ProviderProps) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load persisted data on mount
  useEffect(() => {
    const persisted = loadFromStorage();
    if (persisted) {
      dispatch({ type: 'LOAD_STATE', payload: persisted });
    }
  }, []);

  // Sync to localStorage whenever state changes
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};
