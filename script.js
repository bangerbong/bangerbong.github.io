// script.js

const icons = document.querySelectorAll('.icon');
const windows = document.querySelectorAll('.window');
const clock = document.getElementById('clock');

icons.forEach(icon => {
  icon.addEventListener('dblclick', () => {
    const win = document.getElementById(icon.dataset.window);
    if (win) win.style.display = 'block';
  });
});

windows.forEach(win => {
  const bar = win.querySelector('.title-bar');
  const close = document.createElement('span');
  close.textContent = 'X';
  close.style.cursor = 'pointer';
  bar.appendChild(close);

  close.addEventListener('click', () => {
    win.style.display = 'none';
  });

  let offsetX, offsetY, isDragging = false;

  bar.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex = Date.now();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    win.style.left = (e.clientX - offsetX) + 'px';
    win.style.top = (e.clientY - offsetY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
});

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString();
}
setInterval(updateClock, 1000);
updateClock();

// Paint App
const canvas = document.getElementById('paintCanvas');
const ctx = canvas.getContext('2d');
let painting = false;

canvas.addEventListener('mousedown', () => painting = true);
canvas.addEventListener('mouseup', () => painting = false);
canvas.addEventListener('mousemove', draw);

function draw(e) {
  if (!painting) return;
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(e.offsetX, e.offsetY, 2, 0, Math.PI * 2);
  ctx.fill();
}

// Minesweeper
const grid = document.getElementById('mine-grid');
const size = 9;
const mineCount = 10;
let cells = [];

function createGrid() {
  grid.innerHTML = '';
  cells = [];
  for (let i = 0; i < size * size; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.dataset.index = i;
    cell.addEventListener('click', () => revealCell(i));
    grid.appendChild(cell);
    cells.push({el: cell, mine: false, revealed: false, flagged: false});
  }
  placeMines();
}

function placeMines() {
  let placed = 0;
  while (placed < mineCount) {
    const index = Math.floor(Math.random() * cells.length);
    if (!cells[index].mine) {
      cells[index].mine = true;
      placed++;
    }
  }
}

function revealCell(index) {
  const cell = cells[index];
  if (cell.revealed) return;
  cell.revealed = true;
  cell.el.classList.add('revealed');
  if (cell.mine) {
    cell.el.textContent = '💣';
    alert('Game Over');
    return;
  }
  const adjacent = getAdjacent(index);
  const minesAround = adjacent.filter(i => cells[i].mine).length;
  if (minesAround > 0) {
    cell.el.textContent = minesAround;
  } else {
    adjacent.forEach(revealCell);
  }
}

function getAdjacent(index) {
  const adj = [];
  const x = index % size;
  const y = Math.floor(index / size);
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < size && ny < size) {
        adj.push(ny * size + nx);
      }
    }
  }
  return adj;
}

createGrid();
