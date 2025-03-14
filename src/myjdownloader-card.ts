import { css, html, LitElement, PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getLovelace, hasConfigOrEntityChanged, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { DownloadLink, Downloads, MyJDownloaderCardConfig, Package } from './types.js';
import { CARD_VERSION } from './version.js';
import { localize } from './localize/localize.js';
import { slugify } from './utils.js';
import './editor.js';

// eslint-disable-next-line no-console
console.info(`%c  MyJDownloader-Card \n%c  ${localize('common.version')} ${CARD_VERSION}`, 'color: orange; font-weight: bold; background: black', 'color: white; font-weight: bold; background: dimgray');

window.customCards = window.customCards || [];
window.customCards.push({
	type: 'myjdownloader-card',
	name: 'MyJDownloader Card',
	preview: true,
	description: 'This Lovelace Custom card displays downloads information provided by the MyJDownloader Integration.',
});

@customElement('myjdownloader-card')
export class MyJDownloaderCard extends LitElement {
	public static getConfigElement(): LovelaceCardEditor {
		return document.createElement('myjdownloader-card-editor');
	}

	public static getStubConfig(): Record<string, unknown> {
		return {};
	}

	@property({ attribute: false }) public hass!: HomeAssistant;
	@state() private config!: MyJDownloaderCardConfig;
	private _selectedInstance!: string;
	private _selectedInstanceEntity!: string;

	set selectedInstance(name) {
		const oldInstance = this._selectedInstance;

		this._selectedInstance = name;
		this._selectedInstanceEntity = name == null ? name : slugify(name);

		this.requestUpdate('_selectedInstance', oldInstance);
	}

	get selectedInstance() {
		return this._selectedInstance;
	}

	get selectedInstanceEntity() {
		return this._selectedInstanceEntity;
	}

	public setConfig(config: MyJDownloaderCardConfig): void {
		// TODO Check for required fields and that they are of the proper format
		if (!config) {
			throw new Error(localize('common.invalid_configuration'));
		}

		if (config.display_mode !== undefined && !['compact', 'full'].includes(config.display_mode)) {
			throw new Error(localize('config.wrong_display_mode'));
		}
		if (config.list_mode !== undefined && !['full', 'packages', 'links'].includes(config.list_mode)) {
			throw new Error(localize('config.wrong_list_mode'));
		}

		if (config.test_gui) {
			getLovelace().setEditMode(true); // eslint-disable-line @typescript-eslint/no-unsafe-call
		}

		this.config = {
			header_title: 'MyJDownloader',
			sensor_name: 'jdownloader',
			display_mode: 'compact',
			list_mode: 'full',
			default_instance: undefined,
			hide_title: false,
			hide_instance: false,
			hide_play: false,
			hide_pause: false,
			hide_stop: false,
			hide_speed_limit: false, ...config,
		};

		if (this.config.default_instance != null) {
			this.selectedInstance = this.config.default_instance;
		}
	}

	protected shouldUpdate(changedProps: PropertyValues): boolean {
		if (!this.config) {
			return false;
		}

		if (changedProps.has('_selectedInstance')) {
			return true;
		}

		return hasConfigOrEntityChanged(this, changedProps, false);
	}

	render() {
		if (!this.config || !this.hass) {
			return html``;
		}

		if (this.selectedInstance == null) {
			this.selectedInstance = this._getInstances()[0];
		}

		return html`
          <ha-card>
            <div class="card-header">
              ${this.renderCardHeader()}
              ${this.renderInstanceSelect()}
            </div>
            <div>
              <div id="toolbar-container">
                ${this.renderToolbar()}
              </div>
              <div id="downloads">
                ${this._renderDownloads()}
              </div>
            </div>
          </ha-card>
		`;
	}

	_renderDownloads() {
		let downloads;
		try {
			downloads = this._getDownloads();
		} catch (e) {
			if (e instanceof Error && e.message.startsWith('error.no_sensor_')) {
				return html`
                  <div class="no-sensor">${localize(e.message)}</div>`;
			}
			throw e;
		}

		return html`
          ${Object.keys(downloads).length > 0 ? html`
            <div class="mode-${this.config.display_mode}">
              ${this._renderDownloadList(downloads)}
            </div>` : html`
            <div class="no-downloads">${localize('downloads.no_downloads')}</div>`}`;
	}

	_renderDownloadList(downloads: Downloads) {
		let renderPackageMethod, renderLinkMethod;

		if (this.config.display_mode === 'compact') {
			renderPackageMethod = this.renderPackage.bind(this);
			renderLinkMethod = this.renderDownloadLink.bind(this);
		} else {
			renderPackageMethod = this.renderPackageFull.bind(this);
			renderLinkMethod = this.renderDownloadLinkFull.bind(this);
		}

		if (['full', 'packages'].includes(this.config.list_mode as string)) {
			return Object.entries(downloads).map(([uuid, pack]) => renderPackageMethod(parseInt(uuid), pack as Package));
		}
		return Object.values(downloads).map(downloadLink => renderLinkMethod(downloadLink as DownloadLink));
	}

	_buildPackage(pack: Package) {
		return {
			activeTask: pack.activeTask,
			bytesLoaded: pack.bytesLoaded,
			bytesTotal: pack.bytesTotal,
			percent: ((100 * pack.bytesLoaded) / pack.bytesTotal) || 0,
			childCount: pack.childCount,
			comment: pack.comment,
			downloadPassword: pack.downloadPassword,
			enabled: pack.enabled,
			eta: pack.eta,
			finished: pack.finished,
			hosts: pack.hosts,
			name: pack.name,
			priority: pack.priority,
			running: pack.running,
			saveTo: pack.saveTo,
			speed: pack.speed,
			status: pack.status,
			statusIconKey: pack.statusIconKey,
			uuid: pack.uuid,
			links: [] as DownloadLink[],
		};
	}

	_buildDownloadLink(downloadLink: DownloadLink) {
		return {
			addedDate: downloadLink.addedDate,
			bytesLoaded: downloadLink.bytesLoaded,
			bytesTotal: downloadLink.bytesTotal,
			percent: ((100 * downloadLink.bytesLoaded) / downloadLink.bytesTotal) || 0,
			comment: downloadLink.comment,
			downloadPassword: downloadLink.downloadPassword,
			enabled: downloadLink.enabled,
			eta: downloadLink.eta,
			extractionStatus: downloadLink.extractionStatus,
			finished: downloadLink.finished,
			finishedDate: downloadLink.finishedDate,
			host: downloadLink.host,
			name: downloadLink.name,
			packageUUID: downloadLink.packageUUID,
			priority: downloadLink.priority,
			running: downloadLink.running,
			skipped: downloadLink.skipped,
			speed: downloadLink.speed,
			status: downloadLink.status,
			statusIconKey: downloadLink.statusIconKey,
			url: downloadLink.url,
			uuid: downloadLink.uuid,
		};
	}

	_getDownloads() {
		const downloads = {} as Downloads;

		if (['full', 'packages'].includes(this.config.list_mode as string)) {
			if (typeof this.hass.states[`sensor.${this.config.sensor_name}_${this.selectedInstanceEntity}_packages`] === 'undefined') {
				throw new Error('error.no_sensor_packages');
			} else {
				const packages = this.hass.states[`sensor.${this.config.sensor_name}_${this.selectedInstanceEntity}_packages`].attributes.packages as Package[];
				packages.forEach((pack: Package) => {
					downloads[pack.uuid] = this._buildPackage(pack);
				});
			}
		}

		if (['full', 'links'].includes(this.config.list_mode as string)) {
			if (typeof this.hass.states[`sensor.${this.config.sensor_name}_${this.selectedInstanceEntity}_links`] === 'undefined') {
				throw new Error('error.no_sensor_links');
			} else {
				const links = this.hass.states[`sensor.${this.config.sensor_name}_${this.selectedInstanceEntity}_links`].attributes.links as DownloadLink[];
				links.forEach((link: DownloadLink) => {
					const linkData = this._buildDownloadLink(link);

					if (this.config.list_mode === 'full') {
						(downloads[link.packageUUID] as Package).links.push(linkData);
					} else {
						downloads[link.uuid] = linkData;
					}
				});
			}
		}

		return downloads;
	}

	_getStats() {
		const sensorPrefix = `sensor.${this.config.sensor_name}_${this._selectedInstanceEntity}`;
		if (typeof this.hass.states[`${sensorPrefix}_download_speed`] !== 'undefined') {
			return {
				down_speed: this.hass.states[`${sensorPrefix}_download_speed`].state as string,
				down_unit: this.hass.states[`${sensorPrefix}_download_speed`].attributes.unit_of_measurement as string,
				status: this.hass.states[`${sensorPrefix}_status`].state as string,
			};
		}
		return {
			down_speed: undefined,
			down_unit: 'B/s',
			status: 'no_sensor',
		};
	}

	_getInstances(): string[] {
		return (typeof this.hass.states[`sensor.${this.config.sensor_name}s_online`] !== 'undefined' ? this.hass.states[`sensor.${this.config.sensor_name}s_online`].attributes.jdownloaders : []) as string[];
	}

	_toggleInstance(ev: CustomEvent) {
		this.selectedInstance = (ev.target as HTMLSelectElement).value;
	}

	async _togglePlay() {
		await this.hass.callService('myjdownloader', 'start_downloads', { entity_id: `sensor.${this.config.sensor_name}_${this._selectedInstanceEntity}_status` });
	}

	async _togglePause() {
		await this.hass.callService('switch', 'toggle', { entity_id: `switch.${this.config.sensor_name}_${this._selectedInstanceEntity}_pause` });
	}

	async _toggleStop() {
		await this.hass.callService('myjdownloader', 'stop_downloads', { entity_id: `sensor.${this.config.sensor_name}_${this._selectedInstanceEntity}_status` });
	}

	async _toggleLimit() {
		await this.hass.callService('switch', 'toggle', { entity_id: `switch.${this.config.sensor_name}_${this._selectedInstanceEntity}_limit` });
	}

	_downloadStatus(downloadItem: DownloadLink | Package) {
		if (downloadItem.finished) {
			return 'finished';
		} else if (downloadItem.enabled) {
			return 'downloading';
		}
		return 'stopped';
	}

	renderToolbar() {
		const stats = this._getStats();
		return html`
          <div id="toolbar">
            <div class="status titleitem c-${stats.status}">
              <p>${localize(`status.${stats.status}`)}
              <p>
            </div>
            <div class="titleitem">
              <ha-icon icon="mdi:download" class="down down-color title-item-icon"></ha-icon>
              <span>${stats.down_speed} ${stats.down_unit}</span>
            </div>
            ${this.renderPlayButton()}
            ${this.renderPauseButton()}
            ${this.renderStopButton()}
            ${this.renderLimitButton()}
          </div>
		`;
	}

	renderPackage(uuid: number, pack: Package) {
		return html`
          <div class="package-container ${uuid}">
            <div class="progressbar">
              <div class="${this._downloadStatus(pack)} progressin"
                   style="width: ${pack.percent}%"></div>
              <ha-icon class="download-icon" icon="mdi:package-variant"></ha-icon>
              <div class="name"><a title="${pack.name}">${pack.name}</a></div>
              <!-- Using <a /> just as a quick hack to display a tooltip, improve in future release -->
              <div class="percent">${pack.percent.toFixed(2)}%</div>
            </div>
            ${this.config.list_mode === 'full' ? html`
              <div class="links">${pack.links.map(link => this.renderDownloadLink(link))}</div>` : ''}
          </div>
		`;
	}

	renderDownloadLink(downloadLink: DownloadLink) {
		return html`
          <div class="progressbar">
            <div class="${this._downloadStatus(downloadLink)} progressin"
                 style="width: ${downloadLink.percent}%"></div>
            <ha-icon class="download-icon" icon="mdi:download"></ha-icon>
            <div class="name"><a title="${downloadLink.name}">${downloadLink.name}</a></div>
            <div class="percent">${downloadLink.percent.toFixed(2)}%</div>
          </div>
		`;
	}

	renderPackageFull(uuid: number, pack: Package) {
		return html`
          <div class="package-container ${uuid}">
            <div class="package">
              <div class="package_name">
                <ha-icon class="download-icon" icon="mdi:package-variant"></ha-icon>
                <a title="${pack.name}">${pack.name}</a></div>
              <div class="package_status">${localize(`status.${this._downloadStatus(pack)}`)}</div>
              <div class="progressbar">
                <div class="${this._downloadStatus(pack)} progressin"
                     style="width: ${pack.percent}%">
                </div>
              </div>
              <div class="package_details">${pack.percent.toFixed(2)} %</div>
            </div>
            <div class="links">
              ${pack.links.map(link => this.renderDownloadLinkFull(link))}
            </div>
          </div>
		`;
	}

	renderDownloadLinkFull(downloadLink: DownloadLink) {
		return html`
          <div class="link">
            <div class="link_name">
              <ha-icon class="download-icon" icon="mdi:download"></ha-icon>
              <a title="${downloadLink.name}">${downloadLink.name}</a></div>
            <div class="link_status">${localize(`status.${this._downloadStatus(downloadLink)}`)}</div>
            <div class="progressbar">
              <div class="${this._downloadStatus(downloadLink)} progressin" style="width: ${downloadLink.percent}%">
              </div>
            </div>
            <div class="link_details">${downloadLink.percent.toFixed(2)} %</div>
          </div>
		`;
	}

	renderPlayButton() {
		if (this.config.hide_play) {
			return html``;
		}

		const state = this.hass.states[`sensor.${this.config.sensor_name}_${this._selectedInstanceEntity}_status`].state === 'stopped';
		return html`
          <div class="titleitem">
            <ha-icon-button
                class="play_${state ? 'on' : 'off'}"
                @click="${this._togglePlay.bind(this)}"
                title="${localize('actions.play')}"
                id="play">
              <ha-icon class="title-item-button" icon="mdi:play"></ha-icon>
            </ha-icon-button>
          </div>
		`;
	}

	renderPauseButton() {
		if (this.config.hide_pause) {
			return html``;
		}

		if (typeof this.hass.states[`switch.${this.config.sensor_name}_${this._selectedInstanceEntity}_pause`] === 'undefined') {
			return html``;
		}

		const state = this.hass.states[`switch.${this.config.sensor_name}_${this._selectedInstanceEntity}_pause`].state as string;
		return html`
          <div class="titleitem">
            <ha-icon-button
                class="pause_${state}"
                @click="${this._togglePause.bind(this)}"
                title="${localize('actions.pause')}"
                id="pause">
              <ha-icon class="title-item-button" icon="mdi:pause"></ha-icon>
            </ha-icon-button>
          </div>
		`;
	}

	renderStopButton() {
		if (this.config.hide_stop) {
			return html``;
		}

		const state = this.hass.states[`sensor.${this.config.sensor_name}_${this._selectedInstanceEntity}_status`].state === 'stopped';
		return html`
          <div class="titleitem">
            <ha-icon-button
                class="stop_${state ? 'off' : 'on'}"
                @click="${this._toggleStop.bind(this)}"
                title="${localize('actions.stop')}"
                id="stop">
              <ha-icon class="title-item-button" icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
		`;
	}

	renderLimitButton() {
		if (this.config.hide_speed_limit) {
			return html``;
		}

		if (typeof this.hass.states[`switch.${this.config.sensor_name}_${this._selectedInstanceEntity}_limit`] === 'undefined') {
			return html``;
		}

		const state = this.hass.states[`switch.${this.config.sensor_name}_${this._selectedInstanceEntity}_limit`].state as string;
		return html`
          <div class="titleitem">
            <ha-icon-button
                class="speed_limit_${state}"
                @click="${this._toggleLimit.bind(this)}"
                title="${localize('actions.speed_limit')}"
                id="speed_limit">
              <ha-icon class="title-item-button" icon="mdi:download-lock"></ha-icon>
            </ha-icon-button>
          </div>
		`;
	}

	renderCardHeader() {
		if (this.config.hide_title) {
			return html``;
		}

		return html`
          <div class="header-title">${this.config.header_title}</div>`;
	}

	renderInstanceSelect() {
		if (this.config.hide_instance) {
			return html``;
		}

		return html`
          <ha-select
              class="instance-dropdown"
              @selected=${this._toggleInstance.bind(this)}
              .value=${this.selectedInstance}>
            ${this._getInstances().map((type) => html`
              <mwc-list-item .value=${type}>${type}</mwc-list-item>`)}
          </ha-select>
		`;
	}

	/**
	 * Card height. A height of 1 is equivalent to 50 pixels
	 * download size: 28px
	 */
	public getCardSize() {
		return 1;
	}

	/**
	 * Sizing in sections view
	 */
	public getLayoutOptions() {
		return {
			grid_rows: 4,
			grid_min_rows: 3,
			grid_columns: 4,
			grid_min_columns: 2,
		};
	}

	static readonly styles = css`
      /* Header */

      .card-header {
        display: flex;
      }

      .header-title {
        margin-right: 25px;
      }

      .instance-dropdown {
        flex-grow: 1;
      }

      /* Downloads */

      #downloads {
        margin-top: 0.4em;
        padding-bottom: 0.8em;
      }

      /* Global status */

      .c-running {
        color: var(--label-badge-yellow);
      }

      .c-pause {
        color: var(--label-badge-blue);
      }

      .c-idle {
        color: var(--label-badge-grey);
      }

      .c-stopped {
        color: var(--label-badge-grey);
      }

      .progressbar {
        border-radius: 0.4em;
        margin-bottom: 0.6em;
        height: 1.4em;
        display: flex;
        background-color: #f1f1f1;
        z-index: 0;
        position: relative;
        margin-left: 1.4em;
        margin-right: 1.4em;
      }

      .progressin {
        border-radius: 0.4em;
        height: 100%;
        z-index: 1;
        position: absolute;
      }

      .download-icon {
        --mdc-icon-size: 1.4em;
        z-index: 2;
        margin-left: .2em;
        line-height: 1.4em;
      }

      .mode-compact .download-icon {
        color: var(--text-light-primary-color, var(--primary-text-color));
      }

      .name {
        margin-left: 0.7em;
        width: calc(100% - 60px);
        overflow: hidden;
        z-index: 2;
        color: var(--text-light-primary-color, var(--primary-text-color));
        line-height: 1.4em;
      }

      .percent {
        vertical-align: middle;
        z-index: 2;
        margin-left: 1.7em;
        margin-right: 0.7em;
        color: var(--text-light-primary-color, var(--primary-text-color));
        line-height: 1.4em;
      }

      /* Download status */

      .downloading {
        background-color: var(--paper-item-icon-active-color);
      }

      .stopped {
        background-color: var(--label-badge-grey);
      }

      .finished {
        background-color: var(--light-primary-color);
      }

      .links {
        margin-left: 1.5em;
      }

      .title-item-icon {
        display: inline-block;
        padding-top: 12px;
      }

      .title-item-button {
        font-size: var(--paper-font-body1_-_font-size);
      }

      .down-color {
        color: var(--paper-item-icon-active-color);
      }

      #toolbar-container {
        position: relative;
        display: inline;
        width: 100%;
      }

      #toolbar {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
      }

      .titleitem {
        width: auto;
        margin-left: 0.7em;
      }

      .status {
        font-size: 1em;
      }

      .speed_limit_off {
        color: var(--light-primary-color);
      }

      .speed_limit_on {
        color: var(--paper-item-icon-active-color);
      }

      .pause_off {
        color: var(--light-primary-color);
      }

      .pause_on, .play_on, .stop_on {
        color: var(--primary-color);
      }

      .play_off, .stop_off {
        color: var(--label-badge-grey);
      }

      .no-downloads, .no-sensor {
        margin-left: 1.4em;
      }

      .no-sensor {
        color: var(--error-color);
      }

      .mode-full {
        margin-left: 1.4em;
        margin-right: 1.4em;
      }

      .mode-full .progressbar {
        margin: 0 0 0 0;
        height: 4px;
      }

      .package_name, .link_name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .package_status, .link_status {
        font-size: 0.7em;
      }

      .package_details, .link_details {
        font-size: 0.7em;
      }
    `;
}
