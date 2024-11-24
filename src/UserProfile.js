import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth';

const auth = firebase.auth();

function UserProfile() {
  const user = auth.currentUser;

  if (!user) {
    return <p>No user signed in</p>;
  }

  return (
    <div className="user-profile">
      <img src={user.photoURL} alt="User Avatar" />
      <h3>{user.displayName}</h3>
      <p>Email: {user.email}</p>
    </div>
  );
}

export default UserProfile;