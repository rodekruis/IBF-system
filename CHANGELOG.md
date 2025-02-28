# [0.289.0](https://github.com/rodekruis/IBF-system/compare/v0.288.1...v0.289.0) (2025-02-28)


### Bug Fixes

* hide wrongly calculated total exposure if percentage ([e8ae728](https://github.com/rodekruis/IBF-system/commit/e8ae72896af0c5e85940184f924a8506aba1572c))


### Features

* replace monthly-forecast-info by forecastSource and align with design ([c7aae3f](https://github.com/rodekruis/IBF-system/commit/c7aae3f5bfd7b921d456329c479393817872e3b1))



## [0.288.1](https://github.com/rodekruis/IBF-system/compare/v0.288.0...v0.288.1) (2025-02-28)


### Bug Fixes

* process alert_threshold rename via migration AB[#33405](https://github.com/rodekruis/IBF-system/issues/33405) ([b57c53f](https://github.com/rodekruis/IBF-system/commit/b57c53fa5682b53a52278883053b5d001a6351c5))
* process uncovered datamodel changes AB[#33405](https://github.com/rodekruis/IBF-system/issues/33405) ([ccf6110](https://github.com/rodekruis/IBF-system/commit/ccf611065bd91d4bd703133bf392d9c2f91b48f3))



# [0.288.0](https://github.com/rodekruis/IBF-system/compare/v0.287.0...v0.288.0) (2025-02-28)


### Features

* remove covid risk layer AB[#33963](https://github.com/rodekruis/IBF-system/issues/33963) ([f92eaa5](https://github.com/rodekruis/IBF-system/commit/f92eaa55ee68520c8a099f44c86e4b1abd67fe05))



# [0.287.0](https://github.com/rodekruis/IBF-system/compare/v0.286.0...v0.287.0) (2025-02-27)


### Bug Fixes

* build error ([fd02446](https://github.com/rodekruis/IBF-system/commit/fd0244617d6b2edb704474dab3786a26abdda65b))
* warning-to-trigger scenario ([3721dec](https://github.com/rodekruis/IBF-system/commit/3721deca4dd6d0b9ff1d0d8c3b8810509de01f4e))


### Features

* unclickable timelines + refactor AB[#33408](https://github.com/rodekruis/IBF-system/issues/33408) ([0f25bf0](https://github.com/rodekruis/IBF-system/commit/0f25bf0a56d89c2f462dba917439785e8db4777f))



# [0.286.0](https://github.com/rodekruis/IBF-system/compare/v0.285.0...v0.286.0) (2025-02-25)


### Bug Fixes

* basic changes to arrive at working front-end AB[#33407](https://github.com/rodekruis/IBF-system/issues/33407) ([f47e01b](https://github.com/rodekruis/IBF-system/commit/f47e01b42ff9fb460948aeafff6549d9ae4bacd6))
* bug in getActiveAlertAreas query ([547a4e3](https://github.com/rodekruis/IBF-system/commit/547a4e3c98d61c2e2d09993e31ffd60d4acf51c5))
* remove app-timestamp properly ([fb37f49](https://github.com/rodekruis/IBF-system/commit/fb37f49099264d7072490e60819b94f988934d86))
* rename startDate to firstIssuedDate ([40a0e46](https://github.com/rodekruis/IBF-system/commit/40a0e46869c9d0942239bd8d96cae60e43081c62))
* show exposure for warnings also if available AB[#33407](https://github.com/rodekruis/IBF-system/issues/33407) ([4dc5f72](https://github.com/rodekruis/IBF-system/commit/4dc5f723b6cd4c3a4ed59935249a609f95af2693))


### Features

* show first issued date in bottomright of speech bubble ([940e63f](https://github.com/rodekruis/IBF-system/commit/940e63f718d7faba24f47c0767538d39dec416ff))



# [0.285.0](https://github.com/rodekruis/IBF-system/compare/v0.284.0...v0.285.0) (2025-02-24)


### Bug Fixes

* correctly test on event.startDate in timestamp format AB[#33907](https://github.com/rodekruis/IBF-system/issues/33907) ([4702efe](https://github.com/rodekruis/IBF-system/commit/4702efe0825692a417ce2eaf300d0d348785752f))


### Features

* send email on event starting as ongoing AB[#33907](https://github.com/rodekruis/IBF-system/issues/33907) ([26aca8a](https://github.com/rodekruis/IBF-system/commit/26aca8ae4a3680f311e240cd844d91c600b7282e))



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



