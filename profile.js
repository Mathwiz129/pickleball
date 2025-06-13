const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const playerName = new URLSearchParams(location.search).get("player");

function formatDate(ms) {
  const d = new Date(ms);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function loadProfile() {
  if (!playerName) return;

  document.getElementById("playerName").textContent = playerName;

  const ref = db.collection("users").doc(playerName);
  ref.get().then(doc => {
    if (!doc.exists) return;

    const data = doc.data();
    const singles = data.singlesWins || 0;
    const doubles = data.doublesWins || 0;
    const played = data.matchesPlayed ?? singles + doubles;
    const ratio = played > 0 ? ((singles + doubles) / played).toFixed(2) : "0.00";
    const rating = data.rating !== undefined ? data.rating.toFixed(2) : "N/A";
document.getElementById("rating").textContent = rating;

    document.getElementById("singlesWins").textContent = singles;
    document.getElementById("doublesWins").textContent = doubles;
    document.getElementById("matchesPlayed").textContent = played;
    document.getElementById("winRatio").textContent = ratio;
  });
}

function loadMatchHistory() {
  const matchContainer = document.getElementById("matchHistory");
  matchContainer.innerHTML = "";

  db.collection("matches")
    .orderBy("timestamp", "desc")
    .limit(30)
    .get()
    .then(snapshot => {
      const matches = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(m =>
          (m.playerA || []).includes(playerName) || (m.playerB || []).includes(playerName)
        );

      if (matches.length === 0) {
        matchContainer.textContent = "No match history available.";
        return;
      }

      matches.forEach(m => {
        const A = (m.playerA || []).join(" & ");
        const B = (m.playerB || []).join(" & ");
        const isWinnerA = m.winner === "A";
        const didWin = (isWinnerA && m.playerA.includes(playerName)) || (!isWinnerA && m.playerB.includes(playerName));

        const resultText = isWinnerA ? `${A} def. ${B}` : `${B} def. ${A}`;
        const date = m.timestamp ? new Date(m.timestamp).toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "Unknown Date";
        const type = m.type || "match";

        const div = document.createElement("div");
        div.className = "match";
        div.textContent = `${date} • ${type} • ${resultText} (${m.scoreA}–${m.scoreB})`;
        matchContainer.appendChild(div);
      });
    })
    .catch(err => {
      console.error("Error loading match history:", err);
      matchContainer.textContent = "Error loading match history.";
    });
}
document.getElementById("removePlayerBtn")?.addEventListener("click", () => {
  const name = new URLSearchParams(window.location.search).get("player");
  if (!name) return;

  const confirmed = confirm(`Are you sure you want to remove "${name}" from the database? This cannot be undone.`);

  if (confirmed) {
    db.collection("users").doc(name).delete().then(() => {
      alert("Player removed.");
      window.location.href = "index.html";
    }).catch(error => {
      console.error("Error removing player:", error);
      alert("There was an error removing the player.");
    });
  }
});

loadProfile();
loadMatchHistory();