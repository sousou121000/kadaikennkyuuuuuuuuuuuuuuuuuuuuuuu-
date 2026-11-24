const tracks = document.querySelectorAll(".reel-track");
const slotResult = document.getElementById("slotResult");
const scoreDisplay = document.getElementById("scoreDisplay");

const winOverlay = document.getElementById("winOverlay");
const effectTitle = document.getElementById("effectTitle");
const effectMessage = document.getElementById("effectMessage");
const effectWords = document.getElementById("effectWords");

// スロットに使用する画像
const images = [
    "taihu.jpg",
    "zisin.jpg",
    "tunami.jpg",
    "minikyara.jpg"
];

const imageNames = [
    "台風",
    "地震",
    "津波",
    "ミニキャラ"
];

const reelCount = 3;
const spinSpeed = 50; // 回転速度（数値を大きくすると速くなります）

// リールの状態
let positions = [0, 0, 0];
let stopped = [false, false, false];
let results = [];

let imageHeight = 180;
let stopIndex = 0;

// ポイントと連続ハズレ回数
let score = 0;
let missCount = 0;

// ゲームの状態
// spinning：回転中
// ready：再挑戦待ち
// overlay：演出表示中
let gameState = "spinning";


// リールを作る
function createReels() {
    tracks.forEach((track) => {
        track.innerHTML = "";

        // 同じ画像を繰り返して並べる
        for (let i = 0; i < 32; i++) {
            const img = document.createElement("img");
            const imageIndex = i % images.length;

            img.src = images[imageIndex];
            img.alt = imageNames[imageIndex];

            track.appendChild(img);
        }
    });

    // CSSで設定した画像の高さを取得
    imageHeight = tracks[0]
        .querySelector("img")
        .getBoundingClientRect().height;
}


// リールを回転させる
function animateReels() {
    const loopHeight = imageHeight * images.length;

    tracks.forEach((track, index) => {
        if (!stopped[index]) {
            positions[index] += spinSpeed;
            positions[index] %= loopHeight;

            track.style.transform =
                `translateY(-${positions[index]}px)`;
        }
    });

    requestAnimationFrame(animateReels);
}


// リールを1つ停止する（目押し仕様：押した瞬間の絵柄で即停止）
function stopReel(index) {
    stopped[index] = true;

    const loopHeight = imageHeight * images.length;

    // 現在の位置から最も近い絵柄の番号を計算（四捨五入で枠にピタッと合わせる）
    const rawIndex = Math.round(positions[index] / imageHeight);
    const target = rawIndex % images.length;

    results[index] = target;

    // 絵柄が枠のど真ん中に収まる位置に即座に固定
    positions[index] = target * imageHeight;

    tracks[index].style.transition = "none";
    tracks[index].style.transform =
        `translateY(-${positions[index]}px)`;
}


// キー操作
document.addEventListener("keydown", (event) => {

    if (event.repeat) return;

    // SPACEキー：左から順番に停止
    if (event.code === "Space") {
        event.preventDefault();

        if (gameState !== "spinning") return;
        if (stopIndex >= reelCount) return;

        stopReel(stopIndex);
        stopIndex++;

        // 3つすべて停止したら即座に結果を判定
        if (stopIndex === reelCount) {
            checkResult();
        }
    }

    // Aキー：再挑戦
    if (event.key.toLowerCase() === "a") {
        if (gameState === "ready") {
            resetGame();
        }
    }

    // ENTERキー：演出画面から戻る
    if (event.code === "Enter") {
        if (gameState === "overlay") {
            closeOverlay();
        }
    }
});


// 3つの絵柄がそろったか判定
function checkResult() {

    const isWin =
        results[0] === results[1] &&
        results[1] === results[2];

    // どれかの絵柄が3つそろった場合
    if (isWin) {
        missCount = 0;

        const isMiniKyara = images[results[0]] === "minikyara.jpg";

        if (isMiniKyara) {
            // minikyara.jpg のときだけ2ポイント加算＋大当たり演出を表示
            score += 2;
            scoreDisplay.textContent = `ポイント: ${score} pt`;
            slotResult.textContent = "大当たり！！(+2pt)";

            showOverlay(
                "jackpot",
                "大当たり！！！！",
                ` +2ポイント獲得！（合計 ${score} pt）`
            );
        } else {
            // それ以外の絵柄は1ポイント加算のみ（演出画面は出さない）
            score += 1;
            scoreDisplay.textContent = `ポイント: ${score} pt`;
            slotResult.textContent = "当たり！(+1pt) Aキーで再挑戦";

            gameState = "ready";
        }

        return;
    }

    // ハズレ
    missCount++;

    slotResult.textContent =
        `ハズレ！ Aキーで再挑戦（連続${missCount}回）`;

    // 10回連続でハズレになった場合
    if (missCount >= 10) {

        showOverlay(
            "taunt",
            "10連続ハズレｗｗｗ",
            "まだそろわないの？運がなさすぎる！！"
        );

        // あおり演出の後は、次の10回を数える
        missCount = 0;

        return;
    }

    // 再挑戦できる状態にする
    gameState = "ready";
}


// 演出を表示する
function showOverlay(type, title, message) {

    gameState = "overlay";

    winOverlay.className = "win-overlay active";

    // あおり演出の場合
    if (type === "taunt") {
        winOverlay.classList.add("taunt");
    }

    effectTitle.textContent = title;
    effectMessage.textContent = message;

    createEffectWords(type);
}


// 演出画面に文字を表示する
function createEffectWords(type) {

    effectWords.innerHTML = "";

    let words;

    if (type === "taunt") {
        words = [
            "ざんねん！",
            "10連敗！",
            "ｗｗｗ",
            "まだ？",
            "ドンマイ！",
            "そろわない！"
        ];
    } else {
        words = [
            "ドパ！",
            "大当たり！",
            "やった！",
            "ドパドパ！",
            "大成功！",
            "ポイントGET！"
        ];
    }

    for (let i = 0; i < 24; i++) {
        const word = document.createElement("div");

        word.className = "effect-word";

        word.textContent =
            words[Math.floor(Math.random() * words.length)];

        word.style.left = Math.random() * 90 + "%";
        word.style.top = Math.random() * 90 + "%";

        word.style.animationDelay =
            Math.random() * 1.5 + "s";

        effectWords.appendChild(word);
    }
}


// ENTERキーで演出を終了
function closeOverlay() {

    winOverlay.classList.remove("active");
    winOverlay.classList.remove("taunt");

    effectWords.innerHTML = "";

    resetGame();
}


// ゲームを最初からやり直す
function resetGame() {

    positions = [0, 0, 0];
    stopped = [false, false, false];
    results = [];

    stopIndex = 0;

    tracks.forEach((track) => {
        track.style.transition = "none";
        track.style.transform = "translateY(0px)";
    });

    slotResult.textContent = "SPACEキーでスタート！";

    gameState = "spinning";
}


// 初期設定
createReels();
animateReels();