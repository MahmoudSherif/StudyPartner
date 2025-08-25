Firebase Cloud Functions
========================

Deployed features:
1. onTaskWrite trigger: Recomputes challenge points when any task document changes in subcollection shared-challenges/{challengeId}/tasks/{taskId}.
2. recomputeChallengePoints callable: Manual recompute by passing { challengeId }.

Local Development Steps:
1. npm install
2. (Optionally) firebase emulators:start --only functions,firestore
3. Deploy: firebase deploy --only functions

Migration Plan (array -> subcollection):
1. For each existing challenge with tasks array, write each task to shared-challenges/{id}/tasks/{taskId} doc (retain id, points, completions, completedBy).
2. Remove tasks array after validation OR keep temporarily for backward compatibility.
3. Frontend should switch to listening to subcollection; existing aggregate challenge doc will still get updated points via trigger.

Security Rules (conceptual):
match /shared-challenges/{cid}/tasks/{tid} {
  allow read: if true; // refine as needed
  allow write: if request.auth != null && (request.auth.uid in resource.data.completions.keys() || request.auth.uid == resource.data.ownerId);
}

Callable recompute: restrict to owner or admin with custom claims.
