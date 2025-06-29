import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { VideoGenerationResponse } from '../services/tavus';
import { VideoGenerationStatus } from '../components/VideoGenerationStatus';

interface VideoGenerationContextType {
  generateVideo: (proposalId: string, script: string) => Promise<VideoGenerationResponse>;
  getVideoUrl: (proposalId: string) => string | null;
  isGenerating: (proposalId: string) => boolean;
  clearVideoRequest: (videoId: string) => void;
}

const VideoGenerationContext = createContext<VideoGenerationContextType | undefined>(undefined);

interface VideoRequest extends VideoGenerationResponse {
  proposalId: string;
}

export const VideoGenerationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [videoRequests, setVideoRequests] = useState<VideoRequest[]>([]);
  const [completedVideos, setCompletedVideos] = useState<Record<string, string>>({});
  
  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedVideos = localStorage.getItem('ideasmatter-completed-videos');
      if (savedVideos) {
        setCompletedVideos(JSON.parse(savedVideos));
      }
    } catch (error) {
      console.error('Error loading saved videos:', error);
    }
  }, []);

  // Save to localStorage when completedVideos changes
  useEffect(() => {
    try {
      localStorage.setItem('ideasmatter-completed-videos', JSON.stringify(completedVideos));
    } catch (error) {
      console.error('Error saving videos to localStorage:', error);
    }
  }, [completedVideos]);

  const generateVideo = async (proposalId: string, script: string): Promise<VideoGenerationResponse> => {
    try {
      // Import dynamically to avoid circular dependencies
      const { generateExplainerVideo } = await import('../services/tavus');
      
      // Generate video
      const response = await generateExplainerVideo(script);
      
      // Add to requests
      setVideoRequests(prev => [
        ...prev, 
        { ...response, proposalId }
      ]);
      
      return response;
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  };

  const getVideoUrl = (proposalId: string): string | null => {
    return completedVideos[proposalId] || null;
  };

  const isGenerating = (proposalId: string): boolean => {
    return videoRequests.some(req => 
      req.proposalId === proposalId && 
      req.status !== 'completed' && 
      req.status !== 'failed'
    );
  };

  const clearVideoRequest = (videoId: string) => {
    setVideoRequests(prev => prev.filter(req => req.video_id !== videoId));
  };

  const handleVideoComplete = (videoId: string, videoUrl: string) => {
    // Find the proposal ID for this video
    const request = videoRequests.find(req => req.video_id === videoId);
    if (request) {
      // Store the completed video URL
      setCompletedVideos(prev => ({
        ...prev,
        [request.proposalId]: videoUrl
      }));
      
      // Show notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Video Generation Complete', {
          body: 'Your AI explainer video is ready to view!',
          icon: '/favicon.ico'
        });
      }
    }
  };

  return (
    <VideoGenerationContext.Provider value={{
      generateVideo,
      getVideoUrl,
      isGenerating,
      clearVideoRequest
    }}>
      {children}
      <VideoGenerationStatus 
        videoRequests={videoRequests}
        onRemove={clearVideoRequest}
        onVideoComplete={handleVideoComplete}
      />
    </VideoGenerationContext.Provider>
  );
};

export const useVideoGeneration = () => {
  const context = useContext(VideoGenerationContext);
  if (context === undefined) {
    throw new Error('useVideoGeneration must be used within a VideoGenerationProvider');
  }
  return context;
};