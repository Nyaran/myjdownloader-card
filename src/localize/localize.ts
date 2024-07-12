import * as en from './languages/en.json';
import * as es from './languages/es.json';

const languages: LanguagesObject = {
	en,
	es,
};

type LanguagesObject = {
	[key: string]: LanguagesObject | string
}

function getLanguage(): string {
	let lang = localStorage.getItem('selectedLanguage')?.replace(/['"]+/g, '').replace('-', '_');
	if (lang == null || lang === 'null') {
		const _hass = (document.querySelector('home-assistant') as any).hass;
		lang = _hass.selectedLanguage || _hass.language;
	}

	return lang || 'en';
}

export function localize(string: string, search = '', replace = ''): string {
	const lang = getLanguage();
	let translated: string;

	try {
		translated = string.split('.').reduce((o, i) => o[i], languages[lang]) as string;
	} catch (e) {
		translated = string.split('.').reduce((o, i) => o[i], languages['en']) as string;
	}

	if (translated === undefined) {
		translated = string.split('.').reduce((o, i) => o[i], languages['en']) as string;
	}

	if (search !== '' && replace !== '') {
		translated = translated.replace(search, replace);
	}
	return translated || string;
}
