import Pagination from '../../src/components/Pagination.js';

const createPagination = async (attrs = {}) => {
	const container = document.createElement('div');
	const parts = [];
	if(attrs['total-items'] !== undefined) parts.push(`total-items="${attrs['total-items']}"`);
	if(attrs['items-per-page'] !== undefined) parts.push(`items-per-page="${attrs['items-per-page']}"`);
	if(attrs.page !== undefined) parts.push(`page="${attrs.page}"`);
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
		if(el.page !== 1){
			cleanup(container);
			return fail(`Expected currentPage to be 1, got ${el.page}`);
		}
		cleanup(container);
		pass('currentPage defaults to 1');
	},

	'should set initial page via page attribute': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100, page: 3 });
		if(el.page !== 3){
			cleanup(container);
			return fail(`Expected currentPage to be 3 from page attribute, got ${el.page}`);
		}
		cleanup(container);
		pass('page attribute sets initial currentPage');
	},

	'should clamp page when set directly out of range': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.page = 999;
		await el.updateComplete;
		if(el.page !== 10){
			cleanup(container);
			return fail(`Expected page to clamp to 10, got ${el.page}`);
		}
		el.page = -5;
		await el.updateComplete;
		if(el.page !== 1){
			cleanup(container);
			return fail(`Expected page to clamp to 1, got ${el.page}`);
		}
		cleanup(container);
		pass('direct page assignment clamps to valid range');
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
	'should navigate to a specific page': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.page = 5;
		await el.updateComplete;
		if(el.page !== 5){
			cleanup(container);
			return fail(`Expected page to be 5, got ${el.page}`);
		}
		cleanup(container);
		pass('page assignment navigates to given page');
	},

	'should clamp page to totalPages': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.page = 100;
		await el.updateComplete;
		if(el.page !== 10){
			cleanup(container);
			return fail(`Expected page to be clamped to 10, got ${el.page}`);
		}
		cleanup(container);
		pass('page clamps to totalPages');
	},

	'should clamp page to 1 at minimum': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.page = -5;
		await el.updateComplete;
		if(el.page !== 1){
			cleanup(container);
			return fail(`Expected page to be clamped to 1, got ${el.page}`);
		}
		cleanup(container);
		pass('page clamps to 1 at minimum');
	},

	'should not fire page-change event if page did not change': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		let fired = false;
		el.addEventListener('page-change', () => { fired = true; });
		el.page = 1;
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
		el.page = 3;
		await el.updateComplete;
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
		el.page = 3;
		await el.updateComplete;
		el.nextPage();
		await el.updateComplete;
		if(el.page !== 4){
			cleanup(container);
			return fail(`Expected currentPage to be 4 after nextPage, got ${el.page}`);
		}
		cleanup(container);
		pass('nextPage increments current page');
	},

	'should nextPage not exceed totalPages': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.page = 10;
		await el.updateComplete;
		el.nextPage();
		await el.updateComplete;
		if(el.page !== 10){
			cleanup(container);
			return fail(`Expected currentPage to stay at 10 on last page, got ${el.page}`);
		}
		cleanup(container);
		pass('nextPage does not exceed totalPages');
	},

	'should previousPage decrement current page': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.page = 5;
		await el.updateComplete;
		el.previousPage();
		await el.updateComplete;
		if(el.page !== 4){
			cleanup(container);
			return fail(`Expected currentPage to be 4 after previousPage, got ${el.page}`);
		}
		cleanup(container);
		pass('previousPage decrements current page');
	},

	'should previousPage not go below 1': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.previousPage();
		await el.updateComplete;
		if(el.page !== 1){
			cleanup(container);
			return fail(`Expected currentPage to stay at 1 when on first page, got ${el.page}`);
		}
		cleanup(container);
		pass('previousPage does not go below 1');
	},

	/*
		itemsPerPage changes
	*/
	'should reset to page 1 when itemsPerPage changes': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.page = 1;
		await el.updateComplete;
		el.itemsPerPage = 25;
		await el.updateComplete;
		if(el.page !== 1){
			cleanup(container);
			return fail(`Expected page to stay at 1 when itemsPerPage changes from page 1, got ${el.page}`);
		}
		cleanup(container);
		pass('page stays at 1 when changing itemsPerPage from page 1');
	},

	'should adjust page when itemsPerPage changes': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.page = 5;
		await el.updateComplete;
		let eventFired = false;
		let eventDetail = null;
		el.addEventListener('page-change', (e) => { eventFired = true; eventDetail = e.detail; });
		el.itemsPerPage = 25;
		await el.updateComplete;
		if(!eventFired){
			cleanup(container);
			return fail('page-change should fire when itemsPerPage changes and page adjusts');
		}
		if(el.page !== eventDetail.currentPage){
			cleanup(container);
			return fail(`page should be ${eventDetail.currentPage}, got ${el.page}`);
		}
		cleanup(container);
		pass('page adjusts and page-change fires when itemsPerPage changes');
	},

	'should keep same first item on page when itemsPerPage changes': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100, 'items-per-page': 10 });
		el.page = 2;
		await el.updateComplete;
		const firstItemOldSize = (el.page - 1) * 10 + 1;
		if(firstItemOldSize !== 11){
			cleanup(container);
			return fail(`Expected first item to be 11, got ${firstItemOldSize}`);
		}
		el.itemsPerPage = 5;
		await el.updateComplete;
		const firstItemNewSize = (el.page - 1) * 5 + 1;
		if(firstItemNewSize !== 11){
			cleanup(container);
			return fail(`Expected first item to still be 11 after size change, but got ${firstItemNewSize} on page ${el.page}`);
		}
		cleanup(container);
		pass('User stays viewing the same first item when itemsPerPage changes');
	},

	/*
		totalItems changes
	*/
	'should clamp page when totalItems decreases': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 100 });
		el.page = 10;
		await el.updateComplete;
		el.totalItems = 30;
		await el.updateComplete;
		if(el.page > el.totalPages){
			cleanup(container);
			return fail(`currentPage ${el.page} should not exceed totalPages ${el.totalPages}`);
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
		const hasPrev = !!sr.querySelector('kc-pg-prev');
		const hasInfo = !!sr.querySelector('kc-pg-page-info');
		const hasNext = !!sr.querySelector('kc-pg-next');
		const hasFirst = !!sr.querySelector('kc-pg-first');
		const hasLast = !!sr.querySelector('kc-pg-last');
		cleanup(container);
		if(!hasPrev || !hasInfo || !hasNext) return fail('simple set missing required controls');
		if(hasFirst || hasLast) return fail('simple set should not include first/last controls');
		pass('simple control set renders correct controls');
	},

	'full controls should render first, prev, goto-page, next, last, and items-per-page': async ({pass, fail}) => {
		const { container, el } = await createPagination({ 'total-items': 50, controls: 'full' });
		await el.updateComplete;
		const sr = el.shadowRoot;
		const hasFirst = !!sr.querySelector('kc-pg-first');
		const hasPrev = !!sr.querySelector('kc-pg-prev');
		const hasGoto = !!sr.querySelector('kc-pg-goto-page');
		const hasNext = !!sr.querySelector('kc-pg-next');
		const hasLast = !!sr.querySelector('kc-pg-last');
		const hasIpp = !!sr.querySelector('kc-pg-items-per-page');
		const hasPageInfo = !!sr.querySelector('kc-pg-page-info');
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
		el.page = 3;
		await el.updateComplete;
		if(!detail || detail.currentPage !== 3 || detail.totalPages !== 10 || detail.itemsPerPage !== 10 || detail.totalItems !== 100){
			cleanup(container);
			return fail(`page-change detail is incomplete or incorrect: ${JSON.stringify(detail)}`);
		}
		cleanup(container);
		pass('page-change detail contains full pagination state');
	},
};


