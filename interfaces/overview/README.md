# the-dashboard-app

...

- [Setup development environment](#setup-development-environment)
- [Configuration](#configuration)
- [Getting Started](#getting-started)
- [Documentation](#documentation)

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

## Documentation

Documentation of the tools and libraries used.

- [Ionic Framework v5](https://ionicframework.com/docs/)  
  This UI-kit or library gives us a foundation to quickly build interfaces cross-platform/cross-device-type.  
  We use the (default) framework of Angular with(in) Ionic.

  - Available components: <https://ionicframework.com/docs/components>
  - Icons: <https://ionicons.com/>

- [Angular v9](https://v9.angular.io/docs)  
  This front-end framework gives us a structure to create components that can be connected, combined, share data and can be delivered as a web-app.

  - API Documentation: <https://v9.angular.io/api>
  - Used by Angular, RxJS: <https://rxjs.dev/guide/overview>

