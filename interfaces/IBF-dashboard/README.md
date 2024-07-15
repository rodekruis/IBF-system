# IBF-dashboard: Web interface of the IBF-system.

Welcome to the GitHub repository of the [IBF-dashboard](http://ibf.510.global/),

- [Setup development environment](#setup-development-environment)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Documentation](#documentation)
- [Other resources](#other-resources)
- [Loading layer info popup descriptions](#loading-the-layer-info-popup-descriptions)

## Setup development environment

**Node.js**  
To prevent conflicts between other projects use a version manager to install and use Node.js.

- On windows: <https://docs.microsoft.com/en-us/windows/nodejs/setup-on-windows>
- On macOS/Linux: Use [NVM - Node Version Manager](http://nvm.sh/)

  After installing run:

  ```sh
  nvm install
  ```

**Install other dependencies**  
See [Documentation](#documentation).

```sh
npm install
```

## Configuration

Set the required configuration values in the `.env` file, by using the provided [`example.env`](example.env):

```sh
cp example.env .env
```

## Getting Started

To start a local instance of the interface on <http://localhost:4200/>:

```sh
npm start
```

See other available tasks/scripts with: `npm run`

## Frameworks

- [Ionic Framework](https://ionicframework.com/docs/) This UI-kit or library gives us a foundation to quickly build interfaces cross-platform/cross-device-type.

- [Angular](https://angular.dev/overview) This front-end framework gives us a structure to create components that can be connected, combined, share data and can be delivered as a web-app.

- [Leaflet](https://leafletjs.com/) A library for maps with multiple interactive layers. Used with [ngx-leaflet](https://github.com/bluehalo/ngx-leaflet) for Angular.
