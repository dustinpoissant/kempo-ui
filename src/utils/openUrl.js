export default (url, target) => {
  if(target === '_blank'){
    window.open(url, '_blank', 'noopener');
  } else {
    window.location.href = url;
  }
};
