const tracks = document.querySelectorAll(".reel-track");
const slotResult = document.getElementById("slotResult");
const scoreDisplay = document.getElementById("scoreDisplay");

const winOverlay = document.getElementById("winOverlay");
const effectTitle = document.getElementById("effectTitle");
const effectMessage = document.getElementById("effectMessage");
const effectWords = document.getElementById("effectWords");

// スロットに使用する画像（4種類目として minikyara.jpg を追加）
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
const stopDuration = 1400;

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
// settling：停止結果の判定中
// ready：再挑戦待ち
// overlay：演出表示中
let gameState = "spinning";


// リールを作る
function createReels() {
    tracks.forEach((track) => {
        track.innerHTML = "";

        // 同じ画像を繰り返して並べる（4の倍数にしておくと切れ目が自然）
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
            positions[index] += 7;
            positions[index] %= loopHeight;

            track.style.transform =
                `translateY(-${positions[index]}px)`;
        }
    });

    requestAnimationFrame(animateReels);
}


// リールを1つ停止する
function stopReel(index) {
    // 停止する絵柄をランダムに決定
    const target = Math.floor(Math.random() * images.length);

    results[index] = target;
    stopped[index] = true;

    const loopHeight = imageHeight * images.length;

    // 目標の絵柄まで移動する距離
    let distance =
        (target * imageHeight - positions[index] % loopHeight + loopHeight)
        % loopHeight;

    // さらに6周してから停止
    distance += imageHeight * images.length * 6;

    const finalPosition = positions[index] + distance;

    tracks[index].style.transition =
        `transform ${stopDuration}ms cubic-bezier(0.15, 0.7, 0.2, 1)`;

    requestAnimationFrame(() => {
        tracks[index].style.transform =
            `translateY(-${finalPosition}px)`;
    });

    // 停止後、位置を整理する
    setTimeout(() => {
        positions[index] = finalPosition % loopHeight;

        tracks[index].style.transition = "none";
        tracks[index].style.transform =
            `translateY(-${positions[index]}px)`;
    }, stopDuration);
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

        // 3つすべて停止したら結果を判定
        if (stopIndex === reelCount) {
            gameState = "settling";

            setTimeout(() => {
                checkResult();
            }, stopDuration + 100);
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

            score += 2;
            scoreDisplay.textContent = `ポイント: ${score} pt`;
            slotResult.textContent = "大当たり！！(+2pt)";

            showOverlay(
                "jackpot",
                "大当たり！！！！",
                `+2ポイント獲得！（合計 ${score} pt）` );
        } else {
            // それ以外の絵柄は1ポイント加算のみ（演出画面は出さない）
            score += 1;
            scoreDisplay.textContent = `ポイント: ${score} pt`;
            slotResult.textContent = "当たり！(+1pt) Aキーで再挑戦";

            // 演出画面が出ないので、そのままAキーで再挑戦できるようにする
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

function showOverlay(type, title, message) {

    gameState = "overlay";

    winOverlay.className = "win-overlay active";


    if (type === "taunt") {
        winOverlay.classList.add("taunt");
    }

    effectTitle.textContent = title;
    effectMessage.textContent = message;

    createEffectWords(type);
}

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

function closeOverlay() {

    winOverlay.classList.remove("active");
    winOverlay.classList.remove("taunt");

    effectWords.innerHTML = "";

    resetGame();
}



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



createReels();
animateReels();