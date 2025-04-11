# IBF-system

IBF-system is a web app to visualize hazard forecasts. It has a [NestJS backend](./services/API-service) and an [Angular frontend](./interfaces/IBF-dashboard). Read our [wiki](https://github.com/rodekruis/IBF-system/wiki) for [functional](https://github.com/rodekruis/IBF-system/wiki/Features) and [technical](https://github.com/rodekruis/IBF-system/wiki/Software-architecture) information.

![IBF portal showing floods in Uganda](https://github.com/user-attachments/assets/6cb909e8-be23-40af-ae7e-e9ccba41db40)

IBF will not show meaningful information without [forecast data](https://github.com/rodekruis/IBF-system/wiki/Create-a-pipeline). This data is uploaded to the IBF-system through the [IBF API](http://localhost:3000/docs). For demo purposes, the [API-service](./services/API-service) includes [mock data](http://localhost:3000/docs#/---%20mock%2Fseed%20data%20---/ScriptsController_mock) to simulate hazard forecasts.

## Getting Started

1. Install [NodeJS](https://nodejs.org/en/download)
2. Install [Docker](https://docs.docker.com/get-docker)
3. Download [IBF-system](https://github.com/rodekruis/IBF-system/archive/refs/heads/master.zip) source code
4. Download and extract [raster-data.zip](https://510ibfsystem.blob.core.windows.net/rasters/raster-files.zip) into `services/API-service/geoserver-volume/raster-files`
5. Setup env variables `cp example.env .env`
6. Start API-service `npm run start:services`
   - Open [https://localhost:3000/api](https://localhost:3000/api) in a web browser to check if the API-service is running
   - Open [http://localhost:3000/docs](http://localhost:3000/docs) in a web browser to access the API-service documentation
7. Start IBF-dashboard `npm run install:interface`
   - Open [http://localhost:4200](http://localhost:4200) in a web browser to check if the IBF-dashboard is running

### Load data

- Login via [/api/user/login](http://localhost:3000/docs#/--%20user%20--/UserController_login)
- Load seed data via [/api/scripts/reset](http://localhost:3000/docs#/---%20mock%2Fseed%20data%20---/ScriptsController_resetDb)
- Load mock data via [/api/scripts/mock](http://localhost:3000/docs#/---%20mock%2Fseed%20data%20---/ScriptsController_mock)
- You can load data via the various [IBF-API](http://localhost:3000/docs) endpoints. Read [API for pipelines](https://github.com/rodekruis/IBF-system/wiki/API-for-pipelines) for details.

### What next?

- Read our [wiki](https://github.com/rodekruis/IBF-system/wiki) for [functional](https://github.com/rodekruis/IBF-system/wiki/Features) and [technical](https://github.com/rodekruis/IBF-system/wiki/Software-architecture) information.
- Read our [Guides](https://github.com/rodekruis/IBF-system/wiki#guides) to learn how to [add a forecast pipeline](https://github.com/rodekruis/IBF-system/wiki/Create-a-pipeline) and [update data](https://github.com/rodekruis/IBF-system/wiki/Add-static-data).
- Read our [Contributing](docs/CONTRIBUTING.md) guide to add new features or fix bugs.
- Read our [Glossary](https://github.com/rodekruis/IBF-system/wiki/Glossary) for definitions.

---

IBF-system is published under the open-source [Apache-2.0 license](./LICENSE).
