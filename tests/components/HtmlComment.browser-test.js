import '../../../src/components/htmlEditorNodes/HtmlComment.js';

const HenHtmlComment = customElements.get('k-hen-html-comment');

export default {
	/*
		Custom Element Registration
	*/
	'should register k-hen-html-comment element': async ({pass, fail}) => {
		if(!HenHtmlComment) return fail('k-hen-html-comment should be registered');
		pass('k-hen-html-comment is registered');
	},

	'should have static lexicalNode property': async ({pass, fail}) => {
		if(!HenHtmlComment.lexicalNode) return fail('HenHtmlComment should have static lexicalNode');
		if(HenHtmlComment.lexicalNode.getType() !== 'html-comment') return fail(`Expected type 'html-comment', got '${HenHtmlComment.lexicalNode.getType()}'`);
		pass('lexicalNode property exists with correct type');
	},

	/*
		isVisualCompatible
	*/
	'isVisualCompatible should return true for comment nodes': async ({pass, fail}) => {
		const commentNode = document.createComment('test');
		if(!HenHtmlComment.lexicalNode.isVisualCompatible(commentNode)) return fail('Should return true for comment nodes');
		pass('Returns true for comment nodes');
	},

	'isVisualCompatible should return false for element nodes': async ({pass, fail}) => {
		const el = document.createElement('div');
		if(HenHtmlComment.lexicalNode.isVisualCompatible(el)) return fail('Should return false for element nodes');
		pass('Returns false for element nodes');
	},

	'isVisualCompatible should return false for text nodes': async ({pass, fail}) => {
		const textNode = document.createTextNode('hello');
		if(HenHtmlComment.lexicalNode.isVisualCompatible(textNode)) return fail('Should return false for text nodes');
		pass('Returns false for text nodes');
	},

	/*
		preprocessHtml
	*/
	'preprocessHtml should convert comments to spans': async ({pass, fail}) => {
		const result = HenHtmlComment.lexicalNode.preprocessHtml('<p>text <!-- hello --> more</p>');
		if(result.includes('<!--')) return fail('Comment should be replaced');
		if(!result.includes('data-html-comment=')) return fail(`Expected data-html-comment attribute, got '${result}'`);
		if(!result.includes('<span')) return fail('Should convert to span element');
		pass('Converts comments to spans');
	},

	'preprocessHtml should handle multiple comments': async ({pass, fail}) => {
		const result = HenHtmlComment.lexicalNode.preprocessHtml('<!-- a --><!-- b -->');
		const count = (result.match(/data-html-comment/g) || []).length;
		if(count !== 2) return fail(`Expected 2 spans, got ${count}`);
		pass('Handles multiple comments');
	},

	'preprocessHtml should handle multiline comments': async ({pass, fail}) => {
		const result = HenHtmlComment.lexicalNode.preprocessHtml('<!-- line1\nline2 -->');
		if(result.includes('<!--')) return fail('Multiline comment should be replaced');
		if(!result.includes('data-html-comment')) return fail('Should produce data-html-comment attribute');
		pass('Handles multiline comments');
	},

	'preprocessHtml should leave non-comment HTML untouched': async ({pass, fail}) => {
		const html = '<p>No comments here</p>';
		const result = HenHtmlComment.lexicalNode.preprocessHtml(html);
		if(result !== html) return fail(`Should not modify non-comment HTML, got '${result}'`);
		pass('Leaves non-comment HTML untouched');
	},

	'preprocessHtml should escape quotes in comment text': async ({pass, fail}) => {
		const result = HenHtmlComment.lexicalNode.preprocessHtml('<!-- say "hello" -->');
		if(result.includes('<!--')) return fail('Comment should be replaced');
		if(!result.includes('&quot;')) return fail('Quotes should be escaped in attribute');
		pass('Escapes quotes in comment text');
	},

	/*
		importDOM
	*/
	'importDOM should return span handler': async ({pass, fail}) => {
		const domConfig = HenHtmlComment.lexicalNode.importDOM();
		if(!domConfig || !domConfig.span) return fail('importDOM should return config with span key');
		pass('importDOM returns span handler');
	},

	'importDOM span handler should return null for non-comment spans': async ({pass, fail}) => {
		const domConfig = HenHtmlComment.lexicalNode.importDOM();
		const span = document.createElement('span');
		const result = domConfig.span(span);
		if(result !== null) return fail('Should return null for spans without data-html-comment');
		pass('Returns null for non-comment spans');
	},

	'importDOM span handler should return conversion for comment spans': async ({pass, fail}) => {
		const domConfig = HenHtmlComment.lexicalNode.importDOM();
		const span = document.createElement('span');
		span.setAttribute('data-html-comment', 'test comment');
		const result = domConfig.span(span);
		if(!result) return fail('Should return conversion for comment spans');
		if(!result.conversion) return fail('Result should have conversion function');
		if(result.priority !== 2) return fail(`Expected priority 2, got ${result.priority}`);
		pass('Returns conversion for comment spans');
	},

	/*
		Lexical Node (static only - instance methods require active Lexical editor)
	*/
	'lexical node should have correct type': async ({pass, fail}) => {
		if(HenHtmlComment.lexicalNode.getType() !== 'html-comment') return fail('Type should be html-comment');
		pass('Type is html-comment');
	}
};
