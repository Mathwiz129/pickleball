document.addEventListener("DOMContentLoaded", () => {
  const nav = document.createElement("header");
  nav.style.background = "#3d9970";
  nav.style.padding = "1em 2em";
  nav.style.display = "flex";
  nav.style.justifyContent = "space-between";
  nav.style.alignItems = "center";
  nav.style.flexWrap = "nowrap";


  // Inject styling for nav buttons
  const style = document.createElement("style");
  style.textContent = `
    .nav-btn {
      background: white;
      color: #3d9970;
      padding: 0.6em 1.2em;
      border: none;
      border-radius: 6px;
      font-weight: bold;
      cursor: pointer;
      font-size: 1em;
      transition: background 0.2s ease;
    }
    .nav-btn:hover {
      background: #e0f2ea;
    }
    .nav-title {
      color: white;
      font-size: 1.5em;
      font-weight: bold;
      text-decoration: none;
    }
  `;
  document.head.appendChild(style);

  nav.innerHTML = `
    <a href="index.html" class="nav-title">Chattpickleball</a>
    <div style="display: flex; gap: 1em;">
      <button class="nav-btn" onclick="location.href='match.html'">Enter Match</button>
      <button class="nav-btn" onclick="location.href='add.html'">Add New Player</button>
      <button class="nav-btn" onclick="location.href='about.html'">About</button>
    </div>
  `;

  document.body.insertBefore(nav, document.body.firstChild);
});