import { createClient } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from "next";

// Supabase クライアント（サーバーサイド用）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res
      .status(400)
      .json({ message: "Username, email, and password are required" });
  }

  if (username.length < 3) {
    return res
      .status(400)
      .json({ message: "Username must be at least 3 characters" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  try {
    // ユーザー名の重複チェック
    const { data: existingUser, error: _checkError } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Supabase Authでユーザー作成
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: username,
      }
    });

    if (error) {
      console.error("Signup error:", error);
      if (error.message.includes('already registered')) {
        return res.status(409).json({ message: "Email already exists" });
      }
      return res.status(400).json({ message: error.message });
    }

    if (!data.user) {
      return res.status(400).json({ message: "User creation failed" });
    }

    // プロフィール作成
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        username: username,
        email: email,
        bio: '',
        is_public: false,
      }]);

    if (profileError) {
      console.error("Profile creation error:", profileError);
      // ユーザーは作成されているが、プロフィール作成に失敗
      // この場合、ユーザーが後でプロフィールを完成させることができる
    }

    res.status(201).json({
      message: "User created successfully",
      user: data.user,
      profile: {
        username: username,
        email: email,
      },
    });
    
  } catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
