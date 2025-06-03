const desktop = document.getElementById("desktop");
const windowsContainer = document.getElementById("windows-container");
let highestZ = 1000;

// Utility to capitalize first letter
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Make a window draggable
function makeDraggable(win) {
  const header = win.querySelector(".window-header");
  let offsetX, offsetY, dragging = false;

  header.addEventListener("mousedown", e => {
    dragging = true;
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    win.style.zIndex = ++highestZ;
  });

  window.addEventListener("mouseup", () => {
    dragging = false;
  });

  window.addEventListener("mousemove", e => {
    if (!dragging) return;
    let x = e.clientX - offsetX;
    let y = e.clientY - offsetY;
    // Keep inside viewport
    x = Math.min(Math.max(x, 0), window.innerWidth - win.offsetWidth);
    y = Math.min(Math.max(y, 0), window.innerHeight - win.offsetHeight - 40); // minus taskbar
    win.style.left = x + "px";
    win.style.top = y + "px";
  });
}

// Open window on icon double click
desktop.querySelectorAll(".icon").forEach(icon => {
  icon.addEventListener("dblclick", () => {
    const winId = icon.dataset.window;
    if (!winId) return;

    // Check if window already open
    let existingWin = document.getElementById("window-" + winId);
    if (existingWin) {
      existingWin.style.zIndex = ++highestZ;
      return;
    }

    // Create new window
    const win = document.createElement("div");
    win.classList.add("window");
    win.id = "window-" + winId;
    win.style.left = "150px";
    win.style.top = "150px";
    win.style.zIndex = ++highestZ;

    const header = document.createElement("div");
    header.classList.add("window-header");

    const titleText = document.createElement("div");
    titleText.classList.add("title-text");
    titleText.textContent = capitalize(winId);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "X";
    closeBtn.title = "Close";
    closeBtn.addEventListener("click", () => {
      windowsContainer.removeChild(win);
    });

    header.appendChild(titleText);
    header.appendChild(closeBtn);

    const content = document.createElement("div");
    content.classList.add("window-content");

    // Fill window content based on folder type
    if (winId === "minesweeper") {
      content.appendChild(createMinesweeper(9, 9, 10));
    } else if (winId === "contact") {
      content.id = "contact-content";
      // Add your contact info or image here (replace or add to below)
      content.innerHTML = `
        <p style="font-family:'MS Sans Serif'; font-size:14px; color:black;">
          You can add your contact details or images here.<br><br>
          Example:<br>
          Phone: (123) 456-7890<br>
          Email: example@mail.com<br><br>
          Or insert an image below:
        </p>
        <img src="your-contact-image.jpg" alt="Contact Image" />
      `;
    } else {
      content.textContent = `This is the ${capitalize(winId)} window. Add your content here.`;
    }

    win.appendChild(header);
    win.appendChild(content);
    windowsContainer.appendChild(win);

    makeDraggable(win);
  });
});


// Minesweeper game implementation

function createMinesweeper(rows, cols, minesCount) {
  const container = document.createElement("div");
  container.style.textAlign = "center";

  // Create grid table
  const table = document.createElement("table");
  table.classList.add("minesweeper-grid");

  // State arrays
  const mineMap = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const revealed = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const flagged = Array(rows).fill(null).map(() => Array(cols).fill(false));
  let cellsRevealed = 0;
  let gameOver = false;

  // Place mines randomly
  let placedMines = 0;
  while (placedMines < minesCount) {
    let r = Math.floor(Math.random() * rows);
    let c = Math.floor(Math.random() * cols);
    if (!mineMap[r][c]) {
      mineMap[r][c] = true;
      placedMines++;
    }
  }

  // Calculate number of adjacent mines
  function countAdjacent(r, c) {
    let count = 0;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        let nr = r + dr;
        let nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (mineMap[nr][nc]) count++;
        }
      }
    }
    return count;
  }

  // Reveal cell recursively if 0 adjacent mines
  function reveal(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    if (revealed[r][c] || flagged[r][c]) return;
    revealed[r][c] = true;
    cellsRevealed++;

    const cell = table.rows[r].cells[c];
    cell.classList.add("revealed");
    cell.style.border = "2px inset #fff";
    cell.style.cursor = "default";

    if (mineMap[r][c]) {
      cell.classList.add("mine");
      cell.textContent = "💣";
      gameOver = true;
      revealAllMines();
      setTimeout(() => alert("Game Over! You hit a mine."), 10);
      return;
    }

    let count = countAdjacent(r, c);
    if (count > 0) {
      cell.textContent = count;
      cell.style.color = getNumberColor(count);
    } else {
      cell.textContent = "";
      // Reveal neighbors
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr !== 0 || dc !== 0) reveal(r + dr, c + dc);
        }
      }
    }

    checkWin();
  }

  // Reveal all mines on game over
  function revealAllMines() {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (mineMap[r][c]) {
          const cell = table.rows[r].cells[c];
          if (!cell.classList.contains("revealed")) {
            cell.classList.add("revealed", "mine");
            cell.textContent = "💣";
            cell.style.cursor = "default";
          }
        }
      }
    }
  }

  // Get color for number
  function getNumberColor(num) {
    const colors = {
      1: "#0000FF", // blue
      2: "#008200", // green
      3: "#FF0000", // red
      4: "#000084", // dark blue
      5: "#840000", // dark red
      6: "#008284", // cyan
      7: "#000000", // black
      8: "#808080", // gray
    };
    return colors[num] || "black";
  }

  // Check if all safe cells revealed (win)
  function checkWin() {
    if (gameOver) return;
    if (cellsRevealed === rows * cols - minesCount) {
      gameOver = true;
      revealAllMines();
      setTimeout(() => alert("Congratulations! You won Minesweeper!"), 10);
    }
  }

  // Create cells
  for (let r = 0; r < rows; r++) {
    const tr = document.createElement("tr");
    for (let c = 0; c < cols; c++) {
      const td = document.createElement("td");

      // Left click to reveal
      td.addEventListener("click", e => {
        if (gameOver) return;
        if (flagged[r][c]) return;
        reveal(r, c);
      });

      // Right click to flag/unflag
      td.addEventListener("contextmenu", e => {
        e.preventDefault();
        if (gameOver || revealed[r][c]) return;
        flagged[r][c] = !flagged[r][c];
        td.textContent = flagged[r][c] ? "🚩" : "";
        td.classList.toggle("flagged", flagged[r][c]);
      });

      tr.appendChild(td);
    }
    table.appendChild(tr);
  }

  container.appendChild(table);
  return container;
}

// Clock update
function updateClock() {
  const clock = document.getElementById("clock");
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  if (hours === 0) hours = 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  clock.textContent = `${hours}:${minutes} ${ampm}`;
}
setInterval(updateClock, 1000);
updateClock();
