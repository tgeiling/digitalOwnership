import React, { useRef, useState } from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwztCRbh_6Dz4bU8f6V_lgnZNLE9P9zT4",
  authDomain: "digitalownership-b2afe.firebaseapp.com",
  projectId: "digitalownership-b2afe",
  storageBucket: "digitalownership-b2afe.appspot.com",
  messagingSenderId: "409306177453",
  appId: "1:409306177453:web:b082a1c48cf4f30a4e0b24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const analytics = getAnalytics(app);

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>🔥 Video Platform</h1>
        <SignOut />
      </header>

      <section>
        {user ? <VideoDashboard /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch((error) => console.error('Error signing in:', error));
  };

  return (
    <div>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Follow community guidelines to avoid being banned!</p>
    </div>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className="sign-out" onClick={() => signOut(auth)}>
        Sign Out
      </button>
    )
  );
}

function VideoDashboard() {
  const videosRef = collection(firestore, 'videos');
  const q = query(videosRef, orderBy('createdAt', 'desc'));
  const [videos] = useCollectionData(q, { idField: 'id' });
  const [videoTitle, setVideoTitle] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      alert('Video title is required');
      return;
    }
    setUploading(true);

    try {
      await addDoc(videosRef, {
        title: videoTitle,
        createdAt: serverTimestamp(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous'
      });
      setVideoTitle('');
    } catch (error) {
      console.error('Error uploading video:', error);
    }
    setUploading(false);
  };

  return (
    <div>
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="text"
          placeholder="Video Title"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <div className="video-grid">
        {videos && videos.map((video) => (
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
