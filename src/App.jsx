import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import AuthPanel from "./AuthPanel";

export default function App() {
  // ---------- STATE: what the page remembers ----------
  const [user, setUser] = useState(null); // who is logged in (null = nobody)
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

  // ---------- When the page opens ----------
  useEffect(() => {
    if (!supabase) return;
    loadMessages();

    // AUTH: Supabase tells us who is logged in now, and again
    // whenever someone logs in or out.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => data.subscription.unsubscribe(); // clean up when the page closes
  }, []);

  // ---------- WRITE: add a new message ----------
  // We don't send user_id. The database fills it in from the login.
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

  // ---------- DELETE: the database only allows deleting your own ----------
  async function deleteMessage(id) {
    const { data, error } = await supabase
      .from("messages")
      .delete()
      .eq("id", id)
      .select(); // ask for the deleted rows back, so we can tell if it worked

    if (error) {
      setStatus("Couldn't delete: " + error.message);
      return;
    }
    if (data.length === 0) {
      // RLS quietly blocked it: no error, but nothing was deleted
      setStatus("Nothing was deleted. You can only delete your own messages.");
      return;
    }
    loadMessages();
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
      <p className="intro">
        Anyone can read the guestbook. Log in to sign it. You can delete your own
        messages, but nobody else's.
      </p>

      <AuthPanel user={user} />

      {user ? (
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
      ) : (
        <p className="status">Log in or create an account to sign the guestbook.</p>
      )}

      {status && <p className="status">{status}</p>}

      <ul className="messages">
        {messages.map((m) => (
          <li key={m.id}>
            <div className="row-top">
              <strong>{m.name}</strong>
              <span className="when">{new Date(m.created_at).toLocaleString()}</span>

              {/* Only show Delete on YOUR messages. This is just convenience.
                  The REAL protection is the RLS policy in the database. */}
              {user && m.user_id === user.id && (
                <button className="small secondary" onClick={() => deleteMessage(m.id)}>
                  Delete
                </button>
              )}
            </div>
            <p>{m.message}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}