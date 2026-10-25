
"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import { db } from "@/lib/firebase";

type SharedNote = {
  title?: string;
  body?: string;
  shared?: boolean;
  shareExpiresAt?: { toDate?: () => Date };
};

export default function SharedNotePage({
  params,
}: {
  params: Promise<{ userId: string; noteId: string }>;
}) {
  const [note, setNote] = useState<SharedNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadNote() {
      try {
        const { userId, noteId } = await params;
        const noteRef = doc(db, "users", userId, "notes", noteId);
        const snapshot = await getDoc(noteRef);

        if (!active) return;

        if (!snapshot.exists()) {
          setError("This note is unavailable or the share link has expired.");
          return;
        }

        const data = snapshot.data() as SharedNote;
        const expiry = data.shareExpiresAt?.toDate?.();

        if (
          data.shared !== true ||
          !expiry ||
          expiry.getTime() <= Date.now()
        ) {
          setError("This note is not shared or its link has expired.");
          return;
        }

        setNote(data);
      } catch {
        if (active) {
          setError("Unable to open this note. The link may be invalid or expired.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadNote();

    return () => {
      active = false;
    };
  }, [params]);

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "40px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Shared Note</h1>

      {loading && <p>Loading note...</p>}
      {error && <p>{error}</p>}

      {note && (
        <article>
          <h2>{note.title || "Untitled"}</h2>
          <ReactMarkdown>{note.body || ""}</ReactMarkdown>
          <p style={{ color: "#666", fontSize: 13 }}>
            This is a read-only shared note.
          </p>
        </article>
      )}
    </main>
  );
}
