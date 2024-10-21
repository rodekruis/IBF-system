## [0.273.3](https://github.com/rodekruis/IBF-system/compare/v0.273.2...v0.273.3) (2024-10-21)


### Bug Fixes

* compact number in email should consider format ([780ad71](https://github.com/rodekruis/IBF-system/commit/780ad7155f3b76846b9e5234e884f18b36831b98))
* remove event aggregate in email ([2c4117e](https://github.com/rodekruis/IBF-system/commit/2c4117e7c0e02f95c5b93c6e86114b3f5d6faa48))
* use average for percentage indicators in email body event ([1088ba8](https://github.com/rodekruis/IBF-system/commit/1088ba8fcb0748c47ef61eeac1c6a3ac214aee05))



## [0.273.2](https://github.com/rodekruis/IBF-system/compare/v0.273.1...v0.273.2) (2024-10-15)


### Bug Fixes

* do not send any mock exposure data when leadTime > 3 months ([7f269dd](https://github.com/rodekruis/IBF-system/commit/7f269ddd508a21ca7031d33e8d3497adb6b42d76))



## [0.273.1](https://github.com/rodekruis/IBF-system/compare/v0.273.0...v0.273.1) (2024-10-15)


### Bug Fixes

* make triggered-areas api-call after eventName is set ([b00e14a](https://github.com/rodekruis/IBF-system/commit/b00e14ae80a414ec81324e4d49c0af7e10b45b0f))



# [0.273.0](https://github.com/rodekruis/IBF-system/compare/v0.272.2...v0.273.0) (2024-10-15)


### Features

* reverse multi-threshold other countries ([b2acf60](https://github.com/rodekruis/IBF-system/commit/b2acf601077c50c3949c6f2b39db3cf4fb4cea08))



## [0.272.2](https://github.com/rodekruis/IBF-system/compare/v0.272.1...v0.272.2) (2024-10-15)


### Bug Fixes

* update en.json import ([9683842](https://github.com/rodekruis/IBF-system/commit/9683842d5896a9a411dde02592aaddc24a63c337))



## [0.272.1](https://github.com/rodekruis/IBF-system/compare/v0.272.0...v0.272.1) (2024-10-14)


### Bug Fixes

* area speech bbubble appears twice ([2d7ea68](https://github.com/rodekruis/IBF-system/commit/2d7ea687017011c066e383561de5f010a07b3f34))



# [0.272.0](https://github.com/rodekruis/IBF-system/compare/v0.271.3...v0.272.0) (2024-10-14)


### Bug Fixes

* add 'first' to start date copy in email ([b609590](https://github.com/rodekruis/IBF-system/commit/b609590220c50c4e178024e2950b3880028ab339))
* align warning-to-trigger email ocpy logic with portal ([0e0fe4d](https://github.com/rodekruis/IBF-system/commit/0e0fe4d9776d540c7379c56272c8767684fbd808))
* change weird apiTest variable naming ([ad19fdc](https://github.com/rodekruis/IBF-system/commit/ad19fdc47e95fa1e90b00f3fb85d37e9becfecb8))
* failing test by using HH:mm as default hour format convention ([bc34903](https://github.com/rodekruis/IBF-system/commit/bc34903fe18c8896da99785fcc15292d20177cca))
* get correct glofas dynamic data in case of warning-to-trigger scenario ([344cc15](https://github.com/rodekruis/IBF-system/commit/344cc15fe2c3319c5aedadef00b0677306c3b581))
* get glofas popup leadtime from eventName is stationCode or stationName ([9015823](https://github.com/rodekruis/IBF-system/commit/90158233bcb71862d36f4028afa70d524fea8e0b))
* label ongoing in event header ([e855d93](https://github.com/rodekruis/IBF-system/commit/e855d93f2e396b1e3d7fe8917dc2d55ad5a5454a))
* make email body logic hazard-independent ([58fc7d8](https://github.com/rodekruis/IBF-system/commit/58fc7d8ed4e4640c306510b773eef3137722cb91))
* make get point data query generic again ([2e31033](https://github.com/rodekruis/IBF-system/commit/2e31033b633966e004fece44e4541992d032732a))
* mock flash floods exposed point assets ([cd005e4](https://github.com/rodekruis/IBF-system/commit/cd005e44ba2ceab153a0ac17a8cc4cc6d483df1f))
* only use most recent dynamic data available per point ([913641f](https://github.com/rodekruis/IBF-system/commit/913641fbef0649ed08a136a6ee4a232b2c16d0cd))
* remove old glofas station endpoints ([96d6e74](https://github.com/rodekruis/IBF-system/commit/96d6e74368fe01cba9cf71bfe65e19460c9878c1))
* use same upload date throughout api-calls when not passed ([d2861a6](https://github.com/rodekruis/IBF-system/commit/d2861a6d9186bb06f764579de84b8d06ff0a3795))


### Features

* disable finished-event notifications ([30be269](https://github.com/rodekruis/IBF-system/commit/30be2697bd9eec74d400d1c035f2a25879216a4b))
* switch all countries to multi-threshold ([f678d99](https://github.com/rodekruis/IBF-system/commit/f678d9921999a0b4c548b716f4e6367e197f6eeb))



## [0.271.3](https://github.com/rodekruis/IBF-system/compare/v0.271.2...v0.271.3) (2024-10-08)


### Bug Fixes

* mock flash floods exposed point assets ([ab58c0e](https://github.com/rodekruis/IBF-system/commit/ab58c0ed0c6cfb2ea72ee108956acbbb7e29ec28))



## [0.271.2](https://github.com/rodekruis/IBF-system/compare/v0.271.1...v0.271.2) (2024-10-01)


### Bug Fixes

* check if raster files exist before reading them ([2fdfdef](https://github.com/rodekruis/IBF-system/commit/2fdfdefc8a7242b94406b9c4340aa3b8ca092847))
* merge NG_API_URL and BASE_URL_IBF_SERVICE into API_SERVICE_URL ([9c1d2bb](https://github.com/rodekruis/IBF-system/commit/9c1d2bb0de5a3fa68ae5d192299dbb495deb1815))



## [0.271.1](https://github.com/rodekruis/IBF-system/compare/v0.271.0...v0.271.1) (2024-09-30)


### Bug Fixes

* change scenario name 'default' to 'trigger' ([63f133b](https://github.com/rodekruis/IBF-system/commit/63f133b15f3717ae52ca61a30c4ee4dc9ebb0e05))
* rename more occurences of 'default' ([da97514](https://github.com/rodekruis/IBF-system/commit/da97514ab665376160bef85106e33bd40b047efd))
* switch mock path and body for migrated disaster-types ([e77a1e4](https://github.com/rodekruis/IBF-system/commit/e77a1e45ad5c0442e678d1d9123ca24042d7231f))



