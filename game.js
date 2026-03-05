const COLS = 6;
const ROWS = 7;
const SIZE = 64;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = COLS * SIZE;
canvas.height = ROWS * SIZE;

let grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

let score = 0;
let unlockedLevel = 0;

const image = new Image();
image.src = "images/Naturachimie.png";

const INGREDIENT_COUNT = 6; // adapte selon ton image
const SPRITE_HEIGHT = 128;  // hauteur d’un ingrédient dans l’image
const SPRITE_WIDTH = 128;

let currentPair = null;

function createPair() {
  return {
    x: Math.floor(COLS / 2),
    y: 0,
    rotation: 0,
    blocks: [
      { level: unlockedLevel },
      { level: unlockedLevel }
    ]
  };
}

function drawBlock(level, x, y) {
  ctx.drawImage(
    image,
    0,
    level * SPRITE_HEIGHT,
    SPRITE_WIDTH,
    SPRITE_HEIGHT,
    x * SIZE,
    y * SIZE,
    SIZE,
    SIZE
  );
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x] !== null) {
        drawBlock(grid[y][x], x, y);
      }
    }
  }

  if (currentPair) {
    const positions = getPairPositions();
    positions.forEach((pos, i) => {
      drawBlock(currentPair.blocks[i].level, pos.x, pos.y);
    });
  }
}

function getPairPositions() {
  const { x, y, rotation } = currentPair;

  if (rotation === 0) {
    return [
      { x: x, y: y },
      { x: x, y: y - 1 }
    ];
  }
  if (rotation === 1) {
    return [
      { x: x, y: y },
      { x: x + 1, y: y }
    ];
  }
  if (rotation === 2) {
    return [
      { x: x, y: y },
      { x: x, y: y + 1 }
    ];
  }
  if (rotation === 3) {
    return [
      { x: x, y: y },
      { x: x - 1, y: y }
    ];
  }
}

function canMove(dx) {
  const positions = getPairPositions();
  return positions.every(pos => {
    const nx = pos.x + dx;
    return nx >= 0 && nx < COLS;
  });
}

function move(dx) {
  if (canMove(dx)) {
    currentPair.x += dx;
  }
}

function rotate() {
  currentPair.rotation = (currentPair.rotation + 1) % 4;
}

function drop() {
  const positions = getPairPositions();

  positions.forEach((pos, i) => {
    let y = pos.y;
    while (y + 1 < ROWS && grid[y + 1][pos.x] === null) {
      y++;
    }
    grid[y][pos.x] = currentPair.blocks[i].level;
  });

  resolveMatches();
  currentPair = createPair();
}

function resolveMatches() {
  let visited = Array.from({ length: ROWS }, () => Array(COLS).fill(false));

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x] !== null && !visited[y][x]) {
        let cluster = [];
        floodFill(x, y, grid[y][x], visited, cluster);

        if (cluster.length >= 3) {
          cluster.forEach(pos => {
            grid[pos.y][pos.x] = null;
          });

          const newLevel = grid[y][x] + 1;
          unlockedLevel = Math.max(unlockedLevel, newLevel);
          score += Math.pow(3, newLevel);

          document.getElementById("score").innerText = "Score : " + score;
        }
      }
    }
  }
}

function floodFill(x, y, level, visited, cluster) {
  if (
    x < 0 || x >= COLS ||
    y < 0 || y >= ROWS ||
    visited[y][x] ||
    grid[y][x] !== level
  ) return;

  visited[y][x] = true;
  cluster.push({ x, y });

  floodFill(x + 1, y, level, visited, cluster);
  floodFill(x - 1, y, level, visited, cluster);
  floodFill(x, y + 1, level, visited, cluster);
  floodFill(x, y - 1, level, visited, cluster);
}

document.addEventListener("keydown", e => {
  if (!currentPair) return;

  if (e.key === "ArrowLeft") move(-1);
  if (e.key === "ArrowRight") move(1);
  if (e.key === "ArrowUp") rotate();
  if (e.key === "ArrowDown") drop();

  drawGrid();
});

image.onload = () => {
  currentPair = createPair();
  drawGrid();
};