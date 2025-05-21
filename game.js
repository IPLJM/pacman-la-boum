// Pac-Man DJ Battle V5 - version stable et complète avec fond, animation, mobile controls
let pacmanImg, discoImg, backgroundImg, pacmanMouth = 0, pacmanAngle = 0;
let ghostImgs = [], ghostScaredImg;
let pacman;
let ghosts = [];
let gridSize = 20;
let cols = 20;
let rows = 20;
let grid = [];
let direction, nextDirection;
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
  [1,0,1,1,1,1,1,0,1,1,1,0,1,1,1,0,1,1,0,1],
  [1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,0,0,1],
  [1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1,1,0,1,1],
  [1,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,1],
  [1,0,1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,1,1,1],
  [1,0,1,0,0,0,0,0,1,0,1,0,0,0,0,0,1,0,0,1],
  [1,0,1,1,1,1,1,1,1,0,1,1,1,1,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function preload() {
  backgroundImg = loadImage("background.png");
  pacmanImg = loadImage("pacman.png");
  discoImg = loadImage("disco.png");
  ghostScaredImg = loadImage("ghost_scared.png");
  for (let i = 1; i <= 4; i++) ghostImgs.push(loadImage(`ghost${i}.png`));
}

function setup() {
  let canvas = createCanvas(400, 400);
  canvas.parent("game-container");
  frameRate(12);
  setupMobileControls();
  resetGame();
}

function setupMobileControls() {
  if (/Mobi|Android/i.test(navigator.userAgent)) {
    document.body.style.overflow = "hidden";
    let controls = createDiv().id("mobile-controls").style("text-align:center; margin-top:10px");
    controls.html(`
      <div style="display:flex;justify-content:center;gap:10px;">
        <button onclick="setDirection('LEFT')">⬅️</button>
        <button onclick="setDirection('UP')">⬆️</button>
        <button onclick="setDirection('DOWN')">⬇️</button>
        <button onclick="setDirection('RIGHT')">➡️</button>
      </div>
    `);
  }
}

function setDirection(dir) {
  if (dir === 'LEFT') nextDirection = createVector(-1, 0);
  else if (dir === 'RIGHT') nextDirection = createVector(1, 0);
  else if (dir === 'UP') nextDirection = createVector(0, -1);
  else if (dir === 'DOWN') nextDirection = createVector(0, 1);
}

function resetGame() {
  score = 0;
  direction = createVector(1, 0);
  nextDirection = direction.copy();
  gameOver = false;
  ghostScared = false;
  ghostTimer = frameCount;
  pacman = createVector(1, 1);
  ghosts = [
    { pos: createVector(18, 1), img: ghostImgs[0], active: true },
    { pos: createVector(1, 18), img: ghostImgs[1], active: true },
    { pos: createVector(10, 10), img: ghostImgs[2], active: true },
    { pos: createVector(18, 18), img: ghostImgs[3], active: true }
  ];
  grid = [];
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      row.push({ wall: levelMap[y][x] === 1, disco: levelMap[y][x] === 0 });
    }
    grid.push(row);
  }
  document.getElementById("score").innerText = "Score: 0";
  loop();
}

function draw() {
  if (backgroundImg && backgroundImg.width > 0) {
    background(backgroundImg);
  } else {
    background(0);
  }

  if (frameCount - ghostTimer > 120) {
    ghostScared = !ghostScared;
    ghostTimer = frameCount;
  }

  drawMap();
  movePacman();
  drawPacman();
  moveGhosts();
  drawGhosts();

  if (grid[pacman.y][pacman.x].disco) {
    grid[pacman.y][pacman.x].disco = false;
    score++;
    document.getElementById("score").innerText = "Score: " + score;
  }
}

function drawMap() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x].wall) {
        fill(0, 0, 255);
        rect(x * gridSize, y * gridSize, gridSize, gridSize);
      } else if (grid[y][x].disco) {
        image(discoImg, x * gridSize + 6, y * gridSize + 6, gridSize - 12, gridSize - 12);
      }
    }
  }
}

function movePacman() {
  let tx = pacman.x + nextDirection.x;
  let ty = pacman.y + nextDirection.y;
  if (!grid[ty]?.[tx]?.wall) direction = nextDirection.copy();

  let nx = pacman.x + direction.x;
  let ny = pacman.y + direction.y;
  if (!grid[ny]?.[nx]?.wall) {
    pacman.x = nx;
    pacman.y = ny;
    pacmanAngle = direction.heading();
    pacmanMouth = (pacmanMouth + 1) % 2;
  }
}

function drawPacman() {
  push();
  translate(pacman.x * gridSize + gridSize / 2, pacman.y * gridSize + gridSize / 2);
  rotate(pacmanAngle);
  image(pacmanImg, -gridSize / 2, -gridSize / 2, gridSize, gridSize);
  pop();
}

function moveGhosts() {
  for (let ghost of ghosts) {
    if (!ghost.active) continue;
    if (frameCount % 5 === 0) {
      if (ghostScared) {
        let dirs = shuffle([createVector(1, 0), createVector(-1, 0), createVector(0, 1), createVector(0, -1)]);
        for (let d of dirs) {
          let nx = ghost.pos.x + d.x;
          let ny = ghost.pos.y + d.y;
          if (!grid[ny]?.[nx]?.wall) {
            ghost.pos.add(d);
            break;
          }
        }
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
    if (ghost.pos.x === pacman.x && ghost.pos.y === pacman.y) {
      if (ghostScared) {
        ghost.active = false;
        score += 100;
        document.getElementById("score").innerText = "Score: " + score;
      } else {
        gameOver = true;
        noLoop();
      }
    }
  }
}

function drawGhosts() {
  for (let ghost of ghosts) {
    if (!ghost.active) continue;
    let img = ghostScared ? ghostScaredImg : ghost.img;
    image(img, ghost.pos.x * gridSize, ghost.pos.y * gridSize, gridSize, gridSize);
  }
}

function keyPressed() {
  if (keyCode === LEFT_ARROW) nextDirection = createVector(-1, 0);
  else if (keyCode === RIGHT_ARROW) nextDirection = createVector(1, 0);
  else if (keyCode === UP_ARROW) nextDirection = createVector(0, -1);
  else if (keyCode === DOWN_ARROW) nextDirection = createVector(0, 1);
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
  if (abs(dx) > abs(dy)) {
    nextDirection = createVector(dx > 0 ? 1 : -1, 0);
  } else {
    nextDirection = createVector(0, dy > 0 ? 1 : -1);
  }
}
