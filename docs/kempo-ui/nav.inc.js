document.getElementById('toggleNavSideMenu').addEventListener('click', async () => {
	await window.customElements.whenDefined('k-side-menu');
	document.getElementById('navSideMenu').toggle();
});