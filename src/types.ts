import { LovelaceCard, LovelaceCardConfig, LovelaceCardEditor } from 'custom-card-helpers';

declare global {
	interface HTMLElementTagNameMap {
		'myjdownloader-card-editor': LovelaceCardEditor;
		'hui-error-card': LovelaceCard;
	}

	interface Window {
		customCards: unknown[]
		loadCardHelpers(): Promise<unknown>
	}
}

export interface MyJDownloaderCardConfig extends LovelaceCardConfig {
	header_title?: string;
	sensor_name?: string;
	display_mode?: 'full' | 'compact';
	list_mode?: 'full' | 'packages' | 'links';
	default_instance?: string;
	hide_title?: boolean;
	hide_instance?: boolean;
	hide_speed_limit?: boolean;
	hide_pause?: boolean;
}

export type Downloads = Record<number, DownloadLink | Package>

export interface DownloadLink {
	addedDate: number
	bytesLoaded: number
	bytesTotal: number
	percent: number
	comment: string
	downloadPassword: string
	enabled: boolean
	eta: number
	extractionStatus: string
	finished: boolean
	finishedDate: number
	host: string
	name: string
	packageUUID: number
	priority: 'HIGHEST' | 'HIGHER' | 'HIGH' | 'DEFAULT' | 'LOW' | 'LOWER' | 'LOWEST'
	running: boolean
	skipped: boolean
	speed: number
	status: string
	statusIconKey: string
	url: string
	uuid: number
}

export interface Package {
	activeTask: string
	bytesLoaded: number
	bytesTotal: number
	percent: number
	childCount: number
	comment: string
	downloadPassword: string
	enabled: boolean
	eta: number
	finished: boolean
	hosts: string[]
	name: string
	priority: 'HIGHEST' | 'HIGHER' | 'HIGH' | 'DEFAULT' | 'LOW' | 'LOWER' | 'LOWEST'
	running: boolean
	saveTo: string
	speed: number
	status: string
	statusIconKey: string
	links: DownloadLink[]
}

