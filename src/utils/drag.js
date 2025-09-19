/*
	Drag Utility
*/
export default (options = {}) => {
	let startX, startY, timeoutId;

	const {
		element,
		callback = () => {},
		startCallback = () => {},
		moveCallback = () => {},
		endCallback = () => {},
		preventScroll = false
	} = options;

	const dragMove = (event) => {
		if(preventScroll) {
			event.preventDefault(); // prevent drag scrolling
		}
		clearTimeout(timeoutId);
		const pageX = event.pageX || event.touches[0].pageX;
		const pageY = event.pageY || event.touches[0].pageY;
		const diff = {
			x: pageX - startX,
			y: pageY - startY,
			...options
		};
		callback(diff);
		moveCallback(diff);
	};

	const dragEnd = (event) => {
		clearTimeout(timeoutId);
		const pageX = event.pageX || (event.changedTouches && event.changedTouches[0].pageX) || 0;
		const pageY = event.pageY || (event.changedTouches && event.changedTouches[0].pageY) || 0;
		const diff = {
			x: pageX - startX,
			y: pageY - startY,
			...options
		};
		callback(diff);
		endCallback(diff);
		removeListeners();
	};

	const dragStart = (event) => {
		if(event.button && event.button !== 0) return; // Only left click for mouse
		
		clearTimeout(timeoutId);
		startX = event.pageX || event.touches[0].pageX;
		startY = event.pageY || event.touches[0].pageY;
		const diff = {
			x: 0,
			y: 0,
			...options
		};
		startCallback(diff);
		window.addEventListener('mousemove', dragMove, { passive: !preventScroll });
		window.addEventListener('mouseup', dragEnd, { passive: !preventScroll });
		window.addEventListener('touchmove', dragMove, { passive: !preventScroll });
		window.addEventListener('touchend', dragEnd, { passive: !preventScroll });
	};

	const removeListeners = () => {
		window.removeEventListener('mousemove', dragMove);
		window.removeEventListener('mouseup', dragEnd);
		window.removeEventListener('touchmove', dragMove);
		window.removeEventListener('touchend', dragEnd);
	};

	element.addEventListener('mousedown', dragStart, { passive: !preventScroll });
	element.addEventListener('touchstart', dragStart, { passive: !preventScroll });

	// Return cleanup function
	return () => {
		element.removeEventListener('mousedown', dragStart);
		element.removeEventListener('touchstart', dragStart);
		removeListeners();
	};
};
