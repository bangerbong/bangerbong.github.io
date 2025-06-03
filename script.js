// script.js (Only showing the relevant draggableDesktopElements part)

// ... (rest of the script before this part remains mostly the same) ...

    // --- Draggable Desktop Elements (Icons, Sticky Note) ---
    draggableDesktopElements.forEach(element => {
        let offsetX, offsetY, isDragging = false;
        let hasMoved = false;
        const dragHandle = element;

        dragHandle.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            isDragging = true;
            hasMoved = false;
            e.preventDefault();

            // CRITICAL: Ensure element is absolutely positioned for dragging
            // Get current computed style to see if it's already absolute
            const computedStyle = window.getComputedStyle(element);
            if (computedStyle.position !== 'absolute') {
                // If not absolute (e.g., in flex flow on mobile),
                // capture its current visual position BEFORE making it absolute
                const rect = element.getBoundingClientRect();
                element.style.left = `${rect.left}px`;
                element.style.top = `${rect.top}px`;
                element.style.position = 'absolute'; // NOW make it absolute
            }
            // else, it was already absolute (e.g. desktop or already dragged)

            offsetX = e.clientX - element.offsetLeft;
            offsetY = e.clientY - element.offsetTop;
            highestDesktopZ++;
            element.style.zIndex = highestDesktopZ;
            element.classList.add('is-dragging');
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            hasMoved = true;
            let newLeft = e.clientX - offsetX;
            let newTop = e.clientY - offsetY;
            const taskbarHeight = 30; // Or get dynamically document.getElementById('taskbar').offsetHeight
            const elWidth = element.offsetWidth;
            const elHeight = element.offsetHeight;

            // Constrain to viewport
            const minLeft = 0;
            const maxLeft = window.innerWidth - elWidth;
            const minTop = 0;
            const maxTop = window.innerHeight - elHeight - taskbarHeight;

            newLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
            newTop = Math.max(minTop, Math.min(maxTop, newTop));

            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.classList.remove('is-dragging');
                // Note: Element remains position: absolute after dragging.
                // To make it flow back into flex on mobile after drag would be more complex.
            }
        });

        if (element.classList.contains('icon')) {
            element.addEventListener('dblclick', () => {
                if (!hasMoved && element.dataset.window) {
                    openWindowById(element.dataset.window);
                }
                setTimeout(() => { hasMoved = false; }, 0);
            });
        }
    });

// ... (rest of the script, window dragging, clock, apps etc. remains mostly the same) ...

// ... (rest of the script, window dragging, clock, apps etc. remains mostly the same) ...
