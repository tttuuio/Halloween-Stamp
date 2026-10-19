// Firebase本体
const firebaseConfig = {
    // ここに自分のFirebase設定を入れる
};

// Firebaseを初期化
firebase.initializeApp(firebaseConfig);

// Firestore（データベース）
const db = firebase.firestore();

// Authentication（匿名認証）
const auth = firebase.auth();
