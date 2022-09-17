[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Nyaran-blue?logo=ko-fi)](https://ko-fi.com/nyaran)
[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-Nyaran-blue?logo=buy-me-a-coffee)](https://www.buymeacoffee.com/nyaran)

# Custom MyJDownloader card for HomeAssistant/Lovelace

This Lovelace custom card displays downloads information provided by the MyJDownloader Integration.
It also supports enable limit speed mode and play/pause of all downloads.
If you have multiple MyJDownloader instances associated to your account, you can cycle through all of them.

## Installation

### - Manual method

- Download
  the [latest release](https://github.com/Nyaran/myjdownloader-card/releases/latest/download/myjdownloader-card.tgz)
- Extract content.
- Copy the `myjdownloader-card/dist` folder into `www` folder into your HA installation, as explained
  in [official documentation](https://developers.home-assistant.io/docs/frontend/custom-ui/registering-resources/)
- Restart HA

### - [HACS](https://hacs.xyz/) method (recommended)

- Copy this repo URL
- In the HACS section, add this repo as custom (mark as Lovelace in Category), as explained
  in [official documentation](https://hacs.xyz/docs/faq/custom_repositories)
- Restart HA

### Lovelace UI configuration

Please add the card to the resources in configuration.yaml:

```
resources:
  - {type: js, url: '/hacsfiles/myjdownloader-card/myjdownloader-card.js'}
```

## Options

### Card options

| Name             | Type    | Required     | Default         | Description                                                  |
|------------------|---------|--------------|-----------------|--------------------------------------------------------------|
| type             | string  | **required** |                 | `custom:myjdownloader-card`                                  |
| header_title     | string  | optional     | `MyJDownloader` | Header text at the top of card                               |
| sensor_name      | string  | optional     | `jdownloader`   | Name of the sensor                                           |
| display_mode     | string  | optional     | `compact`       | Display mode: compact or full                                |
| default_instance | string  | optional     |                 | Default instance to show, if not set, the first one is used. |
| hide_title       | boolean | optional     | false           | Hide header text at the top of card                          |
| hide_instance    | boolean | optional     | true            | Hide MyJDownloader instance selector                         |
| hide_speed_limit | boolean | optional     | false           | Hide speed limit button                                      |
| hide_playpause   | boolean | optional     | false           | Hide play/pause button                                       |

Please find below an example of ui-lovelace.yaml card entry:

```yaml
    cards:
      - type: custom:myjdownloader-card
        default_instance: 'foo@bar'
        hide_instance: true
```

## Preview
MyJDownloader Card in "compact" mode (dark theme):

![MyJDownloader Card compact](./myjdownloader-card-compact-dark.png)

MyJDownloader Card in "full" mode (light theme):

![MyJDownloader Card full](./myjdownloader-card-full-light.png)

## Thanks

[@home-assistant](https://github.com/home-assistant/) and [@hacs](https://github.com/hacs/) teams, for their awesome work.

[![@amaximus](https://github.com/amaximus.png?size=40) @amaximus](@amaximus) for his work on [transmission-card](https://github.com/amaximus/transmission-card), which this card is heavily inspired by.
