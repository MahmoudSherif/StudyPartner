// Primary-key generation.
//
// Every table in the schema declares `id uuid primary key`, and the sync layer
// sends the client-generated id along with the row so that optimistic UI state
// and the stored row share an identity. That makes the format load-bearing:
// Postgres rejects anything that is not a well-formed UUID with
// `invalid input syntax for type uuid`, which fails the whole insert.
//
// The previous implementation used `Date.now().toString()`. That is not a UUID,
// so no row was ever created; it also collides whenever two items are created
// inside the same millisecond, which a loop or a double-tap does easily.

/**
 * A RFC 4122 v4 UUID, suitable for a `uuid` primary key.
 *
 * `crypto.randomUUID` is the right answer and is available in every browser
 * this app supports -- but only in a secure context, so it is missing over
 * plain http on a LAN address during development. The fallbacks keep that case
 * working rather than breaking every write.
 */
export function newId(): string {
  const cryptoObj = globalThis.crypto

  if (typeof cryptoObj?.randomUUID === 'function') {
    return cryptoObj.randomUUID()
  }

  if (typeof cryptoObj?.getRandomValues === 'function') {
    const bytes = cryptoObj.getRandomValues(new Uint8Array(16))
    // Set the version (4) and variant (10xx) bits the spec requires.
    bytes[6] = (bytes[6] & 0x0f) | 0x40
    bytes[8] = (bytes[8] & 0x3f) | 0x80
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  }

  // Last resort: no crypto at all. Math.random() is not a CSPRNG, but these ids
  // are row identifiers, not secrets or capabilities -- nothing is authorised by
  // knowing one, because RLS scopes every query by user_id.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const rand = (Math.random() * 16) | 0
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8
    return value.toString(16)
  })
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/** True if `value` can be sent to a `uuid` column without erroring. */
export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}
