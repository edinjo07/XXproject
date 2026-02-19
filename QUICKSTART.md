# Quick Start Guide

Follow these steps to get your platform running quickly.

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```powershell
npm install
```

### Step 2: Create Environment File
```powershell
Copy-Item .env.example .env
```

Then edit `.env` and add:
- Your PostgreSQL database URL
- Generate a secret for NextAuth: `openssl rand -base64 32`
- Your Bunny Stream credentials

### Step 3: Set Up Database
```powershell
# Initialize database
npx prisma db push

# Seed with test accounts
npm run db:seed
```

This creates:
- **Admin account**: admin@example.com / admin123456
- **Creator account**: creator@example.com / creator123456

### Step 4: Start Development Server
```powershell
npm run dev
```

Visit: http://localhost:3000

## 🎯 First Steps

### 1. Test Age Verification
- Visit http://localhost:3000
- Confirm you are 18+
- This is stored in localStorage

### 2. Login as Admin
- Go to http://localhost:3000/login
- Login with: admin@example.com / admin123456
- Access admin panel: http://localhost:3000/admin

### 3. Test Creator Flow
- Logout and login as creator@example.com
- Go to Creator Dashboard
- Try uploading a test video

### 4. Test Moderation
- Login as admin
- Go to admin panel
- Approve the video you uploaded

### 5. Test Public View
- Logout or use incognito mode
- Browse approved videos
- Click to watch and test view tracking

## 📊 Viewing Database

At any time, you can view/edit the database:
```powershell
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555

## ⚡ Available Scripts

```powershell
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint

npm run db:push    # Push schema changes to database
npm run db:seed    # Seed database with test data
npm run db:studio  # Open Prisma Studio
```

## 🔧 Common Tasks

### Reset Database
```powershell
npx prisma db push --force-reset
npm run db:seed
```

### Create New Test User
Use Prisma Studio or register through the UI

### Change Payout Rate
Edit `.env`:
```env
PAYOUT_RATE_PER_1000_VIEWS=10
```

### View Server Logs
Watch the terminal where `npm run dev` is running

## 🐛 Troubleshooting

**Can't connect to database?**
- Make sure PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Try: `npx prisma db push`

**Next.js errors?**
- Delete `.next` folder
- Run `npm install` again
- Restart dev server

**Auth not working?**
- Regenerate NEXTAUTH_SECRET
- Clear browser cookies
- Check NEXTAUTH_URL matches your domain

**Video upload fails?**
- Verify Bunny Stream credentials in `.env`
- Check API key has proper permissions
- Ensure library ID is correct

## 🎥 Bunny Stream Setup

1. Create account at https://bunny.net/stream/
2. Create a Video Library
3. Copy these values to `.env`:
   - API Key (from library settings)
   - Library ID (from URL)
   - CDN Hostname (from pull zone settings)

## 📝 Next Steps

1. ✅ Get platform running locally
2. ✅ Test all features (upload, moderation, viewing)
3. ✅ Customize branding (colors, name)
4. ✅ Update Terms & Privacy pages
5. ✅ Set up production database
6. ✅ Deploy to hosting platform

## 🌐 Deployment Checklist

Before deploying to production:

- [ ] Set secure NEXTAUTH_SECRET
- [ ] Use production database
- [ ] Configure Bunny Stream production account
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Review and update Terms of Service
- [ ] Review and update Privacy Policy
- [ ] Set up proper payment processing
- [ ] Implement real ad system
- [ ] Consider CDN for static assets
- [ ] Set up monitoring and logging
- [ ] Implement backup strategy
- [ ] Review security settings

## 📞 Need Help?

Check the main [README.md](README.md) for detailed documentation.
