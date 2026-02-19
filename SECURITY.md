# 🔒 Security Guide

This document outlines the security measures implemented in this application and best practices for maintaining security.

## 🛡️ Implemented Security Measures

### 1. File & Data Protection

#### .gitignore Configuration
The following sensitive files are excluded from version control:
- `.env` files (all variants)
- Database files (`.db`, `.db-journal`)
- Private keys and certificates (`.key`, `.crt`, `.pem`)
- Test scripts with credentials
- Log files

**⚠️ IMPORTANT**: Never commit these files to version control!

### 2. Security Headers

Configured in `next.config.js`:

| Header | Purpose | Value |
|--------|---------|-------|
| `X-Frame-Options` | Prevent clickjacking | DENY |
| `X-Content-Type-Options` | Prevent MIME sniffing | nosniff |
| `X-XSS-Protection` | XSS protection | 1; mode=block |
| `Referrer-Policy` | Control referrer info | strict-origin-when-cross-origin |
| `Permissions-Policy` | Disable unused features | camera=(), microphone=(), geolocation=() |
| `Content-Security-Policy` | Control resource loading | Strict CSP policy |
| `X-Robots-Tag` | Prevent API indexing | noindex, nofollow (API routes) |

**Disabled**: `X-Powered-By` header to hide Next.js usage

### 3. Rate Limiting

Implemented in `src/middleware.ts`:

- **General Routes**: 100 requests per minute per IP
- **Sensitive Routes** (auth, admin, upload): 30 requests per minute per IP
- Returns `429 Too Many Requests` with `Retry-After` header when exceeded

### 4. Authentication & Authorization

#### Implemented in `src/lib/security.ts`:

- **`requireAuth()`**: Ensures user is logged in
- **`requireAdmin()`**: Ensures user has admin role
- **Session-based JWT**: Secure token management with NextAuth

### 5. Input Validation & Sanitization

The `sanitize` utilities in `src/lib/security.ts`:

```typescript
sanitize.string()   // Remove dangerous characters
sanitize.email()    // Validate and normalize email
sanitize.username() // Validate username format
sanitize.html()     // Prevent XSS in HTML content
```

### 6. File Upload Validation

Configured limits in `src/lib/security.ts`:

- **Videos**: Max 500MB, types: MP4, WebM, OGG, MOV
- **Images**: Max 5MB, types: JPEG, PNG, GIF, WebP

### 7. Origin Validation

Middleware checks request origin to prevent CSRF attacks on non-GET API requests.

### 8. Secure Logging

`secureLog()` function automatically redacts sensitive fields:
- password
- apiKey
- secret
- token
- authorization

---

## 🔐 Environment Variables Security

### Required Variables

Create `.env` file (NEVER commit to Git):

```bash
# Database
DATABASE_URL="file:./dev.db"

# NextAuth (use strong random strings)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-with-openssl-rand-base64-32>"

# Bunny Stream (obtain from Bunny CDN dashboard)
BUNNY_STREAM_API_KEY="<your-api-key>"
BUNNY_STREAM_LIBRARY_ID="<your-library-id>"
BUNNY_STREAM_CDN_HOSTNAME="<your-cdn-hostname>"
```

### Generate Secure Secrets

```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 🚨 Security Best Practices

### For Developers

1. **Never hardcode credentials**
   - Use environment variables only
   - Never log sensitive data

2. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   ```

3. **Use HTTPS in production**
   - Never use HTTP for production
   - Enable HSTS headers

4. **Validate all inputs**
   - Use Zod schemas for API validation
   - Sanitize user-provided content

5. **Implement proper error handling**
   - Don't expose stack traces to users
   - Log errors securely

### For Production Deployment

1. **Environment variables**
   - Use platform's secret management (Vercel, AWS Secrets Manager, etc.)
   - Never expose `.env` files

2. **Database**
   - Use PostgreSQL/MySQL in production (not SQLite)
   - Enable encryption at rest
   - Regular backups

3. **Rate limiting**
   - Use Redis for distributed rate limiting
   - Consider using Cloudflare or similar CDN

4. **Monitoring**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor failed login attempts
   - Alert on suspicious activity

5. **HTTPS & Certificates**
   - Use SSL/TLS certificates
   - Enable HSTS
   - Consider using Cloudflare for DDoS protection

---

## 🔍 API Route Security Example

### Protected API Route Pattern

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, sanitize } from '@/lib/security'
import { z } from 'zod'

// Define validation schema
const schema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().max(5000),
})

export async function POST(request: NextRequest) {
  // 1. Check authentication
  const { error, session } = await requireAuth(request)
  if (error) return error

  try {
    // 2. Parse and validate input
    const body = await request.json()
    const validated = schema.parse(body)

    // 3. Sanitize inputs
    const title = sanitize.string(validated.title)
    const content = sanitize.html(validated.content)

    // 4. Process request...
    // Your business logic here

    return NextResponse.json({ success: true })
  } catch (error) {
    // 5. Handle errors securely
    console.error('[API Error]', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
```

---

## 🐛 Common Vulnerabilities Prevented

### ✅ SQL Injection
- **Protection**: Prisma ORM with parameterized queries
- **Status**: Protected

### ✅ XSS (Cross-Site Scripting)
- **Protection**: Input sanitization, CSP headers, React auto-escaping
- **Status**: Protected

### ✅ CSRF (Cross-Site Request Forgery)
- **Protection**: Origin validation, SameSite cookies
- **Status**: Protected

### ✅ Clickjacking
- **Protection**: X-Frame-Options: DENY
- **Status**: Protected

### ✅ Rate Limiting / DDoS
- **Protection**: Middleware rate limiting
- **Status**: Protected (basic level)

### ✅ Authentication Bypass
- **Protection**: Middleware checks, role-based access
- **Status**: Protected

### ✅ Information Disclosure
- **Protection**: Secure logging, error handling
- **Status**: Protected

---

## 📋 Security Checklist

Before going to production:

- [ ] All environment variables are set securely
- [ ] Database is not SQLite (use PostgreSQL/MySQL)
- [ ] HTTPS is enabled
- [ ] Security headers are configured
- [ ] Rate limiting is working
- [ ] File uploads are validated
- [ ] Error tracking is set up
- [ ] Logs don't contain sensitive data
- [ ] Dependencies are up to date (`npm audit`)
- [ ] Admin routes are protected
- [ ] API routes validate inputs
- [ ] CORS is properly configured
- [ ] Backup strategy is in place

---

## 🆘 Security Incident Response

If you discover a security vulnerability:

1. **Don't panic** - Most issues can be fixed quickly
2. **Isolate the issue** - Take affected services offline if needed
3. **Assess the impact** - Check logs for exploitation attempts
4. **Fix the vulnerability** - Apply patches immediately
5. **Notify users** - If data was compromised, inform affected users
6. **Document the incident** - Learn and improve security measures

---

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Web Security Academy](https://portswigger.net/web-security)

---

**Last Updated**: February 17, 2026
**Maintained By**: Development Team

For questions or security concerns, contact: [security@yourapp.com]
