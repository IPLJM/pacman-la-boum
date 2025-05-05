// Pac-Man DJ Battle
let pacmanImg, ghostImg, discoImg;
let pacman, ghost;
let gridSize = 20;
let cols = 20;
let rows = 20;
let grid = [];
let score = 0;
let gameOver = false;
let touchStartX, touchStartY;

function preload() {
  pacmanImg = loadImage("1.png");
  ghostImg = loadImage("3.png");
  discoImg = loadImage("disco.png");
}

function setup() {
  let canvas = createCanvas(cols * gridSize, rows * gridSize);
  canvas.parent("game-container");
  resetGame();
}

function resetGame() {
  grid = [];
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      row.push({ disco: true });
    }
    grid.push(row);
  }

  pacman = createVector(1, 1);
  ghost = createVector(cols - 2, rows - 2);
  score = 0;
  gameOver = false;
  document.getElementById("score").innerText = "Score: 0";
  loop();
}

function draw() {
  background(0);

  if (gameOver) {
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(32);
    text("Game Over", width / 2, height / 2);
    noLoop();
    return;
  }

  // draw disco balls
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x].disco) {
        image(discoImg, x * gridSize + 4, y * gridSize + 4, gridSize - 8, gridSize - 8);
      }
    }
  }

  // draw pacman
  image(pacmanImg, pacman.x * gridSize, pacman.y * gridSize, gridSize, gridSize);

  // draw ghost
  image(ghostImg, ghost.x * gridSize, ghost.y * gridSize, gridSize, gridSize);

  // move ghost towards pacman (simple AI)
  if (frameCount % 10 === 0) {
    if (ghost.x < pacman.x) ghost.x++;
    else if (ghost.x > pacman.x) ghost.x--;
    else if (ghost.y < pacman.y) ghost.y++;
    else if (ghost.y > pacman.y) ghost.y--;
  }

  // check collision
  if (pacman.x === ghost.x && pacman.y === ghost.y) {
    gameOver = true;
  }

  // collect disco
  if (grid[pacman.y][pacman.x].disco) {
    grid[pacman.y][pacman.x].disco = false;
    score++;
    document.getElementById("score").innerText = "Score: " + score;
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW && pacman.x > 0) pacman.x--;
  else if (keyCode === RIGHT_ARROW && pacman.x < cols - 1) pacman.x++;
  else if (keyCode === UP_ARROW && pacman.y > 0) pacman.y--;
  else if (keyCode === DOWN_ARROW && pacman.y < rows - 1) pacman.y++;
}

function touchStarted() {
  if (gameOver) {
    resetGame();
    return;
  }
  touchStartX = mouseX;
  touchStartY = mouseY;
}

function touchEnded() {
  let dx = mouseX - touchStartX;
  let dy = mouseY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && pacman.x < cols - 1) pacman.x++;
    else if (dx < 0 && pacman.x > 0) pacman.x--;
  } else {
    if (dy > 0 && pacman.y < rows - 1) pacman.y++;
    else if (dy < 0 && pacman.y > 0) pacman.y--;
  }
}

