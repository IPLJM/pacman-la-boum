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

// levelMap = 1: mur, 0: pastille, 2: vide, 9: enclos
const levelMap = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1],
  [1,0,1,2,2,1,0,1,2,2,1,0,1,1,1,0,1,2,2,1,0,1,2,2,1,0,1,1],
  [1,0,1,2,2,1,0,1,2,2,1,0,0,0,0,0,1,2,2,1,0,1,2,2,1,0,1,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,9,1,0,1,1,1,1,0,1,1,1,1,0,1,1],
  [1,0,1,2,2,1,0,1,2,2,1,0,1,9,1,0,1,2,2,1,0,1,2,2,1,0,1,1],
  [1,0,1,2,2,1,0,1,2,2,1,0,1,9,1,0,1,2,2,1,0,1,2,2,1,0,1,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,9,1,0,1,1,1,1,0,1,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,9,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,9,1,0,1,1,1,1,0,1,1,1,1,0,1,1],
  [1,0,1,2,2,1,0,1,2,2,1,0,1,1,1,0,1,2,2,1,0,1,2,2,1,0,1,1],
  [1,0,1,2,2,1,0,1,2,2,1,0,0,0,0,0,1,2,2,1,0,1,2,2,1,0,1,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,0,1,1,1,1,0,1,1,1,0,1,1,1,1,0,1,1,1,1,1,1,1],
  [1,0,0,0,0,1,0,1,2,2,1,0,1,2,1,0,1,2,2,1,0,1,0,0,0,0,0,1],
  [1,1,1,1,0,1,0,1,2,2,1,0,1,2,1,0,1,2,2,1,0,1,0,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

function initGrid() {
  grid = [];
  for (let y = 0; y < rows; y++) {
    let row = [];
    for (let x = 0; x < cols; x++) {
      const cell = levelMap[y][x];
      row.push({
        wall: cell === 1 || cell === 9,
        disco: cell === 0
      });
    }
    grid.push(row);
  }
}
function preload() {
  pacmanImg = loadImage("pacman.png");
  discoImg = loadImage("disco.png");
  backgroundImg = loadImage("background.png");
  ghostScaredImg = loadImage("ghost_scared.png");

  for (let i = 1; i <= 4; i++) {
    ghostImgs.push(loadImage(`ghost${i}.png`));
  }
}

function setup() {
  let size = gridSize * cols;
  let canvas = createCanvas(size, size + 60);
  canvas.parent("game-container");
  frameRate(10);
  resetGame();

  // Mobile controls
  if (windowWidth < 600) {
    createMobileControls();
  }

  // Scroll lock
  document.addEventListener('touchmove', function (e) {
    e.preventDefault();
  }, { passive: false });
}

function resetGame() {
  direction = createVector(1, 0);
  nextDirection = direction;
  score = 0;
  pacmanLives = 3;
  gameOver = false;
  ghostScared = false;
  ghostScaredTimer = 0;

  initGrid();
  pacman = createVector(14, 23);

  ghosts = [];
  let ghostStart = createVector(13, 11);
  for (let i = 0; i < 4; i++) {
    ghosts.push({
      pos: ghostStart.copy().add(i % 2, Math.floor(i / 2)),
      dir: createVector(0, -1),
      img: ghostImgs[i],
      eaten: false
    });
  }
}

function draw() {
  if (backgroundImg && backgroundImg.width > 0) {
    background(backgroundImg);
  } else {
    background(0);
  }

  drawGrid();
  movePacman();
  drawPacman();
  moveGhosts();
  drawGhosts();
  drawScore();
  drawLives();
}
function drawGrid() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let cell = grid[y][x];
      if (cell.wall) {
        fill(0, 0, 255);
        rect(x * gridSize, y * gridSize + 20, gridSize, gridSize);
      } else if (cell.disco) {
        image(discoImg, x * gridSize + 5, y * gridSize + 25, 10, 10);
      }
    }
  }
}

function drawPacman() {
  push();
  translate(pacman.x * gridSize + gridSize / 2, pacman.y * gridSize + gridSize / 2 + 20);
  rotate(direction.heading());
  imageMode(CENTER);
  image(pacmanImg, 0, 0, gridSize, gridSize);
  pop();
}

function movePacman() {
  let next = p5.Vector.add(pacman, nextDirection);
  if (!isWall(next)) {
    direction = nextDirection;
  }

  let target = p5.Vector.add(pacman, direction);
  if (!isWall(target)) {
    pacman = target;
  }

  // manger pastille
  let cell = grid[pacman.y][pacman.x];
  if (cell && cell.disco) {
    cell.disco = false;
    score += 10;
  }

  // mode panique aléatoire
  if (frameCount % 300 === 0) {
    ghostScared = true;
    ghostScaredTimer = 100;
  }

  if (ghostScared) {
    ghostScaredTimer--;
    if (ghostScaredTimer <= 0) ghostScared = false;
  }
}

function moveGhosts() {
  for (let ghost of ghosts) {
    if (ghost.eaten) continue;

    let options = [
      createVector(1, 0),
      createVector(-1, 0),
      createVector(0, 1),
      createVector(0, -1)
    ];

    let best = ghostScared ? random(options) : getDirectionTo(ghost.pos, pacman);
    let next = p5.Vector.add(ghost.pos, best);
    if (!isWall(next)) {
      ghost.pos = next;
      ghost.dir = best;
    }

    // collision
    if (ghost.pos.equals(pacman)) {
      if (ghostScared) {
        ghost.eaten = true;
        score += 100;
      } else {
        pacmanLives--;
        if (pacmanLives <= 0) {
          gameOver = true;
          noLoop();
        } else {
          resetGame();
        }
        return;
      }
    }
  }
}

function drawGhosts() {
  for (let ghost of ghosts) {
    if (ghost.eaten) continue;
    image(ghostScared ? ghostScaredImg : ghost.img, ghost.pos.x * gridSize, ghost.pos.y * gridSize + 20, gridSize, gridSize);
  }
}

function isWall(pos) {
  if (!grid[pos.y] || !grid[pos.y][pos.x]) return true;
  return grid[pos.y][pos.x].wall;
}

function getDirectionTo(from, to) {
  let dirs = [
    createVector(1, 0),
    createVector(-1, 0),
    createVector(0, 1),
    createVector(0, -1)
  ];

  dirs.sort((a, b) => {
    let da = dist(from.x + a.x, from.y + a.y, to.x, to.y);
    let db = dist(from.x + b.x, from.y + b.y, to.x, to.y);
    return da - db;
  });

  return dirs[0];
}

function drawScore() {
  fill(255);
  textSize(16);
  textAlign(LEFT);
  text(`1UP  ${score}`, 10, 18);
  textAlign(CENTER);
  text(`HIGH SCORE  ${highScore}`, width / 2, 18);
}

function drawLives() {
  for (let i = 0; i < pacmanLives; i++) {
    image(pacmanImg, i * 20 + 10, height - 30, 16, 16);
  }
}

function keyPressed() {
  if (keyCode === UP_ARROW) nextDirection = createVector(0, -1);
  else if (keyCode === DOWN_ARROW) nextDirection = createVector(0, 1);
  else if (keyCode === LEFT_ARROW) nextDirection = createVector(-1, 0);
  else if (keyCode === RIGHT_ARROW) nextDirection = createVector(1, 0);
}

function touchStarted(e) {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}

function touchEnded(e) {
  let dx = e.changedTouches[0].clientX - touchStartX;
  let dy = e.changedTouches[0].clientY - touchStartY;

  if (abs(dx) > abs(dy)) {
    nextDirection = dx > 0 ? createVector(1, 0) : createVector(-1, 0);
  } else {
    nextDirection = dy > 0 ? createVector(0, 1) : createVector(0, -1);
  }
}

// Boutons tactiles
function createMobileControls() {
  let container = createDiv().id("mobile-controls");
  container.style("margin-top", "10px");

  let layout = `
    <div style="display: flex; flex-direction: column; align-items: center;">
      <button onclick="nextDirection = createVector(0, -1)">⬆️</button>
      <div style="display: flex; justify-content: center;">
        <button onclick="nextDirection = createVector(-1, 0)">⬅️</button>
        <button onclick="nextDirection = createVector(1, 0)">➡️</button>
      </div>
      <button onclick="nextDirection = createVector(0, 1)">⬇️</button>
    </div>`;
  container.html(layout);
}
