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
const spinSpeed = 1800;

// リールの状態
let positions = [0, 0, 0];
let stopped = [false, false, false];
let results = [];

let imageHeight = 180;
let stopIndex = 0;

// ポイントと連続ハズレ回数
let score = 0;
let missCount = 0;

let gameState = "spinning";


// リールを作る
function createReels() {
    tracks.forEach((track) => {
        track.innerHTML = "";

        for (let i = 0; i < 32; i++) {
            const img = document.createElement("img");
            const imageIndex = i % images.length;

            img.src = images[imageIndex];
            img.alt = imageNames[imageIndex];

            track.appendChild(img);
        }
    });

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


// リールを1つ停止する
function stopReel(index) {
    stopped[index] = true;

    const rawIndex = Math.round(positions[index] / imageHeight);
    const target = rawIndex % images.length;

    results[index] = target;
    positions[index] = target * imageHeight;

    tracks[index].style.transition = "none";
    tracks[index].style.transform =
        `translateY(-${positions[index]}px)`;
}


// キー操作
document.addEventListener("keydown", (event) => {

    if (event.repeat) return;

    if (event.code === "Space") {
        event.preventDefault();

        if (gameState !== "spinning") return;
        if (stopIndex >= reelCount) return;

        stopReel(stopIndex);
        stopIndex++;

        if (stopIndex === reelCount) {
            checkResult();
        }
    }

    if (event.key.toLowerCase() === "a") {
        if (gameState === "ready") {
            resetGame();
        }
    }

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
                ` +2ポイント獲得！（合計 ${score} pt）`
            );
        } else {
            score += 1;
            scoreDisplay.textContent = `ポイント: ${score} pt`;
            slotResult.textContent = "当たり！(+1pt) Aキーで再挑戦";

            gameState = "ready";
        }

        return;
    }

    missCount++;

    slotResult.textContent =
        `ハズレ！ Aキーで再挑戦（連続${missCount}回）`;

    if (missCount >= 10) {

        showOverlay(
            "taunt",
            "10連続ハズレｗｗｗ",
            "まだそろわないの？運がなさすぎる！！"
        );

        missCount = 0;

        return;
    }

    gameState = "ready";
}


// 演出を表示する
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


/* =========================================
   カスタムスクロール（全身ミニキャラ連動＆ドラッグ）
========================================= */
const scrollTrack = document.getElementById("scrollTrack");
const scrollChara = document.getElementById("scrollChara");

let isDraggingScroll = false;
let dragStartY = 0;
let dragStartCharaTop = 0;

function syncCharaWithPageScroll() {
    if (isDraggingScroll) return;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) {
        scrollChara.style.top = "0px";
        return;
    }

    const scrollRatio = window.scrollY / maxScroll;
    const maxTrackTravel = scrollTrack.clientHeight - scrollChara.offsetHeight;
    const currentTop = Math.max(0, Math.min(maxTrackTravel, scrollRatio * maxTrackTravel));

    scrollChara.style.top = `${currentTop}px`;
}

window.addEventListener("scroll", syncCharaWithPageScroll, { passive: true });
window.addEventListener("resize", syncCharaWithPageScroll);
syncCharaWithPageScroll();

// マウス・タッチドラッグでキャラを動かしてページスクロール
scrollChara.addEventListener("pointerdown", (e) => {
    isDraggingScroll = true;
    dragStartY = e.clientY;
    dragStartCharaTop = parseFloat(scrollChara.style.top) || 0;
    scrollChara.setPointerCapture(e.pointerId);
});

scrollChara.addEventListener("pointermove", (e) => {
    if (!isDraggingScroll) return;

    const deltaY = e.clientY - dragStartY;
    const maxTrackTravel = scrollTrack.clientHeight - scrollChara.offsetHeight;
    const newTop = Math.max(0, Math.min(maxTrackTravel, dragStartCharaTop + deltaY));

    scrollChara.style.top = `${newTop}px`;

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = maxTrackTravel > 0 ? newTop / maxTrackTravel : 0;
    window.scrollTo(0, ratio * maxScroll);
});

scrollChara.addEventListener("pointerup", (e) => {
    if (!isDraggingScroll) return;
    isDraggingScroll = false;
    scrollChara.releasePointerCapture(e.pointerId);
});


/* =========================================
   ここから本文のインタラクティブ要素
========================================= */

// 1. 「お・か・し・も」めくりカード
document.querySelectorAll(".flip-card").forEach((card) => {
    card.addEventListener("click", () => {
        card.classList.toggle("flipped");
        if (card.classList.contains("flipped")) {
            card.textContent = card.dataset.back;
        } else {
            card.textContent = card.dataset.front;
        }
    });
});

// 2. 緊急2択サバイバルクイズ
document.querySelectorAll(".quiz-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        const quizType = btn.dataset.quiz;
        const isCorrect = btn.dataset.correct === "true";
        const feedback = document.getElementById(`feedback-${quizType}`);

        if (isCorrect) {
            feedback.style.color = "#00f5d4";
            feedback.textContent = quizType === "eq"
                ? "⭕ 大正解！揺れている最中に外へ飛び出すと、ガラスやブロック塀が落ちてきて超危険！"
                : "⭕ 大正解！増水した川や用水路に近づくのは最も危険な行動のひとつだ！";
        } else {
            feedback.style.color = "#ff758f";
            feedback.textContent = quizType === "eq"
                ? "❌ 危険！慌てて外に出ると落下物に直撃するぞ。まずは机の下などで身を守ろう！"
                : "❌ 危険！「ちょっと見るだけ」で流される事故が多発しているぞ。絶対に近づくな！";
        }
    });
});

// 3. 防災バッグ詰め込みチャレンジ
const bagWeightEl = document.getElementById("bagWeight");
const bagScoreEl = document.getElementById("bagScore");
const bagCommentEl = document.getElementById("bagComment");

document.querySelectorAll(".pack-item").forEach((item) => {
    item.addEventListener("click", () => {
        item.classList.toggle("selected");

        let totalWeight = 0;
        let totalScore = 0;

        document.querySelectorAll(".pack-item.selected").forEach((selected) => {
            totalWeight += parseFloat(selected.dataset.weight);
            totalScore += parseInt(selected.dataset.score, 10);
        });

        bagWeightEl.textContent = totalWeight.toFixed(1);
        bagScoreEl.textContent = totalScore;

        if (totalWeight > 10.0) {
            bagWeightEl.style.color = "#ff4d6d";
            bagCommentEl.textContent = "⚠️ 重量オーバー！重すぎて逃げる途中でバテてしまうぞ！何か減らそう！";
        } else {
            bagWeightEl.style.color = "#ffdd00";
            if (item.classList.contains("selected")) {
                bagCommentEl.textContent = item.dataset.msg;
            } else {
                bagCommentEl.textContent = "アイテムを取り出した！";
            }
        }
    });
});

// 4. 対策チェックリスト達成度
const prepChecks = document.querySelectorAll(".prep-check");
const progressFill = document.getElementById("prepProgressFill");
const progressText = document.getElementById("prepProgressText");
const masterStamp = document.getElementById("masterStamp");

prepChecks.forEach((chk) => {
    chk.addEventListener("change", () => {
        const checkedCount = document.querySelectorAll(".prep-check:checked").length;
        const total = prepChecks.length;
        const percent = (checkedCount / total) * 100;

        progressFill.style.width = `${percent}%`;
        progressText.textContent = `チェック数: ${checkedCount} / ${total} 項目`;

        if (checkedCount === total) {
            masterStamp.style.display = "block";
        } else {
            masterStamp.style.display = "none";
        }
    });
});

// 5. 追従ミニキャラの防災トーク
const mascotBtn = document.getElementById("mascotBtn");
const mascotBubble = document.getElementById("mascotBubble");

const mascotTips = [
    "💡 災害用伝言ダイヤルは「171（いない）」と覚えよう！",
    "👟 寝室の近くにスリッパを置いておくと、割れたガラスから足を守れるよ！",
    "🛁 お風呂の水を溜めておくと、断水したときにトイレを流せるんだ！",
    "🥫 非常食は普段から食べて買い足す「ローリングストック」がおすすめ！",
    "🌊 津波は時速40km以上の速さで来ることも！見えたらもう遅いよ！",
    "🎰 上のスロットで10連続ハズレると特別な演出が見られるらしい…？",
    "🎒 避難するときのリュックは両手が空くから安全だよ！"
];

let lastTipIndex = -1;

mascotBtn.addEventListener("click", () => {
    let nextIndex;
    do {
        nextIndex = Math.floor(Math.random() * mascotTips.length);
    } while (nextIndex === lastTipIndex);

    lastTipIndex = nextIndex;
    mascotBubble.textContent = mascotTips[nextIndex];
    mascotBubble.style.transform = "scale(1.06)";
    setTimeout(() => {
        mascotBubble.style.transform = "scale(1)";
    }, 150);
});