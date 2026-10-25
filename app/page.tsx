
"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "../lib/firebase";
import {
  loginWithEmail,
  loginWithGoogle,
  logout,
  registerWithEmail,
} from "../lib/auth";
import {
  createNote,
  deleteNote,
  updateNote,
  watchNotes,
  shareNote,
  type Note,
} from "../lib/notes";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }

    return watchNotes(
      user.uid,
      setNotes,
      (error) => setMessage(error.message)
    );
  }, [user]);

  async function handleEmailAuth() {
    setBusy(true);
    setMessage("");

    try {
      if (isRegistering) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (error) {
      const firebaseError = error as { code?: string; message?: string };
      setMessage(
        `Authentication failed (${firebaseError.code || "unknown"}): ${
          firebaseError.message || "Please try again."
        }`
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setBusy(true);
    setMessage("");

    try {
      await loginWithGoogle();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Google sign-in failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleAddNote() {
    if (!user || (!title.trim() && !body.trim())) return;

    setBusy(true);
    setMessage("");

    try {
      await createNote(
  user.uid,
  title.trim() || "Untitled",
  body.trim(),
  tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean)
);
      setTitle("");
      setBody("");
      setTagsInput("");
      setMessage("Note saved to the cloud!");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save note.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteNote(noteId: string) {
    if (!user) return;

    try {
      await deleteNote(user.uid, noteId);
      setMessage("Note deleted.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not delete note.");
    }
  }

  async function handleEditNote(note: Note) {
    if (!user) return;

    const newTitle = window.prompt("Edit note title:", note.title);
    if (newTitle === null) return;

    const newBody = window.prompt("Edit note body:", note.body);
    if (newBody === null) return;

    try {
      await updateNote(user.uid, note.id, {
        title: newTitle.trim() || "Untitled",
        body: newBody,
      });
      setMessage("Note updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update note.");
    }
  }

  if (authLoading) {
    return <main style={{ padding: 32 }}>Loading...</main>;
  }

  const buttonStyle = {
    padding: "11px 16px",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    background: "#2563eb",
    color: "white",
  };

  const inputStyle = {
    display: "block",
    width: "100%",
    padding: 12,
    marginBottom: 12,
    boxSizing: "border-box" as const,
    border: "1px solid #ccc",
    borderRadius: 6,
  };

  return (
    <main
      style={{
        maxWidth: 850,
        margin: "40px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>My Cloud Notes</h1>
      <p>Create, edit, and securely store your notes in the cloud.</p>

      {message && (
        <p role="status" style={{ padding: 10, background: "#eef2ff" }}>
          {message}
        </p>
      )}

      {!user ? (
        <section
          style={{
            border: "1px solid #ddd",
            borderRadius: 12,
            padding: 20,
            marginTop: 24,
          }}
        >
          <h2>{isRegistering ? "Create your account" : "Sign in"}</h2>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleEmailAuth();
            }}
          >
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              style={inputStyle}
            />

            <label htmlFor="password">Password (at least 6 characters)</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete={isRegistering ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              style={inputStyle}
            />

            <button type="submit" disabled={busy} style={buttonStyle}>
              {busy
                ? "Please wait..."
                : isRegistering
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p>
            {isRegistering ? "Already registered?" : "New here?"}{" "}
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              style={{
                border: "none",
                background: "none",
                color: "#2563eb",
                cursor: "pointer",
              }}
            >
              {isRegistering ? "Sign in" : "Create an account"}
            </button>
          </p>

          <button
            onClick={() => void handleGoogleLogin()}
            disabled={busy}
            style={{ ...buttonStyle, background: "#333" }}
          >
            Continue with Google
          </button>
        </section>
      ) : (
        <>
          <section
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 24,
            }}
          >
            <p>Signed in as {user.email || "Google user"}</p>
            <button onClick={() => void logout()} style={buttonStyle}>
              Sign out
            </button>
          </section>

          <section
            style={{
              padding: 20,
              border: "1px solid #ddd",
              borderRadius: 12,
              marginTop: 16,
            }}
          >
            <h2>Create a note</h2>

            <input
              aria-label="Note title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Note title"
              style={inputStyle}
            />

           <textarea
  aria-label="Note body"
  value={body}
  onChange={(event) => setBody(event.target.value)}
  placeholder="Write your note here..."
  rows={5}
  style={inputStyle}
/>

<input
  aria-label="Note tags"
  value={tagsInput}
  onChange={(event) => setTagsInput(event.target.value)}
  placeholder="Tags (separate with commas, e.g. Work, Study)"
  style={inputStyle}
/>
            <button
              onClick={() => void handleAddNote()}
              disabled={busy}
              style={buttonStyle}
            >
              {busy ? "Saving..." : "Save note"}
            </button>
          </section>

          <section style={{ marginTop: 30 }}>
            <h2>Your notes ({notes.length})</h2>
            <input
  type="text"
  placeholder="Search your notes..."
  value={searchTerm}
  onChange={(event) => setSearchTerm(event.target.value)}
  style={inputStyle}
/>

            {notes.length === 0 && <p>No notes yet. Create your first note!</p>}

            {notes
  .filter((note) =>
    `${note.title} ${note.body}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )
  .map((note) => (
            
              <article
                key={note.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <h3>{note.title}</h3>
                {note.tags && note.tags.length > 0 && (
  <p style={{ color: "#2563eb", fontSize: 14 }}>
    Tags: {note.tags.join(", ")}
  </p>
)}
                
                <div style={{ marginTop: 8 }}>
  <ReactMarkdown>{note.body}</ReactMarkdown>
</div>
<div style={{ display: "flex", gap: 8 }}>
  <button
    onClick={() => void handleEditNote(note)}
    style={{
      padding: "10px 16px",
      background: "#2563eb",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
    }}
  >
    Edit
  </button>

  <button
    onClick={() => void handleDeleteNote(note.id)}
    style={{
      padding: "10px 16px",
      background: "#dc2626",
      color: "white",
      border: "none",
      borderRadius: 6,
      cursor: "pointer",
    }}
  >
    Delete
  </button>
  <button
  onClick={async () => {
    try {
      await shareNote(user.uid, note.id, 24);
      const link = `${window.location.origin}/shared/${user.uid}/${note.id}`;
      await navigator.clipboard.writeText(link);
      setMessage("Share link copied! It expires in 24 hours.");
    } catch {
      setMessage("Could not share note. Please try again.");
    }
  }}
  style={buttonStyle}
>
  Share (24h)
</button>
</div>

              </article>
            ))}
          </section>
        </>
      )}
    </main>
  );
}
