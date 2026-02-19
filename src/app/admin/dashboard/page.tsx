'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { 
  FaVideo, FaUsers, FaEye, FaDollarSign, FaCheck, FaTimes, 
  FaTrash, FaChartLine, FaFlag, FaUserShield, FaBan, FaUserSlash,
  FaHistory, FaFilter
} from 'react-icons/fa'

interface Video {
  id: string
  title: string
  status: string
  views: number
  createdAt: string
  duration: number
  user: {
    id: string
    username: string
  }
}

interface User {
  id: string
  email: string
  username: string
  role: string
  status: string
  createdAt: string
  _count: {
    videos: number
  }
}

interface Report {
  id: string
  reason: string
  details: string | null
  status: string
  action: string | null
  createdAt: string
  video: {
    id: string
    title: string
  }
  reporter: {
    username: string
  }
}

interface AuditLog {
  id: string
  action: string
  targetType: string
  targetId: string
  reason: string | null
  createdAt: string
  admin: {
    username: string
  }
}

interface Stats {
  totalUsers: number
  totalVideos: number
  pendingVideos: number
  totalViews: number
  totalEarnings: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'users' | 'reports' | 'tools' | 'audit'>('overview')
  const [stats, setStats] = useState<Stats | null>(null)
  const [videos, setVideos] = useState<Video[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters
  const [videoStatusFilter, setVideoStatusFilter] = useState<string>('ALL')
  const [userStatusFilter, setUserStatusFilter] = useState<string>('ALL')
  
  // Tools state
  const [selectedUserId, setSelectedUserId] = useState('')
  const [viewsToAdd, setViewsToAdd] = useState('')
  const [earningsAmount, setEarningsAmount] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      const userRole = (session.user as any)?.role
      if (userRole !== 'ADMIN') {
        router.push('/')
        return
      }
      fetchData()
    }
  }, [status, session, router])

  const fetchData = async () => {
    try {
      const [statsRes, videosRes, usersRes, reportsRes, auditRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/videos/all'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/reports'),
        axios.get('/api/admin/audit-log?limit=50'),
      ])
      setStats(statsRes.data)
      setVideos(videosRes.data.videos)
      setUsers(usersRes.data.users)
      setReports(reportsRes.data.reports)
      setAuditLogs(auditRes.data.logs)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVideoAction = async (videoId: string, action: 'approve' | 'reject' | 'delete') => {
    if (action === 'delete' && !confirm('Are you sure you want to delete this video?')) return
    
    try {
      if (action === 'delete') {
        await axios.delete(`/api/admin/videos/${videoId}`)
      } else {
        await axios.post(`/api/admin/videos/${videoId}/${action}`)
      }
      await fetchData()
    } catch (error) {
      alert('Action failed. Please try again.')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their videos.')) return
    
    try {
      await axios.delete(`/api/admin/users/${userId}`)
      await fetchData()
    } catch (error) {
      alert('Failed to delete user.')
    }
  }

  const handleSuspendUser = async (userId: string) => {
    const reason = prompt('Enter suspension reason:')
    if (!reason) return
    
    try {
      await axios.post(`/api/admin/users/${userId}/suspend`, { reason })
      await fetchData()
      alert('User suspended successfully!')
    } catch (error) {
      alert('Failed to suspend user.')
    }
  }

  const handleBanUser = async (userId: string) => {
    const reason = prompt('Enter ban reason:')
    if (!reason) return
    
    if (!confirm('Are you sure you want to permanently ban this user?')) return
    
    try {
      await axios.post(`/api/admin/users/${userId}/ban`, { reason })
      await fetchData()
      alert('User banned successfully!')
    } catch (error) {
      alert('Failed to ban user.')
    }
  }

  const handleResolveReport = async (reportId: string) => {
    const action = prompt('Enter action taken (NO_ACTION, VIDEO_REMOVED, USER_WARNED, USER_SUSPENDED, USER_BANNED):')
    const notes = prompt('Enter resolution notes:')
    
    try {
      await axios.post(`/api/admin/reports/${reportId}/resolve`, { 
        action: action || 'NO_ACTION',
        resolutionNotes: notes || ''
      })
      await fetchData()
      alert('Report resolved successfully!')
    } catch (error) {
      alert('Failed to resolve report.')
    }
  }

  const handleSimulateViews = async () => {
    if (!selectedUserId || !viewsToAdd) {
      alert('Please select a user and enter view count')
      return
    }
    
    try {
      await axios.post('/api/admin/simulate-views', {
        userId: selectedUserId,
        viewCount: parseInt(viewsToAdd)
      })
      alert('Views simulated successfully!')
      setViewsToAdd('')
      await fetchData()
    } catch (error) {
      alert('Failed to simulate views.')
    }
  }

  const handleAddEarnings = async () => {
    if (!selectedUserId || !earningsAmount) {
      alert('Please select a user and enter amount')
      return
    }
    
    try {
      await axios.post('/api/admin/add-earnings', {
        userId: selectedUserId,
        amount: parseFloat(earningsAmount)
      })
      alert('Earnings added successfully!')
      setEarningsAmount('')
      await fetchData()
    } catch (error) {
      alert('Failed to add earnings.')
    }
  }

  const filteredVideos = videos.filter(v => 
    videoStatusFilter === 'ALL' || v.status === videoStatusFilter
  )

  const filteredUsers = users.filter(u => 
    userStatusFilter === 'ALL' || u.status === userStatusFilter
  )

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading Admin Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <FaUserShield className="text-3xl sm:text-4xl text-primary" />
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: FaChartLine },
          { id: 'videos', label: 'Videos', icon: FaVideo },
          { id: 'users', label: 'Users', icon: FaUsers },
          { id: 'reports', label: 'Reports', icon: FaFlag },
          { id: 'tools', label: 'Tools', icon: FaDollarSign },
          { id: 'audit', label: 'Audit Log', icon: FaHistory },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition whitespace-nowrap text-sm sm:text-base ${
              activeTab === tab.id
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-gray-800'
            }`}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            <div className="bg-surface p-4 sm:p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FaUsers className="text-2xl text-blue-500" />
                <div className="text-textSecondary text-sm">Total Users</div>
              </div>
              <div className="text-3xl font-bold">{stats.totalUsers}</div>
            </div>
            
            <div className="bg-surface p-4 sm:p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FaVideo className="text-2xl text-purple-500" />
                <div className="text-textSecondary text-sm">Total Videos</div>
              </div>
              <div className="text-3xl font-bold">{stats.totalVideos}</div>
            </div>
            
            <div className="bg-surface p-4 sm:p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FaVideo className="text-2xl text-yellow-500" />
                <div className="text-textSecondary text-sm">Pending Review</div>
              </div>
              <div className="text-3xl font-bold">{stats.pendingVideos}</div>
            </div>
            
            <div className="bg-surface p-4 sm:p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FaEye className="text-2xl text-green-500" />
                <div className="text-textSecondary text-sm">Total Views</div>
              </div>
              <div className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</div>
            </div>
            
            <div className="bg-surface p-4 sm:p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <FaDollarSign className="text-2xl text-primary" />
                <div className="text-textSecondary text-sm">Total Earnings</div>
              </div>
              <div className="text-3xl font-bold">${stats.totalEarnings.toFixed(2)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Videos Tab */}
      {activeTab === 'videos' && (
        <div className="bg-surface rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">All Videos</h2>
            <div className="flex items-center gap-2">
              <FaFilter className="text-textSecondary" />
              <select
                value={videoStatusFilter}
                onChange={(e) => setVideoStatusFilter(e.target.value)}
                className="bg-background border border-gray-700 rounded px-3 py-1 text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-sm">Title</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Creator</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Status</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Views</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Duration</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVideos.map((video) => (
                  <tr key={video.id} className="border-t border-gray-800">
                    <td className="p-3 sm:p-4 text-sm">{video.title}</td>
                    <td className="p-3 sm:p-4 text-sm">{video.user.username}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs ${
                        video.status === 'APPROVED' ? 'bg-green-500 bg-opacity-20 text-green-500' :
                        video.status === 'PENDING' ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                        'bg-red-500 bg-opacity-20 text-red-500'
                      }`}>
                        {video.status}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-sm">{video.views}</td>
                    <td className="p-3 sm:p-4 text-sm">{Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}</td>
                    <td className="p-3 sm:p-4">
                      <div className="flex gap-2">
                        {video.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleVideoAction(video.id, 'approve')}
                              className="p-2 bg-green-500 hover:bg-green-600 rounded"
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() => handleVideoAction(video.id, 'reject')}
                              className="p-2 bg-red-500 hover:bg-red-600 rounded"
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleVideoAction(video.id, 'delete')}
                          className="p-2 bg-red-700 hover:bg-red-800 rounded"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-surface rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">All Users</h2>
            <div className="flex items-center gap-2">
              <FaFilter className="text-textSecondary" />
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="bg-background border border-gray-700 rounded px-3 py-1 text-sm"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-sm">Username</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Email</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Role</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Status</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Videos</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-t border-gray-800">
                    <td className="p-3 sm:p-4 text-sm">{user.username}</td>
                    <td className="p-3 sm:p-4 text-sm">{user.email}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs ${
                        user.role === 'ADMIN' ? 'bg-primary bg-opacity-20 text-primary' :
                        user.role === 'CREATOR' ? 'bg-blue-500 bg-opacity-20 text-blue-500' :
                        'bg-gray-500 bg-opacity-20 text-gray-500'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs ${
                        user.status === 'ACTIVE' ? 'bg-green-500 bg-opacity-20 text-green-500' :
                        user.status === 'SUSPENDED' ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                        'bg-red-500 bg-opacity-20 text-red-500'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-sm">{user._count.videos}</td>
                    <td className="p-3 sm:p-4">
                      {user.role !== 'ADMIN' && (
                        <div className="flex gap-2">
                          {user.status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className="p-2 bg-yellow-500 hover:bg-yellow-600 rounded"
                                title="Suspend User"
                              >
                                <FaUserSlash />
                              </button>
                              <button
                                onClick={() => handleBanUser(user.id)}
                                className="p-2 bg-orange-500 hover:bg-orange-600 rounded"
                                title="Ban User"
                              >
                                <FaBan />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-2 bg-red-700 hover:bg-red-800 rounded"
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className="bg-surface rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold">Content Reports</h2>
          </div>
          <div className="space-y-4 p-4 sm:p-6">
            {reports.length === 0 ? (
              <p className="text-textSecondary text-center py-8">No reports found</p>
            ) : (
              reports.map((report) => (
                <div key={report.id} className="bg-background p-4 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{report.video.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          report.status === 'PENDING' ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                          report.status === 'RESOLVED' ? 'bg-green-500 bg-opacity-20 text-green-500' :
                          'bg-blue-500 bg-opacity-20 text-blue-500'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      <p className="text-sm text-textSecondary mb-1">
                        <strong>Reason:</strong> {report.reason}
                      </p>
                      {report.details && (
                        <p className="text-sm text-textSecondary mb-1">
                          <strong>Details:</strong> {report.details}
                        </p>
                      )}
                      {report.action && (
                        <p className="text-sm text-green-400 mb-1">
                          <strong>Action Taken:</strong> {report.action}
                        </p>
                      )}
                      <p className="text-xs text-textSecondary">
                        Reported by {report.reporter.username} on {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex sm:flex-col gap-2">
                      <button
                        onClick={() => router.push(`/video/${report.video.id}`)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded text-sm whitespace-nowrap"
                      >
                        View Video
                      </button>
                      {report.status === 'PENDING' && (
                        <button
                          onClick={() => handleResolveReport(report.id)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded text-sm whitespace-nowrap"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tools Tab */}
      {activeTab === 'tools' && (
        <div className="space-y-6">
          {/* Simulate Views */}
          <div className="bg-surface p-4 sm:p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaEye className="text-primary" />
              Simulate Views for User
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Select User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                >
                  <option value="">Select a user...</option>
                  {users.filter(u => u.role === 'CREATOR').map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user._count.videos} videos)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Number of Views to Add</label>
                <input
                  type="number"
                  value={viewsToAdd}
                  onChange={(e) => setViewsToAdd(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  placeholder="e.g., 1000"
                  min="1"
                />
              </div>
              <button
                onClick={handleSimulateViews}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold"
              >
                Simulate Views
              </button>
              <p className="text-xs text-textSecondary">
                This will add the specified views to the user's most recent approved video and calculate earnings accordingly.
              </p>
            </div>
          </div>

          {/* Add Earnings */}
          <div className="bg-surface p-4 sm:p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaDollarSign className="text-primary" />
              Add Balance to Earnings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Select User</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                >
                  <option value="">Select a user...</option>
                  {users.filter(u => u.role === 'CREATOR').map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user._count.videos} videos)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={earningsAmount}
                  onChange={(e) => setEarningsAmount(e.target.value)}
                  className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary"
                  placeholder="e.g., 50.00"
                  step="0.01"
                  min="0.01"
                />
              </div>
              <button
                onClick={handleAddEarnings}
                className="w-full bg-primary hover:bg-primaryHover text-white py-3 rounded-lg font-semibold"
              >
                Add Earnings
              </button>
              <p className="text-xs text-textSecondary">
                This will add a bonus earning entry to the user's account. Use this for manual adjustments or bonuses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-surface rounded-lg overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-800">
            <h2 className="text-xl font-bold">Admin Action Audit Log</h2>
            <p className="text-sm text-textSecondary mt-1">Complete history of all admin actions</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background">
                <tr>
                  <th className="text-left p-3 sm:p-4 text-sm">Date</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Admin</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Action</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Target</th>
                  <th className="text-left p-3 sm:p-4 text-sm">Reason</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-t border-gray-800">
                    <td className="p-3 sm:p-4 text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 sm:p-4 text-sm">{log.admin.username}</td>
                    <td className="p-3 sm:p-4">
                      <span className={`px-2 py-1 rounded text-xs ${
                        log.action.includes('APPROVED') ? 'bg-green-500 bg-opacity-20 text-green-500' :
                        log.action.includes('REJECTED') || log.action.includes('DELETED') ? 'bg-red-500 bg-opacity-20 text-red-500' :
                        log.action.includes('SUSPENDED') || log.action.includes('BANNED') ? 'bg-orange-500 bg-opacity-20 text-orange-500' :
                        'bg-blue-500 bg-opacity-20 text-blue-500'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-sm">
                      {log.targetType}: {log.targetId.substring(0, 8)}...
                    </td>
                    <td className="p-3 sm:p-4 text-sm text-textSecondary">
                      {log.reason || 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
