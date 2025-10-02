const toTitleCase = str =>
  str
    .replace(/([A-Z])/g, ' $1')
    .split(/[\s_-]+/)
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

export default toTitleCase;