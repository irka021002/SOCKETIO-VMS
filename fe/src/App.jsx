import { useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js';
import './App.css';

function App() {
  const [count, setCount] = useState(0);
  const [cameras, setCameras] = useState([
    [1,"rtsp://admin:rastek123@10.50.0.13/cam/realmonitor?channel=1&subtype=00"],
    [2,"rtsp://admin:ipcam@reog39@10.50.0.14/cam/realmonitor?channel=1&subtype=00"],
    [3,"rtsp://admin:rastek123@10.50.0.13/cam/realmonitor?channel=1&subtype=00"],
    // [4,"rtsp://admin:ipcam@reog39@10.50.0.14/cam/realmonitor?channel=1&subtype=00"],
  ])

  useEffect(() => {
    cameras.map(v => {
      const socket = io(`http://127.0.0.1:404${v[0]}`);
      socket.on('connect', () => {
        console.log('Connected to server');
      });
      socket.emit("camera", "wake up")
      socket.on(`image-${v[0]}`, (data) => {
        const videoPresent = document.getElementById(`video-${v[0]}`);
        if (videoPresent) {
          videoPresent.src = `data:image/jpeg;base64, ${data}`;
        }
      });
    })
  }, []);

  return (
    <>
      <div style={{display: "flex", flexWrap: "wrap"}}>
        {cameras.map(v => <img width={500} height={500} id={`video-${v[0]}`} />)}
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
