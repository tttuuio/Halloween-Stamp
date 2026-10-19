import { db, auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

// ===== Firebaseへの参加記録 =====

// 匿名ログインが完了したら参加記録を準備する
onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const participantRef = doc(db, "participants", user.uid);

    try {
        const snapshot = await getDoc(participantRef);
        const found = getFoundGhosts();

        if (!snapshot.exists()) {
            // 初めて参加したとき
            await setDoc(participantRef, {
                createdAt: serverTimestamp(),
                lastSeenAt: serverTimestamp(),
                foundGhosts: found
            });
        } else {
            // 以前の記録があるとき
            const saved = snapshot.data().foundGhosts || [];
            const merged = [...new Set([...saved, ...found])];

            await updateDoc(participantRef, {
                lastSeenAt: serverTimestamp(),
                foundGhosts: merged
            });

            // Firebaseにある発見記録を端末にも保存
            localStorage.setItem(
                "foundGhosts",
                JSON.stringify(merged)
            );

            // 図鑑と発見数を更新
            renderEncyclopedia();
            renderTopProgress();
        }

        console.log("参加記録を確認しました！");
    } catch (error) {
        console.error("参加記録の保存に失敗しました:", error);
    }
});

// おばけ探し
const keywordInput = document.getElementById("keyword");
const keywordButton = document.getElementById("keywordButton");
const result = document.getElementById("result");

if (keywordButton) {

    keywordButton.addEventListener("click", function () {

        const keyword = keywordInput.value.trim();

        if (keyword === "ゆうれい") {
            saveGhost("ghost");

            result.innerHTML = `
                <div class="ghost-found">
                    <div class="ghost-icon anim-bo">
                        <img src="img/ghost.png" alt="おばけ">
                    </div>
                    <h2>ボーを見つけた！</h2>
                    <p>「ひっ……！見つかっちゃった……！」</p>
                </div>
            `;

        } else if (keyword === "ツギハギ") {
            saveGhost("fran");
            
            result.innerHTML = `
                <div class="ghost-found">
                    <div class="ghost-icon anim-fran">
                        <img src="img/fran.png" alt="フラン">
                    </div>
                    <h2>フランを見つけた！</h2>
                    <p>「おお！よく見つけたな！」</p>
                </div>
            `;
        } else if (keyword === "よる") {
            saveGhost("bat");
            result.innerHTML = `
                <div class="ghost-found">
                    <div class="ghost-icon anim-bat">
                        <img src="img/bat.png" alt="バット">
                    </div>
                    <h2>バットを見つけた！</h2>
                    <p>「あれっ！？もう見つかっちゃった？次は絶対見つからないぞ〜！」</p>
                </div>
            `;
        } else if (keyword === "ランタン") {
            saveGhost("pump");
            result.innerHTML = `
                <div class="ghost-found">
                    <div class="ghost-icon anim-pump">
                        <img src="img/pump.png" alt="パンプキン">
                    </div>
                    <h2>パンプキンを見つけた！</h2>
                    <p>「うわっ！見つかっちゃった……！」</p>
                </div>
            `;
        } else if (keyword === "まほう") {
            saveGhost("witch");
            result.innerHTML = `
                <div class="ghost-found">
                    <div class="ghost-icon anim-witch">
                        <img src="img/witch.png" alt="魔女">
                    </div>
                    <h2>ウィッチを見つけた！</h2>
                    <p>「ふふん！この私を見つけるなんて、なかなかやるじゃない！」</p>
                </div>
            `;
        } else if (keyword === "ホウタイ") {
            saveGhost("mummy");
            result.innerHTML = `
                <div class="ghost-found">
                    <div class="ghost-icon anim-mummy">
                        <img src="img/mummy.png" alt="ミイラ">
                    </div>
                    <h2>ミイラを見つけた！</h2>
                    <p>「……ん？もう見つかったの？あと少し寝ていたかったなぁ……。」</p>
                </div>
            `;
        } else if (keyword === "") {

            result.innerHTML = `
                <p class="error-message">合言葉を入力してね！</p>
            `;

        } else {

            result.innerHTML = `
                <p class="error-message">その合言葉ではないみたい……👻</p>
            `;
        }

    });

}


const ghostData = [
    {
        id: "ghost",
        name: "ボー",
        keyword: "ゆうれい",
        image: "img/ghost.png",
        personality: "臆病",
        description: "怖がりだけど、本当は寂しがり屋なおばけ。"
    },
    {
        id: "fran",
        name: "フラン",
        keyword: "ツギハギ",
        image: "img/fran.png",
        personality: "力持ち",
        description: "ちょっと不器用だけど、頼りになる力持ち。"
    },
    {
        id: "bat",
        name: "バット",
        keyword: "ヨル",
        image: "img/bat.png",
        personality: "いたずら好き",
        description: "こっそり隠れて、みんなを驚かせるコウモリ。"
    },
    {
        id: "pump",
        name: "パンプ",
        keyword: "ランタン",
        image: "img/pump.png",
        personality: "食いしん坊",
        description: "お菓子が大好きな、かぼちゃのおばけ。"
    },
    {
        id: "witch",
        name: "ウィッチ",
        keyword: "マホウ",
        image: "img/witch.png",
        personality: "ちょっと偉そう",
        description: "自信満々な魔女。魔法の腕は本物……？"
    },
    {
        id: "mummy",
        name: "ミイラ",
        keyword: "ホウタイ",
        image: "img/mummy.png",
        personality: "のんびり屋",
        description: "マイペースで、いつもゆったりしているミイラ。"
    }
];

// 発見したおばけの記録を読み込む
function getFoundGhosts() {
    try {
        const saved = JSON.parse(
            localStorage.getItem("foundGhosts") || "[]"
        );

        if (!Array.isArray(saved)) return [];

        return saved.filter(id =>
            ghostData.some(ghost => ghost.id === id)
        );
    } catch {
        return [];
    }
}

// 発見したおばけを保存する

function saveGhost(id) {
    const found = getFoundGhosts();

    // すでに発見済みなら何もしない
    if (found.includes(id)) return;

    // 発見記録を保存
    found.push(id);
    localStorage.setItem("foundGhosts", JSON.stringify(found));

    // 6匹そろった瞬間にコンプリート画面を表示
    if (found.length === 6) {
        showCompleteScreen();
    }
}

function showCompleteScreen() {
     if (document.getElementById("completeOverlay")) return;

    const completeHTML = `
        <div class="complete-overlay" id="completeOverlay">
            <div class="complete-popup">
                <div class="complete-stars">✨ 🎃 ✨</div>
                <h2>COMPLETE!!</h2>
                <p class="complete-main">6匹のおばけを全員発見！</p>
                <p>おめでとう！君はゴーストハンターだ！</p>
                <div class="reward-box">
                    🎁 お菓子の掴み取り引換画面
                    <p>この画面をスタッフに見せてね！</p>
                </div>
                <p class="complete-note">
                    ※この画面は、おばけ図鑑から何度でも確認できます！
                </p>
                
<div id="redeemStatus" class="redeem-status"></div>

<button class="keyword-button" id="staffToggle">
    🔐 スタッフ専用：引換確認
</button>

<div id="staffPanel" class="staff-panel" hidden>
    <p>スタッフの方はパスワードを入力してください</p>

    <input
        type="password"
        id="staffPassword"
        placeholder="スタッフ用パスワード"
        autocomplete="off"
    >

    <button class="keyword-button" id="redeemButton">
        引換済みにする
    </button>

    <p id="redeemMessage" class="redeem-message"></p>
</div>

    <button class="keyword-button"
    onclick="document.getElementById('completeOverlay').remove()">
    OK！
    </button>
    </div>
</div>
    `;
    document.body.insertAdjacentHTML("beforeend", completeHTML);
    setupRedeemControls();
}


/* ===== 引換管理 ===== */

// スタッフ用パスワード：好きな文字列に変更してね
const STAFF_PASSWORD = "1031";

// 引換済みかどうかを確認
function isRedeemed() {
    return localStorage.getItem("ghostHuntRedeemed") === "yes";
}

// 引換状態を画面に表示
function updateRedeemStatus() {
    const status = document.getElementById("redeemStatus");
    const button = document.getElementById("redeemButton");
    const message = document.getElementById("redeemMessage");

    if (!status) return;

    if (isRedeemed()) {
        status.textContent = "✅ 引換済みです";
        if (button) {
            button.disabled = true;
            button.textContent = "引換済み";
        }
        if (message) {
            message.textContent = "この端末では引換済みとして記録されています。";
        }
    } else {
        status.textContent = "🎁 お菓子の引換はまだです";
        if (button) {
            button.disabled = false;
            button.textContent = "引換済みにする";
        }
    }
}

// コンプリート画面のボタンを設定
function setupRedeemControls() {
    const toggle = document.getElementById("staffToggle");
    const panel = document.getElementById("staffPanel");
    const password = document.getElementById("staffPassword");
    const button = document.getElementById("redeemButton");
    const message = document.getElementById("redeemMessage");

    if (!toggle || !panel || !password || !button || !message) return;

    updateRedeemStatus();

    toggle.addEventListener("click", () => {
        panel.hidden = !panel.hidden;
        message.textContent = "";
    });

    button.addEventListener("click", () => {
        if (isRedeemed()) {
            updateRedeemStatus();
            return;
        }

        if (password.value !== STAFF_PASSWORD) {
            message.textContent = "❌ パスワードが違います。";
            password.value = "";
            return;
        }

        // この端末に引換済みと保存
        localStorage.setItem("ghostHuntRedeemed", "yes");
        password.value = "";
        message.textContent = "引換済みとして記録しました！";
        updateRedeemStatus();
    });
}

function renderEncyclopedia() {
    const grid = document.getElementById("ghostGrid");
    const progress = document.getElementById("bookProgress");

    // 図鑑ページ以外では何もしない
    if (!grid || !progress) return;

    const found = getFoundGhosts();

    progress.textContent = `👻 ${found.length} / 6 匹 発見！`;
    const completeMessage = document.getElementById("completeMessage");

if (completeMessage) {
    completeMessage.hidden = found.length !== 6;
}

    grid.innerHTML = ghostData.map(ghost => {
        if (found.includes(ghost.id)) {
            return `
                <article class="ghost-card">
                    <img src="${ghost.image}" alt="${ghost.name}">
                    <h2>${ghost.name}</h2>
                    <p>性格：${ghost.personality}</p>
                    <p>${ghost.description}</p>
                </article>
            `;
        }

        return `
            <article class="ghost-card locked">
                <div class="question-mark">？</div>
                <h2>？？？</h2>
                <p>まだ見つかっていないおばけ</p>
            </article>
        `;
    }).join("");
        // 図鑑からコンプリート画面を開く
    const openCompleteButton =
        document.getElementById("openCompleteOverlay");

    if (openCompleteButton && !openCompleteButton.dataset.ready) {
        openCompleteButton.dataset.ready = "true";

        openCompleteButton.addEventListener("click", () => {
            showCompleteScreen();
        });
    }
}

renderEncyclopedia();

// トップページの発見数を更新
function renderTopProgress() {
    const topProgress = document.getElementById("topProgress");

    // トップページ以外では何もしない
    if (!topProgress) return;

    const found = getFoundGhosts();
    topProgress.textContent = `${found.length} / 6`;
}

// ページを開いたときに更新
renderTopProgress();
