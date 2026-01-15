// Generate and persist a unique user ID in localStorage
// This allows anonymous users to have their own conversation history

const USER_ID_KEY = "alexus_user_id";

export function generateUserId(): string {
  // Generate a UUID v4
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getUserId(): string {
  if (typeof window === "undefined") {
    return "";
  }

  let userId = localStorage.getItem(USER_ID_KEY);

  if (!userId) {
    userId = generateUserId();
    localStorage.setItem(USER_ID_KEY, userId);
  }

  return userId;
}

export function clearUserId(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(USER_ID_KEY);
  }
}
