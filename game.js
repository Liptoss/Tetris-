const COLS = 6;
const VISIBLE_ROWS = 7;
const HIDDEN_ROWS = 3;
const ROWS = VISIBLE_ROWS + HIDDEN_ROWS;
const SIZE = 60;

const canvas = document.getElementById("game");
canvas.width = COLS * SIZE;
canvas.height = VISIBLE_ROWS * SIZE;
const ctx = canvas.getContext("2d");

let board = Array.from({ length: ROWS }, () =>
  Array(COLS).fill(0)
);

let unlockedLevels = [1];
let currentPair = null;

const colors = [
  "#2ecc71", // vert
  "#f1c40f", // jaune
  "#e67e22", // orange
  "#e74c3c",
  "#9b59b6",
  "#00ffff",
  "#ff00ff"
];

class Pair {
  constructor() {
    this.x = Math.floor(COLS / 2);
    this.y = 0;
    this.rotation = 0;
    this.levels = [
      randomLevel(),
      randomLevel()
    ];
  }

  getBlocks() {
    const second = [
      { x: 0, y: 0 },
      { x: 0, y: -1 },
      { x: 1, y: 0 },
      { x: 0, y: 1 }
    ][this.rotation];

    return [
      { x: this.x, y: this.y, level: this.levels[0] },
      { x: this.x + second.x, y: this.y + second.y, level: this.levels[1] }
    ];
  }
}

function randomLevel() {
  return unlockedLevels[Math.floor(Math.random() * unlockedLevels.length)];
}

function spawn() {
  currentPair = new Pair();
  if (!canMove(0,0)) {
    alert("Game Over");
    board = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(0)
    );
    unlockedLevels = [1];
  }
}

function canMove(dx, dy) {
  return currentPair.getBlocks().every(b => {
    let nx = b.x + dx;
    let ny = b.y + dy;
    return (
      nx >= 0 &&
      nx < COLS &&
      ny < ROWS &&
      board[ny]?.[nx] === 0
    );
  });
}

function move(dx) {
  if (canMove(dx, 0)) currentPair.x += dx;
}

function rotate() {
  let old = currentPair.rotation;
  currentPair.rotation = (old + 1) % 4;
  if (!canMove(0,0)) currentPair.rotation = old;
}

function drop() {
  while (canMove(0,1)) {
    currentPair.y++;
  }

  currentPair.getBlocks().forEach(b => {
    if (b.y >= 0)
      board[b.y][b.x] = b.level;
  });

  resolveBoard();
  spawn();
}

function resolveBoard() {
  let changed;
  do {
    changed = false;
    let visited = Array.from({ length: ROWS }, () =>
      Array(COLS).fill(false)
    );

    for (let y = 0; y < ROWS; y++) {
      for (let x = 0; x < COLS; x++) {
        if (board[y][x] === 0 || visited[y][x]) continue;

        let group = floodFill(x,y,board[y][x],visited);

        if (group.length >= 3) {
          changed = true;
          group.forEach(g => board[g.y][g.x] = 0);

          let highest = group.reduce((a,b)=> a.y > b.y ? a : b);
          board[highest.y][highest.x] = group[0].level + 1;

          let newLevel = group[0].level + 1;
          if (!unlockedLevels.includes(newLevel)) {
            unlockedLevels.push(newLevel);
          }
        }
      }
    }
  } while (changed);
}

function floodFill(x,y,level,visited) {
  let stack = [{x,y}];
  let group = [];
  while (stack.length) {
    let [cx, cy] = stack.pop();
    if (
      cx<0||cx>=COLS||
      cy<0||cy>=ROWS||
      visited[cy][cx]||
      board[cy][cx]!==level
    ) continue;

    visited[cy][cx]=true;
    group.push({cx,cy,level});

    stack.push([cx+1,cy]);
    stack.push([cx-1,cy]);
    stack.push([cx,cy+1]);
    stack.push([cx,cy-1]);
  }
  return group;
}

function drawCell(x,y,level) {
  if (level === 0) return;
  if (y < HIDDEN_ROWS) return;

  ctx.fillStyle = colors[level-1] || "white";
  ctx.fillRect(
    x*SIZE,
    (y-HIDDEN_ROWS)*SIZE,
    SIZE-2,
    SIZE-2
  );
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  for (let y=0;y<ROWS;y++)
    for (let x=0;x<COLS;x++)
      drawCell(x,y,board[y][x]);

  if (currentPair) {
    currentPair.getBlocks().forEach(b=>{
      drawCell(b.x,b.y,b.level);
    });
  }
}

document.addEventListener("keydown", e=>{
  if (!currentPair) return;
  if (e.key==="ArrowLeft") move(-1);
  if (e.key==="ArrowRight") move(1);
  if (e.key==="ArrowUp") rotate();
  if (e.key==="ArrowDown") drop();
});

function loop() {
  draw();
  requestAnimationFrame(loop);
}

spawn();
loop();