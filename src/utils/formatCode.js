/*
  Format HTML Code
*/
export default (code, options = {}) => {
  if(!code) return '';
  
  const {
    indent = '  ',
    blockTags = ['div', 'p', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'form', 'fieldset', 'section', 'article', 'header', 'footer', 'nav', 'main', 'aside'],
    selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']
  } = options;
  
  let formatted = '';
  let indentLevel = 0;
  
  const isBlockTag = (tag) => {
    const tagName = tag.match(/<\/?(\w+)/)?.[1]?.toLowerCase();
    return tagName && blockTags.includes(tagName);
  };
  
  const isSelfClosingTag = (tag) => {
    const tagName = tag.match(/<(\w+)/)?.[1]?.toLowerCase();
    return (tagName && selfClosingTags.includes(tagName)) || tag.endsWith('/>');
  };
  
  const tokens = [];
  let currentPos = 0;
  const tagRegex = /<[^>]+>/g;
  let match;
  
  while((match = tagRegex.exec(code)) !== null){
    if(match.index > currentPos){
      const text = code.substring(currentPos, match.index).trim();
      if(text){
        tokens.push({type: 'text', content: text});
      }
    }
    tokens.push({type: 'tag', content: match[0]});
    currentPos = match.index + match[0].length;
  }
  
  if(currentPos < code.length){
    const text = code.substring(currentPos).trim();
    if(text){
      tokens.push({type: 'text', content: text});
    }
  }
  
  let needsNewline = false;
  
  tokens.forEach((token, index) => {
    if(token.type === 'text'){
      formatted += token.content;
      needsNewline = false;
    } else {
      const tag = token.content;
      const isClosing = tag.startsWith('</');
      const isBlock = isBlockTag(tag);
      const isSelfClosing = isSelfClosingTag(tag);
      
      if(isClosing && isBlock){
        indentLevel = Math.max(0, indentLevel - 1);
        if(needsNewline){
          formatted += '\n' + indent.repeat(indentLevel) + tag;
        } else {
          formatted += tag;
        }
        needsNewline = true;
      } else if(isBlock && !isSelfClosing){
        if(needsNewline && formatted.length > 0){
          formatted += '\n' + indent.repeat(indentLevel) + tag;
        } else if(formatted.length > 0){
          formatted += '\n' + indent.repeat(indentLevel) + tag;
        } else {
          formatted += indent.repeat(indentLevel) + tag;
        }
        indentLevel++;
        needsNewline = true;
      } else {
        formatted += tag;
        needsNewline = false;
      }
    }
  });
  
  return formatted.trim();
};
