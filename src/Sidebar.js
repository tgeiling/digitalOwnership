import React from 'react';
import './App.css';

function Sidebar({ setActiveMenu }) {
  return (
    <div className="sidebar">
      <ul className="menu-list">
        <li className="menu-item" onClick={() => setActiveMenu('dashboard')}>
          Dashboard
        </li>
        <li className="menu-item" onClick={() => setActiveMenu('boughtVideos')}>
          My Bought Videos
        </li>
        <li className="menu-item" onClick={() => setActiveMenu('valuableVideos')}>
          Most Valuable Videos
        </li>
        <li className="menu-item" onClick={() => setActiveMenu('account')}>
          Account
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
