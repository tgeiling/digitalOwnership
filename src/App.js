import React, { useState } from 'react';
import './App.css';
import Sidebar from'./Sidebar';
import VideoDashboard from './Videodashboard.js';

import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, app } from './firebaseConfig'

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



export default App;
