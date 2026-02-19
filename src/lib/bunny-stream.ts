import axios from 'axios'
import { config } from './config'

const BUNNY_API_BASE = 'https://video.bunnycdn.com'

export class BunnyStreamService {
  private apiKey: string
  private libraryId: string

  constructor() {
    this.apiKey = config.bunnyStream.apiKey
    this.libraryId = config.bunnyStream.libraryId
  }

  /**
   * Create a video in Bunny Stream
   */
  async createVideo(title: string) {
    try {
      const response = await axios.post(
        `${BUNNY_API_BASE}/library/${this.libraryId}/videos`,
        { title },
        {
          headers: {
            AccessKey: this.apiKey,
            'Content-Type': 'application/json',
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Error creating video in Bunny Stream:', error)
      throw new Error('Failed to create video')
    }
  }

  /**
   * Get upload URL for direct upload
   */
  getUploadUrl(videoId: string): string {
    return `${BUNNY_API_BASE}/library/${this.libraryId}/videos/${videoId}`
  }

  /**
   * Get video info
   */
  async getVideoInfo(videoId: string) {
    try {
      const response = await axios.get(
        `${BUNNY_API_BASE}/library/${this.libraryId}/videos/${videoId}`,
        {
          headers: {
            AccessKey: this.apiKey,
          },
        }
      )

      return response.data
    } catch (error) {
      console.error('Error getting video info:', error)
      throw new Error('Failed to get video info')
    }
  }

  /**
   * Delete video from Bunny Stream
   */
  async deleteVideo(videoId: string) {
    try {
      await axios.delete(
        `${BUNNY_API_BASE}/library/${this.libraryId}/videos/${videoId}`,
        {
          headers: {
            AccessKey: this.apiKey,
          },
        }
      )
    } catch (error) {
      console.error('Error deleting video:', error)
      throw new Error('Failed to delete video')
    }
  }

  /**
   * Get video embed URL
   */
  getEmbedUrl(videoId: string): string {
    return `https://iframe.mediadelivery.net/embed/${this.libraryId}/${videoId}`
  }

  /**
   * Get thumbnail URL
   */
  getThumbnailUrl(videoId: string): string {
    return `https://${config.bunnyStream.cdnHostname}/${videoId}/thumbnail.jpg`
  }
}

export const bunnyStream = new BunnyStreamService()
