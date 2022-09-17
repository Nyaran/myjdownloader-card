import {html, LitElement, TemplateResult} from 'lit';
import {fireEvent, HomeAssistant, LovelaceCardEditor} from 'custom-card-helpers';
import {ScopedRegistryHost} from '@lit-labs/scoped-registry-mixin';
import {MyJDownloaderCardConfig} from './types';
import {customElement, property, state} from 'lit/decorators.js';
import {localize} from './localize/localize';

const SCHEMA = [
  {name: 'header_title', selector: {text: {}}},
  {name: 'sensor_name', selector: {text: {}}},
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
  {name: 'default_instance', selector: {text: {}}},
  {
    name: '',
    type: 'grid',
    schema: [
      {name: 'hide_title', selector: {boolean: {}}},
      {name: 'hide_instance', selector: {boolean: {}}},
      {name: 'hide_speed_limit', selector: {boolean: {}}},
      {name: 'hide_playpause', selector: {boolean: {}}},
    ],
  },
] as const;

@customElement('myjdownloader-card-editor')
export class MyJDownloaderCardEditor extends ScopedRegistryHost(LitElement) implements LovelaceCardEditor {
  @property({attribute: false}) public hass?: HomeAssistant;

  @state() private _config?: MyJDownloaderCardConfig;
  @state() private _helpers?: unknown;

  private _initialized = false;

  public setConfig(config: MyJDownloaderCardConfig): void {
    this._config = config;

    this.loadCardHelpers();
  }

  protected render(): TemplateResult | void {
    if (!this.hass || !this._helpers) {
      return html``;
    }

    return html`
      <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${SCHEMA}
          .computeLabel=${(this._computeLabelCallback.bind(this))}
          @value-changed=${this._valueChanged}
      ></ha-form>
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

  private _valueChanged(ev): void {
    console.log('ev.detail.value', ev.detail.value);
    fireEvent(this, 'config-changed', {config: ev.detail.value});
  }

  private _computeLabelCallback(schema: typeof SCHEMA[number]) {
    return localize(`config.${schema.name}`);
  }
}
