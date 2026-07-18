const switchSound = new Audio("assets/audio/switch.mp3");

const hitSound = new Audio("assets/audio/hit.mp3");

switchSound.volume = 0.35;

hitSound.volume = 0.5;





function playSound(sound) {
    if (!soundEnabled) {
        return;
    }

    sound.currentTime = 0;

    sound.play().catch((error) => {
        console.log("Ses oynatılamadı:", error);
    });
}

function switchWorld() {
    if (!gameRunning) {
        return;
    }

    isDarkWorld = !isDarkWorld;
    flashOpacity = 0.35;

    createParticles();

    score++;
    scoreElement.textContent = score;

    playSound(switchSound);

    if (score > highScore) {
    highScore = score;
    highScoreElement.textContent = highScore;

    localStorage.setItem(
        "shadowSwitchHighScore",
        highScore
    );
}

    
}


const soundButton = document.getElementById("soundButton");

const gameOverScreen = document.getElementById("gameOverScreen");

const finalScore = document.getElementById("finalScore");

const restartButton = document.getElementById("restartButton");

const particles = [];
const canvas = document.getElementById("gameCanvas");
const context = canvas.getContext("2d");

const stars = [];

for (let i = 0; i < 45; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.8 + 0.5,
        speed: Math.random() * 0.7 + 0.2
    });
}

const startButton = document.getElementById("startButton");
const scoreElement = document.getElementById("score");
const highScoreElement = document.getElementById("highScore");



let isDarkWorld = false;
let score = 0;
let gameRunning = false;
let animationId = null;
let flashOpacity = 0;

let perfectTimer = 0;
let soundEnabled = true;

let highScore =
    Number(localStorage.getItem("shadowSwitchHighScore")) || 0;

highScoreElement.textContent = highScore;

const player = {
    x: 80,
    y: canvas.height / 2,
    radius: 18,
    speedY: 2
};

const obstacle = {
   x: canvas.width,
    width: 45,
    gapY: 260,
    gapHeight: 180,
    speed: 4,
    world: "light",
    passed: false
};



function drawBackground() {
    context.fillStyle = isDarkWorld ? "#111111" : "#f4f4f4";
    context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayer() {
    context.beginPath();

    context.arc(
        player.x,
        player.y,
        player.radius,
        0,
        Math.PI * 2
    );

        context.fillStyle = isDarkWorld ? "#ffffff" : "#111111";
    context.fill();
    context.closePath();



}

function createParticles() {
    for (let i = 0; i < 18; i++) {
        particles.push({
            x: player.x,
            y: player.y,
            radius: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 6,
            speedY: (Math.random() - 0.5) * 6,
            life: 35
        });
    }
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life--;

        particle.radius *= 0.96;

        if (particle.life <= 0 || particle.radius <= 0.2) {
            particles.splice(i, 1);
        }
    }
}

function drawObstacle() {
    const obstacleIsVisible =
        (obstacle.world === "light" && !isDarkWorld) ||
        (obstacle.world === "dark" && isDarkWorld);

    if (!obstacleIsVisible) {
        return;
    }

    context.fillStyle = isDarkWorld ? "#ffffff" : "#111111";

    // İlk 20 skor: tek engel
    if (score < 20) {
        context.fillRect(
            obstacle.x,
            obstacle.gapY,
            obstacle.width,
            160
        );

        return;
    }

    // 20 ve sonrası: çift boru
    const topHeight = obstacle.gapY;
    const bottomY = obstacle.gapY + obstacle.gapHeight;
    const bottomHeight = canvas.height - bottomY;

    context.fillRect(
        obstacle.x,
        0,
        obstacle.width,
        topHeight
    );

    context.fillRect(
        obstacle.x,
        bottomY,
        obstacle.width,
        bottomHeight
    );
}

function drawFlashEffect() {
    if (flashOpacity <= 0) {
        return;
    }

    context.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
    context.fillRect(0, 0, canvas.width, canvas.height);

    flashOpacity -= 0.04;
}
    

function updateObstacle() {
    obstacle.x -= obstacle.speed;

    if (
        !obstacle.passed &&
        obstacle.x + obstacle.width < player.x - player.radius
    ) {
        obstacle.passed = true;
    }

    if (obstacle.x + obstacle.width < 0) {
        obstacle.x = canvas.width;

        const minimumGapY = 80;
        const maximumGapY =
            canvas.height - obstacle.gapHeight - 80;

        obstacle.gapY =
            minimumGapY +
            Math.random() * (maximumGapY - minimumGapY);

        obstacle.world =
            Math.random() < 0.5 ? "light" : "dark";

        obstacle.passed = false;
    }
}




function updatePlayer() {
    player.y += player.speedY;

    if (player.y + player.radius >= canvas.height) {
        player.y = canvas.height - player.radius;
        player.speedY = -Math.abs(player.speedY);
    }

    if (player.y - player.radius <= 0) {
        player.y = player.radius;
        player.speedY = Math.abs(player.speedY);
    }
}

function checkCollision() {
    const obstacleIsVisible =
        (obstacle.world === "light" && !isDarkWorld) ||
        (obstacle.world === "dark" && isDarkWorld);

    if (!obstacleIsVisible) {
        return;
    }

    const playerTouchesObstacleX =
        player.x + player.radius > obstacle.x &&
        player.x - player.radius < obstacle.x + obstacle.width;

    if (!playerTouchesObstacleX) {
        return;
    }

    // İlk 20 skor: tek engel çarpışması
    if (score < 20) {
        const singleObstacleY = obstacle.gapY;
        const singleObstacleHeight = 160;

        const playerTouchesSingleObstacle =
            player.y + player.radius > singleObstacleY &&
            player.y - player.radius <
                singleObstacleY + singleObstacleHeight;

        if (playerTouchesSingleObstacle) {
            endGame();
        }

        return;
    }

    // 20 ve sonrası: çift boru çarpışması
    const playerTouchesTopPipe =
        player.y - player.radius < obstacle.gapY;

    const playerTouchesBottomPipe =
        player.y + player.radius >
        obstacle.gapY + obstacle.gapHeight;

    if (playerTouchesTopPipe || playerTouchesBottomPipe) {
        endGame();
    }
}

function endGame() {
    gameRunning = false;

    cancelAnimationFrame(animationId);

    playSound(hitSound);

    finalScore.textContent = score;

    gameOverScreen.classList.remove("hidden");
}

function drawGame() {
    drawBackground();
    drawStars();
    drawParticles();
    drawPlayer();
    drawObstacle();
    drawFlashEffect();
    drawPerfectText();
}

function gameLoop() {
    if (!gameRunning) {
        return;
    }

    updateStars();
    updateParticles();
    updatePlayer();
    updateObstacle();
    checkCollision();
    drawGame();

    animationId = requestAnimationFrame(gameLoop);
}


function startGame() {
    gameOverScreen.classList.add("hidden");

    if (animationId !== null) {
        cancelAnimationFrame(animationId);
    }

    score = 0;
    scoreElement.textContent = score;

    isDarkWorld = false;
    gameRunning = true;

    player.y = canvas.height / 2;
    player.speedY = 2;

    obstacle.x = canvas.width;
    obstacle.gapY = 235;
    obstacle.speed = 4;
    obstacle.world = "light";
    obstacle.passed = false;

    startButton.textContent = "Restart Game";

    gameLoop();
}

function drawPerfectText() {

    if (perfectTimer <= 0) return;

    context.font = "bold 36px Arial";
    context.fillStyle = "#FFD700";
    context.textAlign = "center";

    context.fillText(
        "⭐ PERFECT! ⭐",
        canvas.width / 2,
        70
    );

    perfectTimer--;
}


function updateStars() {
    for (const star of stars) {
        star.x -= star.speed;

        if (star.x < 0) {
            star.x = canvas.width;
            star.y = Math.random() * canvas.height;
        }
    }
}

function drawStars() {
    context.fillStyle = isDarkWorld
        ? "rgba(255, 255, 255, 0.75)"
        : "rgba(40, 40, 40, 0.35)";

    for (const star of stars) {
        context.beginPath();

        context.arc(
            star.x,
            star.y,
            star.radius,
            0,
            Math.PI * 2
        );

        context.fill();
        context.closePath();
    }
}

function drawParticles() {
    for (const particle of particles) {
        context.beginPath();

        context.arc(
            particle.x,
            particle.y,
            particle.radius,
            0,
            Math.PI * 2
        );

        context.fillStyle = isDarkWorld
            ? "rgba(255, 255, 255, 0.8)"
            : "rgba(20, 20, 20, 0.7)";

        context.fill();
        context.closePath();
    }
}


canvas.addEventListener("click", switchWorld);
startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);

soundButton.addEventListener("click", () => {
    soundEnabled = !soundEnabled;

    soundButton.textContent =
        soundEnabled ? "🔊" : "🔇";
});

drawGame();