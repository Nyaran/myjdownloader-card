import * as en from './languages/en.json';
import * as es from './languages/es.json';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const languages: any = {
    en,
    es,
};

function getLanguage(): string {
    let lang = localStorage.getItem('selectedLanguage')?.replace(/['"]+/g, '').replace('-', '_');
    if (lang == null || lang === 'null') {
        const _hass = (document.querySelector('home-assistant') as any).hass;
        lang = _hass.selectedLanguage || _hass.language || 'en';
    }

    return lang!;
}

export function localize(string: string, search = '', replace = ''): string {
    let lang = getLanguage();
    let translated: string;

    try {
        translated = string.split('.').reduce((o, i) => o[i], languages[lang]);
    } catch (e) {
        translated = string.split('.').reduce((o, i) => o[i], languages['en']);
    }

    if (translated === undefined) translated = string.split('.').reduce((o, i) => o[i], languages['en']);

    if (search !== '' && replace !== '') {
        translated = translated.replace(search, replace);
    }
    return translated || string;
}
