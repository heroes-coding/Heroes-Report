import hasher from 'fnv-plus'

export function hashString(input) {
  let ahash = hasher.hash(input, 64)
  return ahash.str()
}
