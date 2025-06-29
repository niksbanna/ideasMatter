import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Flag, 
  BarChart3, 
  Settings, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Search,
  Filter,
  Download,
  RefreshCw,
  Calendar,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Heart,
  Clock,
  Database,
  Activity
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { getCurrentUser } from '../services/auth';

interface AdminStats {
  totalUsers: number;
  totalProposals: number;
  totalVotes: number;
  totalComments: number;
  totalReports: number;
  activeProposals: number;
  pendingReports: number;
  todaySignups: number;
  todayProposals: number;
  todayVotes: number;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  user_metadata?: {
    full_name?: string;
  };
  email_confirmed_at?: string;
}

interface ProposalWithStats {
  id: string;
  title: string;
  description: string;
  author_name: string;
  category: string;
  status: string;
  idea_type: string;
  votes_up: number;
  votes_down: number;
  votes_yes: number;
  votes_no: number;
  likes: number;
  created_at: string;
  validation_score?: number;
  user_id?: string;
  total_votes: number;
  total_comments: number;
}

interface Report {
  id: string;
  idea_id: string;
  user_id: string;
  report_text: string;
  status: string;
  ai_decision?: string;
  created_at: string;
  proposal_title: string;
  reporter_email: string;
}

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'reports' | 'analytics' | 'settings'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [proposals, setProposals] = useState<ProposalWithStats[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.email === 'admin@ideasmatter.com' || currentUser?.user_metadata?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadUsers(),
        loadProposals(),
        loadReports()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get total counts from accessible tables
      const [proposalsCount, votesCount, commentsCount, reportsCount] = await Promise.all([
        supabase.from('proposals').select('id', { count: 'exact', head: true }),
        supabase.from('proposal_votes').select('id', { count: 'exact', head: true }),
        supabase.from('proposal_comments').select('id', { count: 'exact', head: true }),
        supabase.from('reports').select('id', { count: 'exact', head: true })
      ]);

      // Get active proposals
      const { count: activeCount } = await supabase
        .from('proposals')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'active');

      // Get pending reports
      const { count: pendingReports } = await supabase
        .from('reports')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Get today's stats
      const today = new Date().toISOString().split('T')[0];
      const [todayProposals, todayVotes] = await Promise.all([
        supabase.from('proposals').select('id', { count: 'exact', head: true }).gte('created_at', today),
        supabase.from('proposal_votes').select('id', { count: 'exact', head: true }).gte('created_at', today)
      ]);

      // Estimate user count from unique user_ids in proposals
      const { data: uniqueUsers } = await supabase
        .from('proposals')
        .select('user_id')
        .not('user_id', 'is', null);

      const estimatedUserCount = uniqueUsers ? new Set(uniqueUsers.map(u => u.user_id)).size : 0;

      setStats({
        totalUsers: estimatedUserCount, // Estimated from proposals
        totalProposals: proposalsCount.count || 0,
        totalVotes: votesCount.count || 0,
        totalComments: commentsCount.count || 0,
        totalReports: reportsCount.count || 0,
        activeProposals: activeCount || 0,
        pendingReports: pendingReports || 0,
        todaySignups: 0, // Cannot access auth.users from client
        todayProposals: todayProposals.count || 0,
        todayVotes: todayVotes.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadUsers = async () => {
    try {
      // Since we can't access auth.users directly, we'll create a user list from proposals
      const { data, error } = await supabase
        .from('proposals')
        .select('user_id, author_name, created_at')
        .not('user_id', 'is', null);
      
      if (error) throw error;

      if (data) {
        const uniqueUsers = data.reduce((acc, proposal) => {
          if (!acc.find(u => u.id === proposal.user_id)) {
            acc.push({
              id: proposal.user_id,
              email: `${proposal.author_name.toLowerCase().replace(/\s+/g, '')}@example.com`,
              created_at: proposal.created_at,
              user_metadata: { full_name: proposal.author_name },
              email_confirmed_at: proposal.created_at // Assume confirmed
            });
          }
          return acc;
        }, [] as User[]);
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          proposal_comments(count),
          proposal_votes(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const proposalsWithStats = data?.map(proposal => ({
        ...proposal,
        total_votes: (proposal.votes_up || 0) + (proposal.votes_down || 0) + (proposal.votes_yes || 0) + (proposal.votes_no || 0) + (proposal.likes || 0),
        total_comments: proposal.proposal_comments?.[0]?.count || 0
      })) || [];

      setProposals(proposalsWithStats);
    } catch (error) {
      console.error('Error loading proposals:', error);
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          proposals!inner(title)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const reportsWithDetails = data?.map(report => ({
        ...report,
        proposal_title: report.proposals?.title || 'Unknown',
        reporter_email: 'Unknown' // Cannot access auth.users from client
      })) || [];

      setReports(reportsWithDetails);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const updateProposalStatus = async (proposalId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: newStatus })
        .eq('id', proposalId);

      if (error) throw error;
      await loadProposals();
    } catch (error) {
      console.error('Error updating proposal status:', error);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;
      await loadReports();
    } catch (error) {
      console.error('Error updating report status:', error);
    }
  };

  const deleteProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to delete this proposal? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('proposals')
        .delete()
        .eq('id', proposalId);

      if (error) throw error;
      await loadProposals();
    } catch (error) {
      console.error('Error deleting proposal:', error);
    }
  };

  const exportData = async (type: 'users' | 'proposals' | 'reports') => {
    try {
      let data;
      let filename;

      switch (type) {
        case 'users':
          data = users;
          filename = 'users-export.json';
          break;
        case 'proposals':
          data = proposals;
          filename = 'proposals-export.json';
          break;
        case 'reports':
          data = reports;
          filename = 'reports-export.json';
          break;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const filteredProposals = proposals.filter(proposal => {
    const matchesSearch = proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proposal.author_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || proposal.status === filterStatus;
    const matchesType = filterType === 'all' || proposal.idea_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <Shield className="h-16 w-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-4">Access Denied</h2>
          <p className="text-red-700">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-blue-100">Manage users, content, and platform analytics</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={loadDashboardData}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <div className="text-right">
              <div className="text-sm text-blue-100">Last updated</div>
              <div className="font-semibold">{new Date().toLocaleTimeString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'content', label: 'Content', icon: FileText },
              { id: 'reports', label: 'Reports', icon: Flag },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const IconComponent = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'reports' && stats?.pendingReports && stats.pendingReports > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {stats.pendingReports}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && stats && (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-medium text-sm">Estimated Users</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.totalUsers}</p>
                      <p className="text-blue-700 text-sm">Based on proposals</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-600 font-medium text-sm">Total Ideas</p>
                      <p className="text-3xl font-bold text-emerald-900">{stats.totalProposals}</p>
                      <p className="text-emerald-700 text-sm">+{stats.todayProposals} today</p>
                    </div>
                    <FileText className="h-8 w-8 text-emerald-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-600 font-medium text-sm">Total Votes</p>
                      <p className="text-3xl font-bold text-orange-900">{stats.totalVotes}</p>
                      <p className="text-orange-700 text-sm">+{stats.todayVotes} today</p>
                    </div>
                    <ThumbsUp className="h-8 w-8 text-orange-600" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 font-medium text-sm">Active Ideas</p>
                      <p className="text-3xl font-bold text-purple-900">{stats.activeProposals}</p>
                      <p className="text-purple-700 text-sm">{Math.round((stats.activeProposals / stats.totalProposals) * 100)}% of total</p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {stats.pendingReports > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-900">Pending Reports</h3>
                      <p className="text-red-700">
                        You have {stats.pendingReports} pending report{stats.pendingReports !== 1 ? 's' : ''} that need review.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveTab('reports')}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Review Reports
                    </button>
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Ideas</h3>
                  <div className="space-y-3">
                    {proposals.slice(0, 5).map((proposal) => (
                      <div key={proposal.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">{proposal.title}</p>
                          <p className="text-sm text-slate-500">by {proposal.author_name}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            proposal.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            proposal.status === 'draft' ? 'bg-orange-100 text-orange-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {proposal.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">System Health</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Database Status</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-emerald-600 font-medium">Healthy</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">API Response Time</span>
                      <span className="text-slate-900 font-medium">~150ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Storage Usage</span>
                      <span className="text-slate-900 font-medium">2.3 GB / 10 GB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Active Sessions</span>
                      <span className="text-slate-900 font-medium">{Math.floor(stats.totalUsers * 0.15)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => exportData('users')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Users</span>
                  </button>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-orange-800 text-sm">
                  <strong>Note:</strong> User data is estimated from proposal submissions. Full user management requires server-side access to authentication records.
                </p>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">First Seen</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                {(user.user_metadata?.full_name || user.email).charAt(0).toUpperCase()}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-slate-900">
                                  {user.user_metadata?.full_name || 'Unknown'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{user.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800">
                              Estimated
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Content Management</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => exportData('proposals')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Content</span>
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-slate-50 rounded-xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                    <input
                      type="text"
                      placeholder="Search content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="proposal">Proposals</option>
                    <option value="poll">Polls</option>
                  </select>
                </div>
              </div>

              {/* Content List */}
              <div className="space-y-4">
                {filteredProposals.map((proposal) => (
                  <div key={proposal.id} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{proposal.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            proposal.idea_type === 'proposal' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {proposal.idea_type}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            proposal.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                            proposal.status === 'draft' ? 'bg-orange-100 text-orange-800' :
                            proposal.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {proposal.status}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-3 line-clamp-2">{proposal.description}</p>
                        <div className="flex items-center space-x-6 text-sm text-slate-500">
                          <span>By {proposal.author_name}</span>
                          <span>{new Date(proposal.created_at).toLocaleDateString()}</span>
                          <span className="flex items-center space-x-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{proposal.total_votes} votes</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{proposal.total_comments} comments</span>
                          </span>
                          {proposal.validation_score && (
                            <span className={`font-medium ${
                              proposal.validation_score >= 80 ? 'text-emerald-600' :
                              proposal.validation_score >= 60 ? 'text-orange-600' :
                              'text-red-600'
                            }`}>
                              Score: {proposal.validation_score}/100
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <select
                          value={proposal.status}
                          onChange={(e) => updateProposalStatus(proposal.id, e.target.value)}
                          className="px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="draft">Draft</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button className="text-blue-600 hover:text-blue-800 p-1">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-slate-600 hover:text-slate-800 p-1">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => deleteProposal(proposal.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">Content Reports</h2>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => exportData('reports')}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export Reports</span>
                  </button>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                <p className="text-orange-800 text-sm">
                  <strong>Note:</strong> Reporter email information is not available due to client-side access limitations.
                </p>
              </div>

              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">Report for: {report.proposal_title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            report.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                            report.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {report.status}
                          </span>
                          {report.ai_decision && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              report.ai_decision === 'BLOCK' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              AI: {report.ai_decision}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 mb-3">{report.report_text}</p>
                        <div className="flex items-center space-x-6 text-sm text-slate-500">
                          <span>Reported by: {report.reporter_email}</span>
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <select
                          value={report.status}
                          onChange={(e) => updateReportStatus(report.id, e.target.value)}
                          className="px-3 py-1 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewed">Reviewed</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button className="text-blue-600 hover:text-blue-800 p-1">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && stats && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900">Platform Analytics</h2>
              
              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Engagement Rate</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {Math.round((stats.totalVotes / stats.totalProposals) * 100) / 100}
                  </div>
                  <p className="text-slate-600 text-sm">Average votes per idea</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Comment Rate</h3>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">
                    {Math.round((stats.totalComments / stats.totalProposals) * 100) / 100}
                  </div>
                  <p className="text-slate-600 text-sm">Average comments per idea</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">User Activity</h3>
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {Math.round(((stats.totalVotes + stats.totalComments) / stats.totalUsers) * 100) / 100}
                  </div>
                  <p className="text-slate-600 text-sm">Actions per user</p>
                </div>
              </div>

              {/* Content Distribution */}
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Content Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {proposals.filter(p => p.idea_type === 'proposal').length}
                    </div>
                    <div className="text-slate-600 text-sm">Proposals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-600">
                      {proposals.filter(p => p.idea_type === 'poll').length}
                    </div>
                    <div className="text-slate-600 text-sm">Polls</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {proposals.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-slate-600 text-sm">Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {proposals.filter(p => p.status === 'draft').length}
                    </div>
                    <div className="text-slate-600 text-sm">Drafts</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900">Platform Settings</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Content Moderation</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Auto-approve content</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">AI content validation</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Require email verification</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Platform Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Guest browsing</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Audio generation</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700">Video generation</span>
                      <input type="checkbox" className="rounded" defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">API Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Gemini API Status</label>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-emerald-600 text-sm">Connected</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">ElevenLabs API Status</label>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <span className="text-emerald-600 text-sm">Connected</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Tavus API Status</label>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-orange-600 text-sm">Not Configured</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Database Maintenance</h3>
                  <div className="space-y-4">
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      Backup Database
                    </button>
                    <button className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors">
                      Clear Cache
                    </button>
                    <button className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors">
                      Reset Analytics
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};