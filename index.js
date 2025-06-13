const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function loadLeaderboard() {
  const sortValue = document.getElementById("sortBy")?.value || "rating";
  const container = document.getElementById("cardContainer");
  container.innerHTML = "";

  db.collection("users").get().then(snapshot => {
    const players = [];

    snapshot.forEach(doc => {
      const data = doc.data() || {};
      const singlesWins = data.singlesWins || 0;
      const doublesWins = data.doublesWins || 0;
      const matchesPlayed = data.matchesPlayed ?? singlesWins + doublesWins;
      const rating = data.rating ?? null;

      players.push({
        name: doc.id,
        singlesWins,
        doublesWins,
        matchesPlayed,
        totalWins: singlesWins + doublesWins,
        rating
      });
    });

    // Sorting
    players.sort((a, b) => {
  if (sortValue === "matches") return b.matchesPlayed - a.matchesPlayed;
  if (sortValue === "singles") return b.singlesWins - a.singlesWins;
  if (sortValue === "doubles") return b.doublesWins - a.doublesWins;
  if (sortValue === "total") return b.totalWins - a.totalWins;
  return (b.rating || 0) - (a.rating || 0);
});

    // Render cards
    players.forEach(player => {
      const winRatio = player.matchesPlayed
        ? (player.totalWins / player.matchesPlayed).toFixed(2)
        : "0.00";

      let pillLabel = "Rating:";
let pillValue = player.rating !== null ? player.rating.toFixed(2) : "N/A";

if (sortValue === "matches") {
  pillLabel = "Matches:";
  pillValue = player.matchesPlayed;
} else if (sortValue === "singles") {
  pillLabel = "Singles Wins:";
  pillValue = player.singlesWins;
} else if (sortValue === "doubles") {
  pillLabel = "Doubles Wins:";
  pillValue = player.doublesWins;
} else if (sortValue === "total") {
  pillLabel = "Total Wins:";
  pillValue = player.totalWins;
}


      const card = document.createElement("div");
      card.className = "player-card";
      card.innerHTML = `
        <div class="card-body">
          <h4>${player.name}</h4>
          <p><strong>Win Ratio:</strong> ${winRatio}</p>
        </div>
        <div class="card-stats">
          <span>${pillLabel}</span>
          <span>${pillValue}</span>
        </div>
      `;

      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        window.location.href = `profile.html?player=${encodeURIComponent(player.name)}`;
      });

      container.appendChild(card);
    });
  }).catch(err => {
    console.error("Error loading leaderboard:", err);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("sortBy")?.addEventListener("change", loadLeaderboard);
  loadLeaderboard();
});