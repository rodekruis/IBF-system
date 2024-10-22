## [0.274.2](https://github.com/rodekruis/IBF-system/compare/v0.274.1...v0.274.2) (2024-10-22)


### Bug Fixes

* center header logo on outlook for windows ([d1ec7e2](https://github.com/rodekruis/IBF-system/commit/d1ec7e2ff15848cdf8629272b6d5f4c1d90985b8))



## [0.274.1](https://github.com/rodekruis/IBF-system/compare/v0.274.0...v0.274.1) (2024-10-21)


### Bug Fixes

* empty thirdLine in date-button ([6588390](https://github.com/rodekruis/IBF-system/commit/6588390de4a74044691371800550d9803627d8c4))



# [0.274.0](https://github.com/rodekruis/IBF-system/compare/v0.273.3...v0.274.0) (2024-10-21)


### Bug Fixes

* add check for leadtime not existing ([3d11334](https://github.com/rodekruis/IBF-system/commit/3d11334f0df53edd25362625b6bcc038e0636433))
* update data via migration script where possible ([4b380df](https://github.com/rodekruis/IBF-system/commit/4b380dfd6dae8261ca48d02cbf2cc4d6a69d00cd))
* update return period mock UGA ([20efcb9](https://github.com/rodekruis/IBF-system/commit/20efcb9effb7befde0a37c85136f4eb0459fa8ce))


### Features

* update trigger statements floods ([4dd9e55](https://github.com/rodekruis/IBF-system/commit/4dd9e558a155be15d7f51e29a0392ad3801e4010))



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



