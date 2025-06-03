const icons = document.querySelectorAll('.icon');
const windowPopup = document.getElementById('window-popup');
const windowTitle = document.getElementById('window-title');
const windowContent = document.getElementById('window-content');
const closeBtn = document.getElementById('close-window');

// Your folder contents - Add your image filenames here!
const folderContents = {
  posters: [
    'assets/posters/poster1.jpg',
    'assets/posters/poster2.jpg',
    'assets/posters/poster3.jpg'
  ],
  branding: [
    'assets/branding/brand1.jpg',
    'assets/branding/brand2.jpg'
  ],
  videos: [
    'assets/videos/thumb1.jpg',
    'assets/videos/thumb2.jpg'
  ],
  photos: [
    'assets/photos/photo1.jpg',
    'assets/photos/photo2.jpg',
    'assets/photos/photo3.jpg'
  ],
  about: []
};

icons.forEach(icon => {
  icon.addEventListener('click', () => {
    const folder = icon.getAttribute('data-folder');
    openWindow(folder);
  });
});

closeBtn.addEventListener('click', () => {
  windowPopup.classList.add('hidden');
  windowContent.innerHTML = '';
});

function openWindow(folder) {
  windowTitle.textContent = folder.charAt(0).toUpperCase() + folder.slice(1);
  windowContent.innerHTML = '';

  if (folder === 'about') {
    windowContent.innerHTML = `
      <p>Hello! I’m Bangerbong, a designer and visual artist.</p>
      <p>Here you’ll find my posters, branding, videos, photos, and more.</p>
      <p>Contact me at: <a href="mailto:youremail@example.com">youremail@example.com</a></p>
    `;
  } else {
    folderContents[folder].forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      windowContent.appendChild(img);
    });
  }

  windowPopup.classList.remove('hidden');
}
