// Deprecated: Migrated to Firebase
// This file is no longer used as we've moved from GitHub Spark KV to Firebase

export function useUserKV<T>(key: string, defaultValue: T) {
  console.warn('useUserKV is deprecated - use Firebase hooks instead')
  return [defaultValue, () => {}, () => {}] as const
}