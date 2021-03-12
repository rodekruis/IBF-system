## [0.33.6](https://github.com/rodekruis/IBF-system/compare/v0.33.5...v0.33.6) (2021-03-12)


### Bug Fixes

* change lead-time UGA to 5 days AB[#6541](https://github.com/rodekruis/IBF-system/issues/6541) ([ed2fef7](https://github.com/rodekruis/IBF-system/commit/ed2fef717b84081f21c05e7d42e37ab7011df87d))
* move all glofas-station input to seed AB[#6543](https://github.com/rodekruis/IBF-system/issues/6543) ([d88dbac](https://github.com/rodekruis/IBF-system/commit/d88dbaca5ed664ce7e4775c080da954e4b1f6331))



## [0.33.5](https://github.com/rodekruis/IBF-system/compare/v0.33.4...v0.33.5) (2021-03-12)


### Bug Fixes

* add data folder to docker ignore ([3488fff](https://github.com/rodekruis/IBF-system/commit/3488fff0a70ce7ae8d83fb15f1657061076571b6))



## [0.33.4](https://github.com/rodekruis/IBF-system/compare/v0.33.3...v0.33.4) (2021-03-11)


### Bug Fixes

* catch error on waterpoints API and use correct admin region layer name ([90665d2](https://github.com/rodekruis/IBF-system/commit/90665d2338e1c4d4348ddc66a485b13716d968ae))
* import path ([f95edaa](https://github.com/rodekruis/IBF-system/commit/f95edaaef0fd713f6546a19017ce593932303ebb))
* window open triggers multiple times on country change ([1f844d1](https://github.com/rodekruis/IBF-system/commit/1f844d1e964b889a423b7fc96048a642f7a99fc3))



## [0.33.3](https://github.com/rodekruis/IBF-system/compare/v0.33.2...v0.33.3) (2021-03-08)


### Bug Fixes

* last changes in keeping relative file paths AD[#5756](https://github.com/rodekruis/IBF-system/issues/5756) ([db99af6](https://github.com/rodekruis/IBF-system/commit/db99af6e1e8475ff52ac3544f7befbd805b72f80))



## [0.33.2](https://github.com/rodekruis/IBF-system/compare/v0.33.1...v0.33.2) (2021-03-08)


### Bug Fixes

* get triggered areas  AB[#6539](https://github.com/rodekruis/IBF-system/issues/6539) ([caedc83](https://github.com/rodekruis/IBF-system/commit/caedc8327ce5c5b156cb8b3ed2d5705d876c7b96))
* review add enum for layer acrivation AB[#6539](https://github.com/rodekruis/IBF-system/issues/6539) ([e5e0ac5](https://github.com/rodekruis/IBF-system/commit/e5e0ac54310108458a2265d783c7f2ecbdf0bf52))



## [0.33.1](https://github.com/rodekruis/IBF-system/compare/v0.33.0...v0.33.1) (2021-03-08)


### Bug Fixes

* enable geoserver locally AB[#6540](https://github.com/rodekruis/IBF-system/issues/6540) ([32f6bf3](https://github.com/rodekruis/IBF-system/commit/32f6bf3bed37923b71ce1cc1e76db091f60070e2))



# [0.33.0](https://github.com/rodekruis/IBF-system/compare/v0.32.1...v0.33.0) (2021-03-08)


### Bug Fixes

* update documentation to add new country AB[#6291](https://github.com/rodekruis/IBF-system/issues/6291) ([16c5803](https://github.com/rodekruis/IBF-system/commit/16c5803a58a9cd78ecea2d90da0a6b461ecee82e))


### Features

* add documentation on local database AB[#6261](https://github.com/rodekruis/IBF-system/issues/6261) ([79bc6f9](https://github.com/rodekruis/IBF-system/commit/79bc6f98d6ab17c48e17d3f41ae8147280e471a3))



## [0.32.1](https://github.com/rodekruis/IBF-system/compare/v0.32.0...v0.32.1) (2021-03-08)


### Bug Fixes

* improve naming/structure IBF-pipeline AB[#6286](https://github.com/rodekruis/IBF-system/issues/6286) ([552b141](https://github.com/rodekruis/IBF-system/commit/552b1419a6caa2d7755902c2d7e7f53bd656ef2d))
* set mailing default to mailchimp AB[#6534](https://github.com/rodekruis/IBF-system/issues/6534) ([c6e6305](https://github.com/rodekruis/IBF-system/commit/c6e63059f466330b0b580838a5ae45109ced2ced))



# [0.32.0](https://github.com/rodekruis/IBF-system/compare/v0.31.0...v0.32.0) (2021-03-08)


### Features

* seed adm dynamically AB[#6517](https://github.com/rodekruis/IBF-system/issues/6517) ([58e2b19](https://github.com/rodekruis/IBF-system/commit/58e2b19fc09819e80fe287d2f0b95143695ff865))



# [0.31.0](https://github.com/rodekruis/IBF-system/compare/v0.28.0...v0.31.0) (2021-03-08)


### Bug Fixes

* base triggered areas on population_affected AB[#6518](https://github.com/rodekruis/IBF-system/issues/6518) ([4d94dc3](https://github.com/rodekruis/IBF-system/commit/4d94dc3cff12ef188a25ef61fb36682b0c8efad9))
* determine loaded admin-areas on lead-time AB[#6425](https://github.com/rodekruis/IBF-system/issues/6425) ([1b09fbc](https://github.com/rodekruis/IBF-system/commit/1b09fbcfdb0b3a67beca93597a163c8e5c46c6f0))
* don't blow up query result by lead-time AB[#6527](https://github.com/rodekruis/IBF-system/issues/6527) ([f792c43](https://github.com/rodekruis/IBF-system/commit/f792c43b670d6aef45b5f0977479f9639c026d9a))
* fix triggered-area-check all countries AB[#6518](https://github.com/rodekruis/IBF-system/issues/6518) ([d9b46ae](https://github.com/rodekruis/IBF-system/commit/d9b46aef238346b2fc421941d4a075dfe0aaa8e0))
* overwrirte non-egypt areas to 0 AB[#6212](https://github.com/rodekruis/IBF-system/issues/6212) ([8369374](https://github.com/rodekruis/IBF-system/commit/83693744f7eec9647a4bd7e8ab355c550b728916))
* query fix AB[#6518](https://github.com/rodekruis/IBF-system/issues/6518) ([6c2aa03](https://github.com/rodekruis/IBF-system/commit/6c2aa03eeb1ae1404c589d60d8fce098b4c70e2d))
* remove circular structure sql-scripts AB[#6531](https://github.com/rodekruis/IBF-system/issues/6531) ([b80fba6](https://github.com/rodekruis/IBF-system/commit/b80fba6e92e52f52d0e4ac00bb7421b5332fbd3e))
* remove unneeded storeHistoric AB[#6212](https://github.com/rodekruis/IBF-system/issues/6212) ([2bab6ba](https://github.com/rodekruis/IBF-system/commit/2bab6baf37991302244fcdf6b54ff0ecc65eb561))
* replace CHANGELOG with COMMITLOG ([e2d8e0c](https://github.com/rodekruis/IBF-system/commit/e2d8e0ca79c37c36de93084c8011450f70935f19))
* set IbfLayerMetadata type AB[#6387](https://github.com/rodekruis/IBF-system/issues/6387) ([ec30699](https://github.com/rodekruis/IBF-system/commit/ec306990cc7f2488971159d6d777349df7aea93b))
* unit test ([bdfabcd](https://github.com/rodekruis/IBF-system/commit/bdfabcd17ea8e1188de1bc4a7c8150312033f669))


### Features

* added EGY logo AB[#6354](https://github.com/rodekruis/IBF-system/issues/6354) ([b7381ce](https://github.com/rodekruis/IBF-system/commit/b7381cee7be40fd9abe125baaf9d239c807f45b3))
* load layers dynamically AB[#6387](https://github.com/rodekruis/IBF-system/issues/6387) ([8e22a7f](https://github.com/rodekruis/IBF-system/commit/8e22a7fb983c2e009a78edacffa6ae9cdd206fb7))
* Set sending emails per country AB[#6520](https://github.com/rodekruis/IBF-system/issues/6520) ([b9ee192](https://github.com/rodekruis/IBF-system/commit/b9ee19214e02871581b794a7f4a329e571893f41))
* Set sending emails per country AB[#6520](https://github.com/rodekruis/IBF-system/issues/6520) ([d29f815](https://github.com/rodekruis/IBF-system/commit/d29f815da1e82d24f60580b1955a65eba74d9cef))
* show all non-triggered timesteps again AB[#6425](https://github.com/rodekruis/IBF-system/issues/6425) ([f5e4505](https://github.com/rodekruis/IBF-system/commit/f5e4505e750a006c91ac7754aa9c76b27e014c56))
* show only boundaries for non-Egypt areas AB[#6485](https://github.com/rodekruis/IBF-system/issues/6485) ([e6c3055](https://github.com/rodekruis/IBF-system/commit/e6c3055091dd9c403a2a0ff813ecd1bc824fbb4d))



