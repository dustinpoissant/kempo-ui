import Pagination from '../../src/components/Pagination.js';

const createPagination = async (attrs = {}) => {
	const container = document.createElement('div');
	const parts = [];
	if(attrs['total-items'] !== undefined) parts.push(`total-items="${attrs['total-items']}"`);
	if(attrs['items-per-page'] !== undefined) parts.push(`items-per-page="${attrs['items-per-page']}"`);
	if(attrs.controls !== undefined) parts.push(`controls="${attrs.controls}"`);
	container.innerHTML = `<k-pagination ${parts.join(' ')}></k-pagination>`;
	document.body.appendChild(container);
	const el = container.querySelector('k-pagination');
	await el.updateComplete;
	return { container, el };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		Element Creation
	*/
	'should create pagination element': async ({pass, fail}) => {
		const { container, el } = await createPagination();
		if(!el){
			cleanup(container);
			return fail('Pagination element should be created');
		}
		if(!(el instanceof Pagination)){
			cleanup(container);
			return fail('Element should be instance of Pagination');
		}
		cleanup(container);
		pass('Pagination element created correctly');
	},

	'should have shadow root': async ({pass, fail}) => {
		const { container, el } = await createPagination();
		if(!el.shadowRoot){
			cleanup(container);
			return fail('Pagination should have shadow root');
		}
		cleanup(container);
		pass('Pagination has shadow root');
	},

	/*
		Default Values
	*/
	'should default currentPage to 1': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		if(el.currentPage !== 1){
			cleanup(container);
			return fail(`Expected currentPage to be 1, got ${el.currentPage}`);
		}
		cleanup(container);
		pass('currentPage defaults to 1');
	},

	'should default itemsPerPage to 10': async ({pass, fail}) => {
		const { container, el } = await createPagination();
		if(el.itemsPerPage !== 10){
			cleanup(container);
			return fail(`Expected itemsPerPage to be 10, got ${el.itemsPerPage}`);
		}
		cleanup(container);
		pass('itemsPerPage defaults to 10');
	},

	'should default totalItems to 0': async ({pass, fail}) => {
		const { container, el } = await createPagination();
		if(el.totalItems !== 0){
			cleanup(container);
			return fail(`Expected totalItems to be 0, got ${el.totalItems}`);
		}
		cleanup(container);
		pass('totalItems defaults to 0');
	},

	/*
		totalPages Calculation
	*/
	'should calculate totalPages correctly': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100, 'items-per-page': 10 });
		if(el.totalPages !== 10){
			cleanup(container);
			return fail(`Expected totalPages to be 10, got ${el.totalPages}`);
		}
		cleanup(container);
		pass('totalPages calculated correctly');
	},

	'should round up totalPages for uneven division': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 95, 'items-per-page': 10 });
		if(el.totalPages !== 10){
			cleanup(container);
			return fail(`Expected totalPages to be 10 for 95 items / 10 per page, got ${el.totalPages}`);
		}
		cleanup(container);
		pass('totalPages rounds up correctly');
	},

	'should return 1 totalPage when totalItems is 0': async ({pass, fail}) => {
		const { container, el } = await createPagination();
		if(el.totalPages !== 1){
			cleanup(container);
			return fail(`Expected totalPages to be 1 when no items, got ${el.totalPages}`);
		}
		cleanup(container);
		pass('totalPages is 1 when totalItems is 0');
	},

	/*
		setPage
	*/
	'should setPage to a specific page': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.setPage(5);
		if(el.currentPage !== 5){
			cleanup(container);
			return fail(`Expected currentPage to be 5 after setPage(5), got ${el.currentPage}`);
		}
		cleanup(container);
		pass('setPage navigates to given page');
	},

	'should clamp setPage to totalPages': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.setPage(100);
		if(el.currentPage !== 10){
			cleanup(container);
			return fail(`Expected currentPage to be clamped to 10, got ${el.currentPage}`);
		}
		cleanup(container);
		pass('setPage clamps to totalPages');
	},

	'should clamp setPage to 1 at minimum': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.setPage(-5);
		if(el.currentPage !== 1){
			cleanup(container);
			return fail(`Expected currentPage to be clamped to 1, got ${el.currentPage}`);
		}
		cleanup(container);
		pass('setPage clamps to 1 at minimum');
	},

	'should not fire page-change event if page did not change': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		let fired = false;
		el.addEventListener('page-change', () => { fired = true; });
		el.setPage(1);
		if(fired){
			cleanup(container);
			return fail('page-change should not fire when page is already 1');
		}
		cleanup(container);
		pass('page-change not fired when page unchanged');
	},

	'should fire page-change event when page changes': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		let eventDetail = null;
		el.addEventListener('page-change', (e) => { eventDetail = e.detail; });
		el.setPage(3);
		if(!eventDetail){
			cleanup(container);
			return fail('page-change event should have fired');
		}
		if(eventDetail.currentPage !== 3){
			cleanup(container);
			return fail(`Expected event detail currentPage to be 3, got ${eventDetail.currentPage}`);
		}
		cleanup(container);
		pass('page-change fires with correct detail');
	},

	/*
		nextPage / previousPage
	*/
	'should nextPage increment current page': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.setPage(3);
		el.nextPage();
		if(el.currentPage !== 4){
			cleanup(container);
			return fail(`Expected currentPage to be 4 after nextPage, got ${el.currentPage}`);
		}
		cleanup(container);
		pass('nextPage increments current page');
	},

	'should nextPage not exceed totalPages': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.setPage(10);
		el.nextPage();
		if(el.currentPage !== 10){
			cleanup(container);
			return fail(`Expected currentPage to stay at 10 on last page, got ${el.currentPage}`);
		}
		cleanup(container);
		pass('nextPage does not exceed totalPages');
	},

	'should previousPage decrement current page': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.setPage(5);
		el.previousPage();
		if(el.currentPage !== 4){
			cleanup(container);
			return fail(`Expected currentPage to be 4 after previousPage, got ${el.currentPage}`);
		}
		cleanup(container);
		pass('previousPage decrements current page');
	},

	'should previousPage not go below 1': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.previousPage();
		if(el.currentPage !== 1){
			cleanup(container);
			return fail(`Expected currentPage to stay at 1 when on first page, got ${el.currentPage}`);
		}
		cleanup(container);
		pass('previousPage does not go below 1');
	},

	/*
		itemsPerPage changes
	*/
	'should reset to page 1 when itemsPerPage changes': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.setPage(5);
		await el.updateComplete;
		el.itemsPerPage = 25;
		await el.updateComplete;
		if(el.currentPage !== 1){
			cleanup(container);
			return fail(`Expected currentPage to reset to 1 when itemsPerPage changes, got ${el.currentPage}`);
		}
		cleanup(container);
		pass('currentPage resets to 1 when itemsPerPage changes');
	},

	'should fire page-change when itemsPerPage changes': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.setPage(5);
		await el.updateComplete;
		let fired = false;
		el.addEventListener('page-change', () => { fired = true; });
		el.itemsPerPage = 25;
		await el.updateComplete;
		if(!fired){
			cleanup(container);
			return fail('page-change should fire when itemsPerPage changes');
		}
		cleanup(container);
		pass('page-change fires when itemsPerPage changes');
	},

	/*
		totalItems changes
	*/
	'should clamp page when totalItems decreases': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.setPage(10);
		await el.updateComplete;
		el.totalItems = 30;
		await el.updateComplete;
		if(el.currentPage > el.totalPages){
			cleanup(container);
			return fail(`currentPage ${el.currentPage} should not exceed totalPages ${el.totalPages}`);
		}
		cleanup(container);
		pass('currentPage clamped when totalItems decreases');
	},

	/*
		Preconfigured control sets
	*/
	'simple controls should render prev, page-info, and next': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 50, controls: 'simple' });
		await el.updateComplete;
		const sr = el.shadowRoot;
		const hasPrev = !!sr.querySelector('k-pg-prev');
		const hasInfo = !!sr.querySelector('k-pg-page-info');
		const hasNext = !!sr.querySelector('k-pg-next');
		const hasFirst = !!sr.querySelector('k-pg-first');
		const hasLast = !!sr.querySelector('k-pg-last');
		cleanup(container);
		if(!hasPrev || !hasInfo || !hasNext) return fail('simple set missing required controls');
		if(hasFirst || hasLast) return fail('simple set should not include first/last controls');
		pass('simple control set renders correct controls');
	},

	'full controls should render first, prev, goto-page, next, last, and items-per-page': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 50, controls: 'full' });
		await el.updateComplete;
		const sr = el.shadowRoot;
		const hasFirst = !!sr.querySelector('k-pg-first');
		const hasPrev = !!sr.querySelector('k-pg-prev');
		const hasGoto = !!sr.querySelector('k-pg-goto-page');
		const hasNext = !!sr.querySelector('k-pg-next');
		const hasLast = !!sr.querySelector('k-pg-last');
		const hasIpp = !!sr.querySelector('k-pg-items-per-page');
		const hasPageInfo = !!sr.querySelector('k-pg-page-info');
		cleanup(container);
		if(!hasFirst || !hasPrev || !hasGoto || !hasNext || !hasLast || !hasIpp) return fail('full set missing required controls');
		if(hasPageInfo) return fail('full set should use goto-page instead of page-info');
		pass('full control set renders correct controls');
	},

	/*
		Event detail contents
	*/
	'should include full state in page-change detail': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100, 'items-per-page': 10 });
		let detail = null;
		el.addEventListener('page-change', (e) => { detail = e.detail; });
		el.setPage(3);
		if(!detail || detail.currentPage !== 3 || detail.totalPages !== 10 || detail.itemsPerPage !== 10 || detail.totalItems !== 100){
			cleanup(container);
			return fail(`page-change detail is incomplete or incorrect: ${JSON.stringify(detail)}`);
		}
		cleanup(container);
		pass('page-change detail contains full pagination state');
	}
};
