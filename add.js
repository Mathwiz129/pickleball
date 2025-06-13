const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  const message = document.getElementById("message");

  if (!name) {
    message.textContent = "Please enter a player name.";
    return;
  }

  const ref = db.collection("users").doc(name);

  ref.get().then(doc => {
    if (doc.exists) {
      message.textContent = "That player already exists.";
    } else {
      return ref.set({
        singlesWins: 0,
        doublesWins: 0,
        matchesPlayed: 0
      }).then(() => {
        message.textContent = `${name} has been added! Redirecting...`;
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1500); // Delay to show message before redirect
      });
    }
  }).catch(err => {
    console.error("Error adding player:", err);
    message.textContent = "Something went wrong. Try again.";
  });
}