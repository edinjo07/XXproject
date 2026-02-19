# 🔒 Security Implementation - Quick Reference

## 🚀 Quick Start

### 1. Environment Setup
```bash
# Copy the template
cp .env.template .env

# Generate a secure secret
# Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Add it to your .env file as NEXTAUTH_SECRET
```

### 2. Verify Protection
```bash
# Check .gitignore is working
git status

# .env should NOT appear in untracked files
# dev.db should NOT appear in untracked files
```

## 📝 Using Security Utilities

### Protect an API Route

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, sanitize } from '@/lib/security'
import { videoUploadSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  // 1. Require authentication
  const { error, session } = await requireAuth(request)
  if (error) return error

  try {
    // 2. Parse request body
    const body = await request.json()
    
    // 3. Validate with schema
    const validation = videoUploadSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      )
    }

    // 4. Sanitize inputs
    const title = sanitize.string(validation.data.title)
    const description = sanitize.html(validation.data.description || '')

    // 5. Process safely...
    // Your business logic here

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Error]', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
```

### Protect Admin Routes

```typescript
import { requireAdmin } from '@/lib/security'

export async function DELETE(request: NextRequest) {
  // Only admins can access
  const { error, session } = await requireAdmin(request)
  if (error) return error

  // Admin-only logic here...
}
```

### Validate File Uploads

```typescript
import { validateUpload } from '@/lib/security'

// In your upload handler
const file = formData.get('video') as File

const validation = validateUpload.video(file)
if (!validation.valid) {
  return NextResponse.json(
    { error: validation.error },
    { status: 400 }
  )
}

// Process valid file...
```

### Secure Logging

```typescript
import { secureLog } from '@/lib/security'

// This will automatically redact sensitive fields
secureLog('User login attempt', { 
  email: 'user@example.com',
  password: 'secret123', // Will be [REDACTED]
  apiKey: 'key_123', // Will be [REDACTED]
})
```

## 🛡️ Available Security Functions

### Authentication
- `requireAuth(request)` - Ensure user is logged in
- `requireAdmin(request)` - Ensure user is admin

### Validation
- `registerSchema` - User registration
- `loginSchema` - User login
- `videoUploadSchema` - Video upload
- `reportSchema` - Report submission
- More in `src/lib/validation.ts`

### Sanitization
- `sanitize.string(input)` - Remove dangerous characters
- `sanitize.email(input)` - Validate & normalize email
- `sanitize.username(input)` - Validate username format
- `sanitize.html(input)` - Prevent XSS

### Upload Validation
- `validateUpload.video(file)` - Validate video files
- `validateUpload.image(file)` - Validate image files

### Utilities
- `validateOrigin(request)` - Check request origin
- `secureLog(message, data)` - Log without sensitive data
- `generateCSRFToken()` - Generate CSRF token

## 🔍 Testing Rate Limiting

```bash
# Test rate limiting (PowerShell)
for ($i=1; $i -le 35; $i++) {
  Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"test": true}'
}

# After 30 requests, you should see 429 errors
```

## 📋 Pre-Production Checklist

```bash
# 1. Update dependencies
npm audit fix

# 2. Check for security issues
npm audit

# 3. Generate Prisma client
npx prisma generate

# 4. Test all auth flows
# - Registration
# - Login
# - Admin access
# - API routes

# 5. Verify .env is NOT in git
git status

# 6. Check security headers
# Visit your site and check Network tab in DevTools
```

## 🚨 Emergency Response

If you discover a security issue:

```bash
# 1. Stop the dev server
# Press Ctrl+C

# 2. Check for exposed .env
git log --all --full-history -- .env

# 3. If .env was committed, rotate ALL secrets immediately
# Generate new values for:
# - NEXTAUTH_SECRET
# - BUNNY_STREAM_API_KEY
# - Any other credentials

# 4. Remove from git history (if needed)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 5. Force push (⚠️ DANGEROUS - coordinate with team)
git push origin --force --all
```

## 📚 Files Modified

- `src/lib/security.ts` - Security utilities
- `src/lib/validation.ts` - Input validation schemas
- `src/middleware.ts` - Rate limiting & auth checks
- `next.config.js` - Security headers
- `.gitignore` - Protected files
- `.env.template` - Environment variable template

## 💡 Best Practices

### ✅ DO
- Use `sanitize.*` on all user inputs
- Validate with Zod schemas
- Use `requireAuth` / `requireAdmin`
- Log errors with `secureLog`
- Keep dependencies updated
- Use environment variables for secrets

### ❌ DON'T
- Hardcode credentials
- Log passwords or tokens
- Trust user input
- Expose stack traces to users
- Commit .env files
- Use SQLite in production

## 🔗 Quick Links

- [Full Security Guide](./SECURITY.md)
- [API Documentation](./API.md)
- [Admin Guide](./ADMIN_GUIDE.md)

---

**Questions?** Check [SECURITY.md](./SECURITY.md) for detailed documentation.
