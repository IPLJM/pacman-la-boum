// Pac-Man DJ Battle V3 — Fantômes + mode panique
let pacmanImg, discoImg;
let ghostImgs = [], ghostScaredImg;
let pacman;
let ghosts = [];
let gridSize = 20;
let cols = 20;
let rows = 11;
let grid = [];
let direction;
let score = 0;
let gameOver = false;
let ghostScared = false;
let ghostTimer = 0;
let touchStartX, touchStartY;

const levelMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,0,1,1,1,0,1,0,1,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,1,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1],
  [1,1,1,0,1,1,1,1,1,0,1,1,1,0,1,0,1,1,1,1],
  [1,0,0,0,0,0,0,0,1,0,1,0,0,0,1,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function preload() {
  pacmanImg = loadImage("pacman.png");
  discoImg = loadImage("disco.png");
  ghostScaredImg = loadImage("ghost_scared.png");
  for (let i = 1; i <= 4; i++) {
    ghostImgs.push(loadImage(`ghost${i}.png`));
  }
}

function setup() {
  let canvas = createCanvas(cols * gridSize, rows * gridSize);
  canvas.parent("game-container");
  frameRate(10);
  resetGame();
}

function resetGame() {
  score = 0;
  direction = createVector(1, 0);
  gameOver = false;
  ghostScared = false;
  ghostTimer = frameCount;
  pacman = createVector(1, 1);
  ghosts = [
    { pos: createVector(18, 1), img: ghostImgs[0] },
    { pos: createVector(1, 9), img: ghostImgs[1] },
    { pos: createVector(18, 9), img: ghostImgs[2] },
    { pos: createVector(10, 5), img: ghostImgs[3] }
  ];
  grid = [];
  for (let y = 0; y < levelMap.length; y++) {
    let row = [];
    for (let x = 0; x < levelMap[y].length; x++) {
      row.push({
        wall: levelMap[y][x] === 1,
        disco: levelMap[y][x] === 0
      });
    }
    grid.push(row);
  }
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

  // Toggle scared mode every 7 seconds
  if (frameCount - ghostTimer > 70) {
    ghostScared = !ghostScared;
    ghostTimer = frameCount;
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x].wall) {
        fill(30, 30, 255);
        rect(x * gridSize, y * gridSize, gridSize, gridSize);
      } else if (grid[y][x].disco) {
        image(discoImg, x * gridSize + 6, y * gridSize + 6, gridSize - 12, gridSize - 12);
      }
    }
  }

  let nextX = pacman.x + direction.x;
  let nextY = pacman.y + direction.y;
  if (!grid[nextY] || !grid[nextY][nextX] || grid[nextY][nextX].wall) {
    // stop
  } else {
    pacman.x = nextX;
    pacman.y = nextY;
  }

  image(pacmanImg, pacman.x * gridSize, pacman.y * gridSize, gridSize, gridSize);

  for (let ghost of ghosts) {
    if (frameCount % 5 === 0) {
      if (ghostScared) {
        let dirs = [createVector(1, 0), createVector(-1, 0), createVector(0, 1), createVector(0, -1)];
        let dir = random(dirs);
        let tx = ghost.pos.x + dir.x;
        let ty = ghost.pos.y + dir.y;
        if (!grid[ty] || !grid[ty][tx] || grid[ty][tx].wall) continue;
        ghost.pos.add(dir);
      } else {
        let dx = pacman.x - ghost.pos.x;
        let dy = pacman.y - ghost.pos.y;
        if (abs(dx) > abs(dy)) {
          ghost.pos.x += dx > 0 && !grid[ghost.pos.y][ghost.pos.x + 1].wall ? 1 : dx < 0 && !grid[ghost.pos.y][ghost.pos.x - 1].wall ? -1 : 0;
        } else {
          ghost.pos.y += dy > 0 && !grid[ghost.pos.y + 1][ghost.pos.x].wall ? 1 : dy < 0 && !grid[ghost.pos.y - 1][ghost.pos.x].wall ? -1 : 0;
        }
      }
    }
    let img = ghostScared ? ghostScaredImg : ghost.img;
    image(img, ghost.pos.x * gridSize, ghost.pos.y * gridSize, gridSize, gridSize);
    if (!ghostScared && ghost.pos.x === pacman.x && ghost.pos.y === pacman.y) {
      gameOver = true;
    }
  }

  if (grid[pacman.y][pacman.x].disco) {
    grid[pacman.y][pacman.x].disco = false;
    score++;
    document.getElementById("score").innerText = "Score: " + score;
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW && !grid[pacman.y][pacman.x - 1].wall) direction = createVector(-1, 0);
  else if (keyCode === RIGHT_ARROW && !grid[pacman.y][pacman.x + 1].wall) direction = createVector(1, 0);
  else if (keyCode === UP_ARROW && !grid[pacman.y - 1][pacman.x].wall) direction = createVector(0, -1);
  else if (keyCode === DOWN_ARROW && !grid[pacman.y + 1][pacman.x].wall) direction = createVector(0, 1);
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
    if (dx > 0 && !grid[pacman.y][pacman.x + 1].wall) direction = createVector(1, 0);
    else if (dx < 0 && !grid[pacman.y][pacman.x - 1].wall) direction = createVector(-1, 0);
  } else {
    if (dy > 0 && !grid[pacman.y + 1][pacman.x].wall) direction = createVector(0, 1);
    else if (dy < 0 && !grid[pacman.y - 1][pacman.x].wall) direction = createVector(0, -1);
  }
}
