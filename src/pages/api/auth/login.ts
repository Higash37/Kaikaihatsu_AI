import bcrypt from "bcrypt";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
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

  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    // ユーザーを検索
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // パスワードを検証
    const isPasswordValid = await bcrypt.compare(password, userData.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    // 最後のログイン時刻を更新
    await updateDoc(doc(db, "users", userDoc.id), {
      lastLoginAt: new Date().toISOString(),
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: userDoc.id,
        username: userData.username,
        email: userData.email,
        profile: userData.profile,
        stats: userData.stats,
        createdAt: userData.createdAt,
        lastLoginAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
