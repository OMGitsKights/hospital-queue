import { useState } from "react";
import * as AuthService from "./AuthService";

export default function Login({ onLogin, language = "en" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [registerMode, setRegisterMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (registerMode) {
        await AuthService.register(username, password, name);
      } else {
        await AuthService.login(username, password);
      }
      if (typeof onLogin === "function") onLogin();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: 420, padding: 12 }}>
      <h3>Sign in</h3>
      <form onSubmit={handleSubmit}>
        {registerMode && (
          <div>
            <input
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%", padding: 8, marginBottom: 8 }}
            />
          </div>
        )}
        <div>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
        </div>
        <div>
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 8, marginBottom: 8 }}
          />
        </div>
        <button type="submit" style={{ padding: "8px 12px" }}>
          Sign in
        </button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
      <div style={{ marginTop: 12, display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setRegisterMode(!registerMode)} style={{ padding: "6px 10px" }}>
          {registerMode ? "Switch to Sign in" : "Create account"}
        </button>
        <div style={{ marginLeft: "auto", color: "#666" }}>
          Tip: try <strong>admin/adminpass</strong> or <strong>doctor/doctorpass</strong>
        </div>
      </div>
    </div>
  );
}
