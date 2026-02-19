# API Documentation

Complete reference for all API endpoints in the Video Platform.

## Authentication

All authenticated endpoints require a valid session token (handled automatically by NextAuth).

### Register User
```
POST /api/auth/register
```

**Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123",
  "role": "USER" | "CREATOR"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "cuid",
    "email": "user@example.com",
    "username": "username",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Login
```
POST /api/auth/signin
```
Handled by NextAuth. Use the provided UI at `/login`.

---

## Videos

### Upload Video (Initialize)
```
POST /api/videos/upload
```

**Auth Required:** Creator or Admin

**Body:**
```json
{
  "title": "Video Title",
  "description": "Optional description"
}
```

**Response:**
```json
{
  "video": {
    "id": "cuid",
    "title": "Video Title",
    "bunnyVideoId": "bunny-video-guid"
  },
  "uploadUrl": "https://video.bunnycdn.com/..."
}
```

**Usage:**
1. Call this endpoint to initialize the upload
2. Upload the video file to the returned `uploadUrl` using PUT request
3. Call the complete endpoint

### Complete Video Upload
```
POST /api/videos/{id}/complete
```

**Auth Required:** Creator (video owner)

**Response:**
```json
{
  "video": {
    "id": "cuid",
    "title": "Video Title",
    "status": "PENDING",
    "duration": 180
  }
}
```

### Record Video View
```
POST /api/videos/{id}/view
```

**Auth Required:** No (public)

**Anti-spam:** Same IP can't count multiple views within 30 minutes

**Response:**
```json
{
  "message": "View recorded"
}
```

### Report Video
```
POST /api/videos/{id}/report
```

**Auth Required:** Yes

**Body:**
```json
{
  "reason": "inappropriate" | "copyright" | "spam" | "illegal" | "other",
  "details": "Optional additional information"
}
```

**Response:**
```json
{
  "message": "Report submitted",
  "report": {
    "id": "cuid",
    "reason": "inappropriate"
  }
}
```

---

## Creator Endpoints

### Get Creator Videos
```
GET /api/creator/videos
```

**Auth Required:** Creator or Admin

**Response:**
```json
{
  "videos": [
    {
      "id": "cuid",
      "title": "Video Title",
      "views": 1234,
      "status": "APPROVED" | "PENDING" | "REJECTED",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "thumbnail": "https://..."
    }
  ]
}
```

### Get Creator Earnings
```
GET /api/creator/earnings
```

**Auth Required:** Creator or Admin

**Response:**
```json
{
  "totalEarnings": 123.45,
  "pendingEarnings": 12.50,
  "pendingViews": 2500,
  "breakdown": [
    {
      "videoId": "cuid",
      "videoTitle": "Video Title",
      "totalViews": 10000,
      "countedViews": 9000,
      "totalEarnings": 45.00
    }
  ]
}
```

**Calculation:**
- `totalEarnings`: Already paid/confirmed earnings
- `pendingEarnings`: Estimated earnings from uncounted views
- `countedViews`: Views that have been counted for payment
- `pendingViews`: Views not yet counted (< 1000)

---

## Admin Endpoints

### Get Pending Videos
```
GET /api/admin/videos/pending
```

**Auth Required:** Admin only

**Response:**
```json
{
  "videos": [
    {
      "id": "cuid",
      "title": "Video Title",
      "description": "Description",
      "bunnyVideoId": "bunny-guid",
      "status": "PENDING",
      "views": 0,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "user": {
        "username": "creator1"
      }
    }
  ]
}
```

### Approve Video
```
POST /api/admin/videos/{id}/approve
```

**Auth Required:** Admin only

**Response:**
```json
{
  "message": "Video approved",
  "video": {
    "id": "cuid",
    "status": "APPROVED",
    "approvedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Reject Video
```
POST /api/admin/videos/{id}/reject
```

**Auth Required:** Admin only

**Body:**
```json
{
  "reason": "Rejection reason message"
}
```

**Response:**
```json
{
  "message": "Video rejected",
  "video": {
    "id": "cuid",
    "status": "REJECTED",
    "rejectionReason": "Rejection reason message"
  }
}
```

### Get Reports
```
GET /api/admin/reports
```

**Auth Required:** Admin only

**Response:**
```json
{
  "reports": [
    {
      "id": "cuid",
      "reason": "inappropriate",
      "details": "Additional details",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "video": {
        "id": "cuid",
        "title": "Video Title"
      },
      "reporter": {
        "username": "user1"
      }
    }
  ]
}
```

### Update Report Status
```
POST /api/admin/reports/{id}
```

**Auth Required:** Admin only

**Body:**
```json
{
  "action": "resolved"
}
```

**Response:**
```json
{
  "message": "Report updated",
  "report": {
    "id": "cuid",
    "status": "RESOLVED",
    "reviewedBy": "admin-id",
    "reviewedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Invalid input",
  "details": [...]
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "error": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Something went wrong"
}
```

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting in production:
- Video uploads: 10 per hour per user
- View tracking: Handled by anti-spam (30 min window)
- Reports: 5 per hour per user

---

## Video View Tracking Logic

### How Views Are Counted
1. User watches video for 5+ seconds
2. View recorded with IP address and timestamp
3. Video view count incremented
4. Duplicate prevention: Same IP within 30 minutes ignored

### Revenue Calculation
- Views counted per 1,000
- Remainder stays as "pending views"
- Example: 2,750 views = 2,000 counted + 750 pending

### Anti-Spam Protection
```javascript
// Duplicate window: 30 minutes (configurable)
const duplicateWindow = new Date()
duplicateWindow.setMinutes(duplicateWindow.getMinutes() - 30)
```

---

## Bunny Stream Integration

### Video Upload Flow
1. Create video via API → Get `uploadUrl`
2. PUT video file to `uploadUrl`
3. Call complete endpoint
4. Wait for admin approval

### Bunny Stream URLs
- **Upload**: `https://video.bunnycdn.com/library/{libraryId}/videos/{videoId}`
- **Thumbnail**: `https://{cdnHostname}/{videoId}/thumbnail.jpg`
- **Embed**: `https://iframe.mediadelivery.net/embed/{libraryId}/{videoId}`

---

## Revenue Calculation Service

### Methods Available

```typescript
// Calculate earnings from view count
calculateEarnings(views: number): number

// Calculate and store earnings for a video
calculateVideoEarnings(videoId: string): Promise<Earning | null>

// Get total earnings for a user
getUserTotalEarnings(userId: string): Promise<number>

// Get detailed earnings breakdown
getUserEarningsBreakdown(userId: string): Promise<EarningsBreakdown[]>

// Get pending (uncounted) earnings
getUserPendingEarnings(userId: string): Promise<PendingEarnings>
```

### Configuration
Set in `.env`:
```env
PAYOUT_RATE_PER_1000_VIEWS=5
MINIMUM_PAYOUT_AMOUNT=50
```

---

## Best Practices

### Security
- Always validate input with Zod schemas
- Check user permissions before actions
- Sanitize user-generated content
- Use parameterized queries (Prisma handles this)

### Performance
- Use database indexes on frequently queried fields
- Consider caching for popular videos
- Implement pagination for large lists
- Use Bunny CDN for video delivery

### Error Handling
- Always catch and log errors
- Return user-friendly error messages
- Don't expose sensitive error details
- Use proper HTTP status codes

---

## Future API Endpoints

Consider implementing:
- `GET /api/videos/trending` - Trending videos
- `GET /api/videos/recommended` - Personalized recommendations
- `POST /api/videos/{id}/comment` - Comments system
- `POST /api/users/{id}/follow` - Follow creators
- `GET /api/search` - Search videos
- `POST /api/creator/payout` - Request payout
- `GET /api/analytics` - Detailed analytics
