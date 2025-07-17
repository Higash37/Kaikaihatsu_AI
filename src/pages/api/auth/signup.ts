import bcrypt from "bcrypt";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { NextApiRequest, NextApiResponse } from "next";

import { db } from "../../../utils/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { username, password, email } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
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
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // メールアドレスの重複チェック（提供されている場合）
    if (email) {
      const emailQuery = query(usersRef, where("email", "==", email));
      const emailSnapshot = await getDocs(emailQuery);

      if (!emailSnapshot.empty) {
        return res.status(409).json({ message: "Email already exists" });
      }
    }

    // パスワードをハッシュ化
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // ユーザーIDを生成
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // ユーザーを作成（特定のIDで）
    const newUser = {
      username,
      email: email || null,
      password: hashedPassword,
      profile: {
        displayName: username,
        bio: "",
        avatar: null,
        preferences: {
          theme: "light",
          notifications: true,
          publicProfile: false,
        },
      },
      stats: {
        quizzesCreated: 0,
        quizzesTaken: 0,
        totalScore: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isActive: true,
      role: "user",
    };

    // 特定のIDでドキュメントを作成
    await setDoc(doc(db, "users", userId), newUser);

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: userId,
        username: newUser.username,
        email: newUser.email,
        profile: newUser.profile,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
