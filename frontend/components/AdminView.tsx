import React, { useState, useRef } from 'react';
import { useStore } from '../StoreContext';
import { AdminLogin } from './AdminLogin';
import { Upload, Trash2, PlayCircle, FolderSync, CheckCircle, Clock, Music, Users, Video, Plus, Filter, LogOut } from 'lucide-react';
import { VoicePart } from '../types';

export const AdminView: React.FC = () => {
  const { 
    tracks, addTrack, removeTrack, 
    recordings, removeRecording, markRecordingUploaded,
    students, addStudent, removeStudent,
    classes, addClass, removeClass,
    isAdminAuthenticated, logoutAdmin
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'recordings' | 'tracks' | 'students'>('recordings');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [newClassName, setNewClassName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClass, setNewStudentClass] = useState('');
  const [newStudentVoice, setNewStudentVoice] = useState<VoicePart>('Soprano');
  const [recordingFilter, setRecordingFilter] = useState('all');

  if (!isAdminAuthenticated) {
    return <AdminLogin />;
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    addTrack({
      id: `track_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension for display
      fileName: file.name,
      url: url
    });
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const simulateDriveUpload = (recordingId: string) => {
    setSyncingId(recordingId);
    // Simulate network request
    setTimeout(() => {
      markRecordingUploaded(recordingId);
      setSyncingId(null);
    }, 2000);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    addClass({ id: `c_${Date.now()}`, name: newClassName.trim() });
    setNewClassName('');
  };

  const handleDeleteClass = (classId: string) => {
    const hasStudents = students.some(s => s.classId === classId);
    if (hasStudents) {
      alert('Cannot delete a class that has students. Please remove or reassign the students first.');
      return;
    }
    removeClass(classId);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentClass) return;
    addStudent({
      id: `s_${Date.now()}`,
      name: newStudentName.trim(),
      classId: newStudentClass,
      voicePart: newStudentVoice
    });
    setNewStudentName('');
  };

  const getStudentDetails = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    const cls = classes.find(c => c.id === student?.classId);
    return { student, cls };
  };

  const getTrackName = (trackId: string) => {
    return tracks.find(t => t.id === trackId)?.name || 'Unknown Track';
  };

  const filteredRecordings = recordings.filter(r => {
    if (recordingFilter === 'all') return true;
    const student = students.find(s => s.id === r.studentId);
    return student?.classId === recordingFilter;
  });

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Director Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage tracks, students, and review submissions.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg overflow-x-auto">
            <button
              onClick={() => setActiveTab('recordings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'recordings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Video className="w-4 h-4" /> Submissions
            </button>
            <button
              onClick={() => setActiveTab('tracks')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'tracks' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Music className="w-4 h-4" /> Tracks
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'students' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Users className="w-4 h-4" /> Roster
            </button>
          </div>
          
          <button
            onClick={logoutAdmin}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {activeTab === 'recordings' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Submissions</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={recordingFilter}
                onChange={(e) => setRecordingFilter(e.target.value)}
                className="w-full sm:w-auto p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="all">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {filteredRecordings.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Video className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No recordings found for the selected filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRecordings.map(recording => {
                const { student, cls } = getStudentDetails(recording.studentId);
                const trackName = getTrackName(recording.trackId);
                const date = new Date(recording.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

                return (
                  <div key={recording.id} className="p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-slate-50 transition-colors">
                    <div className="w-full md:w-48 aspect-video bg-black rounded-lg overflow-hidden flex-shrink-0 relative group">
                      <video src={recording.videoUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <PlayCircle className="w-10 h-10 text-white opacity-70 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <a href={recording.videoUrl} target="_blank" rel="noreferrer" className="absolute inset-0 z-10" aria-label="Play video"></a>
                    </div>
                    
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-slate-900">{student?.name || 'Unknown Student'}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-slate-600">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {cls?.name}</span>
                        <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {student?.voicePart}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {date}</span>
                      </div>
                      <p className="mt-2 text-sm font-medium text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">
                        Track: {trackName}
                      </p>
                    </div>

                    <div className="flex-shrink-0 w-full md:w-auto flex flex-col sm:flex-row items-center gap-3">
                      {recording.status === 'uploaded' ? (
                        <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 w-full sm:w-auto justify-center">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Saved to Drive</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => simulateDriveUpload(recording.id)}
                          disabled={syncingId === recording.id}
                          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-70 w-full sm:w-auto justify-center"
                        >
                          {syncingId === recording.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <FolderSync className="w-4 h-4" />
                              Sync to Drive
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => removeRecording(recording.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors w-full sm:w-auto flex justify-center"
                        title="Delete recording"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="p-4 bg-blue-50 border-t border-blue-100 text-sm text-blue-800 flex items-start gap-3">
             <FolderSync className="w-5 h-5 flex-shrink-0 mt-0.5" />
             <p>
               <strong>Note on Google Drive Integration:</strong> In a production environment, the "Sync to Drive" action would use a backend service authenticated with the Admin's Google Workspace account to securely transfer the video blob to a specific folder.
             </p>
          </div>
        </div>
      )}

      {activeTab === 'tracks' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Backing Tracks</h2>
            <div>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Track
              </button>
            </div>
          </div>
          
          {tracks.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Music className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p>No tracks uploaded yet. Upload audio files for students to sing along to.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {tracks.map(track => (
                <li key={track.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 flex-shrink-0">
                      <Music className="w-5 h-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-medium text-slate-900 truncate">{track.name}</p>
                      <p className="text-xs text-slate-500 truncate">{track.fileName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <audio src={track.url} controls className="h-8 w-full sm:w-64" />
                    <button
                      onClick={() => removeTrack(track.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete track"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-8">
          {/* Add Forms */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add Class Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                Add New Class
              </h3>
              <form onSubmit={handleAddClass} className="flex gap-3">
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Concert Choir (Period 1)"
                  className="flex-grow p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>
            </div>

            {/* Add Student Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                Add New Student
              </h3>
              <form onSubmit={handleAddStudent} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Student Name"
                    className="flex-grow p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    required
                  />
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    required
                  >
                    <option value="" disabled>Select Class</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <select
                    value={newStudentVoice}
                    onChange={(e) => setNewStudentVoice(e.target.value as VoicePart)}
                    className="p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="Soprano">Soprano</option>
                    <option value="Alto">Alto</option>
                    <option value="Tenor">Tenor</option>
                    <option value="Bass">Bass</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!newStudentClass}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Add Student to Roster
                </button>
              </form>
            </div>
          </div>

          {/* Class Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map(cls => {
              const classStudents = students.filter(s => s.classId === cls.id);
              return (
                <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      {cls.name}
                    </h3>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1"
                      title="Delete Class"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <ul className="divide-y divide-slate-100 flex-grow overflow-y-auto max-h-96">
                    {classStudents.map(student => (
                      <li key={student.id} className="p-3 flex justify-between items-center hover:bg-slate-50 group">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-slate-700">{student.name}</span>
                          <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                            {student.voicePart}
                          </span>
                        </div>
                        <button
                          onClick={() => removeStudent(student.id)}
                          className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1"
                          title="Remove Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    ))}
                    {classStudents.length === 0 && (
                      <li className="p-8 text-sm text-slate-500 text-center">No students in this class.</li>
                    )}
                  </ul>
                </div>
              );
            })}
            {classes.length === 0 && (
              <div className="col-span-full p-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 border-dashed">
                <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                <p>No classes created yet. Add a class above to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
