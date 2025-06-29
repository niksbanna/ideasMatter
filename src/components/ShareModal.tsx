import React, { useState, useEffect } from 'react';
import { X, Share2, Linkedin, Twitter, Instagram, Copy, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  generateSocialShareContent, 
  shareToLinkedIn, 
  shareToTwitter, 
  shareToInstagram, 
  copyShareContent,
  type PlatformContent 
} from '../services/socialShare';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposal: {
    id: string;
    title: string;
    description: string;
    category: string;
    author_name: string;
  };
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, proposal }) => {
  const [shareContent, setShareContent] = useState<PlatformContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<'linkedin' | 'twitter' | 'instagram'>('linkedin');
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && !shareContent) {
      generateContent();
    }
  }, [isOpen]);

  const generateContent = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const content = await generateSocialShareContent(proposal);
      setShareContent(content);
    } catch (err) {
      console.error('Error generating share content:', err);
      setError('Failed to generate share content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = (platform: 'linkedin' | 'twitter' | 'instagram') => {
    if (!shareContent) return;

    const content = shareContent[platform];
    
    switch (platform) {
      case 'linkedin':
        shareToLinkedIn(content);
        break;
      case 'twitter':
        shareToTwitter(content);
        break;
      case 'instagram':
        shareToInstagram(content);
        break;
    }
  };

  const handleCopy = () => {
    if (!shareContent) return;
    copyShareContent(shareContent[selectedPlatform]);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return <Linkedin className="h-5 w-5" />;
      case 'twitter':
        return <Twitter className="h-5 w-5" />;
      case 'instagram':
        return <Instagram className="h-5 w-5" />;
      default:
        return <Share2 className="h-5 w-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'linkedin':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'twitter':
        return 'bg-black hover:bg-gray-800 text-white';
      case 'instagram':
        return 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white';
      default:
        return 'bg-slate-600 hover:bg-slate-700 text-white';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <Share2 className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-bold text-slate-900">Share Proposal</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {isGenerating ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-slate-600">Generating optimized content for social platforms...</p>
              <p className="text-sm text-slate-500 mt-2">Using AI to create platform-specific titles and descriptions</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-4" />
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={generateContent}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : shareContent ? (
            <div className="space-y-6">
              {/* Platform Selection */}
              <div>
                <h4 className="text-lg font-semibold text-slate-900 mb-4">Choose Platform</h4>
                <div className="grid grid-cols-3 gap-3">
                  {(['linkedin', 'twitter', 'instagram'] as const).map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedPlatform === platform
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        {getPlatformIcon(platform)}
                        <span className="font-medium capitalize">{platform}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Preview */}
              <div className="bg-slate-50 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center space-x-2">
                  {getPlatformIcon(selectedPlatform)}
                  <span>Preview for {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}</span>
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="font-semibold text-slate-900">{shareContent[selectedPlatform].title}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <p className="text-slate-700">{shareContent[selectedPlatform].description}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Hashtags</label>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <div className="flex flex-wrap gap-2">
                        {shareContent[selectedPlatform].hashtags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleShare(selectedPlatform)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${getPlatformColor(selectedPlatform)}`}
                >
                  {getPlatformIcon(selectedPlatform)}
                  <span>Share on {selectedPlatform.charAt(0).toUpperCase() + selectedPlatform.slice(1)}</span>
                </button>
                
                <button
                  onClick={handleCopy}
                  className="flex items-center justify-center space-x-2 px-6 py-3 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      <span>Copy Content</span>
                    </>
                  )}
                </button>
              </div>

              {/* Platform-specific Notes */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-blue-800 text-sm">
                    {selectedPlatform === 'linkedin' && (
                      <p><strong>LinkedIn:</strong> Professional content optimized for thought leadership and networking. Perfect for reaching policy professionals and decision-makers.</p>
                    )}
                    {selectedPlatform === 'twitter' && (
                      <p><strong>Twitter/X:</strong> Concise, engaging content designed for maximum reach and retweets. Includes trending hashtags for better visibility.</p>
                    )}
                    {selectedPlatform === 'instagram' && (
                      <p><strong>Instagram:</strong> Visual and inspiring content with popular hashtags. Content will be copied to clipboard - paste it with your post image!</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};