import React, { useState } from 'react';
import { useStore } from '../StoreContext';
import { VideoRecorder } from './VideoRecorder';
import { CheckCircle2, Music, User, Users, Mic2 } from 'lucide-react';

export const StudentView: React.FC = () => {
  const { classes, students, tracks, addRecording } = useStore();
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('');
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const filteredStudents = students.filter(s => s.classId === selectedClass);
  const currentTrack = tracks.find(t => t.id === selectedTrack);
  const currentStudent = students.find(s => s.id === selectedStudent);

  const handleRecordingComplete = (url: string) => {
    setRecordingUrl(url);
  };

  const handleSubmit = () => {
    if (!selectedStudent || !selectedTrack || !recordingUrl) return;

    addRecording({
      id: `rec_${Date.now()}`,
      studentId: selectedStudent,
      trackId: selectedTrack,
      videoUrl: recordingUrl,
      date: new Date().toISOString(),
      status: 'pending'
    });
    setIsSubmitted(true);
  };

  const resetForm = () => {
    setSelectedClass('');
    setSelectedStudent('');
    setSelectedTrack('');
    setRecordingUrl(null);
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Recording Submitted!</h2>
        <p className="text-slate-600 max-w-md mb-8">
          Great job, {currentStudent?.name}! Your recording has been saved and is ready for your teacher to review.
        </p>
        <button
          onClick={resetForm}
          className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Record Another Track
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Choir Studio</h1>
        <p className="text-lg text-slate-600">Select your details and record your performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Class Selection */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <Users className="w-4 h-4 text-indigo-500" />
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => { setSelectedClass(e.target.value); setSelectedStudent(''); }}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          >
            <option value="">-- Choose Class --</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Student Selection */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <User className="w-4 h-4 text-indigo-500" />
            Select Name
          </label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            disabled={!selectedClass}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
          >
            <option value="">-- Choose Name --</option>
            {filteredStudents.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.voicePart})</option>
            ))}
          </select>
        </div>

        {/* Track Selection */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
            <Music className="w-4 h-4 text-indigo-500" />
            Select Track
          </label>
          <select
            value={selectedTrack}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          >
            <option value="">-- Choose Track --</option>
            {tracks.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedStudent && selectedTrack ? (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Mic2 className="w-5 h-5 text-indigo-500" />
                Recording Session
              </h3>
              <p className="text-slate-500 mt-1">
                {currentStudent?.name} • {currentStudent?.voicePart} • Singing: <span className="font-medium text-slate-700">{currentTrack?.name}</span>
              </p>
            </div>
          </div>

          {!recordingUrl ? (
            <VideoRecorder 
              trackUrl={currentTrack?.url} 
              onRecordingComplete={handleRecordingComplete} 
            />
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden mb-8 shadow-lg">
                <video src={recordingUrl} controls className="w-full h-full" />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setRecordingUrl(null)}
                  className="px-6 py-3 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Retake Video
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Submit Recording
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic2 className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-2">Ready to Record?</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            Please select your class, name, and the track you want to sing along to above to start your recording session.
          </p>
        </div>
      )}
    </div>
  );
};
