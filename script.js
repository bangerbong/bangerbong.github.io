document.addEventListener('DOMContentLoaded', () => {
  const desktopIcons = document.querySelectorAll('.icon');
  const stickyNote = document.getElementById('sticky-note');
  const windows = document.querySelectorAll('.window');
  const clock = document.getElementById('clock');

  function layoutDesktopIcons() {
    const positions = [
      { top: 100, left: 80 },
      { top: 250, left: 160 },
      { top: 180, left: 300 },
      { top: 340, left: 220 },
      { top: 420, left: 90 },
      { top: 100, left: 400 },
      { top: 220, left: 500 },
      { top: 320, left: 600 },
      { top: 150, left: 700 },
      { top: 280, left: 800 },
      { top: 400, left: 600 }
    ];
    desktopIcons.forEach((icon, i) => {
      const pos = positions[i];
      if (pos) {
        icon.style.top = pos.top + 'px';
        icon.style.left = pos.left + 'px';
        icon.classList.add('positioned');
      }
    });
    stickyNote.classList.add('positioned');
  }

  desktopIcons.forEach(icon => {
    icon.addEventListener('dblclick', () => {
      const win = document.getElementById(icon.dataset.window);
      if (win) win.style.display = 'block';
    });
  });

  document.querySelectorAll('.drive').forEach(drive => {
    drive.addEventListener('click', () => {
      const win = document.getElementById(drive.dataset.window);
      if (win) win.style.display = 'block';
    });
  });

  function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  setInterval(updateClock, 1000);
  updateClock();

  layoutDesktopIcons();
});

