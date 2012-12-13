|travis-status|

backbone-pageable
=================

A pageable, drop-in replacement for Backbone.Collection inspired by
`Backbone.Paginator <https://github.com/addyosmani/backbone.paginator/>`_, but
much better.

.. contents:: Table of Contents

Advantages
----------

* Supports client-side and server-side operations

  You can initialize ``Backbone.PageableCollection`` to paginate and sort on the
  client-side or server-side and switch between the two modes.

* Comes with reasonable defaults

  Server API parameters preconfigured to work with most Rails RESTful APIs by
  default.

* Works well with existing server-side APIs

  Query parameter mappings are all configurable, and you can use either 0-based
  or 1-based indices.

* Bi-directional event handling

  In client-mode, you have access to both the collection holding the models in
  the current page or all the pages. Any changes done on either collection is
  immediately reflected on the other one with the appropriate events propagated.

* 100% compatible with existing code

  ``Backbone.PageableCollection`` passes ``Backbone.Collection`` 's test suite,
  so you can replace your collections with ``Backbone.PageabeCollection`` and
  your code will behave exactly the same.

* Well tested

  Comes with 100s of tests in addition to the ``Backbone.Collection`` test
  suite.

* Well documented

  Use cases and functionality are thoroughly documented.

* No surprising behavior

  ``Backbone.PageableCollection`` performs internal state sanity checks at
  appropriate times, so it is next to impossible to get into a weird state.

* Light-weight

  Less than 2.5k minified and gzipped.


Installation
------------

Installing from Node.js
+++++++++++++++++++++++

.. code-block:: bash

  npm install backbone-pageable


Installing from bower
+++++++++++++++++++++

.. code-block:: bash

  bower install backbone-pageable


Browser
+++++++

.. code-block:: html

  <script src="jquery.js"></script><!-- or zepto or ender -->
  <script src="underscore.js"></script>
  <script src="backbone.js"></script>
  <script src="backbone-pageable.js"></script>


Getting to the Backbone.PageableCollection class from Node.js and AMD
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

.. code-block:: javascript

  var PageableCollection = require("backbone-pageable");


Getting to the Backbone.PageableCollection class in the browser
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

.. code-block:: javascript

  var PageableCollection = Backbone.PageableCollection;


Getting Started
---------------

Like Backbone.Collection, you can provide a URL endpoint, configure your initial
pagination state and server API mapping by extending
``Backbone.PageableCollection``:

.. code-block:: javascript

  var Books = Backbone.PageableCollection.extend({
     url: "api.mybookstore.com/books",
     // Any `state` or `queryParam` you override in a subclass will be merged with
     // the defaults in `Backbone.PageableCollection` 's prototype.
     state: {
       // You can use 0-based or 1-based indices, the default is 1-based.
       // You can set to 0-based by setting ``firstPage`` to 0.
       firstPage: 0,
       // Set this to the initial page index, can be 0-based or 1-based
       currentPage: 0
     },
     // You can configure the mapping from a `Backbone.PageableCollection#state`
     // key to the query string parameters accepted by your server API.
     queryParams: {
       // `Backbone.PageableCollection#queryParams` converts to ruby's
       // will_paginate keys by default.
       currentPage: "current_page",
       pageSize: "page_size"
     }
  });


You can initialize ``state`` and ``queryParams`` from the constructor too:

.. code-block:: javascript

  var Books = Backbone.PageableCollection.extend({
      url:"api.mybookstore.com/books"
  });

  var books = new Books([], {
      // All the `state` and `queryParams` key value pairs are merged with
      // the defaults too.
      state: {
          firstPage: 0,
          currentPage: 0
      },
      queryParams: {
          currentPage: "current_page",
          pageSize: "page_size"
      }
  });


This is a listing of the default ``state`` and ``queryParam`` values.

============ ===== ============= ============================
    ``state``                   ``queryParams``
------------------ ------------------------------------------
Attribute    Value Attribute     Value
============ ===== ============= ============================
firstPage    1                                              
lastPage     null                                            
currentPage  1     currentPage   "page"                     
pageSize     25    pageSize      "per_page"                 
totalPages   null  totalPages    "total_pages"                    
totalRecords null  totalRecords  "total"                    
sortKey      null  sortKey       "sort_by"                  
order        -1    order         "order"                    
\                  directions    { "-1": "ASC", "1": "DESC" }
isClientMode false                                          
============ ===== ============= ============================

You can also consult the `API documentation
<http://wyuenho.github.com/backbone-pageable/#!/api/Backbone.PageableCollection>`_
for a more detailed explaination of these fields.

Bootstrapping
-------------

``Backbone.PageableCollection`` is 100% compatible with ``Backbone.Collection``
's interface, so of course you can bootstrap the models and supply a comparator
to the constructor too:

.. code-block:: javascript

  // Bootstrap with just 1 page of data for server-mode, or all the pages for
  // client-mode.
  var books = new Books([
          { name: "A Tale of Two Cities" },
          { name: "Lord of the Rings" },
          // ...
      ], {
          state: {
              // Paginate and sort on the client side, default is `false`.
              isClient: true
          },
          // This will maintain the current page in the order the comparator defined
          // on the client-side, regardless of modes.
          comparator: function (model) { return model.get("name"); }
      }
  );


Pagination
----------

Server-mode
+++++++++++

``Backbone.Pagination`` defaults to server-mode, which means it only holds one
page of data at a time. All of the ``get*page`` operations are done by
delegating to ``fetch`` and return a ``jqXHR`` in this mode.

.. code-block:: javascript

  books.getFirstPage();
  books.getPreviousPage();
  books.getNextPage();
  books.getLastPage();

  // Since the page data will not be available until the server responds, you
  // probably want to only work on them when the AJAX call has finished.
  books.getPage(2).done(function () {
      // do something ...
  });


All of the ``get*Page`` methods accept the same options
`Backbone.Collection#fetch <http://backbonejs.org/#Collection-fetch>`_ accepts
under server-mode.

Client-mode
+++++++++++

Client-mode is a very convenient mode for paginating a handful of pages entirely
on the client side without going through the network page-by-page. This mode is
best suited if you only have a small number of pages so sending all of the data
to the client in one go is not too time-consuming.

.. code-block:: javascript

  var book = new Book([
      // ...
  ], { state: { isClient: true } });


All of the ``get*Page`` methods reset the pageable collection's data to the models
belonging to the current page and return the collection itself instead of a
``jqXHR``.

.. code-block:: javascript

  // You can immediately operate on the collection without waiting for jQuery to
  // call your `done` callback.
  var json = JSON.stringify(books.getLastPage());

  // You can force a fetch in client-mode to get the most updated data from the
  // server if the collection has gone stale.
  books.getFirstPage({ fetch: true }).done(function () {
      // ...
  });


Sorting
-------

There are three ways you can sort a pageable collection. You can sort on the
client-side by either supplying a ``comparator`` like you can do with a plain
``Backbone.Collection``, by setting a ``sortKey`` and ``order`` to ``state``, or
call the convenient method ``makeComparator`` with a ``sortKey`` and ``order`` at
any time.

Each sorting method is valid for both server-mode and client-mode
operations. Both modes are capable of sorting on either the current page or all
of the pages.

The following matrices will help you understand all of the different ways you
can sort on a pageable collection.

Server-mode
+++++++++++

+--------------+-----------------------------------------------+-------------------------------------+
|              |Server-Current                                 |Server-Full                          |
+==============+===============================================+=====================================+
|comparator    | .. code-block:: javascript                    | N/A                                 |
|              |                                               |                                     |
|              |   var books = new Books([], {                 |                                     |
|              |     comparator: function (l, r)  {            |                                     |
|              |       var lv = l.get("name");                 |                                     |
|              |       var rv = r.get("name");                 |                                     |
|              |       if (lv == rv) return 0;                 |                                     |
|              |       else if (lv < rv) return 1;             |                                     |
|              |       else return -1;                         |                                     |
|              |     }                                         |                                     |
|              |   });                                         |                                     |
|              |                                               |                                     |
|              |                                               |                                     |
|              |                                               |                                     |
|              |                                               |                                     |
|              |                                               |                                     |
+--------------+-----------------------------------------------+-------------------------------------+
|state         | N/A                                           | .. code-block:: javascript          |
|              |                                               |                                     |
|              |                                               |   // You need to bootstrap the      |
|              |                                               |   // first page in a globally       |
|              |                                               |   // sorted order                   |
|              |                                               |   var books = new Books([], {       |
|              |                                               |     state: {                        |
|              |                                               |       sortKey: "name",              |
|              |                                               |       order: 1                      |
|              |                                               |     }                               |
|              |                                               |   });                               |
|              |                                               |   // Or perform a fetch using a     |
|              |                                               |   // query string having the sort   |
|              |                                               |   // key and order for a globally   |
|              |                                               |   // sorted page                    |
|              |                                               |   books.getPage(1);                 |
|              |                                               |                                     |
+--------------+-----------------------------------------------+-------------------------------------+
|makeComparator| .. code-block:: javascript                    | N/A                                 |
|              |                                               |                                     |
|              |   var books = new Books([]);                  |                                     |
|              |   var comp = books.makeComparator("name", 1); |                                     |
|              |   books.comparator = comp;                    |                                     |
|              |                                               |                                     |
|              |                                               |                                     |
+--------------+-----------------------------------------------+-------------------------------------+

Client-mode
+++++++++++

+--------------+------------------------------------+---------------------------------------------+
|              |Client-Current                      |Client-Full                                  |
+==============+====================================+=============================================+
|comparator    | Same as Server-Current. Set        | .. code-block:: javascript                  |
|              | ``state.isClient`` to true.        |                                             |
|              |                                    |   var books = new Books([], {               |
|              |                                    |     comparator: function (l, r) {           |
|              |                                    |       var lv = l.get("name");               |
|              |                                    |       var rv = r.get("name");               |
|              |                                    |       if (lv == rv) return 0;               |
|              |                                    |       else if (lv < rv) return 1;           |
|              |                                    |       else return -1;                       |
|              |                                    |     },                                      |
|              |                                    |     state: {                                |
|              |                                    |       isClient: true                        |
|              |                                    |     },                                      |
|              |                                    |     full: true                              |
|              |                                    |   });                                       |
|              |                                    |                                             |
+--------------+------------------------------------+---------------------------------------------+
|state         | Same as Server-Full. Set           | .. code-block:: javascript                  |
|              | ``state.isClient`` to true.        |                                             |
|              |                                    |   var books = new Books([], {               |
|              |                                    |     state: {                                |
|              |                                    |       sortKey: "name",                      |
|              |                                    |       order: 1,                             |
|              |                                    |       isClient: true                        |
|              |                                    |     },                                      |
|              |                                    |     full: true                              |
|              |                                    |   };                                        |
|              |                                    |                                             |
|              |                                    |                                             |
|              |                                    |                                             |
|              |                                    |                                             |
|              |                                    |                                             |
|              |                                    |                                             |
|              |                                    |                                             |
+--------------+------------------------------------+---------------------------------------------+
|makeComparator| Same as Server-Current. Set        | .. code-block:: javascript                  |
|              | ``state.isClient`` to true.        |                                             |
|              |                                    |   var books = new Books([], {               |
|              |                                    |     state: {                                |
|              |                                    |       isClient:true;                        |
|              |                                    |     },                                      |
|              |                                    |     full: true                              |
|              |                                    |   });                                       |
|              |                                    |   var comp = books.makeComparator("name");  |
|              |                                    |   books.fullCollection.comparator = comp;   |
|              |                                    |                                             |
+--------------+------------------------------------+---------------------------------------------+

Manipulation
------------

This is one of the areas where ``Backbone.PageableCollection`` truely shines. A
``Backbone.PageableCollection`` instance not only is capable of doing everything
a plain ``Backbone.Collection`` is capable of doing for the current page, in
client-mode, it is also capable of synchronizing changes and events across all
of the pages. For example, you can add or remove a model from either a
``Backbone.PageableCollection`` instance, which is holding the current page, or
the ``Backbone.PageableCollection#fullCollection`` collection, which is a plain
``Backbone.Collection`` holding the models for all of the pages. The appropriate
events will be propagated to the other collection when appropriate. Any
additions, removals, resets, model attribute changes and synchronization actions
are communicated between the two collections.

.. code-block:: javascript

   var books = new Books([
     // bootstrap with all of the models for all of the pages here
   ], {
     state: {
       isClientMode: true,
       // Pages indices default to 1-based.
       currentPage: 1,
       firstPage: 1
     }
   });

   // The books collection is now at the first page and a book is added to the
   // end of the current page, which will overflow to the next page and trigger
   // an `add` event on `fullCollection`.
   books.push({ name: "The Great Gatsby"});

   books.fullCollection.at(books.state.currentPage - 1 * books.state.pageSize).get("name");
   >>> "The Great Gatsby"

   // Add a new book to the beginning of the first page.
   books.fullCollection.unshift({ name: "Oliver Twist" });
   books.at(0).get("name");
   >>> "Oliver Twist"

Fetching Data and Managing States
---------------------------------

You can access the pageable collection's internal state by looking at the
``state`` object attached to a ``Backbone.PageableCollection`` instance. This
state object, however, is generally read-only after initialization. There are
various methods to help you manage this state, you should use them instead of
manually modifying it. For the unusual circumstances where you need to modify
the ``state`` object directly, a sanity check will be performed at the next time
you perform any pagination-specific operations to ensure internal state
consistency.

================== ===============================
Method             Use When
================== ===============================
``setPageSize``    Changing the page size
``makeComparator`` Changing the sorting
``switchMode``     Switching between modes
``state``          Need to read the internal state
================== ===============================


In addition to the above methods, you can also synchronize the state with the
server during a fetch. ``Backbone.PageableCollection`` overrides the default
`Backbone.Collection#parse <http://backbonejs.org/#Collection-parse>`_ method to
support an additional response data structure that contains an object hash of
pagination state. The following is a table of the response data structure
formats a pageable collection accepts.

============= ====================================
Without State With State
============= ====================================
[{}, {}, ...] [{ pagination state }, [{}, {} ...]]
============= ====================================

API Reference
-------------

See `here <http://wyuenho.github.com/backbone-pageable/>`_.

FAQ
---

#. Why another paginator?

   This project was born out of the needs for a backing model for
   `Backgrid.Paginator <http://wyuenho.github.com/backgrid/#api-paginator>`_ -
   an extension for the `Backgrid.js <http://wyuenho.github.com/backgrid/>`_
   project. The project needed a smart and intuitive model that is
   well-documented and well-tested to manage the paginator view. Upon examining
   the popular project `Backbone.Paginator
   <https://github.com/addyosmani/backbone.paginator/>`_, the author has
   concluded that it does not satisfy the above requirements. Furthermore, the
   progress of the the project is too slow. The author hopes to reinvent a
   better wheel that is better suited and supported for `Backgrid.js
   <http://wyuenho.github.com/backgrid/>`_.

#. Which package managers does backbone-pageable support?

   bower, CommonJS and AMD as of 0.9.0.

#. Why doesn't backbone-pageable support filtering?

   Wheels should be reinvented only when they are crooked. backbone-pageable aims
   to do one thing only and does it well, which is pagination and sorting. Besides,
   since Backbone.PageableCollection is 100% compatible with Backbone.Collection,
   you can do filtering fairly easily with Backbone's built-in support for
   Underscore.js methods.

#. Why doesn't `queryParams` support functions as values and extra parameters?

   This is feature and a reasonable design decision. Code that deals with
   pagination and sorting should only deal with pagination and sorting, any extra
   URL parameters that has nothing to do with pagination and sorting should be
   hardcoded directly into the `url` attribute, or supplied to `options.data` when
   calling any methods that will perform a fetch. You can also override `parse()`
   to deal with the weird cases where the server API expects the client side code
   to store and resend parameters that have nothing to do with pagination and
   sorting. If none of the above takes care of your use cases, you can alway
   subclass Backbone.PageableCollection.

#. How do I contribute?

   See `CONTRIBUTING <CONTRIBUTING.md>`_.


Change Log
----------

0.9.1
  Bugs Fixed
    - Instantiating a ``PageableCollection`` in client-mode without giving it
      any models no longer throws errors.
  Enhancements
    - Overriding ``state`` and ``queryParams`` in a subclass's prototype now
      merge with the defaults in ``Backbone.PageableCollection.prototype``.
    - fullCollection now respect the parent's prototype.

0.9.0
  Initial release


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

.. |travis-status| image:: https://travis-ci.org/wyuenho/backbone-pageable.png?branch=master
