// Deprecated: Direct Firebase integration replaced this sync layer
// This file is no longer used as components now use Firebase hooks directly

export function useFirebaseSync<T>(
  key: string,
  defaultValue: T,
  saveToFirestore: (userId: string, data: T) => Promise<void>,
  loadFromFirestore: (userId: string) => Promise<T | null>
) {
  console.warn('useFirebaseSync is deprecated - use useFirebaseData hooks directly')
  return [defaultValue, () => {}, () => {}] as const
}
