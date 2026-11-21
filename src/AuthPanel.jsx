import { useState } from "react";
import { supabase } from "./supabaseClient";

// The login / create-account form, or "Logged in as ..." once signed in
export default function AuthPanel({ user }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [note, setNote] = useState("");

  // ---------- Log in with an existing account ----------
  async function logIn(event) {
    event.preventDefault();
    setNote("Logging in...");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setNote(error.message);
      return;
    }
    setNote("");
    setPassword("");
  }

  // ---------- Create a brand-new account ----------
  async function signUp(event) {
    if (!event.currentTarget.form.reportValidity()) return; // boxes filled in?
    setNote("Creating account...");
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) {
      setNote(error.message);
    } else if (!data.session) {
      // Happens when "Confirm email" is turned ON in Supabase
      setNote("Check your email for a confirmation link, then log in.");
    } else {
      setNote("");
      setPassword("");
    }
  }

  // ---------- Already logged in ----------
  if (user) {
    return (
      <div className="card who">
        <span>
          Logged in as <strong>{user.email}</strong>
        </span>
        <button type="button" className="small secondary" onClick={() => supabase.auth.signOut()}>
          Log out
        </button>
      </div>
    );
  }

  // ---------- Not logged in ----------
  return (
    <form className="card" onSubmit={logIn}>
      <label htmlFor="email">Email</label>
      <input
        id="email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label htmlFor="password">Password (6+ characters)</label>
      <input
        id="password"
        type="password"
        required
        minLength={6}
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <div className="actions">
        <button type="submit">Log in</button>
        <button type="button" className="secondary" onClick={signUp}>
          Create account
        </button>
      </div>

      {note && <p className="status">{note}</p>}
    </form>
  );
}