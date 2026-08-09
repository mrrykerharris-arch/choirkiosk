export type VoicePart = 'Soprano' | 'Alto' | 'Tenor' | 'Bass';

export interface ClassGroup {
  id: string;
  name: string;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  voicePart: VoicePart;
}

export interface Track {
  id: string;
  name: string;
  url: string;
  fileName: string;
}

export interface Recording {
  id: string;
  studentId: string;
  trackId: string;
  videoUrl: string;
  date: string;
  status: 'pending' | 'uploaded';
}

export interface AppState {
  classes: ClassGroup[];
  students: Student[];
  tracks: Track[];
  recordings: Recording[];
}
