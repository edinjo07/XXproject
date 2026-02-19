import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    username: string
    role: 'USER' | 'CREATOR' | 'ADMIN'
  }

  interface Session {
    user: {
      id: string
      email: string
      username: string
      role: 'USER' | 'CREATOR' | 'ADMIN'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    role: 'USER' | 'CREATOR' | 'ADMIN'
  }
}
