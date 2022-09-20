import {LovelaceCard, LovelaceCardConfig, LovelaceCardEditor} from 'custom-card-helpers';

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
  default_instance?: string;
  hide_title?: boolean;
  hide_instance?: boolean;
  hide_speed_limit?: boolean;
  hide_pause?: boolean;
}
