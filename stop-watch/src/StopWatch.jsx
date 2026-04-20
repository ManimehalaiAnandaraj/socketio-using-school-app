import React, { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import './assets/mainlayout.css'

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);

  const navigate = useNavigate();

  const themePage = () => {
    navigate('/dashboard'); 
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 10);
      }, 10);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  // Start
  const handleStart = () => {
    setIsRunning(true);
  };

  // Stop
  const handleStop = () => {
    setIsRunning(false);
  };

  // Reset
  const handleReset = () => {
    clearInterval(intervalRef.current);
    setTime(0);
    setIsRunning(false);
  };

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    const ms = Math.floor((milliseconds % 1000) / 10);

    return (
      `${minutes.toString().padStart(2, "0")}:` +
      `${seconds.toString().padStart(2, "0")}:` +
      `${ms.toString().padStart(2, "0")}`
    );
  };

  return (
    <>
    <div className="top-bar">
  <button 
    onClick={() => navigate('/login')} 
    className="btn-theme"
  >
    Go to Login Page
  </button>
</div>
    <div className="stopwatch-container">
    

    <div className="stopwatch">
      <h1 className="head">React Stopwatch</h1>

      <div className="timer-display">
        {formatTime(time)}
      </div>

      <div className="buttons">
        <button onClick={handleStart} className="btn-start">Start</button>
        <button onClick={handleStop} className="btn-stop">Stop</button>
        <button onClick={handleReset} className="btn-reset">Reset</button>
      </div>
    </div>
    </div>
    </>
  );
};

export default Stopwatch;