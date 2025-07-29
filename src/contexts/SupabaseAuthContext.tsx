'use client'

import { User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('AuthProvider initialized')
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  
  // supabaseクライアントをuseStateやuseRefで管理せず、直接作成
  const supabase = createClient()
  console.log('Supabase client created:', supabase)

  // useEffectをコンポーネントマウント直後に強制実行
  console.log('About to run useEffect')
  useEffect(() => {
    console.log('✅ useEffect IS RUNNING!!!')
    
    // 初期認証状態を取得
    const getInitialAuth = async () => {
      console.log('Getting initial auth state...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Initial session:', session, 'Error:', error)
        
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('User found, fetching profile for:', session.user.id)
          await fetchProfile(session.user.id)
        }
        
        setLoading(false)
      } catch (error) {
        console.error('Error getting initial auth:', error)
        setLoading(false)
      }
    }

    getInitialAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          console.log('User authenticated, fetching profile for:', session.user.id)
          await fetchProfile(session.user.id)
        } else {
          console.log('User logged out')
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      console.log('Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      // プロファイルは自動作成トリガーで作成されるため、ここでの手動作成は削除
      // 必要に応じてユーザー名の更新のみ行う
      if (data.user) {
        // 少し待ってからプロファイルを更新（トリガーでの作成を待つ）
        setTimeout(async () => {
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ username })
            .eq('id', data.user.id)

          if (updateError) {
            console.error('Error updating username:', updateError)
          }
        }, 1000)
      }
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}