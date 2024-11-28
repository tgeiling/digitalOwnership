import React, { useState } from 'react';
import { collection, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'; // Firestore functions
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'; // Firebase storage functions
import { useCollectionData } from 'react-firebase-hooks/firestore'; // React Firebase hooks for Firestore
import { auth, firestore, storage } from './firebaseConfig'; // Import the shared Firebase instances
import './VideoDashboard.css'; // Ensure CSS styling is included

function VideoDashboard() {
  const videosRef = collection(firestore, 'videos');
  const q = query(videosRef, orderBy('createdAt', 'desc'));
  const [videos] = useCollectionData(q, { idField: 'id' });
  const [videoTitle, setVideoTitle] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null); // State to track selected video for detail view

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
            price: 'N/A', // Default price value
            length: 'N/A', // Default video length
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

  const handleVideoClick = (video) => {
    setSelectedVideo(video); // Set the selected video for detail view
  };

  const closeDetailView = () => {
    setSelectedVideo(null); // Clear the selected video
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
        <input type="file" accept="video/*" onChange={handleFileChange} className="file-input" />
        <button type="submit" disabled={uploading} className="upload-button">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>

      <div className="video-grid">
        {videos &&
          videos.map((video) => (
            <div key={video.id} className="video-card" onClick={() => handleVideoClick(video)}>
              <div className="thumbnail-container">
                <video className="thumbnail-video">
                  <source src={video.videoURL} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="thumbnail-overlay">
                  <button className="play-button">▶</button>
                </div>
              </div>
              <div className="video-details">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-uploader">By {video.userName}</p>
              </div>
            </div>
          ))}
      </div>

      {selectedVideo && (
        <div className="video-detail-overlay">
          <div className="video-detail-view">
            <button onClick={closeDetailView} className="close-button">
              Close
            </button>
            <div className="video-detail">
              <div className="video-container">
                <video className="detail-video" controls>
                  <source src={selectedVideo.videoURL} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="video-info">
                <h2 className="detail-title">{selectedVideo.title}</h2>
                <p className="detail-uploader">Uploaded by: {selectedVideo.userName}</p>
                <p className="detail-length">
                  Length: {selectedVideo.length || 'N/A'}
                </p>
                <p className="detail-price">
                  Price: {selectedVideo.price || 'N/A'}
                </p>
                <button className="buy-button">Buy Video</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoDashboard;
