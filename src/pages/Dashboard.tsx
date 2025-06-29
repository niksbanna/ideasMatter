import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, TrendingUp, Users, Clock, CheckCircle, XCircle, Eye, Plus, BarChart3, Edit, Trash2 } from 'lucide-react';
import { getUserProposals, deleteProposal, Proposal } from '../services/supabase';
import { getCurrentUser } from '../services/auth';
import { ProtectedRoute } from '../components/ProtectedRoute';

export const Dashboard: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadUserProposals();
  }, []);

  const loadUserProposals = async () => {
    try {
      setIsLoading(true);
      const data = await getUserProposals();
      setProposals(data);
    } catch (error) {
      console.error('Error loading user proposals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProposal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteProposal(id);
      await loadUserProposals(); // Reload the list
    } catch (error) {
      console.error('Error deleting proposal:', error);
      alert('Failed to delete proposal. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const user = getCurrentUser();
  
  // Calculate user stats
  const userStats = {
    ideasSubmitted: proposals.length,
    votesReceived: proposals.reduce((sum, p) => sum + p.votes_up + p.votes_down, 0),
    averageScore: proposals.length > 0 
      ? proposals.reduce((sum, p) => sum + (p.votes_up - p.votes_down), 0) / proposals.length 
      : 0,
    activeProposals: proposals.filter(p => p.status === 'active').length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-orange-600" />;
      default:
        return <XCircle className="h-4 w-4 text-slate-400" />;
    }
  };

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

  const getVoteScore = (proposal: Proposal) => {
    return proposal.votes_up - proposal.votes_down;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
          </h1>
          <p className="text-xl text-slate-600">
            Track your submissions, votes, and impact on civic engagement
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 font-medium text-sm">Ideas Submitted</p>
                <p className="text-3xl font-bold text-blue-900">{userStats.ideasSubmitted}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 font-medium text-sm">Total Votes</p>
                <p className="text-3xl font-bold text-emerald-900">{userStats.votesReceived}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 font-medium text-sm">Avg. Score</p>
                <p className="text-3xl font-bold text-orange-900">
                  {userStats.averageScore > 0 ? '+' : ''}{Math.round(userStats.averageScore)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 font-medium text-sm">Active Proposals</p>
                <p className="text-3xl font-bold text-purple-900">{userStats.activeProposals}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/submit"
            className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Submit New Idea</h3>
                <p className="text-blue-100">Share your vision for better governance</p>
              </div>
            </div>
          </Link>

          <Link
            to="/explorer"
            className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-8 text-white hover:from-emerald-700 hover:to-emerald-800 transition-all transform hover:scale-105"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <Eye className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Explore Proposals</h3>
                <p className="text-emerald-100">Discover and vote on community ideas</p>
              </div>
            </div>
          </Link>
        </div>

        {/* My Proposals */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">My Proposals</h2>
              <Link
                to="/submit"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Submit New →
              </Link>
            </div>
          </div>
          
          <div className="divide-y divide-slate-200">
            {proposals.length > 0 ? (
              proposals.map((proposal) => (
                <div key={proposal.id} className="px-8 py-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Link
                          to={`/proposal/${proposal.id}`}
                          className="text-lg font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {proposal.title}
                        </Link>
                        {proposal.ai_draft && (
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                            AI Generated
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-600 mb-2">
                        <span>Created: {new Date(proposal.created_at).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{proposal.votes_up + proposal.votes_down} votes</span>
                        <span>•</span>
                        <span className="font-medium">Score: {getVoteScore(proposal)}</span>
                      </div>
                      <p className="text-slate-600 text-sm line-clamp-2">{proposal.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-4 ml-6">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(proposal.status)}`}>
                        {getStatusIcon(proposal.status)}
                        <span className="capitalize">{proposal.status}</span>
                      </span>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/proposal/${proposal.id}`}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                          View
                        </Link>
                        
                        {proposal.status === 'draft' && (
                          <button
                            className="text-orange-600 hover:text-orange-700 font-medium text-sm"
                            title="Edit proposal"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteProposal(proposal.id)}
                          disabled={deletingId === proposal.id}
                          className="text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
                          title="Delete proposal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-8 py-12 text-center">
                <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No proposals yet</h3>
                <p className="text-slate-500 mb-4">Start by submitting your first policy idea</p>
                <Link
                  to="/submit"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Submit Idea</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Make a Difference?</h2>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Your ideas can shape the future of governance. Submit new proposals and engage with the community to drive positive change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/submit"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Submit New Idea
              </Link>
              <Link
                to="/explorer"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Explore Proposals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};