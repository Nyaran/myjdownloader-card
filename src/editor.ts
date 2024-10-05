import { html, LitElement, TemplateResult } from 'lit';
import { fireEvent, HomeAssistant, LovelaceCardEditor } from 'custom-card-helpers';
import { ScopedRegistryHost as scopedRegistryHost } from '@lit-labs/scoped-registry-mixin';
import { customElement, property, state } from 'lit/decorators.js';

import { MyJDownloaderCardConfig } from './types.js';
import { localize } from './localize/localize.js';

const SCHEMA = [
	{name: 'header_title', selector: {text: {}}},
	{name: 'sensor_name', selector: {text: {}}},
	{name: 'default_instance', selector: {text: {}}},
	{
		name: '',
		type: 'grid',
		schema: [
			{
				name: 'display_mode',
				selector: {
					select: {
						options: ['compact', 'full'].map(value => ({
							value,
							label: localize(`config.display_mode_label.${value}`),
						})),
					},
				},
			},
			{
				name: 'list_mode',
				selector: {
					select: {
						options: ['full', 'packages', 'links'].map(value => ({
							value,
							label: localize(`config.list_mode_label.${value}`),
						})),
					},
				},
			},
		],
	},
	{
		name: '',
		type: 'grid',
		schema: [
			{ name: 'hide_title', selector: {boolean: {}} },
			{ name: 'hide_instance', selector: {boolean: {}} },
			{ name: 'hide_play', selector: {boolean: {}} },
			{ name: 'hide_pause', selector: {boolean: {}} },
			{ name: 'hide_stop', selector: {boolean: {}} },
			{ name: 'hide_speed_limit', selector: {boolean: {}} },
		],
	},
] as const;

@customElement('myjdownloader-card-editor')
export class MyJDownloaderCardEditor extends scopedRegistryHost(LitElement) implements LovelaceCardEditor {
	@property({ attribute: false }) public hass?: HomeAssistant;

	@state() private _config?: MyJDownloaderCardConfig;
	@state() private _helpers?: unknown;

	private _initialized = false;

	public setConfig(config: MyJDownloaderCardConfig): void {
		this._config = config;

		void this.loadCardHelpers();
	}

	protected render(): TemplateResult {
		if (!this.hass || !this._helpers) {
			return html``;
		}

		return html`
          <ha-form
              .hass=${this.hass}
              .data=${this._config}
              .schema=${SCHEMA}
              .computeLabel=${(this._computeLabelCallback.bind(this))}
              @value-changed=${this._valueChanged.bind(this)}
          ></ha-form>
          <ha-device-picker .label="Label" .value="Value" .devices="Devices" .areas="Areas"
                            .entities="Entities"></ha-device-picker>
		`;
	}

	private _initialize(): void {
		if (this.hass === undefined) return;
		if (this._config === undefined) return;
		if (this._helpers === undefined) return;
		this._initialized = true;
	}

	private async loadCardHelpers(): Promise<void> {
		this._helpers = await window.loadCardHelpers();
	}

	private _valueChanged(ev: CustomEvent<{ value: MyJDownloaderCardConfig }>): void {
		fireEvent(this, 'config-changed', { config: ev.detail.value });
	}

	private _computeLabelCallback(schema: typeof SCHEMA[number]) {
		return localize(`config.${schema.name}`);
	}
}
