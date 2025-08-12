import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from './db'
import UserModel from '../models/User'
import GoogleProvider from 'next-auth/providers/google'
import AppleProvider from 'next-auth/providers/apple'
import FacebookProvider from 'next-auth/providers/facebook'
import { serverEnv } from 'data/env/server'
import { console } from 'inspector'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: serverEnv.GOOGLE_CLIENT_ID!,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: serverEnv.FACEBOOK_CLIENT_ID!,
      clientSecret: serverEnv.FACEBOOK_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: serverEnv.APPLE_CLIENT_ID!,
      clientSecret: serverEnv.APPLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing email or password')
        }

        try {
          await connectToDatabase()
          const user = await UserModel.findOne({ email: credentials.email })

          if (!user) {
            throw new Error('No user found with this email')
          }

          const isValid = await bcrypt.compare(credentials.password, user.password)

          if (!isValid) {
            throw new Error('Invalid password')
          }

          console.log(user)

          return {
            id: user._id.toString(),
            isCompleted: user.isCompleted,
            role: user.role,
            email: user.email,
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await connectToDatabase()

      // Check if user already exists in DB
      console.log("Account:", account)
      let existingUser = await UserModel.findOne({ email: user.email })

      if (!existingUser) {
        // Create user with isCompleted = false
        existingUser = await UserModel.create({
          email: user.email,
          name: user.name || profile?.name || '',
          isCompleted: false,
          role: 'USER',
          provider: account?.provider || 'credentials',
        })
      }

      // Attach DB fields to NextAuth user object for JWT
      user.id = existingUser._id.toString()
      user.isCompleted = existingUser.isCompleted
      user.role = existingUser.role

      return true // allow sign in
    },
    async jwt({ token, user, session, trigger }) {
      console.log('JWT')
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isCompleted = user.isCompleted
        token.email = user.email
      }
      console.log(trigger)

      if (trigger === 'update' && session?.isCompleted) {
        console.log('UPDATE')
        token.isCompleted = session?.isCompleted
      }
      return token
    },
    async session({ session, token }) {
      console.log('SESSION...')
      console.log(session)
      console.log(token)
      session.user = {
        id: token.id as string,
        email: token.email as string,
        role: token.role as string,
        isCompleted: token.isCompleted as boolean,
      }
      console.log('NEW SESSION.USER:', session.user)
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: serverEnv.NEXTAUTH_SECRET,
}
