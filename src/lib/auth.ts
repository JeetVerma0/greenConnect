import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile, getUserProfile } from "./firestore";

export async function signUp(email: string, password: string, name: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  try {
    await updateProfile(credential.user, { displayName: name });
    await createUserProfile(credential.user.uid, {
      name,
      email,
      photoURL: credential.user.photoURL ?? undefined,
    });
  } catch (error) {
    try {
      await deleteUser(credential.user);
    } catch {
      // Auth account may need re-auth to delete; surface original error.
    }
    throw error;
  }

  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(credential.user);
  return credential.user;
}

export async function ensureUserProfile(user: FirebaseUser) {
  const existing = await getUserProfile(user.uid);
  if (existing) return existing;

  await createUserProfile(user.uid, {
    name: user.displayName ?? "Volunteer",
    email: user.email ?? "",
    photoURL: user.photoURL ?? undefined,
  });

  return getUserProfile(user.uid);
}

export async function logOut() {
  return signOut(auth);
}
