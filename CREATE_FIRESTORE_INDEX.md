# Firestore Index Creation Guide

## Missing Index for Discoverable Challenges

The application requires a Firestore index for the discoverable challenges query. While the app will work without this index (using a fallback query), creating the index will improve performance.

### Automatic Index Creation

1. **Click the link in the console error** (if you see it):
   ```
   https://console.firebase.google.com/v1/r/project/motivemate-6c846/firestore/indexes?create_composite=Clpwcm9qZWN0cy9tb3RpdmVtYXRlLTZjODQ2L2RhdGFiYXNlcy8oZGVmYXVsdCkvY29sbGVjdGlvbkdyb3Vwcy9zaGFyZWQtY2hhbGxlbmdlcy9pbmRleGVzL18QARoMCghpc0FjdGl2ZRABGg0KCWNyZWF0ZWRBdBACGgwKCF9fbmFtZV9fEAI
   ```

2. **Or manually create the index**:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project: `motivemate-6c846`
   - Navigate to Firestore Database
   - Click on "Indexes" tab
   - Click "Create Index"

### Index Configuration

**Collection ID:** `shared-challenges`

**Fields to index:**
1. `isActive` (Ascending)
2. `createdAt` (Descending)
3. `__name__` (Ascending)

**Query scope:** Collection

### Alternative: Manual Creation

If the automatic link doesn't work, create the index manually:

1. **Collection:** `shared-challenges`
2. **Fields:**
   - Field path: `isActive`, Order: `Ascending`
   - Field path: `createdAt`, Order: `Descending`
   - Field path: `__name__`, Order: `Ascending`

### Index Status

- **Building:** The index is being created (may take a few minutes)
- **Enabled:** The index is ready and queries will use it
- **Error:** There was an issue creating the index

### Fallback Behavior

The application includes a fallback mechanism that will work without this index:
- It fetches all challenges and filters them client-side
- Performance may be slower with many challenges
- All functionality remains available

### Verification

After creating the index, you should see:
- No more console errors about missing indexes
- Faster loading of discoverable challenges
- The console message: `📊 Total discoverable challenges found: X` (instead of the fallback message) 