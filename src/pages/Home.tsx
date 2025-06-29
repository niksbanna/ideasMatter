import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  Heart, 
  CheckCircle, 
  X, 
  Flag,
  ChevronUp,
  ChevronDown,
  Bookmark,
  Share2,
  Filter,
  Search,
  Plus,
  Globe,
  Lightbulb,
  Vote,
  Eye,
  Calendar,
  Tag,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { getProposals, Proposal } from '../services/supabase';
import { submitVote, getUserVote, toggleSave, isSaved } from '../services/interactions';
import { isAuthenticated, getCurrentUser } from '../services/auth';
import { useLanguage } from '../contexts/LanguageContext';

type SortOption = 'hot' | 'new' | 'top' | 'rising';
type FilterOption = 'all' | 'proposals' | 'polls' | 'civic' | 'fun' | 'tech' | 'environment';

interface FeedItem extends Proposal {
  userVote?: 'up' | 'down' | 'yes' | 'no' | 'like' | null;
  isSaved?: boolean;
  score: number;
  totalVotes: number;
}

export const Home: React.FC = () => {
  const { t } = useLanguage();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('hot');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});

  const authenticated = isAuthenticated();
  const currentUser = getCurrentUser();

  useEffect(() => {
    loadFeed();
  }, [sortBy, filterBy, searchTerm]);

  useEffect(() => {
    if (authenticated) {
      loadUserInteractions();
    }
  }, [feedItems.length, authenticated]);

  const loadFeed = async (pageNum = 1) => {
    try {
      setIsLoading(pageNum === 1);
      const proposals = await getProposals();
      
      let filteredProposals = proposals.filter(proposal => {
        const matchesSearch = !searchTerm || 
          proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          proposal.author_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesFilter = filterBy === 'all' || 
          (filterBy === 'proposals' && proposal.idea_type === 'proposal') ||
          (filterBy === 'polls' && proposal.idea_type === 'poll') ||
          proposal.category.toLowerCase() === filterBy;
        
        return matchesSearch && matchesFilter;
      });

      // Calculate scores and sort
      const itemsWithScores = filteredProposals.map(proposal => {
        const upVotes = (proposal.votes_up || 0) + (proposal.votes_yes || 0) + (proposal.likes || 0);
        const downVotes = (proposal.votes_down || 0) + (proposal.votes_no || 0);
        const totalVotes = upVotes + downVotes;
        const score = upVotes - downVotes;
        const hoursOld = (Date.now() - new Date(proposal.created_at).getTime()) / (1000 * 60 * 60);
        
        let hotScore = score;
        if (sortBy === 'hot') {
          hotScore = score / Math.pow(hoursOld + 2, 1.5); // Reddit-style hot algorithm
        } else if (sortBy === 'rising') {
          hotScore = totalVotes > 5 ? score / Math.pow(hoursOld + 1, 0.8) : 0;
        }

        return {
          ...proposal,
          score,
          totalVotes,
          hotScore
        };
      });

      // Sort based on selected option
      itemsWithScores.sort((a, b) => {
        switch (sortBy) {
          case 'hot':
            return b.hotScore - a.hotScore;
          case 'new':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          case 'top':
            return b.score - a.score;
          case 'rising':
            return b.hotScore - a.hotScore;
          default:
            return 0;
        }
      });

      if (pageNum === 1) {
        setFeedItems(itemsWithScores);
      } else {
        setFeedItems(prev => [...prev, ...itemsWithScores]);
      }
      
      setHasMore(itemsWithScores.length >= 20); // Assume more if we got a full page
    } catch (error) {
      console.error('Error loading feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserInteractions = async () => {
    if (!authenticated) return;

    const updatedItems = await Promise.all(
      feedItems.map(async (item) => {
        try {
          const [userVote, savedStatus] = await Promise.all([
            getUserVote(item.id),
            isSaved(item.id)
          ]);
          return { ...item, userVote, isSaved: savedStatus };
        } catch (error) {
          return item;
        }
      })
    );

    setFeedItems(updatedItems);
  };

  const handleVote = async (itemId: string, voteType: 'up' | 'down' | 'yes' | 'no' | 'like') => {
    if (!authenticated) {
      // Show auth modal or redirect
      return;
    }

    if (votingStates[itemId]) return;

    try {
      setVotingStates(prev => ({ ...prev, [itemId]: true }));
      await submitVote(itemId, voteType);
      
      // Update local state
      setFeedItems(prev => prev.map(item => {
        if (item.id === itemId) {
          const wasVoting = item.userVote === voteType;
          return {
            ...item,
            userVote: wasVoting ? null : voteType
          };
        }
        return item;
      }));

      // Reload to get updated vote counts
      setTimeout(() => loadFeed(), 500);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVotingStates(prev => ({ ...prev, [itemId]: false }));
    }
  };

  const handleSave = async (itemId: string) => {
    if (!authenticated) return;

    try {
      const newSavedStatus = await toggleSave(itemId);
      setFeedItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, isSaved: newSavedStatus } : item
      ));
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Civic': 'bg-blue-100 text-blue-800',
      'Tech': 'bg-indigo-100 text-indigo-800',
      'Fun': 'bg-pink-100 text-pink-800',
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

  const sortOptions = [
    { id: 'hot', label: 'Hot', icon: TrendingUp, description: 'Best posts right now' },
    { id: 'new', label: 'New', icon: Clock, description: 'Latest submissions' },
    { id: 'top', label: 'Top', icon: ArrowUp, description: 'Highest scoring' },
    { id: 'rising', label: 'Rising', icon: ChevronUp, description: 'Trending up' }
  ];

  const filterOptions = [
    { id: 'all', label: 'All', count: feedItems.length },
    { id: 'proposals', label: 'Proposals', count: feedItems.filter(i => i.idea_type === 'proposal').length },
    { id: 'polls', label: 'Polls', count: feedItems.filter(i => i.idea_type === 'poll').length },
    { id: 'civic', label: 'Civic', count: feedItems.filter(i => i.category === 'Civic').length },
    { id: 'fun', label: 'Fun', count: feedItems.filter(i => i.category === 'Fun').length },
    { id: 'tech', label: 'Tech', count: feedItems.filter(i => i.category === 'Tech').length },
    { id: 'environment', label: 'Environment', count: feedItems.filter(i => i.category === 'Environment').length }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-80 py-6">
          <div className="sticky top-6 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/submit"
                  className="flex items-center space-x-3 w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span className="font-medium">Create Post</span>
                </Link>
                <Link
                  to="/explorer"
                  className="flex items-center space-x-3 w-full bg-slate-100 text-slate-700 px-4 py-3 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Eye className="h-5 w-5" />
                  <span className="font-medium">Explore All</span>
                </Link>
              </div>
            </div>

            {/* Sort Options */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Sort By</h3>
              <div className="space-y-2">
                {sortOptions.map((option) => {
                  const IconComponent = option.icon;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setSortBy(option.id as SortOption)}
                      className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg transition-colors ${
                        sortBy === option.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs opacity-75">{option.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setFilterBy(option.id as FilterOption)}
                    className={`flex items-center justify-between w-full px-3 py-2 rounded-lg transition-colors ${
                      filterBy === option.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Info */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Welcome to IdeasMatter</h3>
              <p className="text-blue-800 text-sm mb-4">
                A platform where every idea matters - from fun polls to serious policy proposals.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Open to everyone</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <span>AI-powered insights</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Vote className="h-4 w-4" />
                  <span>Democratic voting</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="flex-1 py-6">
          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-slate-900">IdeasMatter</h1>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-slate-600"
                >
                  <Filter className="h-5 w-5" />
                  <span>Filters</span>
                </button>
              </div>
              
              {showFilters && (
                <div className="space-y-4 border-t border-slate-200 pt-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {sortOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setSortBy(option.id as SortOption)}
                          className={`flex items-center space-x-2 px-3 py-2 rounded-lg whitespace-nowrap ${
                            sortBy === option.id
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  
                  <div className="flex space-x-2 overflow-x-auto">
                    {filterOptions.slice(0, 5).map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setFilterBy(option.id as FilterOption)}
                        className={`px-3 py-2 rounded-lg whitespace-nowrap ${
                          filterBy === option.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {option.label} ({option.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search ideas, topics, or authors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {/* Feed Items */}
          <div className="space-y-4">
            {isLoading && feedItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading feed...</p>
              </div>
            ) : (
              feedItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex">
                    {/* Vote Section */}
                    <div className="flex flex-col items-center p-4 bg-slate-50 rounded-l-xl">
                      {item.idea_type === 'proposal' ? (
                        <>
                          <button
                            onClick={() => handleVote(item.id, 'up')}
                            disabled={!authenticated || votingStates[item.id]}
                            className={`p-2 rounded-lg transition-colors ${
                              item.userVote === 'up'
                                ? 'bg-orange-500 text-white'
                                : 'text-slate-400 hover:bg-orange-100 hover:text-orange-600'
                            } ${!authenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <ArrowUp className="h-5 w-5" />
                          </button>
                          <span className="font-bold text-slate-900 my-1">{item.score}</span>
                          <button
                            onClick={() => handleVote(item.id, 'down')}
                            disabled={!authenticated || votingStates[item.id]}
                            className={`p-2 rounded-lg transition-colors ${
                              item.userVote === 'down'
                                ? 'bg-blue-500 text-white'
                                : 'text-slate-400 hover:bg-blue-100 hover:text-blue-600'
                            } ${!authenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <ArrowDown className="h-5 w-5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleVote(item.id, 'like')}
                            disabled={!authenticated || votingStates[item.id]}
                            className={`p-2 rounded-lg transition-colors ${
                              item.userVote === 'like'
                                ? 'bg-red-500 text-white'
                                : 'text-slate-400 hover:bg-red-100 hover:text-red-600'
                            } ${!authenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Heart className="h-5 w-5" />
                          </button>
                          <span className="font-bold text-slate-900 my-1">{item.likes || 0}</span>
                          <div className="text-xs text-slate-500 text-center">
                            <div>Y: {item.votes_yes || 0}</div>
                            <div>N: {item.votes_no || 0}</div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex-1 p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.idea_type === 'proposal' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {item.idea_type === 'proposal' ? 'Policy' : 'Poll'}
                          </span>
                          {item.ai_draft && (
                            <span className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              AI Enhanced
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4 text-slate-400" />
                          <span className="text-xs text-slate-500">Public</span>
                        </div>
                      </div>

                      {/* Title */}
                      <Link
                        to={`/proposal/${item.id}`}
                        className="block mb-3 group"
                      >
                        <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                          {item.title}
                        </h2>
                      </Link>

                      {/* Description */}
                      <p className="text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-slate-500">
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>u/{item.author_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{getTimeAgo(item.created_at)}</span>
                          </div>
                          <Link
                            to={`/proposal/${item.id}`}
                            className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                          >
                            <MessageSquare className="h-4 w-4" />
                            <span>Comments</span>
                          </Link>
                        </div>

                        <div className="flex items-center space-x-2">
                          {authenticated && (
                            <button
                              onClick={() => handleSave(item.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                item.isSaved
                                  ? 'bg-yellow-100 text-yellow-600'
                                  : 'text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <Bookmark className="h-4 w-4" />
                            </button>
                          )}
                          <button className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                            <Share2 className="h-4 w-4" />
                          </button>
                          <button className="p-2 rounded-lg text-slate-400 hover:bg-red-100 hover:text-red-600 transition-colors">
                            <Flag className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Load More */}
            {hasMore && !isLoading && (
              <div className="text-center py-8">
                <button
                  onClick={() => {
                    setPage(prev => prev + 1);
                    loadFeed(page + 1);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Load More Ideas
                </button>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && feedItems.length === 0 && (
              <div className="text-center py-16">
                <Lightbulb className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-600 mb-2">No ideas found</h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm || filterBy !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to share an idea!'
                  }
                </p>
                <Link
                  to="/submit"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                  <span>Share Your Idea</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-80 py-6">
          <div className="sticky top-6 space-y-6">
            {/* Trending Topics */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Trending Topics</h3>
              <div className="space-y-3">
                {['Climate Action', 'Digital Privacy', 'Work-Life Balance', 'Urban Planning', 'Education Reform'].map((topic, index) => (
                  <div key={topic} className="flex items-center justify-between">
                    <span className="text-slate-700">{topic}</span>
                    <span className="text-xs text-slate-500">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Community Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Community</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Active Ideas</span>
                  <span className="font-semibold text-slate-900">{feedItems.filter(i => i.status === 'active').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Votes</span>
                  <span className="font-semibold text-slate-900">{feedItems.reduce((sum, item) => sum + item.totalVotes, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Contributors</span>
                  <span className="font-semibold text-slate-900">{new Set(feedItems.map(i => i.author_name)).size}</span>
                </div>
              </div>
            </div>

            {/* Platform Info */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6">
              <h3 className="font-semibold text-purple-900 mb-3">About IdeasMatter</h3>
              <p className="text-purple-800 text-sm mb-4">
                Transform your ideas into structured policies with AI assistance, engage in democratic discussions, and help shape the future.
              </p>
              <Link
                to="/submit"
                className="inline-flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};