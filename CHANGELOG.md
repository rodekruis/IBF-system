# [0.42.0](https://github.com/rodekruis/IBF-system/compare/v0.41.0...v0.42.0) (2021-03-19)


### Features

* add flood susceptibility layer AB[#6635](https://github.com/rodekruis/IBF-system/issues/6635) ([4786238](https://github.com/rodekruis/IBF-system/commit/4786238d69fbbafe0e71ab047b5014579bbeba39))
* add flood susceptibility layer geoserver AB[#6631](https://github.com/rodekruis/IBF-system/issues/6631) ([5dccdf1](https://github.com/rodekruis/IBF-system/commit/5dccdf135ed05ab9e58f7be8d839f60cca1e1726))
* add style geoserver for flood susceptibiltiy AB[#6632](https://github.com/rodekruis/IBF-system/issues/6632) ([db27375](https://github.com/rodekruis/IBF-system/commit/db273756c44e7d28ebb60d02c716803ef2bc9bcc))



# [0.41.0](https://github.com/rodekruis/IBF-system/compare/v0.40.2...v0.41.0) (2021-03-19)


### Bug Fixes

* load all users on staging AB[#6636](https://github.com/rodekruis/IBF-system/issues/6636) ([d2ddeef](https://github.com/rodekruis/IBF-system/commit/d2ddeef964221a4d5f60cd511d40e6d7add9c44c))


### Features

* endpoint to get admin boundaries (for pipeline, unused yet) AB[#6626](https://github.com/rodekruis/IBF-system/issues/6626) ([21f76ef](https://github.com/rodekruis/IBF-system/commit/21f76ef91020017d234deaac90e50e4abfd1fb22))
* make pipeline read geojson from db instead of file AB[#6626](https://github.com/rodekruis/IBF-system/issues/6626) ([ece8d81](https://github.com/rodekruis/IBF-system/commit/ece8d8171e6febfdf54f6980a9999fa645bbf85e))
* update egypt geojson AB[#6627](https://github.com/rodekruis/IBF-system/issues/6627) ([8a8ab77](https://github.com/rodekruis/IBF-system/commit/8a8ab776dcbe261c803c1327bcfde6544c2e2c62))
* visualize disputed boundaries AB[#6629](https://github.com/rodekruis/IBF-system/issues/6629) ([a57520b](https://github.com/rodekruis/IBF-system/commit/a57520bff7008169048ecbab1d3c1bd732bc70db))



## [0.40.2](https://github.com/rodekruis/IBF-system/compare/v0.40.1...v0.40.2) (2021-03-19)


### Bug Fixes

* also apply change in trigger-situation AB[#6691](https://github.com/rodekruis/IBF-system/issues/6691) ([33a30dd](https://github.com/rodekruis/IBF-system/commit/33a30ddc13674b708a20925f2e99f294e9a6009d))
* unselected places should not turn grey for admin boundary layer AB[#6691](https://github.com/rodekruis/IBF-system/issues/6691) ([7467ab2](https://github.com/rodekruis/IBF-system/commit/7467ab211017a4e69b3dca6f979d855b1a3ef142))



## [0.40.1](https://github.com/rodekruis/IBF-system/compare/v0.40.0...v0.40.1) (2021-03-19)


### Bug Fixes

* eap actions submit AB[#6700](https://github.com/rodekruis/IBF-system/issues/6700) ([766b5bd](https://github.com/rodekruis/IBF-system/commit/766b5bddfc881bc286e2dd4819536fb9b754bec0))
* populationAffected column should not get dropped on synchronize AB[#6690](https://github.com/rodekruis/IBF-system/issues/6690) ([ba32330](https://github.com/rodekruis/IBF-system/commit/ba32330e820b43d0f17c9e5f1eb4e4f775e481cb))
* remove DDL AB[#6690](https://github.com/rodekruis/IBF-system/issues/6690) ([992db99](https://github.com/rodekruis/IBF-system/commit/992db99542151bc8eda59607eb6faaac7f764f8f))



# [0.40.0](https://github.com/rodekruis/IBF-system/compare/v0.39.0...v0.40.0) (2021-03-19)


### Bug Fixes

* update geoserver store+layer to 5-day AB[#6703](https://github.com/rodekruis/IBF-system/issues/6703) ([04c645a](https://github.com/rodekruis/IBF-system/commit/04c645a0b671c7c0a4e48f2313a252894e269c02))
* update UGA glofas stations AB[#6492](https://github.com/rodekruis/IBF-system/issues/6492) ([60cab6b](https://github.com/rodekruis/IBF-system/commit/60cab6b9bcdfb92597a0902dff199579f00f5d1d))


### Features

* use Glofas API instead of FTP AB[#6491](https://github.com/rodekruis/IBF-system/issues/6491) ([f0fd484](https://github.com/rodekruis/IBF-system/commit/f0fd484bbb1be6e555ae8001d0bfb972ee5e61a8))



# [0.39.0](https://github.com/rodekruis/IBF-system/compare/v0.38.2...v0.39.0) (2021-03-15)


### Features

* disable close-event when activeTrigger AB[#6623](https://github.com/rodekruis/IBF-system/issues/6623) ([f2a5729](https://github.com/rodekruis/IBF-system/commit/f2a57294e03b613f12bf0e7b10b4844b0afe2e59))



## [0.38.2](https://github.com/rodekruis/IBF-system/compare/v0.38.1...v0.38.2) (2021-03-15)


### Bug Fixes

* run sql-scripts in right order AB[#6603](https://github.com/rodekruis/IBF-system/issues/6603) ([8f97aea](https://github.com/rodekruis/IBF-system/commit/8f97aeae73d8bbd48e276e64c820fae5f5fb3e2a))



## [0.38.1](https://github.com/rodekruis/IBF-system/compare/v0.38.0...v0.38.1) (2021-03-15)


### Bug Fixes

* broken wms layer AB[#6614](https://github.com/rodekruis/IBF-system/issues/6614) ([23d3310](https://github.com/rodekruis/IBF-system/commit/23d33105aeb577f63919639712a2390a378366c2))
* broken wms layer AB[#6614](https://github.com/rodekruis/IBF-system/issues/6614) ([538c623](https://github.com/rodekruis/IBF-system/commit/538c623d81de7c494995a5966516a38725e497d0))
* dont' use loader for close event AB[#6602](https://github.com/rodekruis/IBF-system/issues/6602) ([2f6a6ed](https://github.com/rodekruis/IBF-system/commit/2f6a6ed3cbae07a22bc6462e34cf7d2596bd9516))



# [0.38.0](https://github.com/rodekruis/IBF-system/compare/v0.37.3...v0.38.0) (2021-03-15)


### Features

* changing console logs in seed ([5d0408d](https://github.com/rodekruis/IBF-system/commit/5d0408de90616add54e5e8609669fb790f7fa527))



## [0.37.3](https://github.com/rodekruis/IBF-system/compare/v0.37.2...v0.37.3) (2021-03-15)


### Bug Fixes

* improve promise.all AB[#6599](https://github.com/rodekruis/IBF-system/issues/6599) ([b813ff3](https://github.com/rodekruis/IBF-system/commit/b813ff3d75bdbf2b151e3a00caea9c9a5e18fea5))



