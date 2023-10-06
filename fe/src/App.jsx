import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const socket = io('http://127.0.0.1:5000');

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.emit("image", "wake up")

    socket.on('image', (data) => {
      console.log(data);
      // Make sure the image element with id 'videoPresent' exists in your HTML
      const videoPresent = document.getElementById('videoPresent');
      if (videoPresent) {
        videoPresent.src = `data:image/jpeg;base64, ${data}`;
      }
    });

    // Cleanup by removing the 'camera' event listener when unmounting
    return () => {
      socket.off('image');
    };
  }, []);

  return (
    <>
      <div>
        <img width={500} height={500} alt="" id='videoPresent' />
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
