// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Analytics はブラウザ環境でのみ初期化
let _analytics = null;
if (typeof window !== "undefined") {
  _analytics = getAnalytics(app);
}

export { app, db, _analytics as analytics };

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

// アンケート結果を取得する関数
export async function getQuizResults() {
  try {
    const querySnapshot = await getDocs(collection(db, "quiz_results"));
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
      results.push({
        id: doc.id,
        ...doc.data(),
      });
    });
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
