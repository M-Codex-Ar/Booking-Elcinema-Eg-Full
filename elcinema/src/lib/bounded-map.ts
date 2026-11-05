/** Insert into an insertion-ordered Map and evict its oldest entry over the cap. */
export function setBounded<K, V>(map: Map<K, V>, key: K, value: V, limit: number): void {
  map.delete(key);
  map.set(key, value);
  while (map.size > limit) {
    const oldest = map.keys().next().value;
    if (oldest === undefined) return;
    map.delete(oldest);
  }
}
