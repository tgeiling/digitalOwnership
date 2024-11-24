import React, { useState } from "react";
import "./App.css";

import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header className="app-header">
        <h1>🔥 Video Platform</h1>
        {user && <SignOut />}
      </header>

      <main className="app-main">
        {user ? <VideoDashboard /> : <SignIn />}
      </main>

      <footer className="app-footer">
        <p>© 2024 Video Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in:", error);
      alert("Failed to sign in. Please try again.");
    }
  };

  return (
    <div className="auth-section">
      <button className="btn sign-in-btn" onClick={signInWithGoogle}>
        Sign in with Google
      </button>
      <p>Follow community guidelines to avoid being banned!</p>
    </div>
  );
}

function SignOut() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  return (
    <button className="btn sign-out-btn" onClick={handleSignOut}>
      Sign Out
    </button>
  );
}

function VideoDashboard() {
  const videosRef = collection(firestore, "videos");
  const q = query(videosRef, orderBy("createdAt", "desc"));
  const [videos] = useCollectionData(q, { idField: "id" });
  const [videoTitle, setVideoTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      alert("Video title is required");
      return;
    }

    setUploading(true);

    try {
      await addDoc(videosRef, {
        title: videoTitle,
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid || "unknown",
        userName: auth.currentUser?.displayName || "Anonymous",
      });
      setVideoTitle("");
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="dashboard">
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="text"
          placeholder="Enter video title"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          required
        />
        <button type="submit" className="btn upload-btn" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </form>

      <div className="video-grid">
        {videos &&
          videos.map((video) => (
            <div key={video.id} className="video-card">
              <h3>{video.title}</h3>
              <p>Uploaded by {video.userName}</p>
            </div>
          ))}
      </div>
    </div>
  );
}

export default App;
