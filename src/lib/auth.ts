import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

// Define user role type
type UserRole = 'USER' | 'CREATOR' | 'ADMIN'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Don't log credentials for security
        console.log('[AUTH] Authorization attempt')
        
        if (!credentials?.email || !credentials?.password) {
          console.log('[AUTH] Missing credentials')
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          console.log('[AUTH] User not found')
          throw new Error('Invalid credentials')
        }

        console.log('[AUTH] User found, verifying password...')
        
        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isCorrectPassword) {
          console.log('[AUTH] Authentication failed')
          throw new Error('Invalid credentials')
        }

        console.log('[AUTH] Authentication successful')
        
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role as UserRole,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.username = (user as any).username
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user = {
          ...session.user,
          id: token.id as string,
          username: token.username as string,
          role: token.role as UserRole,
        }
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}
