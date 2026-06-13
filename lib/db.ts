import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  orderBy
} from "firebase/firestore";
import type { SessionRecord, GamificationData, SavedText } from "@/types";

// Function to migrate local data to Firestore on first login
export async function syncLocalStorageToCloud(userId: string) {
  try {
    // 1. Sync Gamification Data
    const localGamificationStr = localStorage.getItem("gamification-data");
    if (localGamificationStr) {
      const localGamification: GamificationData = JSON.parse(localGamificationStr);
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // First time login, move local data to cloud
        await setDoc(userRef, { gamification: localGamification });
      } else {
        // If cloud exists, we might want to merge, but for now we keep cloud as source of truth
        // or update local with cloud. We will just leave cloud as is if it exists.
        const cloudData = userDoc.data()?.gamification;
        if (cloudData) {
          localStorage.setItem("gamification-data", JSON.stringify(cloudData));
        }
      }
    } else {
      // If no local data, fetch cloud data and set to local
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists() && userDoc.data()?.gamification) {
        localStorage.setItem("gamification-data", JSON.stringify(userDoc.data()?.gamification));
      }
    }

    // 2. Sync History
    const localHistoryStr = localStorage.getItem("reading-history");
    if (localHistoryStr) {
      const localHistory: SessionRecord[] = JSON.parse(localHistoryStr);
      
      // Batch write could be better but let's do simple sequential write for now
      // Check if user has history in cloud
      const historyQuery = query(collection(db, "users", userId, "history"));
      const historyDocs = await getDocs(historyQuery);
      
      if (historyDocs.empty && localHistory.length > 0) {
        // Upload local history
        for (const record of localHistory) {
          await setDoc(doc(db, "users", userId, "history", record.id), record);
        }
      } else if (!historyDocs.empty) {
        // Pull cloud history to local
        const cloudHistory = historyDocs.docs.map(d => d.data() as SessionRecord);
        localStorage.setItem("reading-history", JSON.stringify(cloudHistory));
      }
    } else {
      // Pull from cloud
      const historyQuery = query(collection(db, "users", userId, "history"));
      const historyDocs = await getDocs(historyQuery);
      if (!historyDocs.empty) {
        const cloudHistory = historyDocs.docs.map(d => d.data() as SessionRecord);
        localStorage.setItem("reading-history", JSON.stringify(cloudHistory));
      }
    }

    // Trigger local storage event so UI updates
    window.dispatchEvent(new Event('storage'));
    
  } catch (error) {
    console.error("Error syncing data:", error);
  }
}

export async function saveSessionToCloud(userId: string, session: SessionRecord) {
  try {
    const sessionRef = doc(db, "users", userId, "history", session.id);
    await setDoc(sessionRef, session);
  } catch (error) {
    console.error("Error saving session to cloud:", error);
  }
}

export async function syncGamificationToCloud(userId: string, data: GamificationData) {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, { gamification: data }, { merge: true });
  } catch (error) {
    console.error("Error syncing gamification to cloud:", error);
  }
}

// AI Text Library Functions
export async function saveAIText(userId: string, textData: Omit<SavedText, 'id' | 'createdAt'>) {
  try {
    const id = Date.now().toString();
    const newText: SavedText = {
      ...textData,
      id,
      createdAt: new Date().toISOString()
    };
    
    const textRef = doc(db, "users", userId, "library", id);
    await setDoc(textRef, newText);
    return newText;
  } catch (error) {
    console.error("Error saving AI text:", error);
    throw error;
  }
}

export async function getUserLibrary(userId: string): Promise<SavedText[]> {
  try {
    const libraryQuery = query(
      collection(db, "users", userId, "library"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(libraryQuery);
    return snapshot.docs.map(d => d.data() as SavedText);
  } catch (error) {
    console.error("Error fetching library:", error);
    return [];
  }
}

export async function deleteAIText(userId: string, textId: string) {
  try {
    // Implement delete if needed later
    console.log("Delete text", textId);
  } catch (error) {
    console.error("Error deleting AI text:", error);
    throw error;
  }
}
