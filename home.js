const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const currentUser = localStorage.getItem("currentUser");
document.getElementById("welcomeName").innerText = `Logged in as: ${currentUser}`;

db.collection("users").get().then(snapshot => {
  const players = [];

  snapshot.forEach(doc => {
    const data = doc.data() || {};
    const wins = data.wins || 0;
    const losses = data.losses || 0;
    players.push({
      name: doc.id,
      wins: wins,
      losses: losses,
      total: wins + losses
    });
  });

  // Sort by wins descending
  players.sort((a, b) => b.wins - a.wins);

  const cardContainer = document.getElementById("cardContainer");

  players.forEach((player, index) => {
    const card = document.createElement("div");
    card.className = "player-card";
    card.innerHTML = `
      <div class="card-body">
        <h4>#${index + 1} – ${player.name}</h4>
        <p><strong>Wins:</strong> ${player.wins}</p>
        <p><strong>Losses:</strong> ${player.losses}</p>
      </div>
      <div class="card-stats">
        <span>Matches Played:</span>
        <span>${player.total}</span>
      </div>
    `;
    cardContainer.appendChild(card);
  });
}).catch(err => {
  console.error("Error loading leaderboard:", err);
});