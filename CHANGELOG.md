## [0.79.3](https://github.com/rodekruis/IBF-system/compare/v0.79.2...v0.79.3) (2021-08-09)


### Bug Fixes

* trigger deploy ([b12762a](https://github.com/rodekruis/IBF-system/commit/b12762a10692d8c11c8ee63277d6bc7fb84dd6c0))



## [0.79.2](https://github.com/rodekruis/IBF-system/compare/v0.79.1...v0.79.2) (2021-08-09)


### Bug Fixes

* call endpoints with unknown leadtime AB[#8927](https://github.com/rodekruis/IBF-system/issues/8927) ([41e3c77](https://github.com/rodekruis/IBF-system/commit/41e3c7735ac97b28e6ecd40b515dfa9497cca3a8))
* make getdefaultleadtime disaster specific AB[#8927](https://github.com/rodekruis/IBF-system/issues/8927) ([bf39ff0](https://github.com/rodekruis/IBF-system/commit/bf39ff057c2fa4b16c51af4ac72ca086d7437722))
* pop. affected 0 for floods AB[#8927](https://github.com/rodekruis/IBF-system/issues/8927) ([2662719](https://github.com/rodekruis/IBF-system/commit/26627190e3405a9e9ccb400b0871ae15d1eaa5ab))
* unfound entry solution AB[#8827](https://github.com/rodekruis/IBF-system/issues/8827) ([fa8b8ca](https://github.com/rodekruis/IBF-system/commit/fa8b8ca7d8cd6e09be43b5d56b1e1da87391bcab))



## [0.79.1](https://github.com/rodekruis/IBF-system/compare/v0.79.0...v0.79.1) (2021-08-06)


### Bug Fixes

* forgot to uncomment AB[#8827](https://github.com/rodekruis/IBF-system/issues/8827) ([f01b47f](https://github.com/rodekruis/IBF-system/commit/f01b47fee8d1a1b2512949eba6335ea2abd7180d))



# [0.79.0](https://github.com/rodekruis/IBF-system/compare/v0.78.4...v0.79.0) (2021-08-06)


### Bug Fixes

* always get latest disasterType in updateLayer AB[#8676](https://github.com/rodekruis/IBF-system/issues/8676) ([0780d83](https://github.com/rodekruis/IBF-system/commit/0780d8362167a724cc80a5525ece731ce008fe14))
* backup value if no placecode match found AB[#8827](https://github.com/rodekruis/IBF-system/issues/8827) ([27cfabd](https://github.com/rodekruis/IBF-system/commit/27cfabd0095e881a8074cf337214463842bb6d17))
* color property bug AB[#8676](https://github.com/rodekruis/IBF-system/issues/8676) ([3064b9c](https://github.com/rodekruis/IBF-system/commit/3064b9c50c3585e24e6fbd0a10e01cfb90b458f9))
* idp-data AB[#8819](https://github.com/rodekruis/IBF-system/issues/8819) ([c00cc37](https://github.com/rodekruis/IBF-system/commit/c00cc375d25fbc84f8c8c68968fb49c1a737a3dc))
* keep own colorProperty for aggregage layers AB[#8676](https://github.com/rodekruis/IBF-system/issues/8676) ([e814378](https://github.com/rodekruis/IBF-system/commit/e81437869b2f2c75510d69f66ace2d5464e59d1e))
* potential cases 65+ instead of population AB[#8834](https://github.com/rodekruis/IBF-system/issues/8834) ([688e4af](https://github.com/rodekruis/IBF-system/commit/688e4af8f032d818ae38526e137930618cd72eb5))
* revert 2nd colorProperty entry to fix fill-colors in map AB[#8820](https://github.com/rodekruis/IBF-system/issues/8820) ([d3d45ed](https://github.com/rodekruis/IBF-system/commit/d3d45ed356fe84e98412ab34ab6fd69fba8f5ec7))
* update hotspot labels AB[#8841](https://github.com/rodekruis/IBF-system/issues/8841) ([12fb864](https://github.com/rodekruis/IBF-system/commit/12fb864cf23a04bed1d4d768b063e85d2dd593bd))


### Features

* add endpoint to update static data AB[#8842](https://github.com/rodekruis/IBF-system/issues/8842) ([29d4e78](https://github.com/rodekruis/IBF-system/commit/29d4e783244bdc0af7c6ded5cac1c5036a44e64f))
* add initial version of hotspot/ipc via seed AB[#8865](https://github.com/rodekruis/IBF-system/issues/8865) ([09c27db](https://github.com/rodekruis/IBF-system/commit/09c27db478958b3029bb7fafa6619eee88112e3b))
* add population under 5 AB[#8818](https://github.com/rodekruis/IBF-system/issues/8818) ([ba2aa2b](https://github.com/rodekruis/IBF-system/commit/ba2aa2b8c53a2cc94d7772cba7d12ba9648d9ea7))
* add static data via seed AB[#8819](https://github.com/rodekruis/IBF-system/issues/8819) ([e7c9ac0](https://github.com/rodekruis/IBF-system/commit/e7c9ac0cb85a788a6144c330cdb087deb4a007fc))
* add static layers AB[#8819](https://github.com/rodekruis/IBF-system/issues/8819) ([1eaebb5](https://github.com/rodekruis/IBF-system/commit/1eaebb5a8c718bc54151f6e3292b6c4b093eae42))
* create hotspot/ipc layers AB[#8841](https://github.com/rodekruis/IBF-system/issues/8841) ([9c64db4](https://github.com/rodekruis/IBF-system/commit/9c64db4e5146e341791a76363e81bdf15e6c58dc))



## [0.78.4](https://github.com/rodekruis/IBF-system/compare/v0.78.3...v0.78.4) (2021-08-03)


### Bug Fixes

* remove broken email alternative AB[#8844](https://github.com/rodekruis/IBF-system/issues/8844) ([7ef0151](https://github.com/rodekruis/IBF-system/commit/7ef015179abd77c654ed72d199c72c7b1a275fef))
* right video channel AB[#8864](https://github.com/rodekruis/IBF-system/issues/8864) ([e8fd6fd](https://github.com/rodekruis/IBF-system/commit/e8fd6fdce277298ba68df5d12a021c23c5fb723d))
* right video channel AB[#8864](https://github.com/rodekruis/IBF-system/issues/8864) ([bf95cf8](https://github.com/rodekruis/IBF-system/commit/bf95cf84bb28afce11ebef96a9cc60f45c3ac8c5))
* update mock forecast values ETH AB[#8810](https://github.com/rodekruis/IBF-system/issues/8810) ([ae8acbc](https://github.com/rodekruis/IBF-system/commit/ae8acbc9774938482aafce4bd85385cb5ae61eb7))



## [0.78.3](https://github.com/rodekruis/IBF-system/compare/v0.78.2...v0.78.3) (2021-08-02)


### Bug Fixes

* get latest update of threshold value instead of first AB[#8876](https://github.com/rodekruis/IBF-system/issues/8876) ([e127907](https://github.com/rodekruis/IBF-system/commit/e127907209075ffe3c2b8454e6f7d0b9acd079fe))



## [0.78.2](https://github.com/rodekruis/IBF-system/compare/v0.78.1...v0.78.2) (2021-07-27)


### Bug Fixes

* add red cross branches seed data for ethiopia AB[#8818](https://github.com/rodekruis/IBF-system/issues/8818) ([7e5c4c5](https://github.com/rodekruis/IBF-system/commit/7e5c4c5c28ec6a43f0873c681ff56342689fc242))



## [0.78.1](https://github.com/rodekruis/IBF-system/compare/v0.78.0...v0.78.1) (2021-07-19)


### Bug Fixes

* use variable instead of function to prevent angular reload AB[#8552](https://github.com/rodekruis/IBF-system/issues/8552) ([a8cd3e0](https://github.com/rodekruis/IBF-system/commit/a8cd3e0ab011064c87081966641c2125e3baa825))



# [0.78.0](https://github.com/rodekruis/IBF-system/compare/v0.77.2...v0.78.0) (2021-07-16)


### Features

* update glofas thresholds AB[#8936](https://github.com/rodekruis/IBF-system/issues/8936) ([00bbf27](https://github.com/rodekruis/IBF-system/commit/00bbf2735ad4d9f94a5d4794c11233bfa9262317))



## [0.77.2](https://github.com/rodekruis/IBF-system/compare/v0.77.1...v0.77.2) (2021-07-15)


### Bug Fixes

* enable population over 65 for Ethiopia ([da2f3d7](https://github.com/rodekruis/IBF-system/commit/da2f3d7ce2cf6410a4e9e938b0d35f09e838da79))



