const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Show/hide doubles inputs
function adjustMatchType() {
  const type = document.getElementById("matchType").value;
  document.querySelectorAll(".doubles-only").forEach(div => {
    div.style.display = type === "doubles" ? "block" : "none";
  });
}

// Populate dropdowns with player names
function populateDropdowns() {
  db.collection("users").get().then(snapshot => {
    const names = snapshot.docs.map(doc => doc.id);
    document.querySelectorAll(".player-select").forEach(select => {
      select.innerHTML = '<option value="">Select Player</option>';
      names.forEach(name => {
        const opt = document.createElement("option");
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
      });
    });
  });
}

// Recalculate rating for a single player
async function calculateRatingForPlayer(name) {
  const matchesA = await db.collection("matches").where("playerA", "array-contains", name).get();
  const matchesB = await db.collection("matches").where("playerB", "array-contains", name).get();
  const allMatches = [...matchesA.docs, ...matchesB.docs];

  let wins = 0, scored = 0, allowed = 0;

  allMatches.forEach(doc => {
    const m = doc.data();
    const isA = (m.playerA || []).includes(name);
    const team = isA ? "A" : "B";
    const myScore = team === "A" ? m.scoreA : m.scoreB;
    const oppScore = team === "A" ? m.scoreB : m.scoreA;

    if (m.winner === team) wins++;
    scored += myScore;
    allowed += oppScore;
  });

  const total = allMatches.length;
  const winRatio = total ? wins / total : 0;
  const margin = total ? (scored - allowed) / total : 0;

  let rating = 5 + ((winRatio - 0.5) * 10) + (margin / 5);
  if (total < 3) rating -= 1;
  rating = Math.max(1, Math.min(10, parseFloat(rating.toFixed(2))));

  return db.collection("users").doc(name).update({ rating });
}

// Handle match submission
function submitMatch() {
  const type = document.getElementById("matchType").value;
  const scoreA = parseInt(document.getElementById("scoreA").value);
  const scoreB = parseInt(document.getElementById("scoreB").value);
  const A1 = document.getElementById("playerA1").value;
  const A2 = document.getElementById("playerA2").value;
  const B1 = document.getElementById("playerB1").value;
  const B2 = document.getElementById("playerB2").value;
  const message = document.getElementById("message");

  const players = { A: [], B: [] };
  if (A1) players.A.push(A1);
  if (type === "doubles" && A2) players.A.push(A2);
  if (B1) players.B.push(B1);
  if (type === "doubles" && B2) players.B.push(B2);

  if (isNaN(scoreA) || isNaN(scoreB) || players.A.length === 0 || players.B.length === 0) {
    message.textContent = "Please fill out all required fields.";
    return;
  }

  const winner = scoreA > scoreB ? "A" : scoreB > scoreA ? "B" : null;
  if (!winner) {
    message.textContent = "Ties aren't allowed.";
    return;
  }

  const winField = type === "singles" ? "singlesWins" : "doublesWins";
  const winners = players[winner];
  const allPlayers = [...players.A, ...players.B];
  const updates = [];

  // Update win stats
  winners.forEach(name => {
    const ref = db.collection("users").doc(name);
    updates.push(ref.get().then(doc => {
      const data = doc.data() || {};
      return ref.update({ [winField]: (data[winField] || 0) + 1 });
    }));
  });

  // Update matches played for all
  allPlayers.forEach(name => {
    const ref = db.collection("users").doc(name);
    updates.push(ref.get().then(doc => {
      const data = doc.data() || {};
      return ref.update({ matchesPlayed: (data.matchesPlayed || 0) + 1 });
    }));
  });

  // Save match
  const matchData = {
    type,
    playerA: players.A,
    playerB: players.B,
    scoreA,
    scoreB,
    winner,
    timestamp: Date.now()
  };
  updates.push(db.collection("matches").add(matchData));

  // ✅ Trigger re-rating
  const uniquePlayers = [...new Set(allPlayers)];
  const ratingUpdates = uniquePlayers.map(async name => {
    try {
      await calculateRatingForPlayer(name);
      console.log(`✅ Rating updated for ${name}`);
    } catch (err) {
      console.error(`❌ Failed to update rating for ${name}`, err);
    }
  });

  Promise.all([...updates, ...ratingUpdates])
    .then(() => {
      message.textContent = "Match logged and ratings updated!";
      setTimeout(() => window.location.href = "index.html", 1500);
    })
    .catch(err => {
      console.error("Error submitting match:", err);
      message.textContent = "Something went wrong. Please try again.";
    });
}

adjustMatchType();
populateDropdowns();