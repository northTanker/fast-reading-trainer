const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

try {
  initializeApp({
    projectId: 'test-project',
  });
  console.log('App initialized');
  const auth = getAuth();
  console.log('Auth initialized');
} catch (e) {
  console.error('Error:', e);
}
