const folders = document.querySelectorAll('.folder');
const popup = document.getElementById('popupWindow');
const popupTitle = document.getElementById('popupTitle');
const popupContent = document.getElementById('popupContent');
const closeBtn = document.getElementById('closeBtn');

folders.forEach(folder => {
  folder.addEventListener('click', () => {
    const folderName = folder.getAttribute('data-folder');
    popupTitle.innerText = folderName;
    popupContent.innerHTML = `<p>Content for ${folderName} will go here.</p>`;
    popup.classList.remove('hidden');
  });
});

closeBtn.addEventListener('click', () => {
  popup.classList.add('hidden');
});
