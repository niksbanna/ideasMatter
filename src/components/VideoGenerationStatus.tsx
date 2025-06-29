import React, { useState, useEffect } from 'react';
import { Video, X, Loader2, CheckCircle, ExternalLink, AlertCircle, Minimize2, Maximize2 } from 'lucide-react';
import { getVideoStatus, VideoGenerationResponse } from '../services/tavus';

interface VideoGenerationStatusProps {
  videoRequests: VideoGenerationResponse[];
  onRemove: (videoId: string) => void;
  onVideoComplete: (videoId: string, videoUrl: string) => void;
}

export const VideoGenerationStatus: React.FC<VideoGenerationStatusProps> = ({
  videoRequests,
  onRemove,
  onVideoComplete
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, {
    status: 'queued' | 'generating' | 'completed' | 'failed';
    progress: number;
    videoUrl?: string;
    error?: string;
  }>>({});

  useEffect(() => {
    // Initialize statuses for new video requests
    const newStatuses = { ...statuses };
    videoRequests.forEach(request => {
      if (!newStatuses[request.video_id]) {
        newStatuses[request.video_id] = {
          status: request.status || 'queued',
          progress: 0,
          videoUrl: request.video_url
        };
      }
    });
    setStatuses(newStatuses);
  }, [videoRequests]);

  useEffect(() => {
    // Set up polling for video status updates
    const videoIds = videoRequests
      .filter(req => req.status !== 'completed' && req.status !== 'failed')
      .map(req => req.video_id);
    
    if (videoIds.length === 0) return;

    const pollInterval = setInterval(() => {
      videoIds.forEach(pollVideoStatus);
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [videoRequests]);

  const pollVideoStatus = async (videoId: string) => {
    try {
      const status = await getVideoStatus(videoId);
      
      setStatuses(prev => {
        const currentStatus = prev[videoId] || { status: 'queued', progress: 0 };
        
        // Calculate progress based on status
        let progress = currentStatus.progress;
        if (status.status === 'queued') progress = 10;
        else if (status.status === 'generating') progress = 50;
        else if (status.status === 'completed') progress = 100;
        
        // If video is completed and we have a URL, notify parent
        if (status.status === 'completed' && status.video_url && currentStatus.status !== 'completed') {
          onVideoComplete(videoId, status.video_url);
        }
        
        return {
          ...prev,
          [videoId]: {
            status: status.status || currentStatus.status,
            progress,
            videoUrl: status.video_url,
            error: status.status === 'failed' ? 'Video generation failed' : undefined
          }
        };
      });
    } catch (error) {
      console.error('Error polling video status:', error);
      setStatuses(prev => ({
        ...prev,
        [videoId]: {
          ...prev[videoId],
          error: 'Failed to check video status'
        }
      }));
    }
  };

  if (videoRequests.length === 0) return null;

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-xl shadow-lg border border-slate-200 z-40 transition-all duration-200 ${
      isMinimized ? 'w-64' : 'w-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-xl">
        <div className="flex items-center space-x-2">
          <Video className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">Video Generation</h3>
            <p className="text-xs text-purple-100">
              {videoRequests.filter(req => 
                !statuses[req.video_id] || 
                (statuses[req.video_id].status !== 'completed' && 
                 statuses[req.video_id].status !== 'failed')
              ).length} in progress
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white transition-colors"
            aria-label={isMinimized ? "Maximize" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="max-h-80 overflow-y-auto p-4 space-y-4">
          {videoRequests.map((request) => {
            const status = statuses[request.video_id] || { status: 'queued', progress: 0 };
            
            return (
              <div key={request.video_id} className="bg-slate-50 rounded-lg p-3 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      {status.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                      ) : status.status === 'failed' ? (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      )}
                      <span className="font-medium text-sm text-slate-900 truncate">
                        {status.status === 'completed' ? 'Video Ready' : 
                         status.status === 'failed' ? 'Generation Failed' :
                         status.status === 'generating' ? 'Generating Video' : 'Queued'}
                      </span>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          status.status === 'completed' ? 'bg-emerald-600' :
                          status.status === 'failed' ? 'bg-red-600' : 'bg-blue-600'
                        }`}
                        style={{ width: `${status.progress}%` }}
                      ></div>
                    </div>
                    
                    {/* Status text */}
                    <div className="text-xs text-slate-500">
                      {status.status === 'queued' && 'Preparing video generation...'}
                      {status.status === 'generating' && 'Creating AI explainer video...'}
                      {status.status === 'completed' && 'Video generation complete!'}
                      {status.status === 'failed' && (status.error || 'Video generation failed')}
                    </div>
                    
                    {/* Actions */}
                    {status.status === 'completed' && status.videoUrl && (
                      <div className="mt-2">
                        <a
                          href={status.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 transition-colors text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>View Video</span>
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => onRemove(request.video_id)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};