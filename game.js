// Pac-Man DJ Battle V6 – Look & Logic comme le vrai
let pacmanImg, discoImg, backgroundImg;
let ghostImgs = [], ghostScaredImg;
let pacman, pacmanLives = 3;
let ghosts = [], ghostSpawnTimers = [];
let gridSize = 20;
let cols = 28;
let rows = 31;
let grid = [];
let direction, nextDirection;
let score = 0;
let highScore = 0;
let gameOver = false;
let ghostScared = false;
let ghostScaredTimer = 0;
let touchStartX, touchStartY;

function preload() {
  backgroundImg = loadImage("background.png");
  pacmanImg = loadImage("pacman.png");
  discoImg = loadImage("disco.png");
  ghostScaredImg = loadImage("ghost_scared.png");
  for (let i = 1; i <= 4; i++) ghostImgs.push(loadImage(`ghost${i}.png`));
}

function setup() {
  let canvas = createCanvas(cols * gridSize, rows * gridSize + 40);
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
      <div style="display:grid;grid-template-columns:40px 40px 40px;gap:5px;justify-content:center;">
        <div></div><button onclick="setDirection('UP')">⬆️</button><div></div>
        <button onclick="setDirection('LEFT')">⬅️</button><div></div><button onclick="setDirection('RIGHT')">➡️</button>
        <div></div><button onclick="setDirection('DOWN')">⬇️</button><div></div>
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
  pacman = createVector(13, 23);
  pacmanLives = 3;
  initGrid();
  initGhosts();
  updateScoreDisplay();
  loop();
}

function initGrid() {
  grid = [];
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      row.push({ wall: false, disco: false });
    }
    grid.push(row);
  }
  // Ex: dessine des murs (simplifié ici)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) grid[y][x].wall = true;
      else if ((x + y) % 7 === 0) grid[y][x].wall = true;
      else grid[y][x].disco = true;
    }
  }
  // Enclos fantômes (ex : ligne horizontale)
  for (let x = 11; x <= 16; x++) grid[14][x].wall = true;
  for (let y = 13; y <= 15; y++) grid[y][13].wall = true;
}

function initGhosts() {
  ghosts = [];
  ghostSpawnTimers = [];
  for (let i = 0; i < 4; i++) {
    ghosts.push({ pos: createVector(13, 14), img: ghostImgs[i], active: false });
    ghostSpawnTimers.push(frameCount + i * 30);
  }
}

function draw() {
  if (backgroundImg && backgroundImg.width > 0) background(backgroundImg);
  else background(0);

  if (frameCount - ghostScaredTimer > 120) ghostScared = false;

  drawHUD();
  drawMap();
  movePacman();
  drawPacman();
  handleGhostSpawns();
  moveGhosts();
  drawGhosts();
  drawLives();

  if (grid[pacman.y][pacman.x].disco) {
    grid[pacman.y][pacman.x].disco = false;
    score++;
    updateScoreDisplay();
  }
}

function drawHUD() {
  fill(255);
  textSize(12);
  textAlign(LEFT);
  text(`1UP  ${score}`, 10, 15);
  textAlign(CENTER);
  text(`HIGH SCORE  ${highScore}`, width / 2, 15);
}

function drawMap() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (grid[y][x].wall) {
        fill(0, 0, 255);
        rect(x * gridSize, y * gridSize + 20, gridSize, gridSize);
      } else if (grid[y][x].disco) {
        image(discoImg, x * gridSize + 6, y * gridSize + 26, gridSize - 12, gridSize - 12);
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
  }
}

function drawPacman() {
  image(pacmanImg, pacman.x * gridSize, pacman.y * gridSize + 20, gridSize, gridSize);
}

function handleGhostSpawns() {
  for (let i = 0; i < ghosts.length; i++) {
    if (!ghosts[i].active && frameCount >= ghostSpawnTimers[i]) ghosts[i].active = true;
  }
}

function moveGhosts() {
  for (let ghost of ghosts) {
    if (!ghost.active) continue;
    let dx = pacman.x - ghost.pos.x;
    let dy = pacman.y - ghost.pos.y;
    if (abs(dx) > abs(dy)) {
      ghost.pos.x += dx > 0 && !grid[ghost.pos.y][ghost.pos.x + 1].wall ? 1 : dx < 0 && !grid[ghost.pos.y][ghost.pos.x - 1].wall ? -1 : 0;
    } else {
      ghost.pos.y += dy > 0 && !grid[ghost.pos.y + 1][ghost.pos.x].wall ? 1 : dy < 0 && !grid[ghost.pos.y - 1][ghost.pos.x].wall ? -1 : 0;
    }

    if (ghost.pos.x === pacman.x && ghost.pos.y === pacman.y) {
      if (ghostScared) {
        ghost.active = false;
        score += 100;
      } else {
        pacmanLives--;
        if (pacmanLives <= 0) {
          gameOver = true;
          noLoop();
        } else {
          pacman = createVector(13, 23);
          direction = createVector(1, 0);
          nextDirection = direction.copy();
        }
      }
      updateScoreDisplay();
    }
  }
}

function drawGhosts() {
  for (let ghost of ghosts) {
    if (!ghost.active) continue;
    let img = ghostScared ? ghostScaredImg : ghost.img;
    image(img, ghost.pos.x * gridSize, ghost.pos.y * gridSize + 20, gridSize, gridSize);
  }
}

function drawLives() {
  for (let i = 0; i < pacmanLives; i++) {
    image(pacmanImg, 10 + i * 22, height - 20, 18, 18);
  }
}

function updateScoreDisplay() {
  if (score > highScore) highScore = score;
  document.getElementById("score").innerText = "Score: " + score;
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
  if (abs(dx) > abs(dy)) nextDirection = createVector(dx > 0 ? 1 : -1, 0);
  else nextDirection = createVector(0, dy > 0 ? 1 : -1);
}
