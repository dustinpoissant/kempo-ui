/*
  closestAcrossShadow

  Like Element.closest(), but it does not stop at shadow-DOM boundaries. When the
  current tree yields no match, it continues from the host of the enclosing shadow
  root and keeps walking up toward the document. Returns the nearest matching
  ancestor (or the element itself), or null if there is none.

  Useful for components nested inside another component's shadow root that need to
  locate a shared ancestor — e.g. a k-context — which native closest() can't reach.
*/
export const closestAcrossShadow = (element, selector) => {
  let node = element;
  while(node){
    const match = node.closest?.(selector);
    if(match) return match;
    const root = node.getRootNode();
    node = root instanceof ShadowRoot ? root.host : null;
  }
  return null;
};

export default closestAcrossShadow;
