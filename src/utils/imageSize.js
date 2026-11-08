/*
  Loads an image in the browser and resolves its natural size, or null when it cannot be loaded.
*/
export default src => new Promise(resolve => {
  const image = new Image();
  image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
  image.onerror = () => resolve(null);
  image.src = src;
});
