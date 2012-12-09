backbone-pageable
=================

A pageable, drop-in replacement for Backbone.Collection inspired by
[Backbone.Paginator](https://github.com/addyosmani/backbone.paginator/).

Features
----------

- Supports client-side and server-side operations. You can initialize
  Backbone.PageableCollection to paginate and sort on the client-side or
  server-side and switch between the two modes.
- Comes with reasonable defaults. Server API parameters preconfigured to work
  with most RESTful APIs by default.
- Works well with existing server-side APIs. Query parameter mappings are all
  configurable, and you can use either 0-based or 1-based indices.
- Bi-directional event handling. In client mode, you have access to both the
  collection holding the models in the current page or all the pages. Any
  changes done on either collection is immediately synchronized with the other
  one.
- 100% compatible with existing code. Backbone.PageableCollection passes
  Backbone.Collection's test suite, so you can replace your collections with
  Backbone.PageabeCollection and your code will behave exactly the same.
- Well tested. Comes with 100s of tests in addition to the Backbone.Collection
  test suite.
- Well documented. Use cases and functionality are thoroughly documented.
- No surprising behavior. Backbone.PageableCollection performs internal state
  sanity checks at appropriate times, so it is next to impossibe to get into a
  weird state.
- Light-weight. Less than 2.5k minified and gzipped.

Getting Started
---------------

Pagination
----------

Sorting
-------

Manipulation
------------

Configuration
-------------

API Reference
-------------

See [here](https://wyuenho.github.com/backbone-pageable/).

Legal
-----
Copyright (c) 2012 Jimmy Yuen Ho Wong

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
