// Typewriter effect
const text = "welcome to my portfolio.";
let index = 0;
function typeWriter() {
  if (index < text.length) {
    document.getElementById("title").innerHTML += text.charAt(index);
    index++;
    setTimeout(typeWriter, 80);
  }
}
typeWriter();

// Open windows with content
function openWindow(name) {
  const existing = document.getElementById(`window-${name}`);
  if (existing) return;

  const win = document.createElement("div");
  win.className = "window";
  win.id = `window-${name}`;

  win.innerHTML = `
    <div class="window-header">
      <span>${name.toUpperCase()}</span>
      <button onclick="document.getElementById('window-${name}').remove()">✖</button>
    </div>
    <div class="window-content">
      <p>This is where your ${name} content goes.</p>
    </div>
  `;

  document.getElementById("windows-container").appendChild(win);
}
