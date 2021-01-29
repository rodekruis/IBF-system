## [0.2.1](https://github.com/rodekruis/IBF-system/compare/v0.2.0...v0.2.1) (2021-01-29)


### Bug Fixes

* remove [0,0] waterpoint locations AB[#5846](https://github.com/rodekruis/IBF-system/issues/5846) ([8799049](https://github.com/rodekruis/IBF-system/commit/8799049338cf193067b214f832609ea1f1dac05f))



# [0.2.0](https://github.com/rodekruis/IBF-system/compare/v0.1.5...v0.2.0) (2021-01-29)


### Bug Fixes

* add waterpoints api key to docker ([ae75851](https://github.com/rodekruis/IBF-system/commit/ae75851c56e90087f20b8b155d412b482cd665ef))
* aggregate total ([af646c4](https://github.com/rodekruis/IBF-system/commit/af646c455f3d4d0100d9e9e146e59960ab1f9ba5))
* change local geoserver-url to new URL ([801f833](https://github.com/rodekruis/IBF-system/commit/801f833b6522a38790571e685777c291e00f64ef))
* de-duplicate 2 places for indicator-labels AB[#5661](https://github.com/rodekruis/IBF-system/issues/5661) ([6a4edbb](https://github.com/rodekruis/IBF-system/commit/6a4edbb4635a7bb8af8d7ce2c512560d2271b6d7))
* IbfLayerName for indicators needed after all AB[#5661](https://github.com/rodekruis/IBF-system/issues/5661) ([8a7a13c](https://github.com/rodekruis/IBF-system/commit/8a7a13cd802b4bbc331b23ad00cbf98bd669fcb0))
* indicator order column needs default value ([099cc2b](https://github.com/rodekruis/IBF-system/commit/099cc2b8bd2dbaa43e3afabb912437f85086ed4d))
* lint error ([e886e63](https://github.com/rodekruis/IBF-system/commit/e886e630c3ca276faad915f37c108362f4557d1e))
* pcode infinite loop ([c08d960](https://github.com/rodekruis/IBF-system/commit/c08d96042dc30b29a5643e764e25e6bec98ac714))
* remove unused endpoints ([05e416d](https://github.com/rodekruis/IBF-system/commit/05e416da6b6c5f2989a3c6ffda3a9ec59c040da6))
* remove unused nginx conf files ([a6e11ba](https://github.com/rodekruis/IBF-system/commit/a6e11badc0c118ab868b306ac337ff13aa029987))
* rename vulnerability layer AB[#5661](https://github.com/rodekruis/IBF-system/issues/5661) ([aa90465](https://github.com/rodekruis/IBF-system/commit/aa904655a36a79896f18b487203e1e277c7ee412))
* set swagger schema to https ([9c29dab](https://github.com/rodekruis/IBF-system/commit/9c29dab799a9bf786a023b3a7127ac1f431df36d))
* show error message when EAP update fails ([65d0414](https://github.com/rodekruis/IBF-system/commit/65d0414aacf05e202f24c9b645c5bfc91b318333))
* test commit for workflow ([a57088d](https://github.com/rodekruis/IBF-system/commit/a57088d5a738ff3c1fa4b4395b72f2604b0de607))
* useful test commit for workflow ([21ce626](https://github.com/rodekruis/IBF-system/commit/21ce6266e85fb43f4c491665b90b8eb98188f6e7))
* user controller spec ([b6a8dbc](https://github.com/rodekruis/IBF-system/commit/b6a8dbc4aaeda2291a3074f466e4bf3579687c70))
* user service spec ([0bf43c4](https://github.com/rodekruis/IBF-system/commit/0bf43c483a3d0d0dac2a305c93831a256bcb7a93))


### Features

* add custom colorBreak option for vulnerability AB[#5662](https://github.com/rodekruis/IBF-system/issues/5662) ([85bd61b](https://github.com/rodekruis/IBF-system/commit/85bd61bc52a55aa5624165c184c185311b00a44b))
* add custom labels in legend for vulnerability AB[#5663](https://github.com/rodekruis/IBF-system/issues/5663) ([adc08d8](https://github.com/rodekruis/IBF-system/commit/adc08d80d56da0569cb2b089c8c0bac445c066dd))
* add ordering of aggregate layers AB[#5745](https://github.com/rodekruis/IBF-system/issues/5745) ([b9032e3](https://github.com/rodekruis/IBF-system/commit/b9032e328a7ff539cdf3d3e60a616de1166b32b6))
* debounce loader for smooth ux ([9981fe4](https://github.com/rodekruis/IBF-system/commit/9981fe48091ca509a50689a3ee8ac9753725d524))
* lead time defaults to 7-day, refactor lead time table ([7d23fd7](https://github.com/rodekruis/IBF-system/commit/7d23fd72dc05cb899cecfcb9d936be128b8bd5c6))
* place code AB[#5655](https://github.com/rodekruis/IBF-system/issues/5655) AB[#5656](https://github.com/rodekruis/IBF-system/issues/5656) AB[#5658](https://github.com/rodekruis/IBF-system/issues/5658) AB[#5657](https://github.com/rodekruis/IBF-system/issues/5657) AB[#5659](https://github.com/rodekruis/IBF-system/issues/5659) ([ba2fd95](https://github.com/rodekruis/IBF-system/commit/ba2fd9589c6bba65ee5520beeb080f714abd842d))



## [0.1.5](https://github.com/rodekruis/IBF-system/compare/v0.1.4...v0.1.5) (2021-01-20)


### Bug Fixes

* add ibf and ibf-test as server names ([5d6d01e](https://github.com/rodekruis/IBF-system/commit/5d6d01e75e5c0425cc9f81c830952085db253493))
* add test server name ([761161a](https://github.com/rodekruis/IBF-system/commit/761161a9a766b76fc72e6d1dbeeee9d0b918375d))
* allow guest users to login ([b7b051a](https://github.com/rodekruis/IBF-system/commit/b7b051a8e880c87478e34b417892660a2ed1635a))
* import file path ([3ae3a0e](https://github.com/rodekruis/IBF-system/commit/3ae3a0ec1681dfdfcc0b52b240c1d7483cd48e0f))
* import user dto test ([e47b3f9](https://github.com/rodekruis/IBF-system/commit/e47b3f981cb4adbd17031161e6839649cf759d22))
* only use ibf-test in server_name ([161503c](https://github.com/rodekruis/IBF-system/commit/161503c02c73e6cd0dbb32aec9903f308cd15b70))
* remove dead link on login page ([8aa294b](https://github.com/rodekruis/IBF-system/commit/8aa294b1cf5791844993462a1b1863c949bb403f))
* remove proxy cache ([71d85e3](https://github.com/rodekruis/IBF-system/commit/71d85e3eeb8fb4c8084c63b1a5c9a546f54ff3b8))
* rename old vars ([62efd07](https://github.com/rodekruis/IBF-system/commit/62efd07e6c8ae4a49746c4ea317bd159195af33d))
* rename redcross to Red Cross AB[#5641](https://github.com/rodekruis/IBF-system/issues/5641) ([bfaf821](https://github.com/rodekruis/IBF-system/commit/bfaf821d4189a57585445c6968ec7ebaa68c820d))
* reorganize API-service folder structure AB[#5637](https://github.com/rodekruis/IBF-system/issues/5637) ([228b9aa](https://github.com/rodekruis/IBF-system/commit/228b9aae9f1bccd3721d6ac3bb4333e3e1870008))
* swagger dto for user apis ([a652b46](https://github.com/rodekruis/IBF-system/commit/a652b469a96b11f76c5b0aa692e7045de435bd52))
* unit test bug AB[#5637](https://github.com/rodekruis/IBF-system/issues/5637) ([f999476](https://github.com/rodekruis/IBF-system/commit/f999476c974c6e6e34141233ce5190fc7cf930cb))
* use loader interceptor AB[#5261](https://github.com/rodekruis/IBF-system/issues/5261) ([c2c89ec](https://github.com/rodekruis/IBF-system/commit/c2c89ec0c536edd062fcdf1635c01278ed63e4c6))
* use nginx cache AB[#5261](https://github.com/rodekruis/IBF-system/issues/5261) ([66f89c7](https://github.com/rodekruis/IBF-system/commit/66f89c74e7e20f8d0bcd6e510ac3217f9be9c6fe))
* use nginx instead of localhost ([2118077](https://github.com/rodekruis/IBF-system/commit/2118077a8f783a7de70e45d23a71b794ff0f46a8))
* use no-cache header in api service AB[#5261](https://github.com/rodekruis/IBF-system/issues/5261) ([edb0c45](https://github.com/rodekruis/IBF-system/commit/edb0c45f4585f44d83cd958ffd88f6a12eaf8da6))


### Features

* add waterpoint-layer to dashboard AB[#5638](https://github.com/rodekruis/IBF-system/issues/5638) ([5f3dfc8](https://github.com/rodekruis/IBF-system/commit/5f3dfc87fb487cb978c930626fcfccaa7aeac4f5))
* integrate leaflet-markercluster for waterpoints AB[#5640](https://github.com/rodekruis/IBF-system/issues/5640) ([c9653c4](https://github.com/rodekruis/IBF-system/commit/c9653c46deeaaa559e8f4e3ed7e00cac727c26d4))
* remove layer availability property AB[#5642](https://github.com/rodekruis/IBF-system/issues/5642) ([672bdd9](https://github.com/rodekruis/IBF-system/commit/672bdd9d7753431b053e0d93cbd0e0b814363d3c))
* waterpoint-endpoint calling 3rd party API AB[#5637](https://github.com/rodekruis/IBF-system/issues/5637) ([e31bfbb](https://github.com/rodekruis/IBF-system/commit/e31bfbb0b20fa101b16764caa01defddf9a70ef7))



## [0.1.4](https://github.com/rodekruis/IBF-system/compare/v0.1.3...v0.1.4) (2021-01-16)


### Bug Fixes

* activate exposed-pop layer in api AB[#5527](https://github.com/rodekruis/IBF-system/issues/5527) ([4ad6b15](https://github.com/rodekruis/IBF-system/commit/4ad6b152cef6936fcb093d2df70b23f00f42cd45))
* build error AB[#5059](https://github.com/rodekruis/IBF-system/issues/5059) ([695122f](https://github.com/rodekruis/IBF-system/commit/695122f26e8a40226f6da077a19022711236f7d7))
* downgrade dependabot changes ([d6bff2c](https://github.com/rodekruis/IBF-system/commit/d6bff2cfc80eb966837da2926abad39889811d9c))
* downgrade node to 10 for api-service ([768b082](https://github.com/rodekruis/IBF-system/commit/768b082f9bfe5040c2bd806fdb02065205ce26fe))
* getting right lead-time in ibf-pipeline AB[#5591](https://github.com/rodekruis/IBF-system/issues/5591) ([f437398](https://github.com/rodekruis/IBF-system/commit/f43739879275d882141a538e54ec3b3be7cecec9))
* handle errors using finalize ([97eb40e](https://github.com/rodekruis/IBF-system/commit/97eb40ebebd244abb4ad2351f72f49ccf032c8ad))
* if no branch specified deploy-script uses master AB[#5591](https://github.com/rodekruis/IBF-system/issues/5591) ([e0323a5](https://github.com/rodekruis/IBF-system/commit/e0323a5a52abc0ba3cec70419024ad5a1ef62c07))
* layer controls menu should listen on menu events instead of button click AB[#4893](https://github.com/rodekruis/IBF-system/issues/4893) ([76aa068](https://github.com/rodekruis/IBF-system/commit/76aa068cf1c4bdcab7fbf05870b61916768d731b))
* loader issue AB[#5261](https://github.com/rodekruis/IBF-system/issues/5261) ([ffcfa8d](https://github.com/rodekruis/IBF-system/commit/ffcfa8d0d18a4d24562509f4c982318ba5b1496d))
* pipeline took 6-day instead of 7-day AB[#5591](https://github.com/rodekruis/IBF-system/issues/5591) ([489826d](https://github.com/rodekruis/IBF-system/commit/489826d2c5de8b4328b051aff8311d44b7e92f71))
* replace ReplaySubject to BehaviorSubject ([1314367](https://github.com/rodekruis/IBF-system/commit/1314367fad4c18a76d682f234464dd1c4bc72be9))
* revert env config ([d4d9000](https://github.com/rodekruis/IBF-system/commit/d4d90002541954c1cb1200f4c6f9a1defc131cca))
* set default date for date button component ([9f8b72d](https://github.com/rodekruis/IBF-system/commit/9f8b72d1a80749b73c3dac2ea07f84a3fae54c8a))
* source info modal null test ([3a5c5d7](https://github.com/rodekruis/IBF-system/commit/3a5c5d79f0dd58dcff84761dab10189e04cc550b))
* tests ([6f8a182](https://github.com/rodekruis/IBF-system/commit/6f8a182b2a86efd76b44a5c31b393f85b548f83f))
* update map aggregate layers on country switch AB[#5051](https://github.com/rodekruis/IBF-system/issues/5051) ([bd84b0b](https://github.com/rodekruis/IBF-system/commit/bd84b0b15c11f2ebb2f8bf8ceb08e58898fbaca5))
* upgrade pygobject ([d6fec1c](https://github.com/rodekruis/IBF-system/commit/d6fec1cadedd84e2a9955f6d1268e477b955f9a1))
* use env var for secrets ([6b90832](https://github.com/rodekruis/IBF-system/commit/6b90832655cf1ee29dd5fe7060435d4257d9ca13))
* use unstable ubuntu gis for 20.04 ([2e13538](https://github.com/rodekruis/IBF-system/commit/2e1353888e27f81d1f0353cc2082ffde992436dd))


### Features

* add ordering to layers AB[#5257](https://github.com/rodekruis/IBF-system/issues/5257) AB[#5256](https://github.com/rodekruis/IBF-system/issues/5256) AB[#5258](https://github.com/rodekruis/IBF-system/issues/5258) AB[#5262](https://github.com/rodekruis/IBF-system/issues/5262) ([d1c9623](https://github.com/rodekruis/IBF-system/commit/d1c96231eed863666bf367fa46aa7f5661e52054))
* add today component AB[#5268](https://github.com/rodekruis/IBF-system/issues/5268) ([70bbbe9](https://github.com/rodekruis/IBF-system/commit/70bbbe90a4e771eae2d62c07aaeda5542bc28e2a))
* change situational overview header color AB[#5263](https://github.com/rodekruis/IBF-system/issues/5263) ([b76d4b4](https://github.com/rodekruis/IBF-system/commit/b76d4b4a26c683dcd45cbc726b7b503198c7bd83))
* date button and timeline buttons ([70bba4c](https://github.com/rodekruis/IBF-system/commit/70bba4c28705babb94897e9db56ddd969077284f))
* flood extent layer should be inactive if no active trigger AB[#5265](https://github.com/rodekruis/IBF-system/issues/5265) ([c488060](https://github.com/rodekruis/IBF-system/commit/c4880608219e928836e789aeae9fd997ef8393b7))
* hide some aggregate indicators from middle column AB[#5269](https://github.com/rodekruis/IBF-system/issues/5269) ([4902360](https://github.com/rodekruis/IBF-system/commit/49023606f3c083bfed3b740cdd2affbdc0b056f0))
* join admin-lines toggling to admin-fill  toggling AB[#5059](https://github.com/rodekruis/IBF-system/issues/5059) ([8f3e9fc](https://github.com/rodekruis/IBF-system/commit/8f3e9fc7a3bc9f14d7d750510495af00219a075b))
* loader AB[#5132](https://github.com/rodekruis/IBF-system/issues/5132) ([d0a7a79](https://github.com/rodekruis/IBF-system/commit/d0a7a79bae40e30e806ba9bccc154c2348e7329a))
* move aggregate layers to matrix ([e79f264](https://github.com/rodekruis/IBF-system/commit/e79f264be73ac58dac00c1cd8f37ca45382b6e29))
* remove secrets from git to avoid adding user information AB[#5153](https://github.com/rodekruis/IBF-system/issues/5153) ([7eee766](https://github.com/rodekruis/IBF-system/commit/7eee766a9823b4faadd5adcd60decfe2a6f96411))
* remove today from timeline component AB[#5266](https://github.com/rodekruis/IBF-system/issues/5266) ([ab79853](https://github.com/rodekruis/IBF-system/commit/ab79853486ea01afe2da38ee23a361e40ffed557))
* revert chat messages to be at the right/left of the avatar ([33fa15a](https://github.com/rodekruis/IBF-system/commit/33fa15acc948dbcec0d4fb2d8ada9842eb49e82a))
* show all aof AB[#5387](https://github.com/rodekruis/IBF-system/issues/5387) ([39c3530](https://github.com/rodekruis/IBF-system/commit/39c35304d2f179bdbfb8ce99ecff9eeb4048c17c))
* show exposed pop. by default if trigger AB[#5527](https://github.com/rodekruis/IBF-system/issues/5527) ([8b5da2f](https://github.com/rodekruis/IBF-system/commit/8b5da2fe6da1c67e4f83b8594e4260035426d5df))
* toggle visiblity of warning icon based on trigger status ([6744186](https://github.com/rodekruis/IBF-system/commit/674418646ee442467a13911a47f01120974666f4))
* update mock-data with abs. exposed numbers AB[#5544](https://github.com/rodekruis/IBF-system/issues/5544) ([49dec20](https://github.com/rodekruis/IBF-system/commit/49dec20faf0da61249e6a779ce7ceb450862addd))
* use salmon colors only if active trigger ([8b2db22](https://github.com/rodekruis/IBF-system/commit/8b2db22130a72c007b91cdf6d0a28c7436f1784c))
* use today component AB[#5267](https://github.com/rodekruis/IBF-system/issues/5267) ([9f14704](https://github.com/rodekruis/IBF-system/commit/9f14704d5c9f873db48929c4d9117373bd06139a))



## [0.1.3](https://github.com/rodekruis/IBF-system/compare/v0.1.2...v0.1.3) (2020-11-23)



## [0.1.2](https://github.com/rodekruis/IBF-system/compare/v0.1.1...v0.1.2) (2020-11-16)


### Bug Fixes

* disable default uppercase on all ionic buttons ([78f1c73](https://github.com/rodekruis/IBF-system/commit/78f1c7350cfc6e37c80eed7c925567cf5022fa6b))



## [0.1.1](https://github.com/rodekruis/IBF-system/compare/v0.1.0...v0.1.1) (2020-11-15)


### Bug Fixes

* add sudo to deploy ([f1ddcbf](https://github.com/rodekruis/IBF-system/commit/f1ddcbfd48c421e168b919ef637896e1732b2afe))
* add sudo to webhook and deploy ([fd05d00](https://github.com/rodekruis/IBF-system/commit/fd05d006d5391fcbc637aa105df74d2c4027296a))
* azure web app fails if web interface service terminates ([58bd595](https://github.com/rodekruis/IBF-system/commit/58bd5953ba9c81b949b123106f65c44ce1e4d165))
* check aggregates response to be not null ([78df42a](https://github.com/rodekruis/IBF-system/commit/78df42a6b8cb131b9ea00bef8ab1fc04165069f4))
* do not wrap eap and layer labels ([cec8136](https://github.com/rodekruis/IBF-system/commit/cec81362e5131388c5bc206cdb4b8c9576bd2f99))
* enable prod build for interface ([16ea270](https://github.com/rodekruis/IBF-system/commit/16ea2706f98df06e11ea17e5e0b449f2d888c76b))
* make handleTimeStepButtonClick public ([256e483](https://github.com/rodekruis/IBF-system/commit/256e4833a9782d9f8298afe5ec7774d43767ce6a))
* make ibf layer data only a feature collection ([382717e](https://github.com/rodekruis/IBF-system/commit/382717eb60403b90dd969575dcf74df9512164e3))
* ng lint ([9b4c066](https://github.com/rodekruis/IBF-system/commit/9b4c0665e233cbf0c43605ed3959242a279339aa))
* remove conflicting lint ([df2a1e4](https://github.com/rodekruis/IBF-system/commit/df2a1e4b417f8ce727e451c4dec3bfdc316a0d6d))
* run prettier fix ([71f4ddd](https://github.com/rodekruis/IBF-system/commit/71f4ddd09045ab3d3433a8811fb34b887f532b27))
* serve interface from www folder instead of dist to avoid conflict ([7a41a61](https://github.com/rodekruis/IBF-system/commit/7a41a61951060ca7fc1cce1fb48ff92542d106f1))
* set default initial value for layers variable to pass tests ([f589316](https://github.com/rodekruis/IBF-system/commit/f589316b32f87704cd2f0214e953059e2a45cf0b))
* set env vars after code pull ([ec8057d](https://github.com/rodekruis/IBF-system/commit/ec8057d5673a7863eb4e63343b3ed2c769ae56ea))
* set map bounds only if features are present ([33dc805](https://github.com/rodekruis/IBF-system/commit/33dc8052982cb8f550fc3635d852526d06550fe7))
* string env vars need to be converted to boolean ([47cbead](https://github.com/rodekruis/IBF-system/commit/47cbeade36e0b7c53aba56c80ed20d71baadc092))
* switch back to bash command in webhook.js ([4879995](https://github.com/rodekruis/IBF-system/commit/487999593c14a4b4f74767e184eb884b58bd0ba8))
* test spec for timeline component ([c830209](https://github.com/rodekruis/IBF-system/commit/c830209b9cd7a9f67c98c0e63081e2de017f3159))
* test spec for timeline service ([0358364](https://github.com/rodekruis/IBF-system/commit/03583646ddca778417198f99bca4ce67b279b230))
* update docker image link in azure config ([d254414](https://github.com/rodekruis/IBF-system/commit/d254414a0151356b6f3732c2677d1429d341a3d2))
* use correct remote in deploy ([d7ac3b7](https://github.com/rodekruis/IBF-system/commit/d7ac3b79e0c3bf30ff6167c97e3ccf027b9f068d))
* use IMAGE_NAME as build tag ([49dbe9d](https://github.com/rodekruis/IBF-system/commit/49dbe9d06b39b6c55c96a0809a5f0c7a00b12a6b))
* use ReplaySubject instead of Subject ([624fe76](https://github.com/rodekruis/IBF-system/commit/624fe7634526fc4b145dad28fecc9c4e4d9150c9))


### Features

* :sparkles: show aggregate information ([d1bfc97](https://github.com/rodekruis/IBF-system/commit/d1bfc975cf9c254447a5a27d6dfb89480a0fb154))
* add admin region layer ([115cddd](https://github.com/rodekruis/IBF-system/commit/115cdddd3b9349ba12ec41a309fbb731c7b994bb))
* add country table and map users to country ([49c8722](https://github.com/rodekruis/IBF-system/commit/49c872233dc4b562abc12bcc3408a6d4cb500fb0))
* add dockerfile for web interface, create docker compose for ci ([3df1ba2](https://github.com/rodekruis/IBF-system/commit/3df1ba287c9a331a3a43ca8d185dc1ebad59abe6))
* add helper package json file at root directory ([970c965](https://github.com/rodekruis/IBF-system/commit/970c965ae12bf7eb5d713cbdb9d136fa236fab4c))
* added build hooks to pass env vars ([822f398](https://github.com/rodekruis/IBF-system/commit/822f398d801b5b8e720c823fc1784161f5281b58))
* country dropdown ([f7569ec](https://github.com/rodekruis/IBF-system/commit/f7569ecf425a0d2bb8a5239e8e082f458ba06abf))
* flood extent for Uganda ([a335c28](https://github.com/rodekruis/IBF-system/commit/a335c287a17e9816fd8913e10189fa4e197ac603))
* format toolbar ([51910f7](https://github.com/rodekruis/IBF-system/commit/51910f7fa53f922fe093a969c3a9c29a70d8df5a))
* host geoserver via api service using http proxy middleware ([9ffc313](https://github.com/rodekruis/IBF-system/commit/9ffc31336e589366f2551c0add282f6c8d84dc62))
* ibf color vars ([b7d76d0](https://github.com/rodekruis/IBF-system/commit/b7d76d0fad06f5df05769c971bc5919d0d72af0f))
* log env vars ([345f9cf](https://github.com/rodekruis/IBF-system/commit/345f9cfd350b5026d6813417b05d87483b77445d))
* login page styling ([3a3c3af](https://github.com/rodekruis/IBF-system/commit/3a3c3af8f878fd43ce726340a8e44ab99c6510d3))
* login page styling ([b94b856](https://github.com/rodekruis/IBF-system/commit/b94b856f82358d763e816a14f22df7b190ce5e8b))
* move default constant string to map service ([5e0862c](https://github.com/rodekruis/IBF-system/commit/5e0862cf13b41a2df85c867c891611c331eeb1b5))
* reload admin region layer only on country change ([95dd888](https://github.com/rodekruis/IBF-system/commit/95dd888b7642b71ca81f78e7602a2aef77255f4b))
* remove lat lng from docker compose and env file ([fbd5778](https://github.com/rodekruis/IBF-system/commit/fbd5778fb01cd6033b51a09e46d55211d2df694c))
* remove lat lng from env vars ([0454721](https://github.com/rodekruis/IBF-system/commit/0454721fab549cf8112862dc15135839697eb7d2))
* remove unused admin region model ([e8d8e51](https://github.com/rodekruis/IBF-system/commit/e8d8e51bce642e323d54d28ce5c2df905554daf5))
* serve static frontend build via backend, remove nginx, use prod build for frontend ([018d6f0](https://github.com/rodekruis/IBF-system/commit/018d6f0b8b310a9bc07b7ae4c11ea56e6c586057))
* set title ([cfdd591](https://github.com/rodekruis/IBF-system/commit/cfdd5910d90d3094e6711366c11c87306200bc75))
* support upto 14 day forecasts ([6ba2031](https://github.com/rodekruis/IBF-system/commit/6ba20318b98cc124f27eab426f50c4cf1272221e))
* switch to gradient of colors ([4fc7250](https://github.com/rodekruis/IBF-system/commit/4fc72506b8f06063f35a8b7f46b1e4048a6479f2))
* timeline and setup layer subscribers ([3d05310](https://github.com/rodekruis/IBF-system/commit/3d0531066815b90bab182f8d7fc4a8bbf19b3f2d))
* timeline update based on review ([a424bbe](https://github.com/rodekruis/IBF-system/commit/a424bbe8f62055c06d2f8309802f7e9a6648fcd6))
* update icon ([60d3945](https://github.com/rodekruis/IBF-system/commit/60d3945e78313add5d4a1016fa55a4c227f60dbc))
* use dotenv file for secrets and config ([cd09693](https://github.com/rodekruis/IBF-system/commit/cd096934e46909131872f9be710a58825b8bce5e))
* user state component ([07bcb1a](https://github.com/rodekruis/IBF-system/commit/07bcb1a8eef1e25d77cf591728b55b3a1d0bdd88))


### Reverts

* Revert "add context to docker, fix dependencies in SQL, update README" ([4b99a9d](https://github.com/rodekruis/IBF-system/commit/4b99a9d740dea8b5e6663a413925438f2b8b70f7))



