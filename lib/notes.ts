
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "./firebase";

export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  updatedAt?: unknown;
};

function notesCollection(userId: string) {
  return collection(db, "users", userId, "notes");
}

export async function createNote(
  userId: string,
  title: string,
  body: string,
  tags: string[] = []
) {
  return addDoc(notesCollection(userId), {
    title,
    body,
    tags,
    shared: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateNote(
  userId: string,
  noteId: string,
  changes: { title?: string; body?: string; tags?: string[] }
) {
  return updateDoc(doc(db, "users", userId, "notes", noteId), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteNote(userId: string, noteId: string) {
  return deleteDoc(doc(db, "users", userId, "notes", noteId));
}

export function watchNotes(
  userId: string,
  onNotes: (notes: Note[]) => void,
  onError?: (error: Error) => void
) {
  const notesQuery = query(
    notesCollection(userId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(
    notesQuery,
    (snapshot) => {
      const notes = snapshot.docs.map((noteDoc) => ({
        id: noteDoc.id,
        ...(noteDoc.data() as Omit<Note, "id">),
      }));

      onNotes(notes);
    },
    (error) => onError?.(error)
  );
}
export async function shareNote(
  userId: string,
  noteId: string,
  hours: number
) {
  return updateDoc(doc(db, "users", userId, "notes", noteId), {
    shared: true,
    shareExpiresAt: new Date(Date.now() + hours * 60 * 60 * 1000),
    updatedAt: serverTimestamp(),
  });
}