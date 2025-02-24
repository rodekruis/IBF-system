# [0.284.0](https://github.com/rodekruis/IBF-system/compare/v0.283.2...v0.284.0) (2025-02-24)


### Bug Fixes

* alert per trigger should insert ([caf0877](https://github.com/rodekruis/IBF-system/commit/caf0877ebf75813ae8f27d9e48cf4c32e8c26102))
* fallback undefined value ([107c41f](https://github.com/rodekruis/IBF-system/commit/107c41f8d7fdf132ff0904732c8b4abb310ca794))
* include warnings in deeper alert areas ([213aaf6](https://github.com/rodekruis/IBF-system/commit/213aaf65e94e7cd479eebcd7db26f9ea94989deb))
* integration testing old style ([dc80aff](https://github.com/rodekruis/IBF-system/commit/dc80aff2db8245febed39e004b07d9f9808d0e44))
* label trigger log forecastSeverity=1 as Warning ([eae8154](https://github.com/rodekruis/IBF-system/commit/eae81549114c3446a580d2dbfa5e8201333a5613))
* MOCK_USE_OLD_PIPELINE_UPLOAD with ELSE block ([4e1304a](https://github.com/rodekruis/IBF-system/commit/4e1304a6c6d12228cfdca5d3df418e069186cce6))
* no-trigger alerts-per-lead-time upload ([6cebcea](https://github.com/rodekruis/IBF-system/commit/6cebcea8c3c7f989300c9d36b980ebb4ea787654))
* put back insertAlertsPerLeadTime call in processEventAreas() ([55b1ebd](https://github.com/rodekruis/IBF-system/commit/55b1ebdcab049cd42ba8ebcf1364b919e61c5e77))
* remaining references to alert_threshold in backend AB[#33490](https://github.com/rodekruis/IBF-system/issues/33490) ([d48239f](https://github.com/rodekruis/IBF-system/commit/d48239f526bc5991415f1a7c6325dc320f8215e0))
* remove extra argument ([7805282](https://github.com/rodekruis/IBF-system/commit/78052820cc52b9b022c5410ab935fced1173dcbb))
* update alertThreshold reference in GET /admin-areas AB[#33490](https://github.com/rodekruis/IBF-system/issues/33490) ([14a0b7d](https://github.com/rodekruis/IBF-system/commit/14a0b7dc943537cac13fac43acb6f113b440a7e6))
* update reference to alertThreshold in getAlertAreas AB[#33490](https://github.com/rodekruis/IBF-system/issues/33490) ([1498834](https://github.com/rodekruis/IBF-system/commit/1498834cacef6700d9c9a4015507062a2e5ed78e))


### Features

* change frontend red outline layer + alert_threshold references AB[#33686](https://github.com/rodekruis/IBF-system/issues/33686) ([7fdc119](https://github.com/rodekruis/IBF-system/commit/7fdc119e10c0dea9aed00a1ce9eb69ec513b476d))
* facilitate transition period for 'trigger' layer ([eb47068](https://github.com/rodekruis/IBF-system/commit/eb4706832dca46138a14c36ac88d82d95b362cf9))
* process pipeline runs old and new AB[#33398](https://github.com/rodekruis/IBF-system/issues/33398) AB[#33999](https://github.com/rodekruis/IBF-system/issues/33999) ([ff1b91a](https://github.com/rodekruis/IBF-system/commit/ff1b91aa130e47a4a160fe8a35089bd9fb83c794))



## [0.283.2](https://github.com/rodekruis/IBF-system/compare/v0.283.1...v0.283.2) (2025-02-18)


### Bug Fixes

* comment out new indicators AB[#33654](https://github.com/rodekruis/IBF-system/issues/33654) ([758bc09](https://github.com/rodekruis/IBF-system/commit/758bc0950cccecc71d605b4effac4cb0b3d23266))
* facilitate old and new alert-per-lead-time endpoint/dto AB[#33630](https://github.com/rodekruis/IBF-system/issues/33630) ([a6ef169](https://github.com/rodekruis/IBF-system/commit/a6ef1697950d435dec4f6d7c83644c2dda56a008))
* integration tests ([9c9ba7c](https://github.com/rodekruis/IBF-system/commit/9c9ba7caab16fc49002d1adf076c3f2a9ce00cde))
* mock data to new dto AB[#33630](https://github.com/rodekruis/IBF-system/issues/33630) ([04f4335](https://github.com/rodekruis/IBF-system/commit/04f4335b2d40c15c7aba1886692d6d708d7df851))



## [0.283.1](https://github.com/rodekruis/IBF-system/compare/v0.283.0...v0.283.1) (2025-02-14)


### Bug Fixes

* flaky e2e test ([7df307c](https://github.com/rodekruis/IBF-system/commit/7df307c980aea7d17025069bce5c1f2bf9efd9f3))



# [0.283.0](https://github.com/rodekruis/IBF-system/compare/v0.282.0...v0.283.0) (2025-02-12)


### Bug Fixes

* monthlyForecastInfo KEN ([099612a](https://github.com/rodekruis/IBF-system/commit/099612a6ae99704166283423ee8724da927cd2d5))


### Features

* remove endOfMonthPipeline exception AB[#33425](https://github.com/rodekruis/IBF-system/issues/33425) ([d0ec5d8](https://github.com/rodekruis/IBF-system/commit/d0ec5d87483d6155d15cfa92c0a19bbfb6bc7fd0))



# [0.282.0](https://github.com/rodekruis/IBF-system/compare/v0.281.1...v0.282.0) (2025-02-11)


### Bug Fixes

* revert local testing scenario update ([246e5b8](https://github.com/rodekruis/IBF-system/commit/246e5b8538e52eab73cefcc1972716faeece0d4e))
* tests ([100723c](https://github.com/rodekruis/IBF-system/commit/100723cd3944faddd80a7d24477fb6175287967c))


### Features

* add update-user endpoint AB[#33049](https://github.com/rodekruis/IBF-system/issues/33049) ([4b1972c](https://github.com/rodekruis/IBF-system/commit/4b1972c66e1a3fdcaa88e30635e5a3a24629a997))



## [0.281.1](https://github.com/rodekruis/IBF-system/compare/v0.281.0...v0.281.1) (2025-02-07)


### Bug Fixes

* e2e test AB[#33251](https://github.com/rodekruis/IBF-system/issues/33251) ([5afffa3](https://github.com/rodekruis/IBF-system/commit/5afffa343cdff55b5d019a85886799609b6d6bd8))
* get formatted eventname + refactor note + small typing AB[#33247](https://github.com/rodekruis/IBF-system/issues/33247) ([2fc1fb4](https://github.com/rodekruis/IBF-system/commit/2fc1fb493d59262ff4890a042990333f2d0634ae))
* remove isEventBased + switch on breadcrumbs drought AB[#33247](https://github.com/rodekruis/IBF-system/issues/33247) ([f6d31eb](https://github.com/rodekruis/IBF-system/commit/f6d31ebd9d988afe8956da7833e5ab736970306c))
* select earliest possible event on map-click AB[#33247](https://github.com/rodekruis/IBF-system/issues/33247) ([bf15eee](https://github.com/rodekruis/IBF-system/commit/bf15eee50657c55a3891f1fc5988a0ea6bdec316))
* test whatsapp message on new notification AB[#33243](https://github.com/rodekruis/IBF-system/issues/33243) ([b815a75](https://github.com/rodekruis/IBF-system/commit/b815a7516e46a9b3491ca5cf3fc572539a3d3aa9))



# [0.281.0](https://github.com/rodekruis/IBF-system/compare/v0.280.0...v0.281.0) (2025-02-05)


### Bug Fixes

* area-of-focus e2e test ([02d84e7](https://github.com/rodekruis/IBF-system/commit/02d84e78f1f816059ccec3adb8e54183b0dcb04c))
* process more PR comments ([e05ff9c](https://github.com/rodekruis/IBF-system/commit/e05ff9cf21b49b65832328a374d371a7d48c2024))
* seed eap-actions ([9da8f30](https://github.com/rodekruis/IBF-system/commit/9da8f3012c81b8a7cf2cf0f8f03a001b6b298d9c))
* tests leadtime ([2c9b0d8](https://github.com/rodekruis/IBF-system/commit/2c9b0d816b3194d8cc1b5e90b49c30b3c008af8c))


### Features

* create endpoint to add/update disaster ([292560b](https://github.com/rodekruis/IBF-system/commit/292560be7cb3b935876a0e4c6e33b96565c6f6a8))



# [0.280.0](https://github.com/rodekruis/IBF-system/compare/v0.279.0...v0.280.0) (2025-02-03)


### Features

* remove stop propertise from trigger log AB[#32660](https://github.com/rodekruis/IBF-system/issues/32660) ([36bb8db](https://github.com/rodekruis/IBF-system/commit/36bb8db4bf3c03d3b23757358a066e7c1b51ccb0))



# [0.279.0](https://github.com/rodekruis/IBF-system/compare/v0.278.7...v0.279.0) (2025-01-31)


### Features

* set up geoserver for rainfall_forecast and population with dummy data AB[#32769](https://github.com/rodekruis/IBF-system/issues/32769) ([d6047c7](https://github.com/rodekruis/IBF-system/commit/d6047c7135c1ec03353d91333eca68df8090b6d5))



## [0.278.7](https://github.com/rodekruis/IBF-system/compare/v0.278.6...v0.278.7) (2025-01-29)


### Bug Fixes

* update misplaced glofas stations AB[#33136](https://github.com/rodekruis/IBF-system/issues/33136) ([2bfbae5](https://github.com/rodekruis/IBF-system/commit/2bfbae5500017a80ca1fc22e168962f616b172b3))



