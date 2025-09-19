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