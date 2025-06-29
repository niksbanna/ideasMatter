import React, { useState } from 'react';
import { Play, X, Loader2, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string | null;
  isLoading: boolean;
  error?: string;
  onClose?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  isLoading,
  error,
  onClose,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    onClose?.();
  };

  if (isLoading) {
    return (
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-slate-600">Generating explainer video...</span>
        </div>
        <div className="mt-3 text-sm text-slate-500 text-center">
          This may take 1-2 minutes to complete
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-xl p-6 border border-red-200">
        <div className="flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return null;
  }

  return (
    <>
      {/* Video Preview/Thumbnail */}
      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 rounded-full p-2">
              <Play className="h-4 w-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900">AI Explainer Video</h4>
              <p className="text-sm text-slate-600">Watch a 30-second overview of this policy</p>
            </div>
          </div>
          <button
            onClick={openModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Watch Video
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <h3 className="text-xl font-bold text-slate-900">Policy Explainer Video</h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                  onError={(e) => {
                    console.error('Video playback error:', e);
                  }}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              
              <div className="mt-4 text-sm text-slate-600">
                <p>This AI-generated video provides a quick overview of the policy proposal, highlighting key benefits and implementation details.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};