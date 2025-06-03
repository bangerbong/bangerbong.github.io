document.addEventListener('DOMContentLoaded', () => {
    const icons = document.querySelectorAll('.icon');
    const windows = document.querySelectorAll('.window');
    const clockElement = document.getElementById('clock');
    const taskbarItemsContainer = document.getElementById('taskbar-items');

    let highestZ = 100;
    const openWindowsMap = new Map();

    function setActiveWindow(win) {
        if (!win) return;
        highestZ++;
        win.style.zIndex = highestZ;
        document.querySelectorAll('.window .title-bar').forEach(tb => tb.classList.remove('active-window-title'));
        const titleBar = win.querySelector('.title-bar');
        if (titleBar) titleBar.classList.add('active-window-title');
        updateActiveTaskbarItem(win.id);
    }

    function openWindowById(winId) {
        const win = document.getElementById(winId);
        if (!win) return;

        let windowTitle = 'Window'; // Default title
        const titleBar = win.querySelector('.title-bar');
        if (titleBar) {
            // Robust title extraction
            let foundTitle = "";
            for (const node of titleBar.childNodes) {
                if (node.nodeType === Node.TEXT_NODE && node.nodeValue.trim() !== "") {
                    foundTitle = node.nodeValue.trim();
                    break;
                }
            }
            if (foundTitle) {
                windowTitle = foundTitle;
            } else { // Fallback if text node not directly under title-bar
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = titleBar.innerHTML;
                const buttons = tempDiv.querySelector('.title-bar-buttons');
                if (buttons) buttons.remove(); // Remove buttons before getting text
                windowTitle = tempDiv.textContent.trim() || win.id.replace("Window", "") || "Window";
            }
        } else if (win.id) {
            windowTitle = win.id.replace("Window", "") || "Window"; // Fallback using ID
        }


        if (win.classList.contains('is-closing')) {
            win.classList.remove('is-closing');
            if (win.onanimationend) win.onanimationend = null;
        }
        
        if (win.style.display === 'block' && !win.classList.contains('is-opening')) {
             setActiveWindow(win);
             return;
        }

        win.classList.add('is-opening');
        setActiveWindow(win);
        createTaskbarItem(win.id, windowTitle);

        win.onanimationend = (e) => {
            if (e.animationName === 'fadeIn' && win.classList.contains('is-opening')) {
                win.classList.remove('is-opening');
                win.style.display = 'block';
            }
            win.onanimationend = null;
        };
        
        setTimeout(() => {
            if (win.classList.contains('is-opening')) {
                win.classList.remove('is-opening');
                win.style.display = 'block';
            }
        }, 250);
    }

    function closeWindow(win) {
        if (!win || win.classList.contains('is-closing')) return;
        win.classList.remove('is-opening');
        win.classList.add('is-closing');
        const winId = win.id;
        win.onanimationend = (e) => {
            if (e.animationName === 'fadeOut') {
                win.style.display = 'none';
                win.classList.remove('is-closing');
                removeTaskbarItem(winId);
            }
            win.onanimationend = null;
        };
        setTimeout(() => {
            if (win.classList.contains('is-closing')) {
                win.style.display = 'none';
                win.classList.remove('is-closing');
                removeTaskbarItem(winId);
            }
        }, 200);
    }

    function createTaskbarItem(winId, title) {
        if (openWindowsMap.has(winId)) {
            updateActiveTaskbarItem(winId);
            return;
        }
        const item = document.createElement('div');
        item.classList.add('taskbar-item');
        item.dataset.windowId = winId;
        item.textContent = title.length > 20 ? title.substring(0, 17) + '...' : title;
        item.addEventListener('click', () => {
            const targetWin = document.getElementById(winId);
            if (targetWin) {
                if (targetWin.style.display === 'none' || targetWin.classList.contains('is-closing')) {
                    openWindowById(winId);
                } else {
                    setActiveWindow(targetWin);
                }
            }
        });
        taskbarItemsContainer.appendChild(item);
        openWindowsMap.set(winId, item);
        updateActiveTaskbarItem(winId);
    }

    function removeTaskbarItem(winId) {
        if (openWindowsMap.has(winId)) {
            openWindowsMap.get(winId).remove();
            openWindowsMap.delete(winId);
        }
        if (openWindowsMap.size > 0) {
            const lastOpenedWindowId = Array.from(openWindowsMap.keys()).pop();
            updateActiveTaskbarItem(lastOpenedWindowId);
        } else {
             updateActiveTaskbarItem(null);
        }
    }
    
    function updateActiveTaskbarItem(activeWinId) {
        taskbarItemsContainer.childNodes.forEach(itemNode => {
            if (itemNode.nodeType === Node.ELEMENT_NODE) {
                if (itemNode.dataset.windowId === activeWinId) {
                    itemNode.classList.add('active');
                } else {
                    itemNode.classList.remove('active');
                }
            }
        });
    }

    icons.forEach(icon => {
        icon.addEventListener('dblclick', () => openWindowById(icon.dataset.window));
    });

    windows.forEach(win => {
        const bar = win.querySelector('.title-bar');
        if (!bar) return;
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('title-bar-buttons');
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('title-bar-button');
        closeBtn.innerHTML = 'r';
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent mousedown on bar from firing
            closeWindow(win);
        });
        buttonContainer.appendChild(closeBtn);
        bar.appendChild(buttonContainer);

        let offsetX, offsetY, isDragging = false;
        bar.addEventListener('mousedown', (e) => {
            if (e.target.closest('.title-bar-button')) return;
            isDragging = true;
            offsetX = e.clientX - win.offsetLeft;
            offsetY = e.clientY - win.offsetTop;
            setActiveWindow(win);
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;

            // Constrain to viewport
            const taskbarHeight = 30;
            newLeft = Math.max(0, Math.min(window.innerWidth - win.offsetWidth, newLeft));
            newTop = Math.max(0, Math.min(window.innerHeight - win.offsetHeight - taskbarHeight, newTop));
            
            win.style.left = newLeft + 'px';
            win.style.top = newTop + 'px';
        });
        document.addEventListener('mouseup', () => { isDragging = false; });
        win.addEventListener('mousedown', () => setActiveWindow(win), true);
    });

    function updateClock() {
        if (clockElement) {
            const now = new Date();
            clockElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    document.querySelectorAll('.drive').forEach(drive => {
        drive.addEventListener('click', () => openWindowById(drive.dataset.window));
    });

    const canvas = document.getElementById('paintCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let painting = false;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        function startPosition(e) { painting = true; draw(e); }
        function endPosition() { painting = false; ctx.beginPath(); }
        function draw(e) {
            if (!painting) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            ctx.strokeStyle = 'black';
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
        canvas.addEventListener('mousedown', startPosition);
        canvas.addEventListener('mouseup', endPosition);
        canvas.addEventListener('mouseout', endPosition);
        canvas.addEventListener('mousemove', draw);
    }

    // --- Minesweeper ---
    const gridElement = document.getElementById('mine-grid');
    const resetButton = document.getElementById('minesweeperResetButton');
    const M_SIZE = 9;
    const M_MINE_COUNT = 10;
    const M_CELL_SIZE_PX = 24; // From CSS .cell width
    
    let m_cells = [];
    let m_gameOver = false;
    let m_firstClick = true;

    function initMinesweeper() {
        if (!gridElement) return;
        console.log("Initializing Minesweeper");
        gridElement.innerHTML = '';
        m_cells = [];
        m_gameOver = false;
        m_firstClick = true;
        if (resetButton) resetButton.textContent = '😊';

        gridElement.style.gridTemplateColumns = `repeat(${M_SIZE}, ${M_CELL_SIZE_PX}px)`;

        for (let i = 0; i < M_SIZE * M_SIZE; i++) {
            const cellDiv = document.createElement('div');
            cellDiv.classList.add('cell');
            cellDiv.dataset.index = i;
            cellDiv.addEventListener('click', () => handleCellClick(i));
            cellDiv.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                handleCellFlag(i);
            });
            gridElement.appendChild(cellDiv);
            m_cells.push({
                el: cellDiv, index: i, mine: false, revealed: false,
                flagged: false, adjacentMines: 0
            });
        }
        // Note: placeMines is now called on first click
    }

    function placeMines(safeIndex) {
        let placed = 0;
        const totalCells = M_SIZE * M_SIZE;
        const safeNeighbors = getAdjacentIndices(safeIndex); // Get neighbors of the safe click

        while (placed < M_MINE_COUNT) {
            const index = Math.floor(Math.random() * totalCells);
            // Mine cannot be on the safeIndex or its immediate neighbors
            if (index === safeIndex || safeNeighbors.includes(index) || m_cells[index].mine) {
                continue;
            }
            m_cells[index].mine = true;
            placed++;
        }

        for (let i = 0; i < totalCells; i++) {
            if (!m_cells[i].mine) {
                const adjacentIndices = getAdjacentIndices(i);
                m_cells[i].adjacentMines = adjacentIndices.filter(adjIdx => m_cells[adjIdx].mine).length;
            }
        }
    }

    function handleCellClick(index) {
        if (m_gameOver) return;
        const cell = m_cells[index];
        if (cell.revealed || cell.flagged) return;

        if (m_firstClick) {
            console.log("First click, placing mines around safe index:", index);
            placeMines(index); // Pass the first clicked cell index as safe
            m_firstClick = false;
        }
        revealCellLogic(index);
        checkWinCondition();
    }

    function revealCellLogic(index) {
        const cell = m_cells[index];
        if (!cell || cell.revealed || cell.flagged || m_gameOver) return;

        cell.revealed = true;
        cell.el.classList.add('revealed');

        if (cell.mine) {
            cell.el.textContent = '💣';
            cell.el.classList.add('mine-hit');
            triggerGameOver(false);
            return;
        }

        if (cell.adjacentMines > 0) {
            cell.el.textContent = cell.adjacentMines;
            cell.el.dataset.mines = cell.adjacentMines;
        } else {
            // Reveal adjacent cells only if this one has 0 adjacent mines
            getAdjacentIndices(index).forEach(adjIdx => revealCellLogic(adjIdx));
        }
    }

    function handleCellFlag(index) {
        if (m_gameOver) return;
        const cell = m_cells[index];
        if (cell.revealed) return;
        cell.flagged = !cell.flagged;
        cell.el.textContent = cell.flagged ? '🚩' : '';
    }

    function getAdjacentIndices(index) {
        const adj = [];
        const x = index % M_SIZE;
        const y = Math.floor(index / M_SIZE);
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && ny >= 0 && nx < M_SIZE && ny < M_SIZE) {
                    adj.push(ny * M_SIZE + nx);
                }
            }
        }
        return adj;
    }

    function triggerGameOver(isWin) {
        m_gameOver = true;
        if (resetButton) resetButton.textContent = isWin ? '😎' : '😵';
        
        m_cells.forEach(cell => {
            if (cell.mine && !cell.revealed) { // Only reveal unrevealed mines
                if (!isWin && !cell.flagged) cell.el.textContent = '💣';
                if (isWin && !cell.flagged) cell.el.textContent = '🚩'; // Auto-flag remaining on win
            }
            if (!cell.mine && cell.flagged && !isWin) {
                cell.el.textContent = '❌';
            }
        });
         if (!isWin) alert("Game Over! You hit a mine.");
         else alert("Congratulations! You cleared all mines!");
    }

    function checkWinCondition() {
        if (m_gameOver) return;
        const totalNonMineCells = (M_SIZE * M_SIZE) - M_MINE_COUNT;
        let revealedNonMineCount = m_cells.filter(c => c.revealed && !c.mine).length;

        if (revealedNonMineCount === totalNonMineCells) {
            triggerGameOver(true);
        }
    }

    if (gridElement) {
        initMinesweeper(); // Initial setup
        if (resetButton) resetButton.addEventListener('click', initMinesweeper);
    }
});
