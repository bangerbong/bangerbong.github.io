document.addEventListener('DOMContentLoaded', () => {
    const icons = document.querySelectorAll('.icon');
    const windows = document.querySelectorAll('.window');
    const clockElement = document.getElementById('clock');
    const taskbarItemsContainer = document.getElementById('taskbar-items');

    let highestZ = 100; // For window stacking
    const openWindowsMap = new Map(); // Tracks open windows and their taskbar items

    // --- Window Management ---
    function setActiveWindow(win) {
        if (!win) return;
        highestZ++;
        win.style.zIndex = highestZ;

        // Update title bar styles
        document.querySelectorAll('.window .title-bar').forEach(tb => tb.classList.remove('active-window-title'));
        const titleBar = win.querySelector('.title-bar');
        if (titleBar) titleBar.classList.add('active-window-title');
        
        updateActiveTaskbarItem(win.id);
    }

    function openWindowById(winId) {
        const win = document.getElementById(winId);
        if (!win) return;

        const titleBar = win.querySelector('.title-bar');
        let windowTitle = 'Window';
        if (titleBar) {
            // Get text content excluding button container
            const titleTextNode = Array.from(titleBar.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
            if (titleTextNode) windowTitle = titleTextNode.nodeValue.trim();
        }

        if (win.classList.contains('is-closing')) {
            win.classList.remove('is-closing');
            if (win.onanimationend) win.onanimationend = null;
        }
        
        // If window is already visible (fully open, not just starting to open)
        if (win.style.display === 'block' && !win.classList.contains('is-opening')) {
             setActiveWindow(win);
             return;
        }

        win.classList.add('is-opening');
        setActiveWindow(win); // This also sets z-index and updates taskbar active state
        createTaskbarItem(winId, windowTitle); // Create taskbar item if not exists

        win.onanimationend = (e) => {
            if (e.animationName === 'fadeIn' && win.classList.contains('is-opening')) {
                win.classList.remove('is-opening');
                win.style.display = 'block'; // Ensure display is block
            }
            win.onanimationend = null;
        };
        
        // Fallback if animationend doesn't fire (e.g., display was changed rapidly)
        setTimeout(() => {
            if (win.classList.contains('is-opening')) {
                win.classList.remove('is-opening');
                win.style.display = 'block';
            }
        }, 250); // Animation duration + buffer
    }

    function closeWindow(win) {
        if (!win || win.classList.contains('is-closing')) return;

        win.classList.remove('is-opening'); // In case it was still opening
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
        // Fallback
        setTimeout(() => {
            if (win.classList.contains('is-closing')) {
                win.style.display = 'none';
                win.classList.remove('is-closing');
                removeTaskbarItem(winId);
            }
        }, 200); // Animation duration + buffer
    }

    // --- Taskbar Management ---
    function createTaskbarItem(winId, title) {
        if (openWindowsMap.has(winId)) { // If item exists, just ensure it's active
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
                    openWindowById(winId); // Re-open if closed
                } else {
                    setActiveWindow(targetWin); // Just bring to front
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
        // Activate another window's taskbar item if any are left
        if (openWindowsMap.size > 0) {
            const lastOpenedWindowId = Array.from(openWindowsMap.keys()).pop(); // Or find highest z-index
            updateActiveTaskbarItem(lastOpenedWindowId);
        } else {
             updateActiveTaskbarItem(null); // No active item
        }
    }
    
    function updateActiveTaskbarItem(activeWinId) {
        taskbarItemsContainer.childNodes.forEach(item => {
            if (item.nodeType === Node.ELEMENT_NODE) { // Ensure it's an element
                if (item.dataset.windowId === activeWinId) {
                    item.classList.add('active');
                } else {
                    item.classList.remove('active');
                }
            }
        });
    }


    // Initialize Icons
    icons.forEach(icon => {
        icon.addEventListener('dblclick', () => openWindowById(icon.dataset.window));
    });

    // Initialize Windows (draggable, close button, etc.)
    windows.forEach(win => {
        const bar = win.querySelector('.title-bar');
        if (!bar) return;

        // Create and add close button
        const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('title-bar-buttons');
        
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('title-bar-button');
        closeBtn.innerHTML = 'r'; // Marlett 'r' for close symbol. Fallback: 'X'
        // For text 'X' if Marlett fails: closeBtn.textContent = 'X'; closeBtn.style.fontSize='12px';
        
        closeBtn.addEventListener('click', () => closeWindow(win));
        buttonContainer.appendChild(closeBtn);
        bar.appendChild(buttonContainer);

        let offsetX, offsetY, isDragging = false;

        bar.addEventListener('mousedown', (e) => {
            // Prevent dragging if click is on a button inside title bar
            if (e.target.closest('.title-bar-button')) return;
            
            isDragging = true;
            offsetX = e.clientX - win.offsetLeft;
            offsetY = e.clientY - win.offsetTop;
            setActiveWindow(win);
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            win.style.left = Math.max(0, Math.min(window.innerWidth - win.offsetWidth, e.clientX - offsetX)) + 'px';
            win.style.top = Math.max(0, Math.min(window.innerHeight - win.offsetHeight - 30, e.clientY - offsetY)) + 'px'; // 30 for taskbar
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Clicking anywhere on window brings it to front
        win.addEventListener('mousedown', () => setActiveWindow(win), true); // Use capture phase
    });

    // --- Clock ---
    function updateClock() {
        if (clockElement) {
            const now = new Date();
            clockElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // --- My Computer Folder Navigation ---
    document.querySelectorAll('.drive').forEach(drive => {
        drive.addEventListener('click', () => openWindowById(drive.dataset.window));
    });

    // --- Paint App ---
    const canvas = document.getElementById('paintCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let painting = false;
        ctx.lineWidth = 3; // Default line width
        ctx.lineCap = 'round'; // Rounded line ends

        function startPosition(e) {
            painting = true;
            draw(e); // Draw a dot on click
        }
        function endPosition() {
            painting = false;
            ctx.beginPath(); // Reset path for next stroke
        }
        function draw(e) {
            if (!painting) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            ctx.strokeStyle = 'black'; // Color can be dynamic
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath(); // Prepare for next segment
            ctx.moveTo(x, y);
        }
        canvas.addEventListener('mousedown', startPosition);
        canvas.addEventListener('mouseup', endPosition);
        canvas.addEventListener('mouseout', endPosition); // Stop painting if mouse leaves canvas
        canvas.addEventListener('mousemove', draw);
    }

    // --- Minesweeper ---
    const gridElement = document.getElementById('mine-grid');
    const resetButton = document.getElementById('minesweeperResetButton');
    const M_SIZE = 9; // Grid dimensions (9x9)
    const M_MINE_COUNT = 10;
    
    let m_cells = [];
    let m_gameOver = false;
    let m_firstClick = true;

    function initMinesweeper() {
        if (!gridElement) return;
        gridElement.innerHTML = '';
        m_cells = [];
        m_gameOver = false;
        m_firstClick = true;
        if (resetButton) resetButton.textContent = '😊';

        gridElement.style.gridTemplateColumns = `repeat(${M_SIZE}, 24px)`; // Cell width from CSS

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
                el: cellDiv,
                index: i,
                mine: false,
                revealed: false,
                flagged: false,
                adjacentMines: 0
            });
        }
    }

    function placeMines(safeIndex) {
        let placed = 0;
        const totalCells = M_SIZE * M_SIZE;
        while (placed < M_MINE_COUNT) {
            const index = Math.floor(Math.random() * totalCells);
            if (index === safeIndex || m_cells[index].mine || getAdjacentIndices(safeIndex).includes(index)) { // Keep first click and its neighbors safe
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
            placeMines(index);
            m_firstClick = false;
        }
        revealCellLogic(index);
        checkWinCondition();
    }

    function revealCellLogic(index) {
        const cell = m_cells[index];
        if (cell.revealed || cell.flagged || m_gameOver) return;

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
            if (cell.mine && !cell.revealed) {
                if (!isWin && !cell.flagged) cell.el.textContent = '💣'; // Show unflagged bombs on loss
                if (isWin && !cell.flagged) cell.el.textContent = '🚩'; // Auto-flag remaining on win
            }
            if (!cell.mine && cell.flagged && !isWin) { // Incorrectly flagged
                cell.el.textContent = '❌';
            }
        });
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
        initMinesweeper();
        if (resetButton) resetButton.addEventListener('click', initMinesweeper);
    }
    // End of Minesweeper
});
