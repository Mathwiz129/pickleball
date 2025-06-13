// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Adjust form based on match type
function adjustMatchType() {
  const matchType = document.getElementById("matchType").value;
  const doublesInputs = document.querySelectorAll(".doubles-only");
  doublesInputs.forEach(select => {
    select.style.display = matchType === "doubles" ? "block" : "none";
  });
}

// Load player options into all dropdowns
function populatePlayerDropdowns() {
  db.collection("users").get().then(snapshot => {
    const usernames = [];
    snapshot.forEach(doc => usernames.push(doc.id));

    document.querySelectorAll(".player-select").forEach(select => {
      usernames.forEach(name => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
      });
    });
  });
}

// Submit the match result
function submitMatch() {
  const matchType = document.getElementById("matchType").value;
  const winner = document.getElementById("winner").value;
  const players = { A: [], B: [] };

  const A1 = document.getElementById("playerA1").value;
  const A2 = document.getElementById("playerA2").value;
  const B1 = document.getElementById("playerB1").value;
  const B2 = document.getElementById("playerB2").value;

  if (A1) players.A.push(A1);
  if (B1) players.B.push(B1);
  if (matchType === "doubles") {
    if (A2) players.A.push(A2);
    if (B2) players.B.push(B2);
  }

  if (!winner || players.A.length === 0 || players.B.length === 0) {
    document.getElementById("message").innerText = "Please fill out all fields.";
    return;
  }

  const promises = [];
  const winField = matchType === "singles" ? "singlesWins" : "doublesWins";
  const allPlayers = [...players.A, ...players.B];

  // Update wins for winners
  players[winner].forEach(name => {
    const ref = db.collection("users").doc(name);
    promises.push(
      ref.get().then(doc => {
        const data = doc.data() || {};
        const update = {};
        update[winField] = (data[winField] || 0) + 1;
        return ref.update(update);
      })
    );
  });

  // Update matches played for everyone
  allPlayers.forEach(name => {
    const ref = db.collection("users").doc(name);
    promises.push(
      ref.get().then(doc => {
        const data = doc.data() || {};
        const played = (data.matchesPlayed || 0) + 1;
        return ref.update({ matchesPlayed: played });
      })
    );
  });

  Promise.all(promises)
    .then(() => {
      document.getElementById("message").innerText = "Match recorded successfully!";
    })
    .catch(err => {
      console.error(err);
      document.getElementById("message").innerText = "Something went wrong.";
    });
}

// Initialize page
adjustMatchType();
populatePlayerDropdowns();