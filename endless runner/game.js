
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const bgMusic = document.getElementById('bgMusic');

let player, obstacles, powerUps, score, speed, gameOver, gameRunning;
let gravity = 0.5;
let jumpPower = -10;
let keys = {};

document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function initGame() {
  player = { x: 50, y: 300, width: 40, height: 40, color: 'blue', dy: 0 };
  obstacles = [];
  powerUps = [];
  score = 0;
  speed = 5;
  gameOver = false;
  gameRunning = true;
}

function startGame() {
  startScreen.style.display = 'none';
  // Try to play music (may require user interaction; Start button counts)
  bgMusic.volume = 0.35;
  bgMusic.play().catch(() => {/* ignore autoplay block */});
  initGame();
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  gameOverScreen.style.display = 'none';
  initGame();
  requestAnimationFrame(gameLoop);
}

function spawnObstacle() {
  obstacles.push({ x: canvas.width, y: 320, width: 40, height: 40, color: 'red' });
}

function spawnPowerUp() {
  powerUps.push({ x: canvas.width, y: 250, width: 30, height: 30, color: 'green' });
}

function update() {
  if (!gameRunning) return;

  // Jump with W
  if (keys['w'] && player.y >= 300) player.dy = jumpPower;
  player.dy += gravity;
  player.y += player.dy;
  if (player.y > 300) { player.y = 300; player.dy = 0; }

  // Move obstacles & powerups
  obstacles.forEach(o => o.x -= speed);
  obstacles = obstacles.filter(o => o.x + o.width > 0);

  powerUps.forEach(p => p.x -= speed);
  powerUps = powerUps.filter(p => p.x + p.width > 0);

  // Collisions
  obstacles.forEach(o => {
    const hit = (
      player.x < o.x + o.width &&
      player.x + player.width > o.x &&
      player.y < o.y + o.height &&
      player.y + player.height > o.y
    );
    if (hit) {
      gameOver = true;
      gameRunning = false;
      finalScore.textContent = 'Score: ' + score;
      gameOverScreen.style.display = 'flex';
    }
  });

  powerUps.forEach((p, i) => {
    const got = (
      player.x < p.x + p.width &&
      player.x + player.width > p.x &&
      player.y < p.y + p.height &&
      player.y + player.height > p.y
    );
    if (got) {
      score += 50;
      powerUps.splice(i, 1);
    }
  });

  // Score & difficulty
  score++;
  if (score % 500 === 0) speed++;

  // Spawning
  if (Math.random() < 0.02) spawnObstacle();
  if (Math.random() < 0.005) spawnPowerUp();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sky & ground
  ctx.fillStyle = '#87CEEB';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#228B22';
  ctx.fillRect(0, 340, canvas.width, 60);

  // Player
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  // Obstacles
  obstacles.forEach(o => {
    ctx.fillStyle = o.color;
    ctx.fillRect(o.x, o.y, o.width, o.height);
  });

  // Power-ups
  powerUps.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);
  });

  // HUD
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText('Score: ' + score, 10, 20);
}

function gameLoop() {
  update();
  draw();
  if (gameRunning) requestAnimationFrame(gameLoop);
}

// Expose start/restart for buttons
window.startGame = startGame;
window.restartGame = restartGame;
