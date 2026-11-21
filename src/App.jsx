import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function App() {
  // ---------- STATE: what the page remembers ----------
  const [messages, setMessages] = useState([]); // rows from the database
  const [name, setName] = useState(""); // what's typed in the Name box
  const [text, setText] = useState(""); // what's typed in the Message box
  const [status, setStatus] = useState("Loading messages...");

  // ---------- READ: get every message, newest first ----------
  async function loadMessages() {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setStatus("Couldn't load messages: " + error.message);
      return;
    }
    setMessages(data);
    setStatus(data.length === 0 ? "No messages yet. Be the first!" : "");
  }

  // Run loadMessages once, when the page first opens
  useEffect(() => {
    if (supabase) loadMessages();
  }, []);

  // ---------- WRITE: add a new message ----------
  async function postMessage(event) {
    event.preventDefault(); // stop the browser from reloading the page
    setStatus("Saving...");

    const { error } = await supabase
      .from("messages")
      .insert({ name: name.trim(), message: text.trim() });

    if (error) {
      setStatus("Couldn't save: " + error.message);
      return;
    }
    setText(""); // clear the message box (keep the name)
    loadMessages(); // reload so the new message shows up
  }

  // ---------- Shown if .env.local is missing ----------
  if (!supabase) {
    return (
      <main className="wrap">
        <h1>Class Guestbook</h1>
        <p className="status error">
          Not connected to Supabase yet. Check your .env.local file, then
          stop and restart npm run dev.
        </p>
      </main>
    );
  }

  // ---------- What the page shows ----------
  return (
    <main className="wrap">
      <h1>Class Guestbook</h1>
      <p className="intro">Sign the guestbook. Every message is saved in Supabase.</p>

      <form className="card" onSubmit={postMessage}>
        <label htmlFor="name">Your name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
        />

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
          maxLength={500}
        />

        <button type="submit">Sign the guestbook</button>
      </form>

      {status && <p className="status">{status}</p>}

      <ul className="messages">
        {messages.map((m) => (
          <li key={m.id}>
            <div className="row-top">
              <strong>{m.name}</strong>
              <span className="when">{new Date(m.created_at).toLocaleString()}</span>
            </div>
            <p>{m.message}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}