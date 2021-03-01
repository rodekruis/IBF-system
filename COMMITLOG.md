# [0.24.0](https://github.com/rodekruis/IBF-system/compare/v0.23.0...v0.24.0) (2021-03-01)


### Bug Fixes

* change service declaration ([0a5349d](https://github.com/rodekruis/IBF-system/commit/0a5349d890b870549e8039f753d0560dce4ab877))
* fix lint errors AB[#6336](https://github.com/rodekruis/IBF-system/issues/6336) ([e576c04](https://github.com/rodekruis/IBF-system/commit/e576c04d89bffd109978ac2ef0243828147a511b))
* fix rainfall-dummy AB[#6340](https://github.com/rodekruis/IBF-system/issues/6340) ([84b3ce6](https://github.com/rodekruis/IBF-system/commit/84b3ce6ffee1338b204fc242a559611f4a9a073a))
* improve country-specific dummy-trigger AB[#6340](https://github.com/rodekruis/IBF-system/issues/6340) ([d0ae214](https://github.com/rodekruis/IBF-system/commit/d0ae2141dc45508f88f7f7cba03531d4347ced3f))
* join old and new way of importing data temporarily AB[#6336](https://github.com/rodekruis/IBF-system/issues/6336) ([155ded5](https://github.com/rodekruis/IBF-system/commit/155ded5535e38cd4473b5f68c712735211b49696))
* lint ([63beb63](https://github.com/rodekruis/IBF-system/commit/63beb6302824d043935067992f48356dff62e967))
* make 'run sql' step in pipeline work for EGY/rainfall AB[#6212](https://github.com/rodekruis/IBF-system/issues/6212) ([26b7c20](https://github.com/rodekruis/IBF-system/commit/26b7c2061bf2206c5c28fcff54f88f313d06b224))


### Features

* add egy to countries AB[#6288](https://github.com/rodekruis/IBF-system/issues/6288) AB[#6291](https://github.com/rodekruis/IBF-system/issues/6291) ([a799e59](https://github.com/rodekruis/IBF-system/commit/a799e596c128dfae0ceb9f3407803f8b5ffe3918))
* egypt user AB[#6289](https://github.com/rodekruis/IBF-system/issues/6289) ([fb53512](https://github.com/rodekruis/IBF-system/commit/fb5351270e80848b37b84e3d83c834068748ffa4))
* load admin-boundary data via seed AB[#6288](https://github.com/rodekruis/IBF-system/issues/6288) ([886c13f](https://github.com/rodekruis/IBF-system/commit/886c13ff552b3bbdd5351f367700af1b622a3ed1))
* overwrite per country AB[#6337](https://github.com/rodekruis/IBF-system/issues/6337) AB[#6340](https://github.com/rodekruis/IBF-system/issues/6340) ([c21e658](https://github.com/rodekruis/IBF-system/commit/c21e658c74a56ba72edc5a884136241a35bd43c2))



# [0.23.0](https://github.com/rodekruis/IBF-system/compare/v0.22.0...v0.23.0) (2021-02-26)


### Bug Fixes

* make pipeline work for rainfall AB[#6212](https://github.com/rodekruis/IBF-system/issues/6212) ([36d2cb6](https://github.com/rodekruis/IBF-system/commit/36d2cb6d71215c763b97af27054d34368623715f))
* new location/filter on git-lfs files AB[#6294](https://github.com/rodekruis/IBF-system/issues/6294) ([3c046ca](https://github.com/rodekruis/IBF-system/commit/3c046ca5882a9ac21dca3da6619391badafa5976))
* remove unused controllers/methods AB[#6294](https://github.com/rodekruis/IBF-system/issues/6294) ([7e4f569](https://github.com/rodekruis/IBF-system/commit/7e4f569249914741d3cd690c814401f75e5197b1))
* turn off sql + notify for egypt (fix later) ([4659ebf](https://github.com/rodekruis/IBF-system/commit/4659ebf7f22d2d599a053f62e462207e79533e36))
* uncomment forgotten AB[#6336](https://github.com/rodekruis/IBF-system/issues/6336) ([0f7e16d](https://github.com/rodekruis/IBF-system/commit/0f7e16d209149b6336cd274b85be1907bf7c9f38))


### Features

* add test shapefile git LFS AB[#6294](https://github.com/rodekruis/IBF-system/issues/6294) ([9b452f1](https://github.com/rodekruis/IBF-system/commit/9b452f19ac3687ef23363d4845330b86ff91192b))
* admin-area-entity + seed Egypt data AB[#6294](https://github.com/rodekruis/IBF-system/issues/6294) ([b474101](https://github.com/rodekruis/IBF-system/commit/b4741012b6f8816c7fb5c931d9eb8ed1b17f8f97))
* get static data pipeline from db AB[#6336](https://github.com/rodekruis/IBF-system/issues/6336) ([5035b92](https://github.com/rodekruis/IBF-system/commit/5035b9275b1f219d24ebafbec5298414c65293e3))
* load glofas station CSV input via seed (for now unused) AB[#6336](https://github.com/rodekruis/IBF-system/issues/6336) ([4232f24](https://github.com/rodekruis/IBF-system/commit/4232f243ce825352d2331c261f32ea6791511e84))
* set up Git LFS AB[#6294](https://github.com/rodekruis/IBF-system/issues/6294) ([e53c448](https://github.com/rodekruis/IBF-system/commit/e53c44817c3d16aa83bd2cde9948e19a6c6d228b))



# [0.22.0](https://github.com/rodekruis/IBF-system/compare/v0.21.2...v0.22.0) (2021-02-24)


### Features

* add component property to analytics events AB[#6335](https://github.com/rodekruis/IBF-system/issues/6335) ([f0ce69d](https://github.com/rodekruis/IBF-system/commit/f0ce69ddca6c59f89b48801673f7ea06d9080f25))



## [0.21.2](https://github.com/rodekruis/IBF-system/compare/v0.21.1...v0.21.2) (2021-02-23)


### Bug Fixes

* use POSTGRES_DB instead of POSTGRES_DBNAME AB[#6253](https://github.com/rodekruis/IBF-system/issues/6253) ([7b055c0](https://github.com/rodekruis/IBF-system/commit/7b055c0a30a9adab448906e1e1b8f04984b268dd))



## [0.21.1](https://github.com/rodekruis/IBF-system/compare/v0.21.0...v0.21.1) (2021-02-22)


### Bug Fixes

* trigger country-subscription at refresh AB[#6272](https://github.com/rodekruis/IBF-system/issues/6272) ([08cb35c](https://github.com/rodekruis/IBF-system/commit/08cb35c52f081e662ae0fd83894b51f3d26d0252))



# [0.21.0](https://github.com/rodekruis/IBF-system/compare/v0.20.3...v0.21.0) (2021-02-19)


### Bug Fixes

* move getMetadata endpoint to indicator-module AB[#6278](https://github.com/rodekruis/IBF-system/issues/6278) ([4a5de88](https://github.com/rodekruis/IBF-system/commit/4a5de88c45de868bb2eef6c1367197f1b5343c95))


### Features

* add unit to map popup AB[#6183](https://github.com/rodekruis/IBF-system/issues/6183) ([7ffb1b5](https://github.com/rodekruis/IBF-system/commit/7ffb1b5182421311a1d5bd41fe174a8e1abffe30))
* add unit to map-legend AB[#6184](https://github.com/rodekruis/IBF-system/issues/6184) ([9dc3e32](https://github.com/rodekruis/IBF-system/commit/9dc3e32304ebb52dd593290fe34c59776bdf9494))
* add unit-attribute to indicator-metadata AB[#6182](https://github.com/rodekruis/IBF-system/issues/6182) ([7c95113](https://github.com/rodekruis/IBF-system/commit/7c9511330b27c0ba2bb32fbe6cc7a57d786a1aa0))



## [0.20.3](https://github.com/rodekruis/IBF-system/compare/v0.20.2...v0.20.3) (2021-02-19)


### Bug Fixes

* have geojson import work with new version of dash-leaflet AB[#6038](https://github.com/rodekruis/IBF-system/issues/6038) ([e1dbeb9](https://github.com/rodekruis/IBF-system/commit/e1dbeb9d3edaeb3d5bde4b72ec107ba46ef8f29d))



## [0.20.2](https://github.com/rodekruis/IBF-system/compare/v0.20.1...v0.20.2) (2021-02-19)


### Bug Fixes

* submit eap action disable button AB[#6181](https://github.com/rodekruis/IBF-system/issues/6181) ([c1fe206](https://github.com/rodekruis/IBF-system/commit/c1fe20663d5d2f7ca4f679b1260fdd4f1c9a7e94))
* submit eap action disable button AB[#6181](https://github.com/rodekruis/IBF-system/issues/6181) ([9a29213](https://github.com/rodekruis/IBF-system/commit/9a29213ae7e6723796452ac72133626e54c87844))



## [0.20.1](https://github.com/rodekruis/IBF-system/compare/v0.20.0...v0.20.1) (2021-02-19)


### Bug Fixes

* fix+improve email sending for all countries AB[#6215](https://github.com/rodekruis/IBF-system/issues/6215) ([313ac07](https://github.com/rodekruis/IBF-system/commit/313ac07d4da61288bd0c17cf957a03a3d8bc6f15))



# [0.20.0](https://github.com/rodekruis/IBF-system/compare/v0.19.1...v0.20.0) (2021-02-19)


### Bug Fixes

* create table if not exists AB[#6254](https://github.com/rodekruis/IBF-system/issues/6254) ([f71465e](https://github.com/rodekruis/IBF-system/commit/f71465e91f7a10eef3052ad606a00c8539e8ab9a))
* create tables if not exist AB[#6254](https://github.com/rodekruis/IBF-system/issues/6254) ([138230f](https://github.com/rodekruis/IBF-system/commit/138230fcf5c7ac1e3a0453db34c465f6e774efad))


### Features

* add dockerized local db AB[#6253](https://github.com/rodekruis/IBF-system/issues/6253) ([0dbeeed](https://github.com/rodekruis/IBF-system/commit/0dbeeed76376fc5ad7b2fd6525e8c4a96c662bc3))



