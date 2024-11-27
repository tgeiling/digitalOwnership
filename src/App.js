import React, { useState } from 'react';
import './App.css';
import Sidebar from './Sidebar';

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDwztCRbh_6Dz4bU8f6V_lgnZNLE9P9zT4",
  authDomain: "digitalownership-b2afe.firebaseapp.com",
  projectId: "digitalownership-b2afe",
  storageBucket: "digitalownership-b2afe.firebasestorage.app",
  messagingSenderId: "409306177453",
  appId: "1:409306177453:web:b082a1c48cf4f30a4e0b24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

function App() {
  const [user] = useAuthState(auth);
  const [activeMenu, setActiveMenu] = useState('dashboard'); // Track the active menu item

  return (
    <div className="App">
      <header className="app-header">
        <h1 className="logo">🔥 Video Platform</h1>
        {user && <SignOut />}
      </header>
      <main className="app-main">
        {user ? (
          <div className="app-content">
            <Sidebar setActiveMenu={setActiveMenu} />
            <div className="main-view">
              {activeMenu === 'dashboard' && <VideoDashboard />}
              {activeMenu === 'boughtVideos' && <div>My Bought Videos</div>}
              {activeMenu === 'valuableVideos' && <div>Most Valuable Videos</div>}
              {activeMenu === 'account' && <div>Account Settings</div>}
            </div>
          </div>
        ) : (
          <SignIn />
        )}
      </main>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  return (
    <div className="sign-in-container">
      <button onClick={signInWithGoogle} className="btn sign-in-btn">
        Sign in with Google
      </button>
      <p className="guidelines">
        Follow community guidelines to avoid being banned!
      </p>
    </div>
  );
}

function SignOut() {
  const handleSignOut = () => {
    signOut(auth).catch((error) => console.error('Error signing out:', error));
  };

  return (
    <button onClick={handleSignOut} className="btn sign-out-btn">
      Sign Out
    </button>
  );
}


function VideoDashboard() {
  const videosRef = collection(firestore, 'videos');
  const q = query(videosRef, orderBy('createdAt', 'desc'));
  const [videos] = useCollectionData(q, { idField: 'id' });
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!videoTitle.trim()) {
      alert('Video title is required');
      return;
    }
    if (!videoFile) {
      alert('Please select a video file');
      return;
    }
    setUploading(true);

    const storageRef = ref(storage, `videos/${videoFile.name}`);
    const uploadTask = uploadBytesResumable(storageRef, videoFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error('Error uploading video:', error);
        setUploading(false);
      },
      async () => {
        const videoURL = await getDownloadURL(uploadTask.snapshot.ref);
        try {
          await addDoc(videosRef, {
            title: videoTitle,
            videoURL,
            createdAt: serverTimestamp(),
            userId: auth.currentUser ? auth.currentUser.uid : 'unknown',
            userName: auth.currentUser ? auth.currentUser.displayName : 'Anonymous',
          });
          setVideoTitle('');
          setVideoFile(null);
        } catch (error) {
          console.error('Error saving video metadata:', error);
        }
        setUploading(false);
      }
    );
  };

  return (
    <div className="dashboard-container">
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="text"
          placeholder="Video Title"
          value={videoTitle}
          onChange={(e) => setVideoTitle(e.target.value)}
          className="input-field"
        />
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="file-input"
        />
        <button type="submit" disabled={uploading} className="upload-button">
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </form>


      <div className="video-grid">
        {videos &&
          videos.map((video) => (
            <div key={video.id} className="video-card">
              <div className="thumbnail-container">
                <a href={video.videoURL} target="_blank" rel="noopener noreferrer">
                  <video className="thumbnail-video" controls>
                    <source src={video.videoURL} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </a>
              </div>
              <div className="video-details">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-uploader">By {video.userName}</p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}


export default App;
