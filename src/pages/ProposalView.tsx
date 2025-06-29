import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Bookmark, BookmarkCheck, User, Calendar, Tag, Volume2, Video, ArrowLeft, ExternalLink, LogIn, Clock, Heart, CheckCircle, X, Flag, Globe } from 'lucide-react';
import { AudioPlayer } from '../components/AudioPlayer';
import { VideoPlayer } from '../components/VideoPlayer';
import { CommentSection } from '../components/CommentSection';
import { AuthModal } from '../components/AuthModal';
import { ShareModal } from '../components/ShareModal';
import { ReportModal } from '../components/ReportModal';
import { LanguageSelector } from '../components/LanguageSelector';
import { TranslatedContent } from '../components/TranslatedContent';
import { generateSpeech, formatTextForSpeech } from '../services/elevenlabs';
import { generateExplainerVideo, generateVideoScript, getVideoStatus } from '../services/tavus';
import { getProposal, Proposal } from '../services/supabase';
import { submitVote, getUserVote, toggleSave, isSaved } from '../services/interactions';
import { isAuthenticated } from '../services/auth';
import { audioCache } from '../services/audioCache';
import { translationService, type Translation } from '../services/translation';

export const ProposalView: React.FC = () => {
  const { id } = useParams();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userVote, setUserVote] = useState<'up' | 'down' | 'yes' | 'no' | 'like' | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [savedStatus, setSavedStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [authAction, setAuthAction] = useState<'vote' | 'comment' | 'save' | 'report'>('vote');
  
  // Audio state
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [isAudioCached, setIsAudioCached] = useState(false);
  
  // Video state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Translation state
  const [translations, setTranslations] = useState<{ title: Translation; description: Translation } | null>(null);
  const [translatedAudioBlob, setTranslatedAudioBlob] = useState<Blob | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  useEffect(() => {
    if (id) {
      loadProposal(id);
    }
  }, [id]);

  useEffect(() => {
    if (proposal && isAuthenticated()) {
      loadUserInteractions();
    }
  }, [proposal]);

  // Check for cached audio when proposal loads
  useEffect(() => {
    if (proposal?.ai_draft) {
      const textContent = formatTextForSpeech(proposal.ai_draft);
      const cachedAudio = audioCache.getCachedAudio(proposal.id, textContent);
      
      if (cachedAudio) {
        setAudioBlob(cachedAudio);
        setIsAudioCached(true);
        console.log('Found cached audio for proposal:', proposal.id);
      }
    }
  }, [proposal]);

  const loadProposal = async (proposalId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProposal(proposalId);
      if (data) {
        setProposal(data);
      } else {
        setError('Idea not found');
      }
    } catch (err) {
      setError('Failed to load idea');
      console.error('Error loading proposal:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserInteractions = async () => {
    if (!proposal || !isAuthenticated()) return;

    try {
      // Load user vote
      const vote = await getUserVote(proposal.id);
      setUserVote(vote);

      // Load save status
      const saved = await isSaved(proposal.id);
      setSavedStatus(saved);
    } catch (error) {
      console.error('Error loading user interactions:', error);
    }
  };

  const requireAuth = (action: 'vote' | 'comment' | 'save' | 'report') => {
    if (!isAuthenticated()) {
      setAuthAction(action);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleVote = async (voteType: 'up' | 'down' | 'yes' | 'no' | 'like') => {
    if (!proposal || isVoting) return;
    
    if (!requireAuth('vote')) return;

    try {
      setIsVoting(true);
      await submitVote(proposal.id, voteType);
      
      // Update local state
      if (userVote === voteType) {
        setUserVote(null);
      } else {
        setUserVote(voteType);
      }

      // Reload proposal to get updated vote counts
      await loadProposal(proposal.id);
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };

  const handleSave = async () => {
    if (!proposal || isSaving) return;
    
    if (!requireAuth('save')) return;

    try {
      setIsSaving(true);
      const newSavedStatus = await toggleSave(proposal.id);
      setSavedStatus(newSavedStatus);
    } catch (error) {
      console.error('Error toggling save:', error);
      alert('Failed to save idea. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    if (!proposal) return;
    setShowShareModal(true);
  };

  const handleReport = () => {
    if (!requireAuth('report')) return;
    setShowReportModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // Reload user interactions after successful auth
    if (proposal) {
      loadUserInteractions();
    }
    
    // If user was trying to report, show report modal
    if (authAction === 'report') {
      setShowReportModal(true);
    }
  };

  const handleGenerateAudio = async () => {
    if (!proposal?.ai_draft) return;

    const textContent = formatTextForSpeech(proposal.ai_draft);
    
    // Check cache first
    const cachedAudio = audioCache.getCachedAudio(proposal.id, textContent);
    if (cachedAudio) {
      setAudioBlob(cachedAudio);
      setIsAudioCached(true);
      setShowAudioPlayer(true);
      console.log('Using cached audio for proposal:', proposal.id);
      return;
    }

    try {
      setIsGeneratingAudio(true);
      setShowAudioPlayer(true);
      setIsAudioCached(false);
      
      const audioBlob = await generateSpeech(textContent);
      
      // Cache the generated audio
      audioCache.setCachedAudio(proposal.id, textContent, audioBlob);
      
      setAudioBlob(audioBlob);
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate audio. Please check your ElevenLabs API configuration.');
      setShowAudioPlayer(false);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!proposal?.ai_draft) return;

    try {
      setIsGeneratingVideo(true);
      setShowVideoPlayer(true);
      setVideoError(null);
      
      // Generate script using AI
      const script = await generateVideoScript(proposal.ai_draft);
      
      // Generate video using Tavus
      const videoResponse = await generateExplainerVideo(script);
      
      // Poll for video completion
      const pollVideo = async () => {
        try {
          const status = await getVideoStatus(videoResponse.video_id);
          
          if (status.status === 'completed' && status.video_url) {
            setVideoUrl(status.video_url);
            setIsGeneratingVideo(false);
          } else if (status.status === 'failed') {
            throw new Error('Video generation failed');
          } else {
            // Continue polling
            setTimeout(pollVideo, 5000);
          }
        } catch (error) {
          console.error('Error polling video status:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          setVideoError(`Failed to generate video: ${errorMessage}`);
          setIsGeneratingVideo(false);
        }
      };
      
      // Start polling after a short delay
      setTimeout(pollVideo, 5000);
      
    } catch (error) {
      console.error('Error generating video:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setVideoError(`Failed to generate video: ${errorMessage}`);
      setIsGeneratingVideo(false);
    }
  };

  const handleTranslationChange = (newTranslations: { title: Translation; description: Translation } | null) => {
    setTranslations(newTranslations);
  };

  const handleTranslatedAudioChange = (audioBlob: Blob | null, language: string) => {
    setTranslatedAudioBlob(audioBlob);
    setSelectedLanguage(language);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading idea...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="text-red-600 mb-4">
            <h3 className="text-xl font-semibold mb-2">Error</h3>
            <p>{error || 'Idea not found'}</p>
          </div>
          <Link
            to="/explorer"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Explorer
          </Link>
        </div>
      </div>
    );
  }

  const getVoteScore = () => {
    if (proposal.idea_type === 'proposal') {
      return (proposal.votes_up || 0) - (proposal.votes_down || 0);
    } else {
      return (proposal.votes_yes || 0) + (proposal.likes || 0) - (proposal.votes_no || 0);
    }
  };

  const getTotalVotes = () => {
    if (proposal.idea_type === 'proposal') {
      return (proposal.votes_up || 0) + (proposal.votes_down || 0);
    } else {
      return (proposal.votes_yes || 0) + (proposal.votes_no || 0) + (proposal.likes || 0);
    }
  };

  const getYesPercentage = () => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round(((proposal.votes_yes || 0) / total) * 100);
  };

  const getNoPercentage = () => {
    const total = getTotalVotes();
    if (total === 0) return 0;
    return Math.round(((proposal.votes_no || 0) / total) * 100);
  };

  const authenticated = isAuthenticated();

  // Check if audio is available (cached or generated)
  const hasAudio = !!audioBlob;
  const textContent = proposal.ai_draft ? formatTextForSpeech(proposal.ai_draft) : '';
  const hasCachedAudio = proposal.ai_draft ? audioCache.hasCache(proposal.id, textContent) : false;

  const getCategoryColor = (category: string) => {
    const colors = {
      'Civic': 'bg-blue-100 text-blue-800',
      'Tech': 'bg-indigo-100 text-indigo-800',
      'Fun': 'bg-pink-100 text-pink-800',
      'Life': 'bg-purple-100 text-purple-800',
      'Products': 'bg-orange-100 text-orange-800',
      'Environment': 'bg-green-100 text-green-800',
      'Education': 'bg-purple-100 text-purple-800',
      'Healthcare': 'bg-red-100 text-red-800',
      'Transportation': 'bg-orange-100 text-orange-800',
      'Economy': 'bg-yellow-100 text-yellow-800',
      'Social': 'bg-pink-100 text-pink-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Food': 'bg-orange-100 text-orange-800',
      'Sports': 'bg-green-100 text-green-800',
      'Travel': 'bg-blue-100 text-blue-800',
      'Science': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category as keyof typeof colors] || 'bg-slate-100 text-slate-800';
  };

  const getTypeColor = (type: string) => {
    return type === 'proposal' 
      ? 'bg-emerald-100 text-emerald-800' 
      : 'bg-blue-100 text-blue-800';
  };

  const selectedLangInfo = translationService.getLanguageInfo(selectedLanguage);

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Navigation */}
        <Link
          to="/explorer"
          className="inline-flex items-center space-x-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Explorer</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl font-bold text-slate-900">{proposal.title}</h1>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(proposal.idea_type)}`}>
                  {proposal.idea_type === 'proposal' ? 'Proposal' : 'Poll'}
                </span>
                {proposal.ai_draft && (
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                    AI Generated Policy
                  </span>
                )}
              </div>
              
              <div className="flex items-center space-x-6 text-slate-600 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{proposal.author_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(proposal.category)}`}>
                    {proposal.category}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  proposal.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  proposal.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Language Selector */}
              <LanguageSelector
                title={proposal.title}
                description={proposal.description}
                proposalId={proposal.id}
                onTranslationChange={handleTranslationChange}
                onAudioChange={handleTranslatedAudioChange}
              />
              
              {/* Report Button */}
              <button
                onClick={handleReport}
                className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                title="Report this content"
              >
                <Flag className="h-4 w-4" />
                <span>Report</span>
              </button>
            </div>
          </div>

          {/* Original Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              {proposal.idea_type === 'proposal' ? 'Original Idea' : 'Description'}
            </h3>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg">
              {proposal.description}
            </p>
          </div>

          {/* Translated Content */}
          {translations && selectedLanguage !== 'en' && (
            <div className="mb-6">
              <TranslatedContent
                originalTitle={proposal.title}
                originalDescription={proposal.description}
                translations={translations}
                audioBlob={translatedAudioBlob}
                language={selectedLanguage}
                languageFlag={selectedLangInfo?.flag || '🌍'}
                languageName={selectedLangInfo?.nativeName || 'Unknown'}
              />
            </div>
          )}
          
          {/* Media Controls - Only for proposals with AI drafts */}
          {proposal.ai_draft && (
            <div className="border-t border-slate-200 pt-6 mb-6">
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                    hasAudio || hasCachedAudio
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white'
                  }`}
                >
                  {hasCachedAudio && !hasAudio ? (
                    <>
                      <Clock className="h-4 w-4" />
                      <span>🔊 Listen (Cached)</span>
                    </>
                  ) : hasAudio ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>🔊 Listen</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4" />
                      <span>🔊 Generate Audio</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  <Video className="h-4 w-4" />
                  <span>🎥 Watch Explainer</span>
                </button>
              </div>
              
              {/* Cache info */}
              {hasCachedAudio && !hasAudio && (
                <div className="mt-3 text-sm text-emerald-600 flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Audio is cached and ready for instant playback</span>
                </div>
              )}
            </div>
          )}
          
          {/* Audio Player */}
          {showAudioPlayer && (
            <div className="mb-6">
              <AudioPlayer
                audioBlob={audioBlob}
                isLoading={isGeneratingAudio}
                isCached={isAudioCached}
                onPlay={() => console.log('Audio started playing')}
                onPause={() => console.log('Audio paused')}
              />
            </div>
          )}
          
          {/* Video Player */}
          {showVideoPlayer && (
            <div className="mb-6">
              <VideoPlayer
                videoUrl={videoUrl}
                isLoading={isGeneratingVideo}
                error={videoError}
                onClose={() => setShowVideoPlayer(false)}
              />
            </div>
          )}
          
          {/* Voting Section */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-4">
                  {proposal.idea_type === 'proposal' ? (
                    // Traditional up/down voting for proposals
                    authenticated ? (
                      <>
                        <button
                          onClick={() => handleVote('up')}
                          disabled={isVoting}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                            userVote === 'up'
                              ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                              : 'border-slate-300 hover:border-emerald-300 hover:bg-emerald-50'
                          } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <ThumbsUp className="h-5 w-5" />
                          <span className="font-semibold">{proposal.votes_up || 0}</span>
                        </button>
                        
                        <button
                          onClick={() => handleVote('down')}
                          disabled={isVoting}
                          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                            userVote === 'down'
                              ? 'bg-red-100 border-red-300 text-red-700'
                              : 'border-slate-300 hover:border-red-300 hover:bg-red-50'
                          } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <ThumbsDown className="h-5 w-5" />
                          <span className="font-semibold">{proposal.votes_down || 0}</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => requireAuth('vote')}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                        >
                          <ThumbsUp className="h-5 w-5" />
                          <span className="font-semibold">{proposal.votes_up || 0}</span>
                        </button>
                        
                        <button
                          onClick={() => requireAuth('vote')}
                          className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-red-300 hover:bg-red-50 transition-all"
                        >
                          <ThumbsDown className="h-5 w-5" />
                          <span className="font-semibold">{proposal.votes_down || 0}</span>
                        </button>
                      </>
                    )
                  ) : (
                    // Yes/No/Like voting for polls
                    <div className="flex items-center space-x-4">
                      {authenticated ? (
                        <>
                          <button
                            onClick={() => handleVote('yes')}
                            disabled={isVoting}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                              userVote === 'yes'
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
                                : 'border-slate-300 hover:border-emerald-300 hover:bg-emerald-50'
                            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-semibold">Yes ({proposal.votes_yes || 0})</span>
                          </button>
                          
                          <button
                            onClick={() => handleVote('no')}
                            disabled={isVoting}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                              userVote === 'no'
                                ? 'bg-red-100 border-red-300 text-red-700'
                                : 'border-slate-300 hover:border-red-300 hover:bg-red-50'
                            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <X className="h-5 w-5" />
                            <span className="font-semibold">No ({proposal.votes_no || 0})</span>
                          </button>

                          <button
                            onClick={() => handleVote('like')}
                            disabled={isVoting}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all ${
                              userVote === 'like'
                                ? 'bg-pink-100 border-pink-300 text-pink-700'
                                : 'border-slate-300 hover:border-pink-300 hover:bg-pink-50'
                            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Heart className="h-5 w-5" />
                            <span className="font-semibold">{proposal.likes || 0}</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => requireAuth('vote')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                          >
                            <CheckCircle className="h-5 w-5" />
                            <span className="font-semibold">Yes ({proposal.votes_yes || 0})</span>
                          </button>
                          
                          <button
                            onClick={() => requireAuth('vote')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-red-300 hover:bg-red-50 transition-all"
                          >
                            <X className="h-5 w-5" />
                            <span className="font-semibold">No ({proposal.votes_no || 0})</span>
                          </button>

                          <button
                            onClick={() => requireAuth('vote')}
                            className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-slate-300 hover:border-pink-300 hover:bg-pink-50 transition-all"
                          >
                            <Heart className="h-5 w-5" />
                            <span className="font-semibold">{proposal.likes || 0}</span>
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  <div className="text-slate-600 font-medium">
                    Score: {getVoteScore()}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {authenticated ? (
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-all ${
                      savedStatus
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'border-slate-300 hover:bg-slate-50'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {savedStatus ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    <span>{savedStatus ? 'Saved' : 'Save'}</span>
                  </button>
                ) : (
                  <button 
                    onClick={() => requireAuth('save')}
                    className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <Bookmark className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                )}
                
                <button 
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* Poll Results for polls */}
            {proposal.idea_type === 'poll' && getTotalVotes() > 0 && (
              <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                <h4 className="font-semibold text-slate-900 mb-3">Poll Results</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-700">Yes</span>
                    <span className="text-sm font-medium text-emerald-700">{getYesPercentage()}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getYesPercentage()}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-red-700">No</span>
                    <span className="text-sm font-medium text-red-700">{getNoPercentage()}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getNoPercentage()}%` }}
                    ></div>
                  </div>
                  
                  <div className="text-center text-sm text-slate-600 mt-3">
                    Total votes: {getTotalVotes()} • Likes: {proposal.likes || 0}
                  </div>
                </div>
              </div>
            )}

            {/* Auth prompt for anonymous users */}
            {!authenticated && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <LogIn className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-blue-900 font-medium">Want to engage with this {proposal.idea_type}?</p>
                    <p className="text-blue-700 text-sm">Sign in to vote, comment, and save ideas you're interested in.</p>
                  </div>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Sign In
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Policy Content - Only for proposals with AI drafts */}
        {proposal.ai_draft && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <span>Problem Statement</span>
              </h2>
              <p className="text-slate-700 leading-relaxed">{proposal.ai_draft.problem}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <span>Proposed Solution</span>
              </h2>
              <p className="text-slate-700 leading-relaxed">{proposal.ai_draft.solution}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <span>Expected Impact</span>
              </h2>
              <p className="text-slate-700 leading-relaxed">{proposal.ai_draft.impact}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <span className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <span>Implementation Plan</span>
              </h2>
              <p className="text-slate-700 leading-relaxed">{proposal.ai_draft.implementation}</p>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <CommentSection 
          proposalId={proposal.id} 
          requireAuth={() => requireAuth('comment')}
          isAuthenticated={authenticated}
        />

        {/* Related Ideas */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Related Ideas</h2>
          <div className="text-center text-slate-500 py-8">
            <p>Related ideas will appear here based on category and content similarity.</p>
            <Link
              to="/explorer"
              className="inline-flex items-center space-x-2 mt-4 text-blue-600 hover:text-blue-700"
            >
              <span>Explore all ideas</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        initialMode="signin"
      />

      {/* Share Modal */}
      {proposal && (
        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          proposal={proposal}
        />
      )}

      {/* Report Modal */}
      {proposal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          ideaId={proposal.id}
          ideaTitle={proposal.title}
          onAuthRequired={() => {
            setShowReportModal(false);
            setShowAuthModal(true);
          }}
        />
      )}
    </>
  );
};