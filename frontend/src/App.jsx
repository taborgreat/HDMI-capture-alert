import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [alertActive, setAlertActive] = useState(false);
  const [timestamp, setTimestamp] = useState("");
  const [imgKey, setImgKey] = useState(Date.now());
  const [showPopup, setShowPopup] = useState(false);

  const [notifyM, setNotifyM] = useState(true);
  const [notifyT, setNotifyT] = useState(true);

  useEffect(() => {
    refresh();
    loadNotifyState();
    const timer = setInterval(refresh, 60000);
    return () => clearInterval(timer);
  }, []);

  const loadNotifyState = async () => {
    const res = await fetch("/notify-state");
    const data = await res.json();
    setNotifyM(data.notifyM);
    setNotifyT(data.notifyT);
  };

  const updateNotify = async (m, t) => {
    await fetch("/notify-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ m, t }),
    });
  };

  const refresh = async () => {
    setImgKey(Date.now());
    try {
      const res = await fetch("/status");
      const data = await res.json();
      setAlertActive(data.alertActive);
      setTimestamp(data.timestamp);
      if (data.alertActive) setShowPopup(true);
    } catch (err) {
      console.error(err);
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "12px",
        boxSizing: "border-box",
      }}
    >
      {/* Top-right hover hotspot */}
      <div
        className="notify-hotspot"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 200,
          height: 200,
          zIndex: 1100,
        }}
      >
        <div
          className="notify-panel"
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            background: "rgba(0,0,0,0.85)",
            padding: 14,
            borderRadius: 8,
            opacity: 0,
            pointerEvents: "none",
            transition: "opacity 0.2s ease",
            whiteSpace: "nowrap",
          }}
        >
          <label style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={notifyM}
              onChange={(e) => {
                const v = e.target.checked;
                setNotifyM(v);
                updateNotify(v, notifyT);
              }}
              style={{ cursor: "pointer" }}
            />
            {" "}Notify M
          </label>
          <br />
          <label style={{ cursor: "pointer", marginTop: 8, display: "inline-block" }}>
            <input
              type="checkbox"
              checked={notifyT}
              onChange={(e) => {
                const v = e.target.checked;
                setNotifyT(v);
                updateNotify(notifyM, v);
              }}
              style={{ cursor: "pointer" }}
            />
            {" "}Notify T
          </label>
        </div>
      </div>

      {showPopup && (
        <div
          style={{
            position: "fixed",
            inset: 0,
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
              padding: 40,
              borderRadius: 10,
              textAlign: "center",
              fontSize: 28,
              fontWeight: "bold",
              boxShadow: "0 0 20px red",
            }}
          >
            🚨 SOMETHING HAPPENING 🚨
            <br />
            <br />
            <button
              onClick={acknowledge}
              style={{
                padding: "12px 25px",
                fontSize: 18,
                borderRadius: 6,
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

      <p style={{ marginTop: 10, textAlign: "center", color: "gray" }}>
        {timestamp ? (
          <>
            <span style={{ fontSize: 28, color: "white" }}>
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
            <br />
            <span style={{ fontSize: 15, opacity: 0.7 }}>
              {new Date(timestamp).toLocaleDateString()}
            </span>
          </>
        ) : (
          "-"
        )}
      </p>

      <div
        style={{
          width: "100%",
          maxWidth: 1280,
          aspectRatio: "16/9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid white",
          borderRadius: 10,
          overflow: "hidden",
        }}
      >
        <img
          src={`/image/latest.jpg?cacheBust=${imgKey}`}
          alt="monitor"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain"
          }}
        />
      </div>
    </div>
  );
}

export default App;