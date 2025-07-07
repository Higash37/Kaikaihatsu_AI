import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// **型定義の拡張**
interface CustomUser {
  id: string
  name: string
  scores: Record<string, number> // **スコアの型を明示**
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Custom Auth',
      credentials: {
        token: { label: 'Token', type: 'text' },
        scores: { label: 'Scores', type: 'text' }, // **scores を追加**
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (credentials?.token === 'valid_token') {
          return {
            id: '1',
            name: '診断済みユーザー',
            scores: credentials.scores ? JSON.parse(credentials.scores) : {}, // **文字列をオブジェクトに変換**
          }
        }
        return null
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.user = user as CustomUser // **型アサーションで user を CustomUser に**
      }
      return token
    },
    async session({ session, token }) {
      session.user = token.user as CustomUser // **型アサーションで session.user に token.user を設定**
      return session
    },
  },
}

export default NextAuth(authOptions)
