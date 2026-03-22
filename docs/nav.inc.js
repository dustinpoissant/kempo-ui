import debounce from './src/utils/debounce.js';

document.getElementById('toggleNavSideMenu').addEventListener('click', async () => {
	await window.customElements.whenDefined('k-aside');
	document.getElementById('navSideMenu').toggle();
});

document.addEventListener('click', function(e) {
	if(e.target.matches('a[href^="#"]')) {
		e.preventDefault();
		const targetId = e.target.getAttribute('href').replace('#', '');
		const target = document.getElementById(targetId);
		if(target) {
			target.scrollIntoView({ behavior: 'smooth' });
			const url = window.location.pathname + window.location.search + '#' + targetId;
			history.replaceState(null, '', url);
		}
	}
});

/*
	Nav Search
*/
const searchInput = document.getElementById('navSearchInput');
const searchDropdown = document.getElementById('navSearchDropdown');
let navSearchList = null;

const openSearch = async () => {
	await customElements.whenDefined('k-filter-list');
	if(!navSearchList) navSearchList = document.getElementById('navSearchList');
	navSearchList.filter(searchInput.value);
	searchDropdown.hidden = false;
};

const closeSearch = () => {
	searchDropdown.hidden = true;
	navSearchList?.clearFocus();
};

searchInput.addEventListener('focus', openSearch);

searchInput.addEventListener('input', debounce(e => {
	navSearchList?.filter(e.target.value);
}, 150));

searchInput.addEventListener('keydown', e => {
	if(e.key === 'Escape') {
		searchInput.value = '';
		searchInput.blur();
		closeSearch();
	} else if(e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
		navSearchList?.handleKeydown(e);
	}
});

searchInput.addEventListener('blur', () => {
	setTimeout(closeSearch, 150);
});

document.addEventListener('keydown', e => {
	const active = document.activeElement;
	const tag = active?.tagName;
	if(tag === 'INPUT' || tag === 'TEXTAREA' || active?.isContentEditable) return;
	if(e.metaKey || e.ctrlKey || e.altKey) return;
	if(e.key.length === 1) {
		searchInput.focus();
		// Don't preventDefault — let the keystroke land in the input naturally
	}
});