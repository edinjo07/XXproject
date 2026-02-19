# Admin Dashboard Documentation

## Overview
The comprehensive admin dashboard provides full control over the video platform, including video moderation, user management, view simulation, and earnings management.

## Access

### Admin Login
- **URL**: `/admin/login`
- **Credentials**: 
  - Email: `admin@example.com`
  - Password: `admin123456`

### Security
- Admin routes are protected by middleware
- Only users with ADMIN role can access `/admin/*` routes
- Automatic redirect to login page for unauthorized access

## Features

### 1. Overview Dashboard
**Path**: `/admin/dashboard` (Overview tab)

Displays platform statistics:
- **Total Users**: Number of registered users
- **Total Videos**: All videos in the platform
- **Pending Videos**: Videos awaiting approval
- **Total Views**: Cumulative view count
- **Total Earnings**: Sum of all creator earnings

### 2. Video Management
**Path**: `/admin/dashboard` (Videos tab)

**Features**:
- View all videos with status (PENDING, APPROVED, REJECTED)
- See creator username for each video
- Track view counts

**Actions**:
- **Approve**: Approve pending videos (button only shown for PENDING status)
- **Reject**: Reject pending videos with optional reason
- **Delete**: Permanently delete any video and all associated data (views, earnings, reports)

**API Endpoints**:
- `GET /api/admin/videos/all` - List all videos
- `POST /api/admin/videos/{id}/approve` - Approve video
- `POST /api/admin/videos/{id}/reject` - Reject video (with reason)
- `DELETE /api/admin/videos/{id}` - Delete video

### 3. User Management
**Path**: `/admin/dashboard` (Users tab)

**Features**:
- View all registered users
- See user roles (USER, CREATOR, ADMIN)
- Track video count per user
- View join date

**Actions**:
- **Delete User**: Permanently remove non-admin users
  - Cascades to delete all user's videos
  - Removes all associated earnings
  - Cleans up views and reports

**Protection**:
- Admin users cannot be deleted (safety feature)

**API Endpoints**:
- `GET /api/admin/users` - List all users with stats
- `DELETE /api/admin/users/{id}` - Delete user (prevents admin deletion)

### 4. Content Reports
**Path**: `/admin/dashboard` (Reports tab)

**Features**:
- View all content reports
- See reporter username
- Read report reason and details
- Check report date

**Actions**:
- **View Video**: Navigate directly to reported video for review

### 5. Admin Tools
**Path**: `/admin/dashboard` (Tools tab)

#### View Simulation
Generate fake views for testing and demonstration purposes.

**How to use**:
1. Select a creator from the dropdown (only shows CREATOR role users)
2. Enter number of views to add (e.g., 1000)
3. Click "Simulate Views"

**What happens**:
- System finds the user's most recent APPROVED video
- Generates unique IP addresses for each view
- Creates view records in batches (100 at a time)
- Updates video view count
- Automatically calculates and adds earnings ($5 per 1000 views)
- Creates CONFIRMED earning entry

**API**: `POST /api/admin/simulate-views`
```json
{
  "userId": "user_id_here",
  "viewCount": 1000
}
```

**Response**:
```json
{
  "success": true,
  "video": {
    "id": "video_id",
    "title": "Video Title",
    "newViews": 1000,
    "earnings": 5.00
  }
}
```

#### Add Earnings Balance
Manually add bonus earnings to creator accounts.

**How to use**:
1. Select a creator from the dropdown
2. Enter amount in USD (e.g., 50.00)
3. Click "Add Earnings"

**What happens**:
- Creates a bonus earning entry
- No video association (manual adjustment/bonus)
- Status set to CONFIRMED
- Immediately available in creator's earnings

**Use cases**:
- Promotional bonuses
- Compensation for issues
- Manual adjustments
- Contest prizes

**API**: `POST /api/admin/add-earnings`
```json
{
  "userId": "user_id_here",
  "amount": 50.00
}
```

## Navigation

### From Navbar
- Desktop: "Admin" link in top navigation (only visible to admins)
- Mobile: "Admin Panel" in hamburger menu (only visible to admins)

### Direct Access
- Dashboard: `/admin/dashboard`
- Login: `/admin/login`
- Old Panel: `/admin` (still available)

## Technical Details

### Database Schema Changes
The Earning model was updated to support bonus earnings:
```prisma
model Earning {
  id              String   @id @default(cuid())
  userId          String
  videoId         String?  // Optional - null for bonus earnings
  amount          Float
  views           Int      @default(0)
  status          String   @default("PENDING")
  calculatedAt    DateTime @default(now())
  
  user            User     @relation(fields: [userId], references: [id])
  video           Video?   @relation(fields: [videoId], references: [id])
}
```

### Middleware Protection
All `/admin/*` routes (except `/admin/login`) are protected:
- Checks JWT token in middleware
- Verifies ADMIN role
- Redirects unauthorized users to `/admin/login`

### Cascade Deletion
When deleting videos or users, related data is cleaned up:

**Video deletion**:
1. Delete all views for the video
2. Delete all earnings from the video
3. Delete all reports about the video
4. Delete the video itself

**User deletion**:
1. Delete views for user's videos
2. Delete reports for user's videos
3. Delete earnings for user's videos
4. Delete user's direct earnings
5. Delete user's videos
6. Delete reports made by user
7. Delete the user account

## Testing

### Test Data
- Admin account: `admin@example.com` / `admin123456`
- Creator account: `creator@example.com` / `creator123456`
- Test video: Available in database (ID: `cmlpv62bu0001rp03s5eiqcn7`)

### Testing Flow
1. Login as admin at `/admin/login`
2. Navigate to Overview tab to see statistics
3. Go to Videos tab to approve/reject test video
4. Use Tools tab to simulate 1000 views
5. Check creator dashboard to see earnings appear
6. Add bonus earnings through Tools tab
7. Verify earnings update in creator account

## Best Practices

### Video Moderation
- Review videos before approval
- Provide rejection reasons for creators
- Use delete sparingly (prefer rejection)

### User Management
- Back up data before deletion
- Consider warning users before removal
- Never delete admin accounts

### View Simulation
- Use realistic view counts (100-10,000)
- Test earnings calculation before live use
- Remember: $5 per 1000 views

### Earnings Management
- Document bonus reasons internally
- Use whole numbers for clarity
- Monitor total platform earnings

## Troubleshooting

### Cannot access admin dashboard
- Ensure you're logged in as admin
- Check role is "ADMIN" not "USER" or "CREATOR"
- Clear browser cache and re-login

### View simulation not working
- Verify user has at least one APPROVED video
- Check console for error messages
- Ensure view count is a positive integer

### Delete operations failing
- Cannot delete admin users (by design)
- Check if video/user exists
- Verify proper admin permissions

## Future Enhancements

Potential additions:
- Batch video approval/rejection
- User role management (promote/demote)
- Earnings report export
- Advanced analytics dashboard
- Activity audit logs
- Email notifications for moderation
- Payout management system
