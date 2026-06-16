const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

try {
  initializeApp({
    projectId: undefined,
  });
  console.log('App initialized');
  const auth = getAuth();
  console.log('Auth initialized');
  auth.verifyIdToken('dummy').catch(e => console.error('Verify Error:', e.message));
} catch (e) {
  console.error('Error:', e.message);
}
