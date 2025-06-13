const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function addPlayer() {
  const name = document.getElementById("playerName").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message");

  if (!name || !email) {
    message.textContent = "Please enter both a name and an email.";
    message.style.color = "red";
    return;
  }

  db.collection("users").doc(name).get().then(doc => {
    if (doc.exists) {
      message.textContent = "That player already exists.";
      message.style.color = "red";
    } else {
      db.collection("users").doc(name).set({
        singlesWins: 0,
        doublesWins: 0,
        matchesPlayed: 0,
        totalWins: 0,
        rating: null,
        email: email
      }).then(() => {
        console.log("Saved with email:", email);
        message.textContent = "Player added successfully!";
        message.style.color = "#3d9970";
        setTimeout(() => window.location.href = "index.html", 1200);
      }).catch(err => {
        console.error("Error adding player:", err);
        message.textContent = "Something went wrong.";
        message.style.color = "red";
      });
    }
  });
}