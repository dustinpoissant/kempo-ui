/*
  Undo and redo for the builder: two stacks of earlier and later pages, at most `limit` steps back. Each step is a copy
  of the page as it was before a change. Kept in memory only, so a reload clears it.
*/
export default class PageHistory {
  constructor(limit = 50) {
    this.limit = limit;
    this.past = [];
    this.future = [];
  }

  get canUndo() {
    return this.past.length > 0;
  }

  get canRedo() {
    return this.future.length > 0;
  }

  /* Records the page as it was before a change. Any redo steps are gone once the page changes. */
  push(snapshot) {
    this.past.push(snapshot);
    if(this.past.length > this.limit) this.past.shift();
    this.future = [];
  }

  /* The page to go back to, given the current one (which is kept for redo), or null. */
  undo(current) {
    if(!this.canUndo) return null;
    this.future.push(current);
    return this.past.pop();
  }

  redo(current) {
    if(!this.canRedo) return null;
    this.past.push(current);
    return this.future.pop();
  }

  clear() {
    this.past = [];
    this.future = [];
  }
}
