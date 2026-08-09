import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AppState, ClassGroup, Student, Track, Recording } from './types';
import { INITIAL_STATE } from './constants';

interface StoreContextType extends AppState {
  addClass: (c: ClassGroup) => void;
  removeClass: (id: string) => void;
  addStudent: (s: Student) => void;
  removeStudent: (id: string) => void;
  addTrack: (t: Track) => void;
  removeTrack: (id: string) => void;
  addRecording: (r: Recording) => void;
  removeRecording: (id: string) => void;
  markRecordingUploaded: (id: string) => void;
  
  // Auth state
  isAdminAuthenticated: boolean;
  loginAsAdmin: () => void;
  logoutAdmin: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const addClass = (c: ClassGroup) => setState(s => ({ ...s, classes: [...s.classes, c] }));
  const removeClass = (id: string) => setState(prev => ({ ...prev, classes: prev.classes.filter(c => c.id !== id) }));
  
  const addStudent = (s: Student) => setState(prev => ({ ...prev, students: [...prev.students, s] }));
  const removeStudent = (id: string) => setState(prev => ({ ...prev, students: prev.students.filter(s => s.id !== id) }));
  
  const addTrack = (t: Track) => setState(prev => ({ ...prev, tracks: [...prev.tracks, t] }));
  const removeTrack = (id: string) => setState(prev => ({ ...prev, tracks: prev.tracks.filter(t => t.id !== id) }));
  
  const addRecording = (r: Recording) => setState(prev => ({ ...prev, recordings: [...prev.recordings, r] }));
  const removeRecording = (id: string) => setState(prev => ({ ...prev, recordings: prev.recordings.filter(r => r.id !== id) }));
  
  const markRecordingUploaded = (id: string) => setState(prev => ({
    ...prev,
    recordings: prev.recordings.map(r => r.id === id ? { ...r, status: 'uploaded' } : r)
  }));

  const loginAsAdmin = () => setIsAdminAuthenticated(true);
  const logoutAdmin = () => setIsAdminAuthenticated(false);

  return (
    <StoreContext.Provider value={{
      ...state,
      addClass,
      removeClass,
      addStudent,
      removeStudent,
      addTrack,
      removeTrack,
      addRecording,
      removeRecording,
      markRecordingUploaded,
      isAdminAuthenticated,
      loginAsAdmin,
      logoutAdmin
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
