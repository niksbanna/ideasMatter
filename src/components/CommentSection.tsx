import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Calendar, LogIn } from 'lucide-react';
import { getComments, submitComment, Comment } from '../services/interactions';
import { getCurrentUser } from '../services/auth';

interface CommentSectionProps {
  proposalId: string;
  requireAuth?: () => boolean;
  isAuthenticated?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ 
  proposalId, 
  requireAuth,
  isAuthenticated = false 
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [proposalId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const data = await getComments(proposalId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    if (!isAuthenticated && requireAuth && !requireAuth()) {
      return;
    }

    const user = getCurrentUser();
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      const userName = user.user_metadata?.full_name || user.email.split('@')[0];
      await submitComment(proposalId, userName, newComment.trim());
      
      // Reload comments
      await loadComments();
      
      // Clear form
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="flex items-center space-x-3 mb-6">
        <MessageSquare className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">
          Discussion ({comments.length})
        </h2>
      </div>
      
      {/* Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="space-y-4">
            <div>
              <textarea
                placeholder="Share your thoughts on this proposal..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <LogIn className="h-5 w-5 text-slate-600" />
            <div>
              <p className="text-slate-900 font-medium">Join the discussion</p>
              <p className="text-slate-600 text-sm">Sign in to share your thoughts on this proposal.</p>
            </div>
            <button
              onClick={requireAuth}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Sign In
            </button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Loading comments...</p>
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="border-l-4 border-blue-200 pl-6 py-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{comment.user_name}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(comment.created_at)}</span>
                  </div>
                </div>
              </div>
              <p className="text-slate-700 leading-relaxed">{comment.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">No comments yet</h3>
            <p className="text-slate-500">Be the first to share your thoughts on this proposal!</p>
          </div>
        )}
      </div>
    </div>
  );
};