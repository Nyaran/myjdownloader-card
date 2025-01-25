import en from './languages/en.json' with { type: 'json' };
import es from './languages/es.json' with { type: 'json' };
import pt from './languages/pt.json' with { type: 'json' };
import { LovelaceCard } from 'custom-card-helpers';

interface LanguageEntry {
	[key: string]: LanguageEntry | string;
}
const languages: Record<string, LanguageEntry> = {
	en,
	es,
	pt,
};

function getLanguage(): keyof typeof languages {
	let lang = localStorage.getItem('selectedLanguage')?.replace(/['"]+/g, '').replace('-', '_');
	if (lang == null || lang === 'null') {
		const _hass = (document.querySelector('home-assistant') as LovelaceCard).hass;
		lang = _hass.selectedLanguage || _hass.language;
	}

	return Object.keys(languages).includes(lang) ? lang as keyof typeof languages : 'en';
}

export function localize(string: string, search = '', replace = ''): string {
	const lang = getLanguage();
	let translated: string;

	try {
		translated = string.split('.').reduce((langEntry, key) => langEntry[key], languages[lang]) as string;
	} catch {
		translated = string.split('.').reduce((langEntry, key) => langEntry[key], languages.en) as string;
	}

	if (translated === undefined) {
		translated = string.split('.').reduce((langEntry, i) => langEntry[i], languages.en) as string;
	}

	if (search !== '' && replace !== '') {
		translated = translated.replace(search, replace);
	}
	return translated || string;
}
