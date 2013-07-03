# Release History

## 0.8.1
* [Use semver-compliant release tag](https://github.com/backbone-paginator/backbone.paginator/issues/188)

## 0.8.0
[Commits](https://github.com/addyosmani/backbone.paginator/compare/v0.7...v0.8)
* [Use correct callback arguments for `option.error`](https://github.com/addyosmani/backbone.paginator/pull/183)
* [Use GitHub API for examples](https://github.com/addyosmani/backbone.paginator/pull/175)
* [Make API more consistent](https://github.com/addyosmani/backbone.paginator/pull/173)
* [Use Backbone.ajax instead of $.ajax](https://github.com/addyosmani/backbone.paginator/pull/170)
* [Fire 'sync' only once on Backbone 1.0.0](https://github.com/addyosmani/backbone.paginator/commit/8faf68e5adfc1f8c61dd2fb5b499a51b0f4d9fba)

## 0.7.0
[Commits](https://github.com/addyosmani/backbone.paginator/compare/v0.6...v0.7)
* [Support Backbone 1.0.0](https://github.com/addyosmani/backbone.paginator/pull/163)
* [Update Netflix request pager example to use Backbone 1.0.0 style events](https://github.com/addyosmani/backbone.paginator/issues/164)
* Migrate to grunt 0.4.0

## 0.6.0
[Commits](https://github.com/addyosmani/backbone.paginator/compare/v0.5...v0.6)

* [Propagate version number from `package.json` to codebase during build](https://github.com/addyosmani/backbone.paginator/commit/5f7d2ff0a8f7e6f87e5a6e2081dc029c3fd0e70c)
* [Transparently support both backbone 9.9 and 9.10 style `success` callback arguments](https://github.com/addyosmani/backbone.paginator/commit/c6c37ea6392c9427d67487e1316592a4a0475e92)
* [Unify interfaces of requestPager and clientPager](https://github.com/addyosmani/backbone.paginator/commit/d4135188c6c956999116157fb9c51e9779e78d57)
* [Allow bootstrapping of pager data without server interaction](https://github.com/addyosmani/backbone.paginator/commit/babb81d7f5245a52053a008a2b82bbbcd324cd4a)
* Bug fixes

## 0.5

* Improved unit testing
* Improved demos
* Improved sorting
* Added filtering abilities
* Added setSort() and setFilter() methods
* Make pager() argument-less
* Don't force attributes
* Let the developer change the type of the request
* Make the API cleaner
* Some bug fixes

## 0.15

* Rewrite to simplify the project API
* Unify components under the same collection hood

## 0.14

* Rewrite of all components

## 0.13

* Initial release of client and request pagers

## 0.11

* Initial work on version to work with requests to a server

## 0.1

* Basic pagination of a single response from the server
