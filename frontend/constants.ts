import { AppState } from './types';

export const INITIAL_STATE: AppState = {
  classes: [
    { id: 'c1', name: 'Concert Choir (Period 1)' },
    { id: 'c2', name: 'Chamber Singers (Period 3)' },
    { id: 'c3', name: 'Beginning Chorus (Period 5)' },
  ],
  students: [
    { id: 's1', name: 'Alice Johnson', classId: 'c1', voicePart: 'Soprano' },
    { id: 's2', name: 'Bob Smith', classId: 'c1', voicePart: 'Tenor' },
    { id: 's3', name: 'Charlie Davis', classId: 'c2', voicePart: 'Bass' },
    { id: 's4', name: 'Diana Prince', classId: 'c2', voicePart: 'Alto' },
  ],
  tracks: [],
  recordings: [],
};
