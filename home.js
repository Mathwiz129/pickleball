const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Show current user name
const currentUser = localStorage.getItem("currentUser");
if (currentUser) {
  const welcome = document.getElementById("welcomeName");
  if (welcome) welcome.innerText = `Logged in as: ${currentUser}`;
}

function loadLeaderboard() {
  const sortValue = document.getElementById("sortBy")?.value || "total";
  const container = document.getElementById("cardContainer");
  if (container) container.innerHTML = "";

  db.collection("users").get().then(snapshot => {
    const players = [];

    snapshot.forEach(doc => {
      const data = doc.data() || {};
      const singles = data.singlesWins || 0;
      const doubles = data.doublesWins || 0;
      const played = data.matchesPlayed ?? singles + doubles;

      players.push({
        name: doc.id,
        singlesWins: singles,
        doublesWins: doubles,
        matchesPlayed: played,
        totalWins: singles + doubles
      });
    });

    players.sort((a, b) => {
      if (sortValue === "singles") return b.singlesWins - a.singlesWins;
      if (sortValue === "doubles") return b.doublesWins - a.doublesWins;
      return b.totalWins - a.totalWins;
    });

    players.forEach((player, index) => {
      const card = document.createElement("div");
      card.className = "player-card";
      card.innerHTML = `
        <div class="card-body">
          <h4>#${index + 1} – ${player.name}</h4>
          <p><strong>Singles Wins:</strong> ${player.singlesWins}</p>
          <p><strong>Doubles Wins:</strong> ${player.doublesWins}</p>
        </div>
        <div class="card-stats">
          <span>Matches Played:</span>
          <span>${player.matchesPlayed}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }).catch(err => {
    console.error("Error loading leaderboard:", err);
  });
}

loadLeaderboard();