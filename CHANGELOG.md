## [0.321.4](https://github.com/rodekruis/IBF-system/compare/v0.321.3...v0.321.4) (2025-07-16)


### Bug Fixes

* use optional chaining when accessing nested properties ([207b482](https://github.com/rodekruis/IBF-system/commit/207b4823ead6bc506e53fdaa8687be94abef1e8c))



## [0.321.3](https://github.com/rodekruis/IBF-system/compare/v0.321.2...v0.321.3) (2025-07-15)


### Bug Fixes

* add eslint rule and fixes to await seed ([a893a6b](https://github.com/rodekruis/IBF-system/commit/a893a6b53830d231595bb0f22f96b3f74c642707))
* adjust country interface to accept partial configs ([4941a35](https://github.com/rodekruis/IBF-system/commit/4941a3557cb9c9482e5f20fe19e696b9ea2d0acd))
* fallback to DEFAULT_USER on null ([71ce901](https://github.com/rodekruis/IBF-system/commit/71ce901b31b42921dade0cef93d58a534838377c))
* guard POST country ([92b3bcd](https://github.com/rodekruis/IBF-system/commit/92b3bcde0b4b2116429d72e4fa53845a6204f985))
* remove unnecessary waterpoint data token and use correct query param ([be166eb](https://github.com/rodekruis/IBF-system/commit/be166ebe76a1c1a73e4ce215cecee87a1e9e55eb))
* remove waterpoints internal ([e9e0cf0](https://github.com/rodekruis/IBF-system/commit/e9e0cf01e67a29bcc34d2aac855e1a78308c9415))
* reset should default to false ([652f4b0](https://github.com/rodekruis/IBF-system/commit/652f4b036162931ec8d74de7cbed5c1a0c9cac43))
* update mock data waterpoints internal ([8c35770](https://github.com/rodekruis/IBF-system/commit/8c357700ef10df0e9731b0dfb66baaf7657f2418))
* use default seed on reset ([481950d](https://github.com/rodekruis/IBF-system/commit/481950daffce7c5732b248957a9012763949f202))



## [0.321.2](https://github.com/rodekruis/IBF-system/compare/v0.321.1...v0.321.2) (2025-06-19)


### Bug Fixes

* ionic translate error ([c3f4130](https://github.com/rodekruis/IBF-system/commit/c3f41304a03f1fa7e5d0f4731d96b25cf2aa7ea4))



## [0.321.1](https://github.com/rodekruis/IBF-system/compare/v0.321.0...v0.321.1) (2025-06-19)


### Bug Fixes

* add mock gauge data ([22eb854](https://github.com/rodekruis/IBF-system/commit/22eb854d9843eb8273f3bde5b7a24a179d294757))
* show warning when file missing in mock scenarios ([b6c5cd3](https://github.com/rodekruis/IBF-system/commit/b6c5cd3b5bbca2621f7b3ac7acedc0754fabb6da))
* use tailwind classes ([68d1c1c](https://github.com/rodekruis/IBF-system/commit/68d1c1cc4729cee578e631c38e30361982514123))



# [0.321.0](https://github.com/rodekruis/IBF-system/compare/v0.320.4...v0.321.0) (2025-06-03)


### Features

* GET admin areas for country and admin level ([4e26a9e](https://github.com/rodekruis/IBF-system/commit/4e26a9ef46b879d9050785e6b0ff34b938e7e03e))



## [0.320.4](https://github.com/rodekruis/IBF-system/compare/v0.320.2...v0.320.4) (2025-06-03)


### Bug Fixes

* align IBF version-nr ([a623bb8](https://github.com/rodekruis/IBF-system/commit/a623bb85cebef3ae6d4ada0da0780174db019b69))
* hack to avoid duplicate waterpoints layers ([be1dd89](https://github.com/rodekruis/IBF-system/commit/be1dd896c9f94fd7219a45574f68b0ce899379b5))



## [0.320.2](https://github.com/rodekruis/IBF-system/compare/v0.320.1...v0.320.2) (2025-06-02)


### Bug Fixes

* geoserver remote login AB[#36431](https://github.com/rodekruis/IBF-system/issues/36431) ([26924ec](https://github.com/rodekruis/IBF-system/commit/26924ec5b1a5ddd202ed8ca2976fa57d11ae43bd))



## [0.320.1](https://github.com/rodekruis/IBF-system/compare/v0.320.0...v0.320.1) (2025-05-28)


### Bug Fixes

* update simplification perc of ETH adm3 AB[#36189](https://github.com/rodekruis/IBF-system/issues/36189) ([4b0142a](https://github.com/rodekruis/IBF-system/commit/4b0142af3581890bf3926721fcebd7c48e0e77fe))



# [0.320.0](https://github.com/rodekruis/IBF-system/compare/v0.319.1...v0.320.0) (2025-05-23)


### Bug Fixes

* drought GET /admin-areas for event-area + stable uploadDate ([723c8a6](https://github.com/rodekruis/IBF-system/commit/723c8a6b360583dce9d0d16c6ce8ca66531be3b7))
* revert integration test assertion changes on drought ([c342104](https://github.com/rodekruis/IBF-system/commit/c342104ec5db5c24bc762b3776fd34ee89f576f0))
* show correct eventName on hover in aggregates header AB[#36185](https://github.com/rodekruis/IBF-system/issues/36185) ([8cb6825](https://github.com/rodekruis/IBF-system/commit/8cb682584c29ce56c27ec441a8108f0405862fbd))


### Features

* add drought + make const AB[#36185](https://github.com/rodekruis/IBF-system/issues/36185) ([7ac8559](https://github.com/rodekruis/IBF-system/commit/7ac8559386765d6850670140e4d205994e0cbf8b))
* disable event-areas for drought again AB[#36246](https://github.com/rodekruis/IBF-system/issues/36246) ([122447d](https://github.com/rodekruis/IBF-system/commit/122447da68fe3591a8084f5e905d86f2275abe74))



## [0.319.1](https://github.com/rodekruis/IBF-system/compare/v0.319.0...v0.319.1) (2025-05-23)


### Bug Fixes

* use 0 as fallback aggregate value ([6b36aec](https://github.com/rodekruis/IBF-system/commit/6b36aec5815bef600d5e17f62e1d558feba8d65c))



