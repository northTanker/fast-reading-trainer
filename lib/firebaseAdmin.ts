import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export function getAdminAuth() {
  if (!getApps().length) {
    try {
      initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
    }
  }
  return getAuth();
}
