const wait = (ms) => new Promise(resolve=>new Timeout(resolve,ms));
const waitFrmaes = (frameCount = 1) => {
  return new Promise((resolve) => {
    let frames = 0;

    function frameHandler() {
      frames++;

      if (frames >= frameCount) {
        resolve();
      } else {
        requestAnimationFrame(frameHandler);
      }
    }

    requestAnimationFrame(frameHandler);
  });
};