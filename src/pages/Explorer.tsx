import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, TrendingUp, Clock, Users, ThumbsUp, MessageSquare, Eye, Calendar, Heart, CheckCircle, X, Flag } from 'lucide-react';
import { getProposals, Proposal } from '../services/supabase';
import { ReportModal } from '../components/ReportModal';
import { AuthModal } from '../components/AuthModal';
import { isAuthenticated } from '../services/auth';

export const Explorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportingIdea, setReportingIdea] = useState<{ id: string; title: string } | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const categories = [
    'All Categories',
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

  const quickFilters = [
    { id: 'all', label: 'All Ideas', icon: Users },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'new', label: 'New', icon: Clock },
    { id: 'civic', label: 'Civic', icon: CheckCircle },
    { id: 'fun', label: 'Fun', icon: Heart },
    { id: 'polls', label: 'Polls', icon: MessageSquare },
    { id: 'proposals', label: 'Proposals', icon: ThumbsUp }
  ];

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getProposals();
      setProposals(data);
    } catch (err) {
      setError('Failed to load ideas. Please try again later.');
      console.error('Error loading proposals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFilter = (filterId: string) => {
    switch (filterId) {
      case 'all':
        setFilterCategory('all');
        setFilterType('all');
        setSortBy('newest');
        break;
      case 'trending':
        setFilterCategory('all');
        setFilterType('all');
        setSortBy('trending');
        break;
      case 'new':
        setFilterCategory('all');
        setFilterType('all');
        setSortBy('newest');
        break;
      case 'civic':
        setFilterCategory('Civic');
        setFilterType('all');
        setSortBy('newest');
        break;
      case 'fun':
        setFilterCategory('Fun');
        setFilterType('all');
        setSortBy('newest');
        break;
      case 'polls':
        setFilterCategory('all');
        setFilterType('poll');
        setSortBy('newest');
        break;
      case 'proposals':
        setFilterCategory('all');
        setFilterType('proposal');
        setSortBy('newest');
        break;
    }
  };

  const handleReport = (idea: Proposal) => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    setReportingIdea({ id: idea.id, title: idea.title });
    setShowReportModal(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    // If user was trying to report, show report modal
    if (reportingIdea) {
      setShowReportModal(true);
    }
  };

  const filteredProposals = proposals
    .filter(proposal => {
      const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           proposal.author_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || proposal.category.toLowerCase() === filterCategory.toLowerCase();
      const matchesType = filterType === 'all' || proposal.idea_type === filterType;
      return matchesSearch && matchesStatus && matchesCategory && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'most_votes':
          const aVotes = (a.votes_up || 0) + (a.votes_yes || 0) + (a.likes || 0) - (a.votes_down || 0) - (a.votes_no || 0);
          const bVotes = (b.votes_up || 0) + (b.votes_yes || 0) + (b.likes || 0) - (b.votes_down || 0) - (b.votes_no || 0);
          return bVotes - aVotes;
        case 'trending':
          // Simple trending algorithm based on votes and recency
          const aScore = ((a.votes_up || 0) + (a.votes_yes || 0) + (a.likes || 0) - (a.votes_down || 0) - (a.votes_no || 0)) / Math.max(1, Math.floor((Date.now() - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24)));
          const bScore = ((b.votes_up || 0) + (b.votes_yes || 0) + (b.likes || 0) - (b.votes_down || 0) - (b.votes_no || 0)) / Math.max(1, Math.floor((Date.now() - new Date(b.created_at).getTime()) / (1000 * 60 * 60 * 24)));
          return bScore - aScore;
        default:
          return 0;
      }
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800';
      case 'draft':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

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

  const getVoteScore = (proposal: Proposal) => {
    if (proposal.idea_type === 'proposal') {
      return (proposal.votes_up || 0) - (proposal.votes_down || 0);
    } else {
      return (proposal.votes_yes || 0) + (proposal.likes || 0) - (proposal.votes_no || 0);
    }
  };

  const getTotalVotes = (proposal: Proposal) => {
    if (proposal.idea_type === 'proposal') {
      return (proposal.votes_up || 0) + (proposal.votes_down || 0);
    } else {
      return (proposal.votes_yes || 0) + (proposal.votes_no || 0) + (proposal.likes || 0);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading ideas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-16">
          <div className="text-red-600 mb-4">
            <Users className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Error Loading Ideas</h3>
            <p>{error}</p>
          </div>
          <button
            onClick={loadProposals}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-8 px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Explore Ideas</h1>
          <p className="text-xl text-slate-600">
            Discover, discuss, and vote on ideas from the community
          </p>
          <div className="mt-6 flex justify-center space-x-8 text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>{proposals.filter(p => p.status === 'active').length} Active</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>{proposals.filter(p => p.idea_type === 'proposal').length} Proposals</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>{proposals.filter(p => p.idea_type === 'poll').length} Polls</span>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-wrap gap-3 mb-6">
            {quickFilters.map((filter) => {
              const IconComponent = filter.icon;
              const isActive = 
                (filter.id === 'all' && filterCategory === 'all' && filterType === 'all') ||
                (filter.id === 'trending' && sortBy === 'trending') ||
                (filter.id === 'new' && sortBy === 'newest') ||
                (filter.id === 'civic' && filterCategory === 'Civic') ||
                (filter.id === 'fun' && filterCategory === 'Fun') ||
                (filter.id === 'polls' && filterType === 'poll') ||
                (filter.id === 'proposals' && filterType === 'proposal');

              return (
                <button
                  key={filter.id}
                  onClick={() => handleQuickFilter(filter.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="font-medium">{filter.label}</span>
                </button>
              );
            })}
          </div>

          {/* Advanced Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search ideas, authors, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[140px]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[140px]"
              >
                <option value="all">All Types</option>
                <option value="poll">Polls</option>
                <option value="proposal">Proposals</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[160px]"
              >
                {categories.map((category) => (
                  <option key={category} value={category === 'All Categories' ? 'all' : category}>
                    {category}
                  </option>
                ))}
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white min-w-[140px]"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="most_votes">Most Votes</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(filterCategory !== 'all' || filterType !== 'all' || searchTerm) && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-slate-600">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center space-x-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                  <span>Search: "{searchTerm}"</span>
                  <button onClick={() => setSearchTerm('')} className="hover:bg-blue-200 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterCategory !== 'all' && (
                <span className="inline-flex items-center space-x-1 bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-sm">
                  <span>Category: {filterCategory}</span>
                  <button onClick={() => setFilterCategory('all')} className="hover:bg-emerald-200 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filterType !== 'all' && (
                <span className="inline-flex items-center space-x-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm">
                  <span>Type: {filterType === 'poll' ? 'Polls' : 'Proposals'}</span>
                  <button onClick={() => setFilterType('all')} className="hover:bg-purple-200 rounded-full p-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Welcome Video */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Welcome to IdeasMatter</h2>
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/jqg6DZ3Njhw" 
              title="Welcome to IdeasMatter" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
          <p className="mt-4 text-slate-600 text-sm">
            Learn how IdeasMatter works and how you can participate in shaping policies and discussions.
          </p>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {filteredProposals.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link 
                          to={`/proposal/${proposal.id}`}
                          className="text-2xl font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {proposal.title}
                        </Link>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(proposal.idea_type)}`}>
                          {proposal.idea_type === 'proposal' ? 'Proposal' : 'Poll'}
                        </span>
                        {proposal.ai_draft && (
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            AI Generated
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 leading-relaxed mb-4 line-clamp-3">{proposal.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-500 mb-4">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>By {proposal.author_name}</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(proposal.category)}`}>
                          {proposal.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col lg:items-end space-y-4">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2 text-slate-600">
                      {proposal.idea_type === 'proposal' ? (
                        <ThumbsUp className="h-5 w-5" />
                      ) : (
                        <Heart className="h-5 w-5" />
                      )}
                      <span className="font-semibold">{getVoteScore(proposal)}</span>
                      <span className="text-sm">score</span>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-600">
                      <MessageSquare className="h-5 w-5" />
                      <span className="font-semibold">{getTotalVotes(proposal)}</span>
                      <span className="text-sm">votes</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link
                      to={`/proposal/${proposal.id}`}
                      className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View {proposal.idea_type === 'proposal' ? 'Proposal' : 'Poll'}</span>
                    </Link>
                    
                    <button
                      onClick={() => handleReport(proposal)}
                      className="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                      title="Report this content"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProposals.length === 0 && (
          <div className="text-center py-16">
            <Users className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No ideas found</h3>
            <p className="text-slate-500 mb-6">Try adjusting your search or filter criteria</p>
            <Link
              to="/submit"
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Share the First Idea</span>
            </Link>
          </div>
        )}

        {/* Quick Stats */}
        {proposals.length > 0 && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Community Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-3xl font-bold mb-2">{proposals.length}</div>
                  <div className="text-blue-100">Total Ideas</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">
                    {proposals.filter(p => p.idea_type === 'proposal').length}
                  </div>
                  <div className="text-blue-100">Proposals</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">
                    {proposals.filter(p => p.idea_type === 'poll').length}
                  </div>
                  <div className="text-blue-100">Community Polls</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-2">
                    {new Set(proposals.map(p => p.author_name)).size}
                  </div>
                  <div className="text-blue-100">Contributors</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportingIdea && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setReportingIdea(null);
          }}
          ideaId={reportingIdea.id}
          ideaTitle={reportingIdea.title}
          onAuthRequired={() => {
            setShowReportModal(false);
            setShowAuthModal(true);
          }}
        />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setReportingIdea(null);
        }}
        onSuccess={handleAuthSuccess}
        initialMode="signin"
      />
    </>
  );
};