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
  no_downloads_label?: string;
  hide_limit?: boolean;
  hide_playpause?: boolean;
  hide_instance?: boolean;
  display_mode?: string;
  sensor_name?: string;
  header_text?: string;
  hide_header?: boolean;
  header_instance?: boolean;
}
