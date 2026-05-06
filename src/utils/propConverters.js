// Boolean converter that uses explicit "true"/"false" string values
export const boolTrueFalse = {
	fromAttribute: v => v === null ? undefined : v.toLowerCase() === 'true',
	toAttribute: v => v ? 'true' : 'false'
};

// Boolean converter that uses attribute presence/absence
export const boolExists = {
	fromAttribute: v => v !== null,
	toAttribute: v => v ? '' : null
};

// itemConverter: function to apply to each item when parsing (default: identity)
export const commaSeparatedArray = (itemConverter = v => v, defaultArray = []) => ({
	fromAttribute: v => v ? v.split(',').map(item => itemConverter(item.trim())).filter(item => item !== null && item !== undefined) : defaultArray,
	toAttribute: v => v.join(',')
});