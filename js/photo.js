
const characters = {
  ghost: { name: "ボー（お化け）", image: "img/ghost.png" },
  fran:  { name: "フラン（フランケンシュタイン）", image: "img/fran.png" },
  bat:   { name: "コウモリ", image: "img/bat.png" },
  pump:  { name: "かぼちゃ", image: "img/pump.png" },
  witch: { name: "魔女", image: "img/witch.png" },
  mummy: { name: "ミイラ", image: "img/mummy.png" }
};

const video = document.getElementById("camera");
const ghostImage = document.getElementById("ghostOverlay");
const select = document.getElementById("ghostSelect");
const startButton = document.getElementById("startCamera");
const takeButton = document.getElementById("takePhoto");
const message = document.getElementById("message");
const result = document.getElementById("result");
const preview = document.getElementById("photoPreview");
const saveLink = document.getElementById("savePhoto");

const enlargeButton = document.getElementById("enlargeGhost");
const shrinkButton = document.getElementById("shrinkGhost");

let ghostSize = 30; // 最初のおばけの幅（%）

function updateGhostSize() {
  ghostImage.style.width = `${ghostSize}%`;
}

enlargeButton.addEventListener("click", () => {
  ghostSize = Math.min(ghostSize + 5, 80);
  updateGhostSize();
});

shrinkButton.addEventListener("click", () => {
  ghostSize = Math.max(ghostSize - 5, 10);
  updateGhostSize();
});

let stream = null;
let selectedCharacter = null;

// 保存済みの発見記録を読み込む
let found = [];

try {
  const saved = JSON.parse(localStorage.getItem("foundGhosts") || "[]");
  if (Array.isArray(saved)) {
    found = saved.filter(id => typeof id === "string");
  }
} catch (error) {
  found = [];
}

// 発見したお化けだけを選択肢に表示
select.innerHTML = "";

const available = found.filter(id => characters[id]);

if (available.length === 0) {
  select.add(new Option("まだお化けを発見していません", ""));
  startButton.disabled = true;
  message.textContent = "先にスタンプラリーでお化けを集めてね！";
} else {
  select.add(new Option("お化けを選んでね", ""));

  available.forEach(id => {
    select.add(new Option(characters[id].name, id));
  });
}

select.addEventListener("change", () => {
  selectedCharacter = characters[select.value] || null;

  ghostSize = 30;
  updateGhostSize();
  ghostImage.style.left = "35%";
  ghostImage.style.top = "35%";

  if (!selectedCharacter) {
    ghostImage.hidden = true;
    takeButton.disabled = true;
    return;
  }

  ghostImage.onload = () => {
    ghostImage.hidden = false;
    updateCaptureButton();
  };

  ghostImage.onerror = () => {
    ghostImage.hidden = true;
    takeButton.disabled = true;
    message.textContent =
      "お化けの画像が読み込めません。画像ファイル名を確認してね。";
  };

  ghostImage.src = selectedCharacter.image;
});

function updateCaptureButton() {
  takeButton.disabled = !(
    stream &&
    video.videoWidth > 0 &&
    selectedCharacter &&
    !ghostImage.hidden &&
    ghostImage.complete &&
    ghostImage.naturalWidth > 0
  );
}

// カメラはボタンを押したときだけ起動する
startButton.addEventListener("click", async () => {
  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("このブラウザではカメラを利用できません。HTTPSのURLで開いてね。");
    }

    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { ideal: "environment" }
      }
    });

    video.srcObject = stream;
    await video.play();

    startButton.disabled = true;
    message.textContent = "カメラ起動中！お化けを選んで撮影してね。";
    updateCaptureButton();
  } catch (error) {
    message.textContent =
      "カメラを起動できませんでした。ブラウザのカメラ許可を確認してね。";
    console.error(error);
  }
});

// お化けをドラッグして移動
let dragging = false;
let offsetX = 0;
let offsetY = 0;

ghostImage.addEventListener("pointerdown", event => {
  if (ghostImage.hidden) return;

  dragging = true;
  const rect = ghostImage.getBoundingClientRect();

  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;

  ghostImage.setPointerCapture(event.pointerId);
});

ghostImage.addEventListener("pointermove", event => {
  if (!dragging) return;

  const area = document.querySelector(".camera-area");
  const rect = area.getBoundingClientRect();

  const x = event.clientX - rect.left - offsetX;
  const y = event.clientY - rect.top - offsetY;

  const maxX = rect.width - ghostImage.offsetWidth;
  const maxY = rect.height - ghostImage.offsetHeight;

  ghostImage.style.left =
    `${Math.max(0, Math.min(x, maxX)) / rect.width * 100}%`;

  ghostImage.style.top =
    `${Math.max(0, Math.min(y, maxY)) / rect.height * 100}%`;
});

function stopDragging() {
  dragging = false;
}

ghostImage.addEventListener("pointerup", stopDragging);
ghostImage.addEventListener("pointercancel", stopDragging);

// カメラ映像とお化けを1枚の画像に合成する
takeButton.addEventListener("click", () => {
  if (!stream || !selectedCharacter) return;

  const area = document.querySelector(".camera-area");
  const areaRect = area.getBoundingClientRect();
  const imageRect = ghostImage.getBoundingClientRect();

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");

  // 表示枠と動画の縦横比が違っても、
  // object-fit: cover の見え方に合わせて切り抜く
  const scale = Math.max(
    areaRect.width / video.videoWidth,
    areaRect.height / video.videoHeight
  );

  const sourceWidth = areaRect.width / scale;
  const sourceHeight = areaRect.height / scale;
  const sourceX = (video.videoWidth - sourceWidth) / 2;
  const sourceY = (video.videoHeight - sourceHeight) / 2;

  ctx.drawImage(
    video,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, canvas.width, canvas.height
  );

  const x = (imageRect.left - areaRect.left) / areaRect.width;
  const y = (imageRect.top - areaRect.top) / areaRect.height;
  const w = imageRect.width / areaRect.width;
  const h = imageRect.height / areaRect.height;

  ctx.drawImage(
    ghostImage,
    x * canvas.width,
    y * canvas.height,
    w * canvas.width,
    h * canvas.height
  );

  preview.src = canvas.toDataURL("image/png");
  saveLink.href = preview.src;
  result.hidden = false;
  message.textContent = "撮影成功！写真を保存してね。";
});

// ページを離れるときはカメラを停止
window.addEventListener("pagehide", () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
});
