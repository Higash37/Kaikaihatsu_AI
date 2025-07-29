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
  console.log('AuthProvider initialized - using default user')
  
  // 常にデフォルトユーザーを設定
  const defaultUser = {
    id: 'default-user-001',
    email: 'user@example.com',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()
  } as User;
  
  const defaultProfile = {
    id: 'default-user-001',
    username: 'デフォルトユーザー',
    email: 'user@example.com',
    bio: null,
    avatar_url: null,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  } as Profile;
  
  const [user, setUser] = useState<User | null>(defaultUser)
  const [profile, setProfile] = useState<Profile | null>(defaultProfile)
  const [loading, setLoading] = useState(false) // 常にログイン済みなのでfalse

  // Mock関数
  const signUp = async (email: string, password: string, username: string) => {
    console.log('Mock signUp called with:', email, username);
    // 何もしない（既にログイン済み）
  }

  const signIn = async (email: string, password: string) => {
    console.log('Mock signIn called with:', email);
    // 何もしない（既にログイン済み）
  }

  const signOut = async () => {
    console.log('Mock signOut called - but user remains logged in');
    // 何もしない（常にログイン状態を維持）
  }

  const value = {
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}