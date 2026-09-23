/**
 * A controlled <textarea> gives you the whole new string on every keystroke, but Yjs
 * needs delete/insert ops at specific offsets to merge correctly with remote edits.
 * This finds the common prefix/suffix between old and new and turns the (usually tiny)
 * middle difference into a single delete + insert on the shared Y.Text.
 */
export function applyTextDiff(ytext, oldStr, newStr) {
  if (oldStr === newStr) return;

  let start = 0;
  const maxStart = Math.min(oldStr.length, newStr.length);
  while (start < maxStart && oldStr[start] === newStr[start]) start++;

  let oldEnd = oldStr.length;
  let newEnd = newStr.length;
  while (oldEnd > start && newEnd > start && oldStr[oldEnd - 1] === newStr[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }

  const deleteLength = oldEnd - start;
  const inserted = newStr.slice(start, newEnd);

  if (deleteLength === 0 && inserted.length === 0) return;

  ytext.doc.transact(() => {
    if (deleteLength > 0) ytext.delete(start, deleteLength);
    if (inserted.length > 0) ytext.insert(start, inserted);
  });
}
