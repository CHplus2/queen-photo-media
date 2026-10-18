// Run only in a trusted Admin SDK environment with Application Default Credentials.
// Example: node scripts/grant-owner.mjs UID owner@example.com
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
const [uid, expectedEmail] = process.argv.slice(2);
if (!uid || !expectedEmail)
  throw new Error(
    'Usage: node scripts/grant-owner.mjs UID expected-owner-email',
  );
initializeApp({
  credential: applicationDefault(),
  projectId: 'gen-lang-client-0346719757',
});
const auth = getAuth();
const user = await auth.getUser(uid);
if (user.email?.toLowerCase() !== expectedEmail.toLowerCase())
  throw new Error('Email does not match UID. No claims changed.');
await auth.setCustomUserClaims(uid, {
  ...user.customClaims,
  staff: true,
  owner: true,
});
console.log(`Owner access assigned to ${user.email}. Sign out and back in.`);
