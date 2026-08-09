import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Square, Circle, AlertCircle, Settings, Mic, Volume2, Music } from 'lucide-react';

interface VideoRecorderProps {
  trackUrl?: string;
  onRecordingComplete: (blobUrl: string) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ trackUrl, onRecordingComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  
  // Settings State
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('');
  const [micVolume, setMicVolume] = useState<number>(1);
  const [trackVolume, setTrackVolume] = useState<number>(1);
  const [showSettings, setShowSettings] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  // Web Audio API refs for mixing
  const audioContextRef = useRef<AudioContext | null>(null);
  const trackSourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const micSourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const micGainNodeRef = useRef<GainNode | null>(null);
  const trackGainNodeRef = useRef<GainNode | null>(null);

  // Keep streamRef updated for cleanup
  useEffect(() => {
    streamRef.current = stream;
  }, [stream]);

  useEffect(() => {
    let mounted = true;
    
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        
        if (!mounted) {
          mediaStream.getTracks().forEach(t => t.stop());
          return;
        }

        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);

        // Enumerate devices after permission is granted
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devices.filter(d => d.kind === 'audioinput');
        setAudioDevices(audioInputs);
        
        if (audioInputs.length > 0) {
          const activeAudioTrack = mediaStream.getAudioTracks()[0];
          const activeDevice = audioInputs.find(d => d.label === activeAudioTrack?.label);
          setSelectedAudioDevice(activeDevice?.deviceId || audioInputs[0].deviceId);
        }
      } catch (err) {
        if (mounted) {
          setError('Could not access camera or microphone. Please ensure permissions are granted.');
          console.error('Error accessing media devices:', err);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Reset track source node if trackUrl changes to allow re-binding to new audio element
  useEffect(() => {
    trackSourceNodeRef.current = null;
  }, [trackUrl]);

  // Update gain nodes when volume changes
  useEffect(() => {
    if (micGainNodeRef.current) {
      micGainNodeRef.current.gain.value = micVolume;
    }
  }, [micVolume]);

  useEffect(() => {
    if (trackGainNodeRef.current) {
      trackGainNodeRef.current.gain.value = trackVolume;
    }
    if (audioRef.current) {
      audioRef.current.volume = Math.min(trackVolume, 1); // HTML volume max is 1
    }
  }, [trackVolume]);

  const switchDevice = async (deviceId: string) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { 
          deviceId: { exact: deviceId }, 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        }
      });
      
      setStream(prevStream => {
        if (prevStream) prevStream.getTracks().forEach(t => t.stop());
        return mediaStream;
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error switching device", err);
    }
  };

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = e.target.value;
    setSelectedAudioDevice(deviceId);
    switchDevice(deviceId);
  };

  const startRecordingProcess = () => {
    if (!stream) return;
    
    // Initialize and resume AudioContext on direct user interaction to comply with browser policies
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setCountdown(3);
    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(interval);
        setCountdown(null);
        executeStartRecording();
      }
    }, 1000);
  };

  const executeStartRecording = () => {
    if (!stream) return;

    chunksRef.current = [];
    let recordStream = stream;

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;

      if (!destinationNodeRef.current) {
        destinationNodeRef.current = ctx.createMediaStreamDestination();
      }
      const dest = destinationNodeRef.current;

      // Setup Mic Gain
      if (!micGainNodeRef.current) {
        micGainNodeRef.current = ctx.createGain();
      }
      micGainNodeRef.current.gain.value = micVolume;

      // Connect Mic
      if (micSourceNodeRef.current) {
        micSourceNodeRef.current.disconnect();
      }
      micSourceNodeRef.current = ctx.createMediaStreamSource(stream);
      micSourceNodeRef.current.connect(micGainNodeRef.current);
      micGainNodeRef.current.connect(dest);

      // Setup Track Gain & Connect if track exists
      if (trackUrl && audioRef.current) {
        if (!trackGainNodeRef.current) {
          trackGainNodeRef.current = ctx.createGain();
        }
        trackGainNodeRef.current.gain.value = trackVolume;

        if (!trackSourceNodeRef.current) {
          trackSourceNodeRef.current = ctx.createMediaElementSource(audioRef.current);
        }
        // Disconnect to avoid duplicate connections if called multiple times
        trackSourceNodeRef.current.disconnect();
        trackSourceNodeRef.current.connect(trackGainNodeRef.current);
        trackGainNodeRef.current.connect(dest);
        trackGainNodeRef.current.connect(ctx.destination); // For local monitoring
      }

      // Combine video and mixed audio
      const videoTracks = stream.getVideoTracks();
      const mixedAudioTracks = dest.stream.getAudioTracks();

      if (videoTracks.length > 0 && mixedAudioTracks.length > 0) {
        recordStream = new MediaStream([videoTracks[0], mixedAudioTracks[0]]);
      }
    } catch (err) {
      console.error("Error mixing audio:", err);
      recordStream = stream; // Fallback
    }

    const mediaRecorder = new MediaRecorder(recordStream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      onRecordingComplete(url);
    };

    mediaRecorder.start();
    setIsRecording(true);

    if (audioRef.current && trackUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Audio play failed", e));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl flex items-center gap-3 border border-red-200">
        <AlertCircle className="w-6 h-6" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-xl border-4 border-slate-800">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted // Mute local playback to avoid feedback loop
          className="w-full h-full object-cover transform scale-x-[-1]" // Mirror effect
        />
        
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <span className="text-white text-8xl font-bold animate-pulse">{countdown}</span>
          </div>
        )}

        {isRecording && (
          <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/20 px-3 py-1.5 rounded-full backdrop-blur-sm border border-red-500/50">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-100 text-sm font-medium tracking-wider">REC</span>
          </div>
        )}
      </div>

      {/* Settings Panel Toggle */}
      <div className="w-full flex justify-end mt-4">
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
          Audio Settings
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-full mt-2 p-5 bg-white border border-slate-200 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <Mic className="w-4 h-4 text-indigo-500" />
                Microphone Input
              </label>
              <select 
                value={selectedAudioDevice} 
                onChange={handleDeviceChange}
                disabled={isRecording || countdown !== null}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
              >
                {audioDevices.length === 0 && <option value="">Loading devices...</option>}
                {audioDevices.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 5)}...`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Volume2 className="w-4 h-4 text-indigo-500" />
                  Mic Volume
                </label>
                <span className="text-xs font-medium text-slate-500">{Math.round(micVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="2" step="0.1" 
                value={micVolume} 
                onChange={(e) => setMicVolume(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
            </div>
          </div>

          {trackUrl && (
            <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Music className="w-4 h-4 text-indigo-500" />
                    Backing Track Volume
                  </label>
                  <span className="text-xs font-medium text-slate-500">{Math.round(trackVolume * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="2" step="0.1" 
                  value={trackVolume} 
                  onChange={(e) => setTrackVolume(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Adjust the track volume to balance with your voice. Use headphones to prevent the track from bleeding into your microphone.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {trackUrl && (
        <audio 
          key={trackUrl} // Force remount when track changes to allow new MediaElementSource
          ref={audioRef} 
          src={trackUrl} 
          crossOrigin="anonymous"
          className="hidden" 
        />
      )}

      <div className="mt-8 flex items-center gap-6">
        {!isRecording ? (
          <button
            onClick={startRecordingProcess}
            disabled={!stream || countdown !== null}
            className="group relative flex items-center justify-center w-20 h-20 bg-red-500 hover:bg-red-600 rounded-full shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 rounded-full border-4 border-red-200 scale-110 group-hover:scale-125 transition-transform opacity-50" />
            <Circle className="w-8 h-8 text-white fill-white" />
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center w-20 h-20 bg-slate-800 hover:bg-slate-700 rounded-full shadow-lg transition-all"
          >
            <Square className="w-8 h-8 text-red-500 fill-red-500" />
          </button>
        )}
      </div>
      
      <p className="mt-4 text-sm text-slate-500 text-center max-w-md">
        {trackUrl 
          ? "Tip: Use headphones to hear the backing track clearly without it bleeding into your recording."
          : "Select a track above to sing along."}
      </p>
    </div>
  );
};
