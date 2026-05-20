import '../../../src/components/controls/TcFirstPage.js';
import '../../../src/components/controls/TcLastPage.js';
import '../../../src/components/controls/TcNextPage.js';
import '../../../src/components/controls/TcPrevPage.js';
import '../../../src/components/controls/TcPageSelect.js';
import '../../../src/components/controls/TcPageSize.js';
import '../../../src/components/Table.js';

const sampleRecords = [];
for(let i = 1; i <= 50; i++){
	sampleRecords.push({ id: i, name: `User ${i}`, value: i * 10 });
}

const createTableWithControl = async (controlTag) => {
	const container = document.createElement('div');
	container.innerHTML = `
		<k-table>
			<div slot="controls">
				<${controlTag}></${controlTag}>
			</div>
		</k-table>
	`;
	document.body.appendChild(container);
	
	const table = container.querySelector('k-table');
	table.pageSize = 10;
	table.setRecords([...sampleRecords]);
	await table.updateComplete;
	
	const control = container.querySelector(controlTag);
	await control.updateComplete;
	
	return { container, table, control };
};

const cleanup = (container) => {
	if(container && container.parentNode){
		container.parentNode.removeChild(container);
	}
};

export default {
	/*
		FirstPage Tests
	*/
	'FirstPage: should render first page button': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-first-page');
		
		const btn = control;
		if(!btn){
			cleanup(container);
			fail('FirstPage should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="chevron-line"]');
		if(!icon || icon.getAttribute('direction') !== 'left'){
			cleanup(container);
			fail('FirstPage should have chevron-line icon with direction="left"');
			return;
		}
		
		cleanup(container);
		pass('FirstPage renders correctly');
	},

	'FirstPage: should be disabled on first page': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-first-page');
		
		table.currentPage = 1;
		await table.updateComplete;
		await control.updateComplete;
		
		const btn = control;
		if(!btn.disabled){
			cleanup(container);
			fail('FirstPage button should be disabled on page 1');
			return;
		}
		
		cleanup(container);
		pass('FirstPage is disabled on first page');
	},

	'FirstPage: should be enabled on other pages': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-first-page');
		
		table.setPage(3);
		await table.updateComplete;
		await control.updateComplete;
		
		const btn = control;
		if(btn.disabled){
			cleanup(container);
			fail('FirstPage button should be enabled on page 3');
			return;
		}
		
		cleanup(container);
		pass('FirstPage is enabled on other pages');
	},

	'FirstPage: should navigate to first page on click': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-first-page');
		
		table.setPage(3);
		await table.updateComplete;
		
		const btn = control;
		btn.click();
		await table.updateComplete;
		
		if(table.getCurrentPage() !== 1){
			cleanup(container);
			fail(`Expected page 1, got ${table.getCurrentPage()}`);
			return;
		}
		
		cleanup(container);
		pass('FirstPage navigates to first page');
	},

	/*
		LastPage Tests
	*/
	'LastPage: should render last page button': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-last-page');
		
		const btn = control;
		if(!btn){
			cleanup(container);
			fail('LastPage should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="chevron-line"]');
		if(!icon){
			cleanup(container);
			fail('LastPage should have chevron-line icon');
			return;
		}
		
		cleanup(container);
		pass('LastPage renders correctly');
	},

	'LastPage: should be disabled on last page': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-last-page');
		
		const totalPages = table.getTotalPages();
		table.setPage(totalPages);
		await table.updateComplete;
		await control.updateComplete;
		
		const btn = control;
		if(!btn.disabled){
			cleanup(container);
			fail('LastPage button should be disabled on last page');
			return;
		}
		
		cleanup(container);
		pass('LastPage is disabled on last page');
	},

	'LastPage: should be enabled on other pages': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-last-page');
		
		table.setPage(1);
		await table.updateComplete;
		await control.updateComplete;
		
		const btn = control;
		if(btn.disabled){
			cleanup(container);
			fail('LastPage button should be enabled on page 1');
			return;
		}
		
		cleanup(container);
		pass('LastPage is enabled on other pages');
	},

	'LastPage: should navigate to last page on click': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-last-page');
		
		table.setPage(1);
		await table.updateComplete;
		
		const totalPages = table.getTotalPages();
		const btn = control;
		btn.click();
		await table.updateComplete;
		
		if(table.getCurrentPage() !== totalPages){
			cleanup(container);
			fail(`Expected page ${totalPages}, got ${table.getCurrentPage()}`);
			return;
		}
		
		cleanup(container);
		pass('LastPage navigates to last page');
	},

	/*
		NextPage Tests
	*/
	'NextPage: should render next page button': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-next-page');
		
		const btn = control;
		if(!btn){
			cleanup(container);
			fail('NextPage should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="chevron"]');
		if(!icon){
			cleanup(container);
			fail('NextPage should have chevron icon');
			return;
		}
		
		cleanup(container);
		pass('NextPage renders correctly');
	},

	'NextPage: should be disabled on last page': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-next-page');
		
		const totalPages = table.getTotalPages();
		table.setPage(totalPages);
		await table.updateComplete;
		await control.updateComplete;
		
		const btn = control;
		if(!btn.disabled){
			cleanup(container);
			fail('NextPage button should be disabled on last page');
			return;
		}
		
		cleanup(container);
		pass('NextPage is disabled on last page');
	},

	'NextPage: should advance page on click': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-next-page');
		
		table.setPage(1);
		await table.updateComplete;
		
		const btn = control;
		btn.click();
		await table.updateComplete;
		
		if(table.getCurrentPage() !== 2){
			cleanup(container);
			fail(`Expected page 2, got ${table.getCurrentPage()}`);
			return;
		}
		
		cleanup(container);
		pass('NextPage advances to next page');
	},

	/*
		PrevPage Tests
	*/
	'PrevPage: should render prev page button': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-prev-page');
		
		const btn = control;
		if(!btn){
			cleanup(container);
			fail('PrevPage should render button');
			return;
		}
		
		const icon = control.shadowRoot.querySelector('k-icon[name="chevron"]');
		if(!icon || icon.getAttribute('direction') !== 'left'){
			cleanup(container);
			fail('PrevPage should have chevron icon with direction="left"');
			return;
		}
		
		cleanup(container);
		pass('PrevPage renders correctly');
	},

	'PrevPage: should be disabled on first page': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-prev-page');
		
		table.setPage(1);
		await table.updateComplete;
		await control.updateComplete;
		
		const btn = control;
		if(!btn.disabled){
			cleanup(container);
			fail('PrevPage button should be disabled on page 1');
			return;
		}
		
		cleanup(container);
		pass('PrevPage is disabled on first page');
	},

	'PrevPage: should go back page on click': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-prev-page');
		
		table.setPage(3);
		await table.updateComplete;
		
		const btn = control;
		btn.click();
		await table.updateComplete;
		
		if(table.getCurrentPage() !== 2){
			cleanup(container);
			fail(`Expected page 2, got ${table.getCurrentPage()}`);
			return;
		}
		
		cleanup(container);
		pass('PrevPage goes to previous page');
	},

	/*
		PageSelect Tests
	*/
	'PageSelect: should render page select dropdown': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-page-select');
		
		const select = control.shadowRoot.querySelector('select');
		if(!select){
			cleanup(container);
			fail('PageSelect should render select element');
			return;
		}
		
		cleanup(container);
		pass('PageSelect renders correctly');
	},

	'PageSelect: should have options for all pages': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-page-select');
		
		// Wait for control to update after table records are set
		await new Promise(resolve => setTimeout(resolve, 100));
		await control.updateComplete;
		
		const totalPages = table.getTotalPages();
		const options = control.shadowRoot.querySelectorAll('option');
		
		if(options.length !== totalPages){
			cleanup(container);
			fail(`Expected ${totalPages} options, got ${options.length}`);
			return;
		}
		
		cleanup(container);
		pass('PageSelect has correct number of options');
	},

	'PageSelect: should change page on selection': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-page-select');
		
		await new Promise(resolve => setTimeout(resolve, 50));
		
		const select = control.shadowRoot.querySelector('select');
		select.value = '3';
		select.dispatchEvent(new Event('change'));
		await table.updateComplete;
		
		if(table.getCurrentPage() !== 3){
			cleanup(container);
			fail(`Expected page 3, got ${table.getCurrentPage()}`);
			return;
		}
		
		cleanup(container);
		pass('PageSelect changes page on selection');
	},

	'PageSelect: should show total pages label': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-page-select');
		
		await new Promise(resolve => setTimeout(resolve, 50));
		await control.updateComplete;
		
		const label = control.shadowRoot.querySelector('label');
		if(!label){
			cleanup(container);
			fail('PageSelect should have label');
			return;
		}
		
		const totalPages = table.getTotalPages();
		if(!label.textContent.includes(totalPages.toString())){
			cleanup(container);
			fail('Label should show total pages');
			return;
		}
		
		cleanup(container);
		pass('PageSelect shows total pages');
	},

	/*
		PageSize Tests
	*/
	'PageSize: should render page size dropdown': async ({pass, fail}) => {
		const { container, control } = await createTableWithControl('kc-tc-page-size');
		
		const select = control.shadowRoot.querySelector('select');
		if(!select){
			cleanup(container);
			fail('PageSize should render select element');
			return;
		}
		
		cleanup(container);
		pass('PageSize renders correctly');
	},

	'PageSize: should have page size options': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-page-size');
		
		await new Promise(resolve => setTimeout(resolve, 50));
		
		const options = control.shadowRoot.querySelectorAll('option');
		if(options.length === 0){
			cleanup(container);
			fail('PageSize should have options');
			return;
		}
		
		cleanup(container);
		pass('PageSize has options');
	},

	'PageSize: should change page size on selection': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-page-size');
		
		await new Promise(resolve => setTimeout(resolve, 50));
		
		const select = control.shadowRoot.querySelector('select');
		select.value = '25';
		select.dispatchEvent(new Event('change'));
		await table.updateComplete;
		
		if(table.getPageSize() !== 25){
			cleanup(container);
			fail(`Expected page size 25, got ${table.getPageSize()}`);
			return;
		}
		
		cleanup(container);
		pass('PageSize changes page size on selection');
	},

	'PageSize: should show current page size as selected': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-page-size');
		
		table.setPageSize(25);
		await table.updateComplete;
		await control.updateComplete;
		
		const select = control.shadowRoot.querySelector('select');
		if(parseInt(select.value) !== 25){
			cleanup(container);
			fail(`Expected selected value 25, got ${select.value}`);
			return;
		}
		
		cleanup(container);
		pass('PageSize shows current size as selected');
	},

	/*
		Update on Events Tests
	*/
	'controls should update on pageChange event': async ({pass, fail}) => {
		const { container, table, control } = await createTableWithControl('kc-tc-first-page');
		
		table.setPage(3);
		await table.updateComplete;
		await control.updateComplete;
		
		let btnBefore = control;
		if(btnBefore.disabled){
			cleanup(container);
			fail('Button should not be disabled before navigation');
			return;
		}
		
		table.firstPage();
		await table.updateComplete;
		await new Promise(resolve => setTimeout(resolve, 10));
		await control.updateComplete;
		
		let btnAfter = control;
		if(!btnAfter.disabled){
			cleanup(container);
			fail('Button should be disabled after navigating to first page');
			return;
		}
		
		cleanup(container);
		pass('Controls update on pageChange event');
	}
};
