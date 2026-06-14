import { db } from "./firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  query,
  orderBy,
  deleteDoc
} from "firebase/firestore";
import type { SessionRecord, GamificationData, SavedText } from "@/types";

// Function to migrate local data to Firestore on first login
export async function syncLocalStorageToCloud(userId: string) {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    // 1. Sync Gamification Data
    const localGamificationStr = localStorage.getItem("gamification-data");
    let mergedGamification: GamificationData | null = null;
    
    if (localGamificationStr) {
      const localGamification: GamificationData = JSON.parse(localGamificationStr);
      if (userDoc.exists() && userDoc.data()?.gamification) {
        const cloudGamification: GamificationData = userDoc.data()?.gamification;
        // Merge: pick the one with more words read, or a more sophisticated merge
        mergedGamification = localGamification.totalWordsRead > cloudGamification.totalWordsRead 
          ? localGamification 
          : cloudGamification;
      } else {
        mergedGamification = localGamification;
      }
    } else if (userDoc.exists() && userDoc.data()?.gamification) {
      mergedGamification = userDoc.data()?.gamification;
    }

    if (mergedGamification) {
      localStorage.setItem("gamification-data", JSON.stringify(mergedGamification));
      await setDoc(userRef, { gamification: mergedGamification }, { merge: true });
    }

    // 2. Sync History
    const localHistoryStr = localStorage.getItem("reading-history");
    const localHistory: SessionRecord[] = localHistoryStr ? JSON.parse(localHistoryStr) : [];
    
    const historyQuery = query(collection(db, "users", userId, "history"));
    const historyDocs = await getDocs(historyQuery);
    const cloudHistory = historyDocs.docs.map(d => d.data() as SessionRecord);

    // Merge history by ID
    const historyMap = new Map<string, SessionRecord>();
    cloudHistory.forEach(record => historyMap.set(record.id, record));
    localHistory.forEach(record => historyMap.set(record.id, record)); // local overrides cloud if duplicate ID
    
    const mergedHistory = Array.from(historyMap.values()).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    localStorage.setItem("reading-history", JSON.stringify(mergedHistory));

    // Upload any items that are in local but not in cloud
    const cloudIds = new Set(cloudHistory.map(r => r.id));
    for (const record of mergedHistory) {
      if (!cloudIds.has(record.id)) {
        await setDoc(doc(db, "users", userId, "history", record.id), record);
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
    const id = crypto.randomUUID();
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
    const textRef = doc(db, "users", userId, "library", textId);
    await deleteDoc(textRef);
  } catch (error) {
    console.error("Error deleting AI text:", error);
    throw error;
  }
}
