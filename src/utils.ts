/**
 * From https://github.com/home-assistant/frontend/blob/dev/src/common/string/slugify.ts
 * Check if there is any way to use the home-assistant method directly
 */
export function slugify(value: string, delimiter = '_'): string {
	const a =
		'àáäâãåăæąçćčđďèéěėëêęğǵḧìíïîįłḿǹńňñòóöôœøṕŕřßşśšșťțùúüûǘůűūųẃẍÿýźžż·/_,:;';
	const b = `aaaaaaaaacccddeeeeeeegghiiiiilmnnnnooooooprrsssssttuuuuuuuuuwxyyzzz${delimiter}${delimiter}${delimiter}${delimiter}${delimiter}${delimiter}`;
	const p = new RegExp(a.split('').join('|'), 'g');

	return value
		.toLowerCase()
		.replace(/\s+/g, delimiter) // Replace spaces with delimiter
		.replace(p, (c) => b.charAt(a.indexOf(c))) // Replace special characters
		.replace(/&/g, `${delimiter}and${delimiter}`) // Replace & with 'and'
		.replace(/[^\w-]+/g, delimiter /* /!\ Doesn't match with HA frontend implementation, but does with core (that uses slugify module) */) // Remove all non-word characters
		.replace(/-/g, delimiter) // Replace - with delimiter
		.replace(new RegExp(`(${delimiter})\\1+`, 'g'), '$1') // Replace multiple delimiters with single delimiter
		.replace(new RegExp(`^${delimiter}+`), '') // Trim delimiter from start of text
		.replace(new RegExp(`${delimiter}+$`), ''); // Trim delimiter from end of text
}
