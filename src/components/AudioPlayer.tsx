import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Loader2, Clock, CheckCircle } from 'lucide-react';

interface AudioPlayerProps {
  audioBlob: Blob | null;
  isLoading: boolean;
  isCached?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioBlob,
  isLoading,
  isCached = false,
  onPlay,
  onPause,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (audioBlob && audioRef.current) {
      // Clean up previous URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      
      // Create new URL for the audio blob
      audioUrlRef.current = URL.createObjectURL(audioBlob);
      audioRef.current.src = audioUrlRef.current;
    }

    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, [audioBlob]);

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      onPause?.();
    } else {
      audioRef.current.play();
      setIsPlaying(true);
      onPlay?.();
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-slate-600">Generating audio...</span>
        </div>
        <div className="mt-2 text-xs text-slate-500 text-center">
          This may take a few moments
        </div>
      </div>
    );
  }

  if (!audioBlob) {
    return null;
  }

  return (
    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        preload="metadata"
      />
      
      {/* Cache indicator */}
      {isCached && (
        <div className="flex items-center space-x-2 mb-4 text-sm text-emerald-600">
          <CheckCircle className="h-4 w-4" />
          <span>Loaded from cache (instant playback)</span>
        </div>
      )}
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={togglePlayPause}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-colors flex-shrink-0 shadow-lg hover:shadow-xl"
            disabled={!audioBlob}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            
            <div className="relative">
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className="slider w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentTime / duration) * 100}%, #e2e8f0 ${(currentTime / duration) * 100}%, #e2e8f0 100%)`
                }}
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <Volume2 className="h-4 w-4 text-slate-600" />
            <div className="w-20">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="slider w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${volume * 100}%, #e2e8f0 ${volume * 100}%, #e2e8f0 100%)`
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Audio info */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-4">
            <span>Policy Audio Summary</span>
            {isCached && (
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Cached</span>
              </div>
            )}
          </div>
          <span>AI Generated</span>
        </div>
      </div>
    </div>
  );
};