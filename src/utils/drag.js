/*
	Drag Utility
*/
export default (options = {}) => {
	let startX, startY, timeoutId, started = false;

	const {
		element,
		callback = () => {},
		startCallback = () => {},
		moveCallback = () => {},
		endCallback = () => {},
		preventScroll = false,
		threshold = 0,
		ignore = ''
	} = options;

	const pointOf = event => event.touches?.[0] ?? event.changedTouches?.[0] ?? event;

	const diffOf = event => {
		const point = pointOf(event);
		return {
			x: (point.pageX ?? 0) - startX,
			y: (point.pageY ?? 0) - startY,
			clientX: point.clientX,
			clientY: point.clientY,
			...options
		};
	};

	const begin = diff => {
		started = true;
		startCallback({ ...diff, x: 0, y: 0 });
	};

	const dragMove = (event) => {
		if(preventScroll) {
			event.preventDefault(); // prevent drag scrolling
		}
		clearTimeout(timeoutId);
		const diff = diffOf(event);
		if(!started){
			if(Math.hypot(diff.x, diff.y) < threshold) return;
			begin(diff);
		}
		callback(diff);
		moveCallback(diff);
	};

	const dragEnd = (event) => {
		clearTimeout(timeoutId);
		if(started){
			const diff = diffOf(event);
			callback(diff);
			endCallback(diff);
		}
		started = false;
		removeListeners();
	};

	const dragStart = (event) => {
		if(event.button && event.button !== 0) return; // Only left click for mouse

		/* A press on something inside the element that does its own job (a button, a link) is that thing's, not a drag's. */
		if(ignore){
			const path = event.composedPath();
			if(path.slice(0, path.indexOf(element)).some(node => node.matches?.(ignore))) return;
		}

		clearTimeout(timeoutId);
		const point = pointOf(event);
		startX = point.pageX;
		startY = point.pageY;
		started = false;
		if(!threshold) begin({ x: 0, y: 0, clientX: point.clientX, clientY: point.clientY, ...options });
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
