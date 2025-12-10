// test for CI/CD

import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    // temporary local URL – later change to EC2 URL
    fetch("http://localhost:3000/api/hello")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Failed to fetch from backend"));
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", textAlign: "center", marginTop: "3rem" }}>
      <h1>Cloud Demo App</h1>
      <p>Backend says: <strong>{message}</strong></p>
    </div>
  );
}

export default App;
