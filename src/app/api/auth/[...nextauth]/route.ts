import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Master Key',
      credentials: {
        password: { label: "App Password", type: "password", placeholder: "Enter your secret password" }
      },
      async authorize(credentials) {
        // Check if the password they typed matches your .env file
        if (credentials?.password === process.env.APP_PASSWORD) {
          // If it matches, let them in as the "Owner"
          return { id: "1", name: "Owner", email: "owner@garage.com" }
        }
        // If it fails, reject them
        return null
      }
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }