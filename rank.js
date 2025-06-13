const firebaseConfig = {
  apiKey: "AIzaSyDULG3iBGIkqRebSMZuBzXFdabQArQCJs4",
  authDomain: "chattpickleball.firebaseapp.com",
  projectId: "chattpickleball"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function calculatePlayerRatings() {
  const usersSnapshot = await db.collection("users").get();

  for (const userDoc of usersSnapshot.docs) {
    const name = userDoc.id;
    let wins = 0, losses = 0, scored = 0, allowed = 0, matches = 0;

    const matchSnapshot = await db.collection("matches")
      .where("playerA", "array-contains", name)
      .get();

    const matchSnapshotB = await db.collection("matches")
      .where("playerB", "array-contains", name)
      .get();

    const allMatches = [...matchSnapshot.docs, ...matchSnapshotB.docs];

    allMatches.forEach(doc => {
      const m = doc.data();
      const inA = (m.playerA || []).includes(name);
      const team = inA ? "A" : "B";
      const theirScore = team === "A" ? m.scoreA : m.scoreB;
      const oppScore = team === "A" ? m.scoreB : m.scoreA;

      matches++;
      scored += theirScore;
      allowed += oppScore;

      if (m.winner === team) wins++;
      else losses++;
    });

    const winRatio = matches > 0 ? wins / matches : 0;
    const avgMargin = matches > 0 ? (scored - allowed) / matches : 0;

    let rating = 5 + ((winRatio - 0.5) * 10) + (avgMargin / 5);
    if (matches < 3) rating -= 1.0;
    rating = Math.max(1, Math.min(10, parseFloat(rating.toFixed(2))));

    await db.collection("users").doc(name).update({ rating });
    console.log(`Updated ${name} to ${rating}`);
  }

  console.log("Rating update complete!");
}