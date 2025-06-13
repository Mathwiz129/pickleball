const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function signup() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  db.collection("users").doc(username).get().then(doc => {
    if (doc.exists) {
      document.getElementById("message").innerText = "Username already taken.";
    } else {
      db.collection("users").doc(username).set({ password }).then(() => {
        document.getElementById("message").innerText = "Signed up!";
        // 👇 Redirect to login page after short delay
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1000);
      });
    }
  });
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  db.collection("users").doc(username).get().then(doc => {
    if (!doc.exists) {
      document.getElementById("message").innerText = "User not found.";
    } else if (doc.data().password !== password) {
      document.getElementById("message").innerText = "Wrong password.";
    } else {
      // Save username to localStorage and redirect
      localStorage.setItem("currentUser", username);
      window.location.href = "home.html";
    }
  });
}
