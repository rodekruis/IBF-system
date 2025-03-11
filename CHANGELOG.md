# [0.296.0](https://github.com/rodekruis/IBF-system/compare/v0.295.0...v0.296.0) (2025-03-11)


### Bug Fixes

* add waitforloadertodisappear in more tests ([b819c73](https://github.com/rodekruis/IBF-system/commit/b819c7305227b572ddd66209c00920bd07f0264d))
* correctly apply more tests also to warning scenario ([60247ce](https://github.com/rodekruis/IBF-system/commit/60247ce6a48212badd17532fc9299ddff584b823))
* rm flaky and irrelevant assertion ([4defa59](https://github.com/rodekruis/IBF-system/commit/4defa5979116c84c2e1e9b198a3e3ba79973059b))
* select-area tests + add waitforloadertodisappear in all tests ([84b9feb](https://github.com/rodekruis/IBF-system/commit/84b9feb1d6a3bfce2b2fe734fdfa25f8f5b81968))


### Features

* add drought trigger + fix tests ([3e677c5](https://github.com/rodekruis/IBF-system/commit/3e677c5da7f1dec4b5e2ecd1718645acce7821a0))
* replace drought trigger by warning scenario ([959db40](https://github.com/rodekruis/IBF-system/commit/959db403c6011652e1f272afb38e931f7cfe1594))



# [0.295.0](https://github.com/rodekruis/IBF-system/compare/v0.294.1...v0.295.0) (2025-03-10)


### Bug Fixes

* handle exception ([e4761c9](https://github.com/rodekruis/IBF-system/commit/e4761c9db3f66175ea9957ca17f96beab61e1ee1))
* import path error ([92588f0](https://github.com/rodekruis/IBF-system/commit/92588f09be5e773f9b9d89048379c82f79943ed0))
* set-trigger endpoint return updateresult ([15cbbb4](https://github.com/rodekruis/IBF-system/commit/15cbbb4cff21da8a2d7c09a7363d39ddcc9fc5c1))
* sql syntax error and remove unused code ([9402404](https://github.com/rodekruis/IBF-system/commit/94024049b3e4177012468f89e3e5a91be523e7c7))


### Features

* add alert level ([d3131f5](https://github.com/rodekruis/IBF-system/commit/d3131f5f61a282af01708d7bd0f1e313d342f071))
* admin area dynamic data should return trigger based on alert level ([4d83ee8](https://github.com/rodekruis/IBF-system/commit/4d83ee86e2558cb175186b09c866d56746d1937c))
* alert level per admin area ([c0f28a0](https://github.com/rodekruis/IBF-system/commit/c0f28a0ad4f0e03a07e758e98539dd03f1363ca5))
* allow closing events triggered by user ([421222f](https://github.com/rodekruis/IBF-system/commit/421222f1e75559ff6f4b248794ba072b0afc158e))
* do not close user triggered event areas ([e9c31c7](https://github.com/rodekruis/IBF-system/commit/e9c31c7a5cbb0fedd3d744076f444392d9e941d5))
* remove alert class from activation log ([ff1cd23](https://github.com/rodekruis/IBF-system/commit/ff1cd23ffcb44249d268fe4d8dccebfdee515934))
* sort notification content by alert level ([e19452a](https://github.com/rodekruis/IBF-system/commit/e19452ad4d2c54cddc3c755e583e5f0ef3cf7ce7))
* use alert level in whatsapp notifications ([4d9c27d](https://github.com/rodekruis/IBF-system/commit/4d9c27dda6ed86674b64f74765d387023d4bdbe0))



## [0.294.1](https://github.com/rodekruis/IBF-system/compare/v0.294.0...v0.294.1) (2025-03-10)


### Bug Fixes

* rm leadtime filter on deleteDuplicates in alerts-per-lead-time AB[#34304](https://github.com/rodekruis/IBF-system/issues/34304) ([75f1070](https://github.com/rodekruis/IBF-system/commit/75f10701ac303ff6b89e879f7ddea2a2d599065a))



# [0.294.0](https://github.com/rodekruis/IBF-system/compare/v0.293.1...v0.294.0) (2025-03-10)


### Features

* rename stopped to userTrigger ([139296f](https://github.com/rodekruis/IBF-system/commit/139296f708a9dd070897bccb59db6bdce5563fea))



## [0.293.1](https://github.com/rodekruis/IBF-system/compare/v0.293.0...v0.293.1) (2025-03-05)


### Bug Fixes

* actionsummary test ([781f5ed](https://github.com/rodekruis/IBF-system/commit/781f5ed4ec53d4b09237993c39aad6fab62a4c9c))
* errors ([d7950b1](https://github.com/rodekruis/IBF-system/commit/d7950b148791ab6d276fae146732179f9cfc43f5))
* move actionsummary test before logout test ([748bf38](https://github.com/rodekruis/IBF-system/commit/748bf38fa074459a5d673b7efbab94f95a47b69d))
* prettier api-service ([01b2940](https://github.com/rodekruis/IBF-system/commit/01b29401a7d0f6ec60bc34b8b8faa37e8237e933))
* remove test.only ([687cc25](https://github.com/rodekruis/IBF-system/commit/687cc25415e9b5dfced6db11ac850a069aa4d14a))
* revert code to fix test ([a325f89](https://github.com/rodekruis/IBF-system/commit/a325f8945db92a94ec30173bdfc0d86dfd945827))



# [0.293.0](https://github.com/rodekruis/IBF-system/compare/v0.292.2...v0.293.0) (2025-03-05)


### Bug Fixes

* missing class property ([0553d90](https://github.com/rodekruis/IBF-system/commit/0553d90814fe858a02c476867ed64278f7628db9))
* unit test ([0e69951](https://github.com/rodekruis/IBF-system/commit/0e69951da1f3f39bd8f0361fb137caa4fc4c3898))


### Features

* add enableSetWarningToTrigger property on disaster-type AB[#34112](https://github.com/rodekruis/IBF-system/issues/34112) ([33499fb](https://github.com/rodekruis/IBF-system/commit/33499fbeeb0689f2dff21a2738cc6ca603f2eaa6))
* show set trigger btn for drought warnings AB[#34113](https://github.com/rodekruis/IBF-system/issues/34113) ([b6740da](https://github.com/rodekruis/IBF-system/commit/b6740daf194496af8a6c2b039a84825dd0895513))



## [0.292.2](https://github.com/rodekruis/IBF-system/compare/v0.292.1...v0.292.2) (2025-03-05)


### Bug Fixes

* breaking test because GET point-data protected ([fb8d42f](https://github.com/rodekruis/IBF-system/commit/fb8d42fd24b8e4813320a57744fdf045cd631ad4))



## [0.292.1](https://github.com/rodekruis/IBF-system/compare/v0.292.0...v0.292.1) (2025-03-04)


### Bug Fixes

* change close-events api path typo AB[#34185](https://github.com/rodekruis/IBF-system/issues/34185) ([c612d0f](https://github.com/rodekruis/IBF-system/commit/c612d0f59fc3d99f3738af621ccf7b748d859414))



# [0.292.0](https://github.com/rodekruis/IBF-system/compare/v0.291.0...v0.292.0) (2025-03-03)


### Features

* add noNotification flag to process events ([6c63fa0](https://github.com/rodekruis/IBF-system/commit/6c63fa0f2b2a5571268f57cdfa76d6e722bf8f10))



# [0.291.0](https://github.com/rodekruis/IBF-system/compare/v0.290.0...v0.291.0) (2025-02-28)


### Features

* remove auto clearout message drought AB[#34049](https://github.com/rodekruis/IBF-system/issues/34049) ([56ec079](https://github.com/rodekruis/IBF-system/commit/56ec0793ea9419876237151fc1a2a487474eceaf))



