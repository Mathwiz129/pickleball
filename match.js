const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function adjustMatchType() {
  const matchType = document.getElementById("matchType").value;
  const doublesInputs = document.querySelectorAll(".doubles-only");

  doublesInputs.forEach(select => {
    select.style.display = matchType === "doubles" ? "block" : "none";
  });
}

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

function submitMatch() {
  const matchType = document.getElementById("matchType").value;
  const winner = document.getElementById("winner").value;

  const players = {
    A: [],
    B: []
  };

  const A1 = document.getElementById("playerA1").value;
  const A2 = document.getElementById("playerA2").value;
  const B1 = document.getElementById("playerB1").value;
  const B2 = document.getElementById("playerB2").value;

  if (A1) players.A.push(A1);
  if (matchType === "doubles" && A2) players.A.push(A2);
  if (B1) players.B.push(B1);
  if (matchType === "doubles" && B2) players.B.push(B2);

  if (players.A.length === 0 || players.B.length === 0 || !winner) {
    document.getElementById("message").innerText = "Please fill out all fields.";
    return;
  }

  const promises = [];

  players[winner].forEach(name => {
    const ref = db.collection("users").doc(name);
    promises.push(ref.get().then(doc => {
      if (doc.exists) {
        const wins = (doc.data().wins || 0) + 1;
        return ref.update({ wins });
      }
    }));
  });

  const loser = winner === "A" ? "B" : "A";
  players[loser].forEach(name => {
    const ref = db.collection("users").doc(name);
    promises.push(ref.get().then(doc => {
      if (doc.exists) {
        const losses = (doc.data().losses || 0) + 1;
        return ref.update({ losses });
      }
    }));
  });

  Promise.all(promises).then(() => {
    document.getElementById("message").innerText = "Match recorded successfully!";
  }).catch(err => {
    console.error(err);
    document.getElementById("message").innerText = "Something went wrong.";
  });
}

adjustMatchType();
populatePlayerDropdowns();