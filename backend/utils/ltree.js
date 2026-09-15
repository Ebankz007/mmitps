/**
 * ltree helpers — PostgreSQL ltree labels cannot contain hyphens.
 * Our UUID format is deterministic (00000000-xxxx-yyyy-zzzz-wwwwwwwwwwww),
 * so hyphen-stripping is reversible.
 */
const uuidToLtree = (uuid) => uuid.replace(/-/g, '');
const ltreeToUuid = (label) =>
  `${label.slice(0, 8)}-${label.slice(8, 12)}-${label.slice(12, 16)}-${label.slice(16, 20)}-${label.slice(20)}`;

/** Convert a dotted ltree path of hyphen-stripped UUIDs → dotted UUIDs. */
const ltreePathToUuids = (path) => (path || '').split('.').filter(Boolean).map(ltreeToUuid).join('.');

module.exports = { uuidToLtree, ltreeToUuid, ltreePathToUuids };