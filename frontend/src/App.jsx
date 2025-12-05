import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [alertActive, setAlertActive] = useState(false);
  const [timestamp, setTimestamp] = useState("");
  const [imgKey, setImgKey] = useState(Date.now());
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, []);

  const refresh = async () => {
    setImgKey(Date.now());

    try {
      const res = await fetch("/status");
      const data = await res.json();

      setAlertActive(data.alertActive);
      setTimestamp(data.timestamp);

      // Trigger popup whenever alert starts
      if (data.alertActive) {
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Status error:", err);
    }
  };

  const acknowledge = async () => {
    await fetch("/ack", { method: "POST" });
    setAlertActive(false);
    setShowPopup(false);
  };

  return (
    <div
      style={{
        backgroundColor: alertActive ? "red" : "black",
        color: "white",
        minHeight: "100vh",
        padding: 0,
        margin: 0,
        transition: "background-color 0.4s ease",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      {/* Flashing Popup */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "flash 0.8s infinite",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#330000",
              padding: "40px",
              borderRadius: "10px",
              textAlign: "center",
              fontSize: "28px",
              fontWeight: "bold",
              color: "white",
              boxShadow: "0 0 20px red",
            }}
          >
            🚨 SOMETHING HAPPENING 🚨
            <br /><br />
            <button
              onClick={acknowledge}
              style={{
                padding: "12px 25px",
                fontSize: "18px",
                borderRadius: "6px",
                background: "white",
                color: "red",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      <h2 style={{ marginTop: "20px", color: "darkgray" }}>Flexential</h2>
      <p style={{ marginTop: "10px", textAlign: "center", color: "gray" }}>
        {timestamp ? (
          <>
            <span style={{ fontSize: "28px", color: "white" }}>
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <br />
            <span style={{ fontSize: "12px", opacity: 0.4 }}>
              {new Date(timestamp).toLocaleDateString()}
            </span>
          </>
        ) : (
          "-"
        )}
      </p>


      {/* Force 720p */}
      <div
        style={{
          width: "1280px",
          height: "720px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "black",
          marginTop: "20px",
          border: "3px solid white",
          borderRadius: "10px",
        }}
      >
        <img
          src={`/image/latest.jpg?cacheBust=${imgKey}`}
          alt="monitor"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        />
      </div>
    </div>
  );
}

export default App;
