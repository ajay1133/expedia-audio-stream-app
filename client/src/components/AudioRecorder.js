import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import MicRecorder from "mic-recorder-to-mp3";
const audioRecorder = new MicRecorder({ bitRate: 128 });

const AudioRecorder = () => {
  const [isMicrophoneAccessDenied, setIsMicrophoneAccessDenied] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [socket, setSocket] = useState(null);
  const [presignedUrls, setPresignedUrls] = useState([]); // To store the presigned URL
  const [disabledButtons, setDisabledButtons] = useState([]); // Manage disabled state for play buttons

  // Establish socket connection to backend
  useEffect(() => {
    const socketConnection = io("http://localhost:4000");
    setSocket(socketConnection);

    return () => {
      socketConnection.disconnect();
    };
  }, []);

  // Start recording function
  const startRecording = async () => {
    try {
      navigator.getUserMedia(
        { audio: true, video: false },
        enableMicRecording,
        disableMicRecording
      );
    } catch (e) {
      console.error("Error starting audio recording = ", e);
    }
  };

  // Enable mic recording after permission granted
  const enableMicRecording = async () => {
    console.log("Permission Granted");
    setIsMicrophoneAccessDenied(false);
    try {
      const recorder = await audioRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  // Disable mic recording after permission denied
  const disableMicRecording = async () => {
    console.log("Permission Denied");
    setIsMicrophoneAccessDenied(true);
  };

  // Stop recording function
  const stopRecording = async () => {
    if (!isRecording) {
      return;
    }
    setIsRecording(false);

    // Send stop recording signal
    if (!socket) {
      return;
    }

    try {
      // When the recording is stopped, combine chunks and send them to backend
      const [buffer, blob] = await audioRecorder.stop().getMp3();
      const audioBlob = new File(buffer, `${Date.now()}.mp3`, { type: blob.type });
      console.log("Audio file emitted successfully = ", audioBlob);

      // Send audioBuffer over WebSocket
      socket.emit("stop-recording", audioBlob);

      // Generate and store the presigned URL
      setPresignedUrls([
        ...presignedUrls,
        ...[URL.createObjectURL(audioBlob)],
      ]);
    } catch (e) {
      socket.emit("stop-recording", null);
      console.error(
        "Error getting audio file from audio recorder on recording stop = ",
        e
      );
    }
  };

  // Play the recording from the presigned URL
  const playRecording = (index) => {
    try {
      console.log(presignedUrls);
      if (presignedUrls.length) {
        // Disable the play button when clicked
        setDisabledButtons((prev) => [...prev, index]);

        const audio = new Audio(presignedUrls[index]); // Use the presigned URL for playback
        if (!audio) {
          throw new Error("Invalid audio file");
        }

        // When the audio finishes playing, re-enable the play button
        audio.onended = () => {
          setDisabledButtons((prev) => prev.filter((i) => i !== index));
        };

        audio.play();
      } else {
        throw new Error("Recording not available for playback");
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Component to display recorded list
  const RecordedList = () => {
    return (
      <div className="recorded-list">
        <h2>Recorded Files</h2>
        {presignedUrls.length > 0 ? (
          <ul className="recorded-files">
            {presignedUrls.map((url, index) => (
              <li key={index} className="recorded-file-item">
                <button
                  onClick={() => playRecording(index)}
                  disabled={disabledButtons.includes(index)} // Disable the button if it's in the disabled state
                  className="play-button"
                >
                  {disabledButtons.includes(index) ? "Playing..." : `Play Recording ${index + 1}`}
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recordings available</p>
        )}
      </div>
    );
  };

  return (
    <div className="audio-recorder">
      <h1>Audio Recorder</h1>
      <button onClick={startRecording} disabled={isRecording}>
        Start Recording
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      <RecordedList /> {/* Display the list of recorded files */}
    </div>
  );
};

export default AudioRecorder;
