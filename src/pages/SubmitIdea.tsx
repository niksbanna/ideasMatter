import React, { useState } from 'react';
import { Send, Lightbulb, FileText, Loader2, CheckCircle, AlertCircle, Database, Bot, Shield, Eye, EyeOff, MessageSquare, Vote, Wallet } from 'lucide-react';
import { generatePolicyDraft } from '../services/gemini';
import { submitIdea, updateProposalDraft } from '../services/supabase';
import { getCurrentUser } from '../services/auth';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { ideaValidationService, type ValidationResult } from '../services/ideaValidation';
import { WalletConnect } from '../components/WalletConnect';
import { submitProposalToBlockchain } from '../services/blockchainVoting';
import { BlockchainProposalStatus } from '../components/BlockchainProposalStatus';

export const SubmitIdea: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [ideaType, setIdeaType] = useState<'proposal' | 'poll'>('poll');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error' | 'validation_failed'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showValidationDetails, setShowValidationDetails] = useState(false);
  
  // Blockchain state
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<string | null>(null);
  const [showWalletConnect, setShowWalletConnect] = useState(false);
  const [isBlockchainSubmitting, setIsBlockchainSubmitting] = useState(false);
  const [blockchainTxId, setBlockchainTxId] = useState<string | null>(null);
  const [blockchainError, setBlockchainError] = useState<string | null>(null);
  const [submittedProposalId, setSubmittedProposalId] = useState<string | null>(null);

  const categories = [
    'General',
    'Civic',
    'Tech',
    'Fun',
    'Life',
    'Products',
    'Environment',
    'Education',
    'Healthcare',
    'Transportation',
    'Urban Planning',
    'Economy',
    'Social',
    'Entertainment',
    'Food',
    'Sports',
    'Travel',
    'Science'
  ];

  const ideaTypes = [
    {
      value: 'poll',
      label: 'Community Poll / Idea',
      description: 'Share an idea, question, or opinion for community discussion',
      icon: MessageSquare,
      examples: ['Is cereal soup?', 'Best pizza topping?', 'Should we have 4-day work weeks?']
    },
    {
      value: 'proposal',
      label: 'AI Drafted Proposal',
      description: 'Create a structured policy proposal with AI assistance',
      icon: FileText,
      examples: ['Renewable energy incentives', 'Public transportation improvements', 'Education reform']
    }
  ];

  // Check if Supabase is configured
  const isSupabaseConfigured = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    return supabaseUrl && 
           supabaseKey && 
           supabaseUrl !== 'your_supabase_url_here' && 
           supabaseKey !== 'your_supabase_anon_key_here';
  };

  // Check if Gemini is configured
  const isGeminiConfigured = () => {
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    return geminiKey && geminiKey !== 'your_gemini_api_key_here';
  };

  const handleWalletChange = (address: string | null, provider: string | null) => {
    setWalletAddress(address);
    setWalletProvider(provider);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const user = getCurrentUser();
    if (!user) {
      setErrorMessage('You must be logged in to submit ideas');
      setSubmissionStatus('error');
      return;
    }

    // Check Supabase configuration before proceeding
    if (!isSupabaseConfigured()) {
      setErrorMessage('Database connection is not configured. Please set up your Supabase credentials in the .env file.');
      setSubmissionStatus('error');
      return;
    }

    // Check Gemini configuration only for proposals
    if (ideaType === 'proposal' && !isGeminiConfigured()) {
      setErrorMessage('Gemini AI is not configured. Please set up your VITE_GEMINI_API_KEY in the .env file for AI proposals.');
      setSubmissionStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus('idle');
    setErrorMessage('');
    setValidationResult(null);
    setBlockchainError(null);
    setBlockchainTxId(null);

    try {
      // Step 1: Validate the idea with AI
      setIsValidating(true);
      const validation = await ideaValidationService.validateIdea(
        title.trim(),
        description.trim(),
        category
      );
      
      setValidationResult(validation);
      setIsValidating(false);

      // Step 2: Submit the idea to Supabase (always save, but mark status based on validation)
      const proposalStatus = validation.isValid ? 'draft' : 'rejected';
      const proposalId = await submitIdea({
        title: title.trim(),
        description: description.trim(),
        author_name: user.user_metadata?.full_name || user.email.split('@')[0],
        category,
        user_id: user.id,
        status: proposalStatus,
        validation_score: validation.score,
        validation_reasons: validation.reasons,
        idea_type: ideaType
      });

      setSubmittedProposalId(proposalId);

      if (!validation.isValid) {
        // Idea failed validation - saved as draft but not public
        setSubmissionStatus('validation_failed');
        setErrorMessage(validation.feedback || 'Your idea needs review before it can be made public.');
        
        // Reset form after a delay
        setTimeout(() => {
          setTitle('');
          setDescription('');
          setCategory('General');
          setIdeaType('poll');
          setSubmissionStatus('idle');
          setValidationResult(null);
        }, 8000);
        
        return;
      }

      // Step 3: Generate AI policy draft (only for proposal type)
      if (ideaType === 'proposal') {
        setIsGenerating(true);
        const aiDraft = await generatePolicyDraft(title, description);
        await updateProposalDraft(proposalId, aiDraft, 'active');
      } else {
        // For polls, just make them active without AI draft
        await updateProposalDraft(proposalId, null, 'active');
      }

      // Step 4: Submit to blockchain if wallet is connected
      if (walletAddress && ideaType === 'proposal') {
        setIsBlockchainSubmitting(true);
        try {
          const blockchainResult = await submitProposalToBlockchain(
            proposalId,
            title.trim(),
            description.trim(),
            walletAddress
          );
          
          if (blockchainResult.success && blockchainResult.txId) {
            setBlockchainTxId(blockchainResult.txId);
          } else if (blockchainResult.error) {
            setBlockchainError(blockchainResult.error);
          }
        } catch (blockchainError) {
          console.error('Error submitting to blockchain:', blockchainError);
          setBlockchainError(blockchainError instanceof Error ? blockchainError.message : 'Unknown blockchain error');
        } finally {
          setIsBlockchainSubmitting(false);
        }
      }

      // Success!
      setSubmissionStatus('success');
      
      // Reset form after a delay
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setCategory('General');
        setIdeaType('poll');
        setSubmissionStatus('idle');
        setValidationResult(null);
        setSubmittedProposalId(null);
        setBlockchainTxId(null);
        setBlockchainError(null);
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting idea:', error);
      
      let errorMsg = 'An unexpected error occurred';
      if (error instanceof Error) {
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
      setIsValidating(false);
      setIsGenerating(false);
    }
  };

  const getValidationIcon = () => {
    if (!validationResult) return null;
    
    if (validationResult.isValid) {
      return <CheckCircle className="h-5 w-5 text-emerald-600" />;
    } else {
      return <AlertCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getValidationColor = () => {
    if (!validationResult) return '';
    
    if (validationResult.isValid) {
      return 'bg-emerald-50 border-emerald-200';
    } else {
      return 'bg-red-50 border-red-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isFormValid = title.trim() && description.trim();
  const canSubmit = isFormValid && isSupabaseConfigured() && (ideaType === 'poll' || isGeminiConfigured());

  const selectedIdeaType = ideaTypes.find(type => type.value === ideaType);

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Share Your Idea</h1>
          <p className="text-xl text-slate-600">
            From simple questions to complex proposals - every idea matters and deserves to be heard.
          </p>
        </div>

        {/* Configuration Warnings */}
        {!isSupabaseConfigured() && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Database className="h-6 w-6 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-2">Database Configuration Required</h4>
                <p className="text-amber-800 mb-3">
                  To submit ideas, you need to configure your Supabase database connection. Please:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-amber-800 text-sm">
                  <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a></li>
                  <li>Copy your project URL and anon key from the Supabase dashboard</li>
                  <li>Update the <code className="bg-amber-100 px-1 rounded">.env</code> file with your credentials</li>
                  <li>Run the database migration to create the proposals table</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {!isGeminiConfigured() && ideaType === 'proposal' && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <Bot className="h-6 w-6 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Gemini AI Configuration Required for Proposals</h4>
                <p className="text-blue-800 mb-3">
                  To generate AI policy drafts, you need to configure your Gemini API key. Please:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-blue-800 text-sm">
                  <li>Get a Gemini API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></li>
                  <li>Add <code className="bg-blue-100 px-1 rounded">VITE_GEMINI_API_KEY=your_api_key_here</code> to your <code className="bg-blue-100 px-1 rounded">.env</code> file</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {submissionStatus === 'success' && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <div>
                    <h4 className="font-semibold text-emerald-900">Idea Submitted Successfully!</h4>
                    <p className="text-sm text-emerald-700">
                      Your {ideaType === 'proposal' ? 'policy proposal' : 'idea'} is now live and ready for community engagement.
                    </p>
                  </div>
                </div>
                
                {/* Blockchain Status */}
                {submittedProposalId && blockchainTxId && (
                  <div className="mt-4">
                    <BlockchainProposalStatus
                      isOnChain={true}
                      txId={blockchainTxId}
                      timestamp={Date.now()}
                      isLoading={isBlockchainSubmitting}
                      error={blockchainError}
                    />
                  </div>
                )}
              </div>
            )}

            {submissionStatus === 'validation_failed' && validationResult && (
              <div className={`mb-6 p-4 border rounded-lg ${getValidationColor()}`}>
                <div className="flex items-start space-x-3">
                  {getValidationIcon()}
                  <div className="flex-1">
                    <h4 className="font-semibold text-red-900 mb-2">Idea Saved as Draft</h4>
                    <p className="text-sm text-red-700 mb-3">
                      Your idea has been saved to your drafts but needs review before it can be made public.
                    </p>
                    
                    <div className="bg-white/50 rounded-lg p-3 mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-red-800">Validation Score:</span>
                        <span className={`font-bold ${getScoreColor(validationResult.score)}`}>
                          {validationResult.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-2">
                        <div 
                          className="bg-red-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${validationResult.score}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowValidationDetails(!showValidationDetails)}
                      className="flex items-center space-x-2 text-sm text-red-700 hover:text-red-800 transition-colors"
                    >
                      {showValidationDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span>{showValidationDetails ? 'Hide' : 'Show'} validation details</span>
                    </button>

                    {showValidationDetails && (
                      <div className="mt-3 space-y-2">
                        <div>
                          <h5 className="text-sm font-medium text-red-800 mb-1">Issues found:</h5>
                          <ul className="text-sm text-red-700 space-y-1">
                            {validationResult.reasons.map((reason, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>{reason}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-red-800 mb-1">Suggestions for improvement:</h5>
                          <ul className="text-sm text-red-700 space-y-1">
                            {ideaValidationService.generateImprovementSuggestions(validationResult).map((suggestion, index) => (
                              <li key={index} className="flex items-start space-x-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {submissionStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-red-900">Submission Failed</h4>
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Idea Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  What type of idea is this?
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {ideaTypes.map((type) => {
                    const IconComponent = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setIdeaType(type.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          ideaType === type.value
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <IconComponent className={`h-6 w-6 mt-0.5 ${
                            ideaType === type.value ? 'text-blue-600' : 'text-slate-600'
                          }`} />
                          <div className="flex-1">
                            <h3 className={`font-semibold mb-1 ${
                              ideaType === type.value ? 'text-blue-900' : 'text-slate-900'
                            }`}>
                              {type.label}
                            </h3>
                            <p className={`text-sm mb-2 ${
                              ideaType === type.value ? 'text-blue-700' : 'text-slate-600'
                            }`}>
                              {type.description}
                            </p>
                            <div className="text-xs text-slate-500">
                              <span className="font-medium">Examples:</span> {type.examples.join(', ')}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-semibold text-slate-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isSubmitting}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-2">
                  {ideaType === 'proposal' ? 'Proposal Title' : 'Idea Title'}
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    ideaType === 'proposal' 
                      ? "e.g., Renewable Energy Incentives for Small Businesses"
                      : "e.g., Is cereal soup? or Should we have 4-day work weeks?"
                  }
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                  disabled={isSubmitting}
                />
                <div className="text-right text-sm text-slate-500 mt-1">
                  {title.length}/100 characters
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-700 mb-2">
                  {ideaType === 'proposal' ? 'Detailed Description' : 'Description & Context'}
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={
                    ideaType === 'proposal'
                      ? "Describe your policy idea in detail. What problem does it solve? How would it work? Who would it benefit? Include any relevant background information or research."
                      : "Provide context for your idea or question. Why is this interesting? What are the different perspectives? What made you think of this?"
                  }
                  rows={ideaType === 'proposal' ? 8 : 6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  required
                  disabled={isSubmitting}
                />
                <div className="text-right text-sm text-slate-500 mt-1">
                  {description.length}/2000 characters
                </div>
              </div>

              {/* Blockchain Integration - Only for proposals */}
              {ideaType === 'proposal' && (
                <div className="border-t border-slate-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center space-x-2">
                      <Wallet className="h-5 w-5" />
                      <span>Blockchain Recording</span>
                    </h3>
                    {!walletAddress && (
                      <button
                        type="button"
                        onClick={() => setShowWalletConnect(!showWalletConnect)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        {showWalletConnect ? 'Hide Wallet' : 'Connect Wallet'}
                      </button>
                    )}
                  </div>

                  {showWalletConnect || walletAddress ? (
                    <WalletConnect
                      onWalletChange={handleWalletChange}
                      currentAddress={walletAddress}
                      currentProvider={walletProvider}
                    />
                  ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-blue-800 font-medium">Blockchain Recording (Optional)</p>
                          <p className="text-blue-700 text-sm">
                            Connect an Algorand wallet to record your proposal on the blockchain for transparency and immutability.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowWalletConnect(true)}
                            className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Connect Wallet
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !canSubmit}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>
                      {isValidating ? 'Validating Content...' : 
                       isGenerating ? 'Generating AI Draft...' : 
                       isBlockchainSubmitting ? 'Recording on Blockchain...' :
                       'Submitting...'}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Share {ideaType === 'proposal' ? 'Proposal' : 'Idea'}</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Selected Type Info */}
            {selectedIdeaType && (
              <div className={`rounded-2xl p-8 ${
                ideaType === 'proposal' 
                  ? 'bg-gradient-to-br from-blue-50 to-blue-100' 
                  : 'bg-gradient-to-br from-emerald-50 to-emerald-100'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className={`rounded-full p-3 ${
                    ideaType === 'proposal' ? 'bg-blue-500' : 'bg-emerald-500'
                  }`}>
                    <selectedIdeaType.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedIdeaType.label}</h3>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      {selectedIdeaType.description}
                    </p>
                    <div className="space-y-2 text-sm text-slate-600">
                      <h4 className="font-medium text-slate-800">Perfect for:</h4>
                      {selectedIdeaType.examples.map((example, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <span>"{example}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Blockchain Info - Only for proposals */}
            {ideaType === 'proposal' && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 rounded-full p-3">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Blockchain Integration</h3>
                    <p className="text-slate-700 leading-relaxed mb-4">
                      Record your proposal on the Algorand blockchain for transparency, immutability, and verification.
                    </p>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>Transparent and verifiable record</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>Immutable timestamp of submission</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>Publicly auditable on Algorand explorer</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <span>Enhanced trust and credibility</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Validation Info */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-500 rounded-full p-3">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">AI Content Validation</h3>
                  <p className="text-slate-700 leading-relaxed mb-4">
                    Every submission is automatically reviewed to ensure it meets community standards for respectful, constructive discussion.
                  </p>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>Respectful and appropriate content</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>Constructive ideas and discussions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>Safe for all community members</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>Meaningful contribution to discourse</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {ideaType === 'proposal' && (
              <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8">
                <div className="flex items-start space-x-4">
                  <div className="bg-emerald-500 rounded-full p-3">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">AI Policy Structure</h3>
                    <ul className="space-y-2 text-slate-700">
                      <li>• Problem identification and analysis</li>
                      <li>• Proposed solution with details</li>
                      <li>• Expected impact and benefits</li>
                      <li>• Implementation plan and timeline</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Community Guidelines</h3>
              <ul className="space-y-2 text-slate-700 text-sm">
                <li>• Keep ideas constructive and thoughtful</li>
                <li>• Respect diverse viewpoints and perspectives</li>
                <li>• No hate speech, harassment, or personal attacks</li>
                <li>• No inappropriate, sexual, or offensive content</li>
                <li>• Stay on topic and contribute meaningfully</li>
                <li>• Have fun and be curious about different ideas!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};