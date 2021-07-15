## [0.77.1](https://github.com/rodekruis/IBF-system/compare/v0.77.0...v0.77.1) (2021-07-15)


### Bug Fixes

* blank dev menu header and move mock scenario strings to ngx translate ([3039f20](https://github.com/rodekruis/IBF-system/commit/3039f20dbf29d26e30c77e2bce355abf1906549c))
* include translate module in spec ([78a2e4e](https://github.com/rodekruis/IBF-system/commit/78a2e4e95abeeb94ee8cf6e04a92f2ca71fc8305))



# [0.77.0](https://github.com/rodekruis/IBF-system/compare/v0.76.3...v0.77.0) (2021-07-15)


### Features

* add potential cases under 5 layer for malaria ([af08d12](https://github.com/rodekruis/IBF-system/commit/af08d12968de010330dbb0d583f12a4a2298fcf9))



## [0.76.3](https://github.com/rodekruis/IBF-system/compare/v0.76.2...v0.76.3) (2021-07-15)


### Bug Fixes

* remove hardcoding on dasbhoard and refactor mock alert ([1ee4644](https://github.com/rodekruis/IBF-system/commit/1ee4644b9888d6e10fd3a215da792229d090b640))



## [0.76.2](https://github.com/rodekruis/IBF-system/compare/v0.76.1...v0.76.2) (2021-07-15)


### Bug Fixes

* legend should show non-zero values ([73fcda3](https://github.com/rodekruis/IBF-system/commit/73fcda340eb3eac17be9ab7a387c7d8fdb0d1a24))



## [0.76.1](https://github.com/rodekruis/IBF-system/compare/v0.76.0...v0.76.1) (2021-07-15)


### Bug Fixes

* disable dengue for ethiopia ([2533389](https://github.com/rodekruis/IBF-system/commit/2533389e4c3ca1760a861142f5c461c8661ebace))



# [0.76.0](https://github.com/rodekruis/IBF-system/compare/v0.75.1...v0.76.0) (2021-07-15)


### Features

* add malaria disaster type AB[#8641](https://github.com/rodekruis/IBF-system/issues/8641) ([b673512](https://github.com/rodekruis/IBF-system/commit/b673512a33b59c25a7c77add08c886d31657ff0e))



## [0.75.1](https://github.com/rodekruis/IBF-system/compare/v0.75.0...v0.75.1) (2021-07-13)


### Bug Fixes

* sleep for 2 minutes before testing ([729214f](https://github.com/rodekruis/IBF-system/commit/729214fbbf57c6dde423a49ac890baa176dd271e))



# [0.75.0](https://github.com/rodekruis/IBF-system/compare/v0.74.0...v0.75.0) (2021-07-13)


### Features

* use ftp instead of datalake AB[#8575](https://github.com/rodekruis/IBF-system/issues/8575) ([de7c8c6](https://github.com/rodekruis/IBF-system/commit/de7c8c61f39339e2eaaca371e6f0048b8aa761e9))



# [0.74.0](https://github.com/rodekruis/IBF-system/compare/v0.73.0...v0.74.0) (2021-07-12)


### Bug Fixes

* show right indicator in admin-area popup AB[#8596](https://github.com/rodekruis/IBF-system/issues/8596) ([c29872f](https://github.com/rodekruis/IBF-system/commit/c29872f11c8bef72a9162e345b51b5f6fd1611d0))


### Features

* show total population in middle column AB[#8586](https://github.com/rodekruis/IBF-system/issues/8586) ([51089cb](https://github.com/rodekruis/IBF-system/commit/51089cb54810a4a17a9281992928e6394586c28f))



# [0.73.0](https://github.com/rodekruis/IBF-system/compare/v0.72.1...v0.73.0) (2021-07-12)


### Bug Fixes

* add missing migration-script AB[#8471](https://github.com/rodekruis/IBF-system/issues/8471) ([796022e](https://github.com/rodekruis/IBF-system/commit/796022e2b7b09c1b279709ec2f772a4feb68cda2))
* middlename not obligatory ([93f861f](https://github.com/rodekruis/IBF-system/commit/93f861f5a3b1e1daa285ac84c02690a33d4fccbd))


### Features

* add disasterType to datamodel, exposure endpionts, mock-endpoint and IBF-pipeline AB[#8475](https://github.com/rodekruis/IBF-system/issues/8475) ([d753310](https://github.com/rodekruis/IBF-system/commit/d753310238814e0c67f64f0b4bc2565f9e5ca160))
* basic first setup of multi-hazard AB[#8471](https://github.com/rodekruis/IBF-system/issues/8471) ([d52b4e9](https://github.com/rodekruis/IBF-system/commit/d52b4e98d31b4ddfa21d3996d5ecb9978f014c7f))
* disasterType throughout all GET endpoints and disaster-type subscriptions AB[#8471](https://github.com/rodekruis/IBF-system/issues/8471) ([e8bd235](https://github.com/rodekruis/IBF-system/commit/e8bd23557bc9867b8484d9d58ba70139b870644c))
* process woreda boundaries ETH AB[#8506](https://github.com/rodekruis/IBF-system/issues/8506) ([b11118d](https://github.com/rodekruis/IBF-system/commit/b11118d6b65b54bf1d5c5cfb1e8c27a414f5cdc7))
* split eap-actions by disasterType AB[#8471](https://github.com/rodekruis/IBF-system/issues/8471) ([1215edb](https://github.com/rodekruis/IBF-system/commit/1215edb8bb702da85211bc79fc8ce7b922357307))
* update mock data to woreda level AB[#8508](https://github.com/rodekruis/IBF-system/issues/8508) ([551986a](https://github.com/rodekruis/IBF-system/commit/551986ad2189bbc02deb77e7b1edcb68da1dea98))
* woreda-level ETH in pipeline/database/dashboard AB[#8507](https://github.com/rodekruis/IBF-system/issues/8507) ([221ced8](https://github.com/rodekruis/IBF-system/commit/221ced80f71c80c2c78af21413427965472ea7cf))
* woreda-station mapping ETH AB[#8509](https://github.com/rodekruis/IBF-system/issues/8509) ([ab64ac3](https://github.com/rodekruis/IBF-system/commit/ab64ac34aba49b33be0a82b075de9dc02597dbe6))



