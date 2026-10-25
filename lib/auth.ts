
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { auth, googleProvider } from "./firebase";

export function registerWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export function loginWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function loginWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export function logout() {
  return signOut(auth);
}
