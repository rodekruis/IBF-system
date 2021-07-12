## [0.72.1](https://github.com/rodekruis/IBF-system/compare/v0.72.0...v0.72.1) (2021-07-12)


### Bug Fixes

* division by zero AB[#8572](https://github.com/rodekruis/IBF-system/issues/8572) ([904f29e](https://github.com/rodekruis/IBF-system/commit/904f29eae78c3cbf24fd2a02bb94203a9931742d))
* EGY pipeline bug AB[#8572](https://github.com/rodekruis/IBF-system/issues/8572) ([04b2de2](https://github.com/rodekruis/IBF-system/commit/04b2de2ade3a4ab6ec4107b8c735985b7952afec))
* mock-endpoint non-triggered AB[#8573](https://github.com/rodekruis/IBF-system/issues/8573) ([67c2a2b](https://github.com/rodekruis/IBF-system/commit/67c2a2bea99b78495c323ffb96b6e0805cc686bf))



# [0.72.0](https://github.com/rodekruis/IBF-system/compare/v0.71.1...v0.72.0) (2021-07-09)


### Bug Fixes

* switch UGA district back to old placeCodes AB# ([746078f](https://github.com/rodekruis/IBF-system/commit/746078fdcf9feb2870d6958ea4d3c924f6e9088e))


### Features

* add admin boundaries and enable admin levels for uga AB[#8504](https://github.com/rodekruis/IBF-system/issues/8504) ([37f4693](https://github.com/rodekruis/IBF-system/commit/37f4693cacdcf71d1f46187e01707b849ea7b69c))



## [0.71.1](https://github.com/rodekruis/IBF-system/compare/v0.71.0...v0.71.1) (2021-07-09)


### Bug Fixes

* truncate instead of drob before seed AB[#8485](https://github.com/rodekruis/IBF-system/issues/8485) ([76898a6](https://github.com/rodekruis/IBF-system/commit/76898a684a57af29bff97c95797b246c3c19c271))



# [0.71.0](https://github.com/rodekruis/IBF-system/compare/v0.70.0...v0.71.0) (2021-07-09)


### Bug Fixes

* use migrations properly with init AB[#8485](https://github.com/rodekruis/IBF-system/issues/8485) ([dbb28f9](https://github.com/rodekruis/IBF-system/commit/dbb28f9e00033662b41d98220052d184a2ec0895))


### Features

* clean database on seed ([02c16d2](https://github.com/rodekruis/IBF-system/commit/02c16d20a6d5cb43783c1d29fc7044b8ae9deecf))



# [0.70.0](https://github.com/rodekruis/IBF-system/compare/v0.69.0...v0.70.0) (2021-07-06)


### Features

* rename parishes to sub-counties for uganda admin level AB[#8397](https://github.com/rodekruis/IBF-system/issues/8397) ([253a66a](https://github.com/rodekruis/IBF-system/commit/253a66aa420d2bcc6b623f934d13e0a4af9fc9a7))



# [0.69.0](https://github.com/rodekruis/IBF-system/compare/v0.68.0...v0.69.0) (2021-07-05)


### Bug Fixes

* no population data for PHL AB[#8469](https://github.com/rodekruis/IBF-system/issues/8469) ([66d6c79](https://github.com/rodekruis/IBF-system/commit/66d6c797e27bad4550d875f952b05a5c389f8e7e))
* remove unnecessary subscription ([8b4cd2f](https://github.com/rodekruis/IBF-system/commit/8b4cd2ff2e69dc36563db6c75a64998cabe09164))
* resolve conflict with population raster layer AB[#6385](https://github.com/rodekruis/IBF-system/issues/6385) ([b23f914](https://github.com/rodekruis/IBF-system/commit/b23f914b0b4419672a2593bd629d5d2e21313906))
* separate population data for PHL ([0a85c46](https://github.com/rodekruis/IBF-system/commit/0a85c46e31ad769471dc3db810ce79c36a42d857))
* use correct admin level value ([30ed795](https://github.com/rodekruis/IBF-system/commit/30ed795875770d76198da8a3407af2741d2aa89e))
* use correct label for percentage of total population layer ([b2c4f17](https://github.com/rodekruis/IBF-system/commit/b2c4f17f4e645e14172265d5c41abd04261e6ea0))


### Features

* add popover information for total population AB[#8189](https://github.com/rodekruis/IBF-system/issues/8189) ([ee68c4c](https://github.com/rodekruis/IBF-system/commit/ee68c4cd7ddb9718b56ff1df0463bd7cbaf71f37))
* add population to seed data AB[#8190](https://github.com/rodekruis/IBF-system/issues/8190) ([35bee5e](https://github.com/rodekruis/IBF-system/commit/35bee5e7333599afedec4939d2777e9e457b99b7))
* add total population layer to the matrix component AB[#8188](https://github.com/rodekruis/IBF-system/issues/8188) ([bea7325](https://github.com/rodekruis/IBF-system/commit/bea732538d280592dd3a5d19861e063a374cc0ce))
* calculate percentage of affected population and display on dashboard AB[#8384](https://github.com/rodekruis/IBF-system/issues/8384) ([b27fbd2](https://github.com/rodekruis/IBF-system/commit/b27fbd2cb879684af1efe4002698354ab3401711))
* include 'pop aff perc' in mock-endpoint AB[#8468](https://github.com/rodekruis/IBF-system/issues/8468) ([b033da8](https://github.com/rodekruis/IBF-system/commit/b033da87038da48cda2cd2c368c31621dfb18e32))
* rename indicator to reuse existing endpoint AB[#8191](https://github.com/rodekruis/IBF-system/issues/8191) ([f27f094](https://github.com/rodekruis/IBF-system/commit/f27f094c526104e0d9b0643a022039f8ed2c2994))



# [0.68.0](https://github.com/rodekruis/IBF-system/compare/v0.67.4...v0.68.0) (2021-07-02)


### Bug Fixes

* AB[#8428](https://github.com/rodekruis/IBF-system/issues/8428) broken popups ([a624033](https://github.com/rodekruis/IBF-system/commit/a6240334f18a4b8086ec59fb98be0a1b0e854593))
* AB[#8428](https://github.com/rodekruis/IBF-system/issues/8428) broken popups robuster fix ([6368928](https://github.com/rodekruis/IBF-system/commit/6368928b64f33d489f8ddd82590670e961259bf2))
* AB[#8428](https://github.com/rodekruis/IBF-system/issues/8428) change chat go to actions text ([59fde43](https://github.com/rodekruis/IBF-system/commit/59fde43798ee47e51668d98b9b24acda72a9d530))
* AB[#8428](https://github.com/rodekruis/IBF-system/issues/8428) eap actions document ([410a42b](https://github.com/rodekruis/IBF-system/commit/410a42bca8b1038413d2e7f391840f8603c4bf8f))
* AB[#8428](https://github.com/rodekruis/IBF-system/issues/8428) send to save ([ec9c351](https://github.com/rodekruis/IBF-system/commit/ec9c35110d1dca1355ba0e89687c5ae8b8714be7))
* Changed getTriggered areas to leadtime dependend AB[#8428](https://github.com/rodekruis/IBF-system/issues/8428) ([b0cef24](https://github.com/rodekruis/IBF-system/commit/b0cef244567e5b2fc733b2e2f2887e6aaabc467e))
* Dengue cases are always active ([0a9dd77](https://github.com/rodekruis/IBF-system/commit/0a9dd77e5da10e4738abf5a6b0836698de1ac7b0))
* PHL simplify geom ([4842998](https://github.com/rodekruis/IBF-system/commit/4842998ac7350aeb572c9aa1abde5cb8237f3b57))
* remove month if upload in same month AB[#8366](https://github.com/rodekruis/IBF-system/issues/8366) ([79ea878](https://github.com/rodekruis/IBF-system/commit/79ea8787262b0a43feb59394bc02ef389e170d41))
* tests ([e451cfe](https://github.com/rodekruis/IBF-system/commit/e451cfe9ed7b29169a0b85cd2ab8bef35ed4f3f9))
* tests ([a245cab](https://github.com/rodekruis/IBF-system/commit/a245cabd7031b373e16760161f71f3474d8d0fd0))


### Features

* Send email from API service for PHL AB[#8292](https://github.com/rodekruis/IBF-system/issues/8292) ([9dd53e8](https://github.com/rodekruis/IBF-system/commit/9dd53e8a7367b52d09185c5035ce046ed7f7b52d))



## [0.67.4](https://github.com/rodekruis/IBF-system/compare/v0.67.3...v0.67.4) (2021-06-28)


### Bug Fixes

* cheap eap-action AB[#8367](https://github.com/rodekruis/IBF-system/issues/8367) ([c565a58](https://github.com/rodekruis/IBF-system/commit/c565a583cb60fceff18d1bb038acb66d04a0c61b))
* enable ZMB for mock from frontend AB[#8368](https://github.com/rodekruis/IBF-system/issues/8368) ([7416718](https://github.com/rodekruis/IBF-system/commit/7416718909027945449a2644ae28767e2e4ae133))
* only update eventPlaceCode in exposure-endpoint for own country AB[#8391](https://github.com/rodekruis/IBF-system/issues/8391) ([193da5f](https://github.com/rodekruis/IBF-system/commit/193da5fea78a6d858ceb9451e943d3702af90a04))



## [0.67.3](https://github.com/rodekruis/IBF-system/compare/v0.67.2...v0.67.3) (2021-06-28)


### Bug Fixes

* close event button AB[#8351](https://github.com/rodekruis/IBF-system/issues/8351) ([2190a88](https://github.com/rodekruis/IBF-system/commit/2190a88539df8b895615d8bf7d3dd92d5658818f))
* only remove country's events in mock-endpoint AB[#8347](https://github.com/rodekruis/IBF-system/issues/8347) ([0d834c7](https://github.com/rodekruis/IBF-system/commit/0d834c71fbe6eadd6a786d6277913dee9056d094))
* unit test AB[#8351](https://github.com/rodekruis/IBF-system/issues/8351) ([a84ded9](https://github.com/rodekruis/IBF-system/commit/a84ded9f1e76b5d718f56f89857300361aa32c1c))



## [0.67.2](https://github.com/rodekruis/IBF-system/compare/v0.67.1...v0.67.2) (2021-06-25)


### Bug Fixes

* drop table if exists ([5b7b861](https://github.com/rodekruis/IBF-system/commit/5b7b8618076a3736425862908b527d77a5e09441))



