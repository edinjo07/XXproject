'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { formatDistanceToNow } from 'date-fns'
import { FaUser, FaReply } from 'react-icons/fa'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    username: string
    avatar: string | null
  }
  replies?: Comment[]
}

interface CommentsProps {
  videoId: string
}

export function Comments({ videoId }: CommentsProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [videoId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await axios.get(`/api/videos/${videoId}/comments`)
      setComments(response.data.comments)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      router.push('/login')
      return
    }

    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await axios.post(`/api/videos/${videoId}/comments`, {
        content: newComment,
      })
      setNewComment('')
      await fetchComments()
    } catch (error) {
      console.error('Error posting comment:', error)
      alert('Failed to post comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      router.push('/login')
      return
    }

    if (!replyContent.trim()) return

    setIsSubmitting(true)
    try {
      await axios.post(`/api/videos/${videoId}/comments`, {
        content: replyContent,
        parentId,
      })
      setReplyContent('')
      setReplyTo(null)
      await fetchComments()
    } catch (error) {
      console.error('Error posting reply:', error)
      alert('Failed to post reply')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="text-textSecondary">Loading comments...</div>
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-6">
        Comments ({comments.length})
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={
            session ? 'Add a comment...' : 'Login to comment'
          }
          className="w-full bg-surface border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-primary resize-none"
          rows={3}
          maxLength={1000}
          disabled={!session || isSubmitting}
        />
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={!session || !newComment.trim() || isSubmitting}
            className="bg-primary hover:bg-primaryHover disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            {isSubmitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-textSecondary text-center py-8">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-surface rounded-lg p-4">
              {/* Comment header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <FaUser />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{comment.user.username}</span>
                    <span className="text-sm text-textSecondary">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-textPrimary">{comment.content}</p>
                </div>
              </div>

              {/* Reply button */}
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="flex items-center gap-2 text-sm text-textSecondary hover:text-primary ml-13"
              >
                <FaReply />
                Reply
              </button>

              {/* Reply form */}
              {replyTo === comment.id && (
                <div className="ml-13 mt-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full bg-background border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-primary resize-none text-sm"
                    rows={2}
                    maxLength={1000}
                    disabled={isSubmitting}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={!replyContent.trim() || isSubmitting}
                      className="bg-primary hover:bg-primaryHover disabled:bg-gray-600 text-white px-4 py-1 rounded text-sm"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => {
                        setReplyTo(null)
                        setReplyContent('')
                      }}
                      className="bg-surface hover:bg-surfaceHover text-white px-4 py-1 rounded text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-13 mt-4 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <FaUser className="text-sm" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">
                            {reply.user.username}
                          </span>
                          <span className="text-xs text-textSecondary">
                            {formatDistanceToNow(new Date(reply.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-textPrimary">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
