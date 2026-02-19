# Video Platform - User-Generated Content Platform

A modern, scalable video platform where creators can upload adult content and earn money based on views. Built with Next.js, PostgreSQL, and Bunny Stream.

## 🚀 Features

### Core Features (MVP)
- ✅ User authentication (register/login)
- ✅ Role-based access (User, Creator, Admin)
- ✅ Video upload with Bunny Stream integration
- ✅ Video moderation queue
- ✅ View tracking with anti-spam protection
- ✅ Revenue calculation based on views
- ✅ Creator dashboard with earnings breakdown
- ✅ Admin panel for content moderation
- ✅ Content reporting system
- ✅ Age verification (18+)
- ✅ Dark theme UI
- ✅ Responsive design (mobile-first)

### Platform Pages
- **Public Pages**: Homepage, video player, creator profiles
- **Creator Dashboard**: Upload videos, view statistics, track earnings
- **Admin Panel**: Moderate videos, review reports
- **Compliance Pages**: Terms of Service, Privacy Policy

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Video Infrastructure**: Bunny Stream (upload, encoding, storage, streaming)
- **Styling**: Tailwind CSS with custom dark theme

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js 18+ and npm/yarn/pnpm
- PostgreSQL database
- Bunny Stream account (for video hosting)

## ⚙️ Installation

### 1. Clone and Install Dependencies

```powershell
cd "c:\Users\albion mulaj\XX Project"
npm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```powershell
Copy-Item .env.example .env
```

Edit `.env` with your actual values:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/video_platform"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32

# Bunny Stream
BUNNY_STREAM_API_KEY="your-bunny-stream-api-key"
BUNNY_STREAM_LIBRARY_ID="your-library-id"
BUNNY_STREAM_CDN_HOSTNAME="your-cdn-hostname.b-cdn.net"

# Platform Settings
PAYOUT_RATE_PER_1000_VIEWS=5
MINIMUM_PAYOUT_AMOUNT=50
```

### 3. Set Up Database

Initialize Prisma and create the database schema:

```powershell
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma db push

# (Optional) Open Prisma Studio to view/edit data
npx prisma studio
```

### 4. Create an Admin User

After the database is set up, you'll need to create an admin user. You can do this by:

1. Running the development server
2. Registering a new account at http://localhost:3000/register
3. Manually updating the user's role in the database to 'ADMIN':

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

Or use Prisma Studio:
```powershell
npx prisma studio
```

### 5. Start Development Server

```powershell
npm run dev
```

Visit http://localhost:3000 to see your platform!

## 🎥 Bunny Stream Setup

1. Sign up for a Bunny Stream account at https://bunny.net/stream/
2. Create a new Video Library
3. Get your API Key from the library settings
4. Copy your Library ID and CDN Hostname
5. Add these values to your `.env` file

## 📁 Project Structure

```
XX Project/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── videos/       # Video management
│   │   │   ├── creator/      # Creator endpoints
│   │   │   └── admin/        # Admin endpoints
│   │   ├── admin/            # Admin panel
│   │   ├── creator/          # Creator dashboard
│   │   ├── video/            # Video player page
│   │   ├── profile/          # User profiles
│   │   ├── login/            # Login page
│   │   ├── register/         # Registration page
│   │   ├── terms/            # Terms of Service
│   │   ├── privacy/          # Privacy Policy
│   │   └── page.tsx          # Homepage
│   ├── components/           # React components
│   │   ├── Navbar.tsx
│   │   ├── VideoGrid.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── VideoInfo.tsx
│   │   └── AgeVerification.tsx
│   └── lib/                  # Utility functions
│       ├── prisma.ts         # Prisma client
│       ├── auth.ts           # NextAuth configuration
│       ├── bunny-stream.ts   # Bunny Stream service
│       ├── revenue.ts        # Revenue calculation
│       └── config.ts         # Platform configuration
├── .env                      # Environment variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 🔑 User Roles

### USER
- Watch videos
- Report content
- Basic profile

### CREATOR
- All USER permissions
- Upload videos
- View earnings dashboard
- Access creator statistics

### ADMIN
- All CREATOR permissions
- Approve/reject videos
- Review reports
- Access admin panel
- User management

## 💰 Revenue System

### How It Works
1. Views are tracked when users watch videos for 5+ seconds
2. Anti-spam: Same IP can't count multiple views within 30 minutes
3. Revenue calculated per 1,000 views
4. Default rate: $5 per 1,000 views (configurable)
5. Earnings visible in creator dashboard

### View Tracking
- Each video view is recorded with IP address and timestamp
- Duplicate views from same IP within 30 minutes are ignored
- Only approved videos count towards earnings

### Earnings Calculation
- Automatic calculation per 1,000 views
- Pending earnings shown separately from paid earnings
- Detailed breakdown per video available

## 🛡️ Security & Compliance

### Age Verification
- Modal on first visit requiring confirmation of 18+ age
- Stored in localStorage

### Content Moderation
- All videos require admin approval before going live
- Moderation queue in admin panel
- Ability to reject with reason

### Content Reporting
- Users can report inappropriate content
- Reports reviewed in admin panel
- Multiple report categories

### Data Protection
- Passwords hashed with bcrypt
- JWT-based authentication
- CSRF protection via NextAuth

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### VPS/Cloud Server

```powershell
# Build the production application
npm run build

# Start production server
npm start
```

### Environment Setup
Make sure to set all environment variables in your deployment platform.

### Database
- Use a managed PostgreSQL service (e.g., Vercel Postgres, Supabase, Railway)
- Run `npx prisma db push` after deployment

## 📊 Database Schema

### Main Tables
- **User**: User accounts with roles
- **Video**: Uploaded videos with status
- **View**: Individual video views
- **Earning**: Calculated earnings records
- **Report**: Content reports
- **Settings**: Platform configuration

## 🎨 Customization

### Branding
Edit [tailwind.config.ts](tailwind.config.ts) to change colors:
```typescript
colors: {
  primary: "#ff006e",        // Main brand color
  background: "#0a0a0a",     // Background color
  surface: "#141414",         // Card/surface color
}
```

### Revenue Rate
Change payout rate in `.env`:
```env
PAYOUT_RATE_PER_1000_VIEWS=10  # $10 per 1000 views
```

## 🐛 Troubleshooting

### Database Connection Issues
```powershell
# Check if PostgreSQL is running
# Verify DATABASE_URL in .env
# Test connection with:
npx prisma db push
```

### Bunny Stream Upload Fails
- Verify API key is correct
- Check library ID matches
- Ensure CDN hostname is correct
- Check file size limits

### NextAuth Session Issues
- Regenerate NEXTAUTH_SECRET
- Clear browser cookies
- Verify NEXTAUTH_URL matches your domain

## 📈 Future Enhancements (Phase 2 & 3)

### Phase 2 - Monetization
- [ ] Real ad integration (Google AdSense, etc.)
- [ ] Payment processing (Stripe, PayPal)
- [ ] Creator verification system
- [ ] Subscription tiers

### Phase 3 - Scaling
- [ ] Video recommendations algorithm
- [ ] Advanced analytics
- [ ] Comments and likes
- [ ] Follow/subscribe system
- [ ] Live streaming
- [ ] Multiple language support

## 📝 License

This project is provided as-is for your use. Ensure compliance with all applicable laws and regulations when operating an adult content platform.

## ⚠️ Important Notes

1. **Legal Compliance**: Ensure you comply with all local and international laws regarding adult content
2. **Age Verification**: Implement proper age verification as required by law
3. **Content Moderation**: Have a clear content policy and moderation system
4. **Terms & Privacy**: Update Terms of Service and Privacy Policy to match your specific implementation
5. **Payment Processing**: Implement proper financial systems before handling real money
6. **GDPR/CCPA**: Ensure compliance with data protection regulations

## 📞 Support

For issues or questions:
1. Check this README
2. Review Prisma documentation: https://www.prisma.io/docs
3. Check Next.js documentation: https://nextjs.org/docs
4. Review Bunny Stream docs: https://docs.bunny.net/docs/stream

---

**Built with ❤️ using Next.js and modern web technologies**
