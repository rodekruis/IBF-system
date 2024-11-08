## [0.274.7](https://github.com/rodekruis/IBF-system/compare/v0.274.6...v0.274.7) (2024-11-08)


### Bug Fixes

* add leading zeros in mock data ([7f1aa40](https://github.com/rodekruis/IBF-system/commit/7f1aa404c12f2316b5a5a065285d8cb59cd54875))
* drop duplicate mock entry ([09f4ba4](https://github.com/rodekruis/IBF-system/commit/09f4ba41b736eaf82dcc3ca65abffba6ccacb914))
* event count in national view ([30a619e](https://github.com/rodekruis/IBF-system/commit/30a619e50dde9f5b74a7bac85b735fbee1f7850f))
* filter area list on actionsValue > 0 in front-end ([d6eb033](https://github.com/rodekruis/IBF-system/commit/d6eb03361b0a05f3dfcdd7849681d6757d1f17ef))
* filter in back-end instead of front-end after all ([290dc4f](https://github.com/rodekruis/IBF-system/commit/290dc4f4cd42589def91f8343bef99a24f06782b))
* filter on actionsValue > 0 OR triggerValue > 0 to leave in warning areas floods. ([e432731](https://github.com/rodekruis/IBF-system/commit/e432731951dddafb84539edf2dec7c63e14ecf95))
* get area list count from array length instead of separately in backend ([b72e3b3](https://github.com/rodekruis/IBF-system/commit/b72e3b3424b2c961bf331cc662c65e8c1aefc8ad))
* get correct glofas dynamic data ([c0c6fda](https://github.com/rodekruis/IBF-system/commit/c0c6fdaa5cb32f9341c7f3dff63d1e7924135fdb))
* get count per event from back-end again ([ce55164](https://github.com/rodekruis/IBF-system/commit/ce551640f79e2563afb6bf12514a960ba6008d41))
* missing eventName ([892ce19](https://github.com/rodekruis/IBF-system/commit/892ce19d021e804d51f177058919230ea1d9b1b4))
* remove old-event from front-end mock + change eslint rule ([29f10ae](https://github.com/rodekruis/IBF-system/commit/29f10aea363b7f2568995e34db8210e1ca5776b5))
* replace dropped xample dto values ([eb7a73d](https://github.com/rodekruis/IBF-system/commit/eb7a73d5b1a52ae614cefeccf88eb7e1c207d9a6))
* revert email-specific filtering as this is already done at the source now ([17fb63a](https://github.com/rodekruis/IBF-system/commit/17fb63a5e6b6f528b102aaa29359d1e0964c9626))
* rm integration tests from deploy script ([8c0c4fd](https://github.com/rodekruis/IBF-system/commit/8c0c4fd60715761721a245ec92a73af86f9b9bd4))
* show speech bubble if 0 areas ([a46cfd2](https://github.com/rodekruis/IBF-system/commit/a46cfd269d18b1bfe1144a8b88b9e98a4e3727ac))
* version-nr ([5ac7228](https://github.com/rodekruis/IBF-system/commit/5ac7228709f0d520f937def9a5d6762328e30df1))



## [0.274.4](https://github.com/rodekruis/IBF-system/compare/v0.274.3...v0.274.4) (2024-10-23)


### Bug Fixes

* don't break if closestToLand point missing ([5306093](https://github.com/rodekruis/IBF-system/commit/530609320276813de82f14257537bcd50f85667a))



## [0.274.3](https://github.com/rodekruis/IBF-system/compare/v0.274.2...v0.274.3) (2024-10-22)


### Bug Fixes

* skip typhoon national view if 2 warning events ([e9c9f6e](https://github.com/rodekruis/IBF-system/commit/e9c9f6e35bd502f9c185026b82fce7bd57f033bb))



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



