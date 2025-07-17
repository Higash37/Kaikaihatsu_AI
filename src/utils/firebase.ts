// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxYHpOLc7YDVoH3sup0dGz5YLh8GNDIIw",
  authDomain: "kaikaihatsu-ai.firebaseapp.com",
  projectId: "kaikaihatsu-ai",
  storageBucket: "kaikaihatsu-ai.firebasestorage.app",
  messagingSenderId: "305633823710",
  appId: "1:305633823710:web:a0961257b3270d36706b4f",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth
const auth = getAuth(app);

// Analytics はブラウザ環境でのみ初期化
let _analytics = null;
if (typeof window !== "undefined") {
  _analytics = getAnalytics(app);
}

export { app, db, auth, _analytics as analytics };

// アンケート結果を保存する関数
export async function saveQuizResult(quizData: any) {
  try {
    const docRef = await addDoc(collection(db, "quiz_results"), {
      ...quizData,
      createdAt: serverTimestamp(),
    });
    console.log("Document written with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
}

// 全ての結果を取得する関数
export async function getAllQuizResults() {
  try {
    const querySnapshot = await getDocs(collection(db, "quiz_results"));
    const results = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return results;
  } catch (error) {
    console.error("Error getting documents: ", error);
    throw error;
  }
}

// 特定の結果を取得する関数
export async function getQuizResult(id: string) {
  try {
    const docRef = doc(db, "quiz_results", id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      throw new Error("No such document!");
    }
  } catch (error) {
    console.error("Error getting document: ", error);
    throw error;
  }
}

// 結果を更新する関数
export async function updateQuizResult(id: string, updateData: any) {
  try {
    const docRef = doc(db, "quiz_results", id);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    console.log("Document updated with ID: ", id);
  } catch (error) {
    console.error("Error updating document: ", error);
    throw error;
  }
}

// ユーザー管理関数
export async function createUserProfile(userId: string, userData: any) {
  try {
    const docRef = doc(db, "users", userId);
    await setDoc(docRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    console.log("User profile created with ID: ", userId);
    return userId;
  } catch (error) {
    console.error("Error creating user profile: ", error);
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  try {
    const docRef = doc(db, "users", userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile: ", error);
    throw error;
  }
}

export async function updateUserProfile(userId: string, updateData: any) {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    });
    console.log("User profile updated with ID: ", userId);
  } catch (error) {
    console.error("Error updating user profile: ", error);
    throw error;
  }
}

// Quiz管理関数
export async function createQuiz(quizData: any) {
  try {
    const docRef = await addDoc(collection(db, "quizzes"), {
      ...quizData,
      createdAt: serverTimestamp(),
    });
    console.log("Quiz created with ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error creating quiz: ", error);
    throw error;
  }
}

export async function getQuizzes(userId?: string) {
  try {
    const quizzesRef = collection(db, "quizzes");
    const querySnapshot = await getDocs(quizzesRef);

    const quizzes = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];

    // ユーザーIDが指定されている場合はフィルタリング
    if (userId) {
      return quizzes.filter((quiz: any) => quiz.creatorId === userId);
    }

    return quizzes;
  } catch (error) {
    console.error("Error getting quizzes: ", error);
    throw error;
  }
}
