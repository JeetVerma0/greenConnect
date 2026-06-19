const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password. Please try again.",
  "auth/user-not-found": "No account found with this email. Sign up first.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/email-already-in-use": "An account with this email already exists. Try signing in.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Wait a moment and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/operation-not-allowed": "Email sign-in is not enabled in Firebase. Enable Email/Password under Authentication → Sign-in method.",
  "auth/configuration-not-found": "Authentication is not configured. Check Firebase settings.",
  "auth/missing-password": "Please enter your password.",
  "auth/invalid-api-key": "App configuration error. Firebase API key is invalid.",
  "permission-denied":
    "Could not save your profile. Deploy Firestore rules: run `firebase deploy --only firestore:rules` from the project folder.",
  unavailable: "Firebase is temporarily unavailable. Try again in a moment.",
  unauthenticated: "You must be signed in to create a profile. Try again.",
};

function getErrorCode(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : null;
  }
  return null;
}

export function getAuthErrorMessage(error: unknown): string {
  const code = getErrorCode(error);
  if (code && AUTH_ERROR_MESSAGES[code]) {
    return AUTH_ERROR_MESSAGES[code];
  }

  if (error instanceof Error) {
    const codeMatch = error.message.match(/\(auth\/[^)]+\)/);
    if (codeMatch) {
      const authCode = codeMatch[0].slice(1, -1);
      if (AUTH_ERROR_MESSAGES[authCode]) return AUTH_ERROR_MESSAGES[authCode];
    }

    if (error.message.includes("permission-denied")) {
      return AUTH_ERROR_MESSAGES["permission-denied"];
    }

    if (error.message.includes("Firebase") && error.message.includes("apiKey")) {
      return "Firebase is not configured. Add your keys to .env.local and restart the dev server.";
    }

    return error.message;
  }

  return "Something went wrong. Please try again.";
}
