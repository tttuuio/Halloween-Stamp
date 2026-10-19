// Firebaseのライブラリを読み込む
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

// Firebaseの設定
const firebaseConfig = {
  apiKey: "AIzaSyDur8mPdY4Duz_usGa82eHjEGHfM-z70rU",
  authDomain: "halloween-ghost-hunt.firebaseapp.com",
  projectId: "halloween-ghost-hunt",
  storageBucket: "halloween-ghost-hunt.firebasestorage.app",
  messagingSenderId: "1089935772479",
  appId: "1:1089935772479:web:03846fa125c979ecf2a18a"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);

// データベースと匿名認証を準備
export const db = getFirestore(app);
export const auth = getAuth(app);

// 匿名認証でログイン
signInAnonymously(auth).catch((error) => {
  console.error("匿名認証に失敗しました:", error);
});
