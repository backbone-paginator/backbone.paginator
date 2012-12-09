/*
  backbone-pageable
  http://github.com/wyuenho/backbone-pageable

  Copyright (c) 2012 Jimmy Yuen Ho Wong
  Licensed under the MIT @license.
*/

(function (factory) {

  // CommonJS
  if (typeof exports === "object") {
    module.exports = factory(require("underscore"), require("backbone"));
  }
  // AMD
  else if (typeof define === "function" && define.amd) {
    define(["underscore", "backbone"], factory);
  }
  // Browser
  else if (typeof _ !== "undefined" && typeof Backbone !== "undefined") {
    var oldPageableCollection = Backbone.PageableCollection;
    var PageableCollection = Backbone.PageableCollection = factory(_, Backbone);

    /**
       __BROWSER ONLY__

       If you already have an object named `PageableCollection` attached to the
       `Backbone` module, you can use this to return a local reference to this
       Backbone.PageableCollection class and reset the name
       Backbone.PageableCollection to its previous definition.

           // The left hand side gives you a reference to this
           // Backbone.PageableCollection implementation, the right hand side
           // resets Backbone.PageableCollection to your other
           // Backbone.PageableCollection.
           var PageableCollection = Backbone.PageableCollection.noConflict();

       @static
       @member Backbone.PageableCollection
       @return {Backbone.PageableCollection}
     */
    Backbone.PageableCollection.noConflict = function () {
      Backbone.PageableCollection = oldPageableCollection;
      return PageableCollection;
    };
  }

}(function (_, Backbone) {

  "use strict";

  /**
     Drop-in replacement for Backbone.Collection. Supports server-side and
     client-side pagination and sorting. Client-side mode also support fully
     multi-directional synchronization of changes between pages.

     @class Backbone.PageableCollection
     @extends Backbone.Collection
   */
  var PageableCollection = Backbone.Collection.extend({

    /**
       The container object to store all pagination states.

       You can override the default state by extending this class or specifying
       them in an `options` hash to the constructor.

       @property {Object} state

       @property {0|1} [state.firstPage=1] The first page index. Set to 0 if
       your server API uses 0-based indices. You should only override this value
       during extension, initialization or reset by the server after
       fetching. This value should be read only at other times.

       @property {number} [state.lastPage] The last page index. This value is
       __read only__ and it's calculated based on whether `firstPage` is 0 or 1,
       during bootstrapping, fetching and resetting. Please don't change this
       value under any circumstances.

       @property {number} [state.currentPage=1] The current page index. You
       should only override this value during extension, initialization or reset
       by the server after fetching. This value should be read only at other
       times. Can be a 0-based or 1-based index, depending on whether
       `firstPage` is 0 or 1. When a pagebale collection is initialized, the
       current page will be set to this page number initially.

       @property {number} [state.pageSize=25] How many records to show per
       page. This value is __read only__ after initialization, if you want to
       change the page size after initialization, you must call #setPageSize.

       @property {number} [state.totalPages] How many pages there are. This
       value is generally read only. If not supplied, it is calculated from the
       number of models during bootstrapping in client mode, or from
       `totalRecords` in server mode. There are use cases where you can change
       this value, but do so at your own risk. If you don't know what the cases
       are, you shouldn't change this value.

       @property {number} [state.totalRecords] How many records there are. This
       value is __required__ under server mode. This value is optional for
       client mode as the number will be the same as the number of models during
       bootstrapping and during fetching, either supplied by the server in the
       metadata, or calculated from the size of the response.

       @property {string} [state.sortKey] The model attribute to use for
       sorting.

       @property {-1|0|1} [state.order] The order to use for sorting. Specify -1
       for ascending order or 1 for descending order. If 0, no client side
       sorting will be done and the order query parameter will not be sent to
       the server during a fetch.
     */
    state: {
      firstPage: 1,
      lastPage: null,
      currentPage: 1,
      pageSize: 25,
      totalPages: null,
      totalRecords: null,
      sortKey: null,
      order: -1,
      isClientMode: false
    },

    /**
       A translation map to convert Backbone.PageableCollection state attributes
       to the query parameters accepted by your server API.

       You can override the default state by extending this class or specifying
       them in `options.queryParams` object hash to the constructor.

       @property {Object} queryParams
       @property {string} [queryParams.currentPage="page"]
       @property {string} [queryParams.pageSize="per_page"]
       @property {string} [queryParams.totalPages="total_pages"]
       @property {string} [queryParams.totalRecords="total"]
       @property {string} [queryParams.sortKey="sort_by"]
       @property {string} [queryParams.order="order"]
       @property {string} [queryParams.directions={"-1": "ASC", "1": "DESC"}] A
       map for translating a Backbone.PageableCollection#state.order constant to
       the ones your server API accepts.
     */
    queryParams: {
      currentPage: "page",
      pageSize: "per_page",
      totalPages: "total_pages",
      totalRecords: "total",
      sortKey: "sort_by",
      order: "order",
      directions: {
        "-1": "ASC",
        "1": "DESC"
      }
    },

    /**
       __CLIENT MODE ONLY__

       This collection is the internal storage for the bootstrapped or fetched
       models. You can use this if you want to operate on all the pages.

       @property {Backbone.Collection} fullCollection
     */
    fullCollection: undefined,

    /**
       Given a list of models or model attributues, bootstrap the full
       collection in client mode, or just the page you want in server mode. If
       you want to intialize this collection to a different state than the
       default, you can specify them in `options.state`. Any state parameters
       supplied will be merged with the default. If you want to change the
       default mapping from #state keys to your server API's query parameter
       names, you can specifiy an object hash in `option.queryParams`. Likewise,
       any mapping provided will be merged with the default. Lastly, all
       Backbone.Collection constructor options are also accepted.

       See:

       - Backbone.PageableCollection#state
       - Backbone.PageableCollection#queryParams
       - [Backbone.Collection#initialize](http://backbonejs.org/#Collection-constructor)

       @param {Array.<Object>} [models]

       @param {Object} [options]

       @param {function(*, *): number} [options.comparator] If specified, this
       comparator is set to the collection(s) instead.

       @param {boolean} [options.full] If `true`, and if #state.isClientMode is
       `true, and either a `options.comparator` or `sortKey` is defined, the
       comparator is attached to the full collection instead of just the parent
       collection containing the current page.

       @param {Object} [options.state] The state attributes overriding the defaults.

       @param {string} [options.state.sortKey] The model attribute to use for
       sorting. If specified instead of `options.comparator`, a comparator will be
       automatically created using this value, and optionally a sorting order
       specified in `options.state.order`, via #setComparator. The comparator is
       then attached to the new collection instance.

       @param {-1|1} [options.state.order] The order to use for sorting. Specify
       -1 for ascending order and 1 for descending order.

       @param {Object} [options.queryParam]
     */
    initialize: function (models, options) {

      models = models || [];
      options = options || {};

      var queryParams = _.extend({}, this.queryParams,
                                 options.queryParams || {});
      queryParams.directions = _.extend({}, this.queryParams.directions,
                                        queryParams.directions || {});
      this.queryParams = queryParams;

      var state = this.state = _.extend({}, this.state, options.state || {});

      if (state.isClientMode) {
        this.fullCollection =
          this._makeFullCollection(models, _.omit(options, "comparator"));

        if (options.full && _.isFunction(options.comparator)) {
          this.fullCollection.comparator = options.comparator;
        }

        this.on("all", this._onPageableCollectionEvent, this.fullCollection);

        if (!this._definedAndNotNull(state.totalRecords)) {
          state.totalRecords = models.length;
        }
      }

      if (_.isString(state.sortKey) && !_.isFunction(options.comparator)) {
        this.setComparator(state.sortKey, state.order, options);
      }

      this.state = this._checkState(state);

      if (state.isClientMode) this.getPage(this.state.currentPage);
    },

    /**
       Makes a Backbone.Collection that contains all the pages and connect event
       handlers to it.

       @private
       @param {Array.<Object|Backbone.Model>} models
       @param {Object} options
       @return {Backbone.Collection}
    */
    _makeFullCollection: function (models, options) {

      // clone the models
      models = models.slice();
      for (var i = 0, model = models[i]; i < models.length; i++) {
        models[i] = model instanceof Backbone.Model ?
          model.attributes :
          _.clone(model);
      }

      options = options || {};

      var fullCollection = new (Backbone.Collection.extend({
        model: this.model,
        url: this.url,
        sync: this.sync
      }))(models, _.omit(options, "state", "queryParams"));

      fullCollection.pageableCollection = this;

      fullCollection.on("all", this._onFullCollectionEvent, this);

      return fullCollection;
    },

    /**
       Event handler that propagates events from the current page to #fullCollection.

       @private
    */
    _onPageableCollectionEvent: function (event, model, pageableCol, options) {

      pageableCol.off("all", pageableCol._onFullCollectionEvent, pageableCol);

      var state = pageableCol.state;
      var currentPage = state.firstStart === 0 ?
        state.currentPage :
        state.currentPage - 1;
      var pageSize = state.pageSize;
      var pageStart = currentPage * pageSize, pageEnd = pageStart + pageSize;

      if (event === "add" || event === "remove") {
        var fullIndex = pageStart + options.index;
        this[event](model, _.extend({}, options, {at: fullIndex}));
      }

      if (event === "reset") {
        options = pageableCol;
        pageableCol = model;
        model = null;
        if (pageableCol.length !== pageSize) {
          var currentPageModels = pageableCol.toArray();
          var fullPageModels = this.toArray();
          var modelsToAdd = _.difference(fullPageModels, currentPageModels);
          var modelsToRemove = _.difference(currentPageModels, fullPageModels);
          this.add(modelsToAdd);
          this.remove(modelsToRemove);
        }
      }

      var thisModel;

      if (event === "change" && (thisModel = this.getByCid(model.cid))) {
        options = pageableCol;
        pageableCol = null;
        thisModel.set(options.changes, options);
      }

      if (event === "sync") {
        if ((thisModel = this.get(model.cid))) {
          thisModel.fetch();
        }
      }

      pageableCol.on("all", pageableCol._onFullCollectionEvent, pageableCol);
    },

    /**
       Event handler that sychronizes events from #fullCollection to its parent
       pageable collection holding the current page.

       @private
    */
    _onFullCollectionEvent: function (event, model, fullCollection, options) {

      fullCollection.off("all", this._onPageableCollectionEvent, fullCollection);

      var state = this.state;
      var currentPage = state.firstPage === 0 ?
        state.currentPage :
        state.currentPage - 1;
      var pageSize = state.pageSize;
      var pageStart = currentPage * pageSize, pageEnd = pageStart + pageSize;

      if (event === "add" || event === "remove") {
        if (options.index >= pageStart && options.index < pageEnd) {
          var pageIndex = options.index - pageStart;
          this[event](model, _.extend({}, options, {at: pageIndex}));
        }
      }

      if (event === "reset") {
        options = fullCollection;
        fullCollection = model;
        this.reset(fullCollection.toArray().slice(pageStart, pageEnd), options);
      }

      var thisModel;

      if (event === "change" && (thisModel = this.getByCid(model.cid))) {
        options = fullCollection;
        fullCollection = null;
        thisModel.set(options.changes, options);
      }

      if (event === "sync") {
        if ((thisModel = this.get(model.cid))) {
          thisModel.fetch();
        }
      }

      fullCollection.on("all", this._onPageableCollectionEvent, fullCollection);
    },

    /**
       @private
       @param {number} val
       @param {string} name
       @throws {TypeError} If `val` is not a finite integer.
    */
    _typeCheckInt: function (val, name) {
      if (!_.isNumber(val) || _.isNaN(val) || !_.isFinite(val) ||
          ~~val !== val) {
        throw new TypeError("`" + name + "` must be a finite integer");
      }
    },

    /**
       @private
       @param {*} val
       @return {boolean}
    */
    _definedAndNotNull: function (val) {
      return !_.isUndefined(val) && val !== null;
    },

    /**
       Sanity check this collection's pagination states. Only perform checks
       when all the required pagination state values are defined and not null.
       If `totalPages` is undefined or null, it is set to `totalRecords` /
       `pageSize`. `lastPage` is set according to whether `firstPage` is 0 or 1
       when no error occurs.

       @private

       @throws {TypeError} If `totalRecords`, `pageSize`, `currentPage` or
       `firstPage` is not a finite integer.

       @throws {RangeError} If `pageSize`, `currentPage` or `firstPage` is out
       of bounds.

       @return {Object} Returns the `state` object if no error was found.
    */
    _checkState: function (state) {

      if (this._definedAndNotNull(state.totalRecords) &&
          this._definedAndNotNull(state.pageSize) &&
          this._definedAndNotNull(state.currentPage) &&
          this._definedAndNotNull(state.firstPage)) {

        this._typeCheckInt(state.totalRecords, "totalRecords");
        this._typeCheckInt(state.pageSize, "pageSize");
        this._typeCheckInt(state.currentPage, "currentPage");
        this._typeCheckInt(state.firstPage, "firstPage");

        if (state.pageSize < 1 || state.pageSize > state.totalRecords) {
          throw new RangeError("`pageSize` must be 1 <= pageSize <= totalRecords");
        }

        if (_.isUndefined(state.totalPages) || state.totalPages === null) {
          state.totalPages = state.totalRecords / state.pageSize;
        }

        if (state.firstPage === 0) {
          if (state.currentPage < state.firstPage ||
              state.currentPage >= state.totalPages) {
            throw new RangeError("`currentPage` must be firstPage <= currentPage < totalPages if 0-based.");
          }
        }
        else if (state.firstPage === 1) {
          if (state.currentPage < state.firstPage ||
              state.currentPage > state.totalPages) {
            throw new RangeError("`currentPage` must be firstPage <= currentPage <= totalPages if 1-based.");
          }
        }
        else {
          throw new RangeError("`firstPage must be 0 or 1`");
        }

        state.lastPage = state.firstPage === 0 ?
          state.totalPages - 1 :
          state.totalPages;
      }

      return state;
    },

    /**
       Change the page size of this collection.

       For server mode operations, changing the page size will trigger a #fetch
       and subsequently a `reset` event.

       For client mode operations, changing the page size will `reset` the
       current page by recalculating the current page boundary on the client
       side.

       If `options.fetch` is true, a fetch can be forced if the collection is in
       client mode.

       @param {number} pageSize The new page size to set to #state.
       @param {Object} [options] {@link #fetch} options.
       @param {boolean} [options.fetch] If `true`, force a fetch in client mode.

       @throws {TypeError} If `pageSize` is not a finite integer.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this.
     */
    setPageSize: function (pageSize, options) {

      this._typeCheckInt(pageSize, "pageSize");

      options = options || {};

      this.state = this._checkState(_.extend({}, this.state, {
        pageSize: pageSize,
        totalPages: this.state.isClientMode ?
          Math.ceil(this.fullCollection.size() / pageSize) :
          this.state.totalRecords / pageSize
      }));

      return this.getPage(this.state.currentPage, options);
    },

    /**
       Toggle between client and server modes.

       If toggling from client to server mode, the full collection is emptied
       and a fetch is immediately issued for the current page from the
       server. Pass `false` to `options.fetch` to skip fetching.

       If toggling from server to client mode, all the pages are immediately
       refetched. If you have too many pages, you can pass `false` to
       `options.fetch` to skip fetching.

       @param {Object} [options]
       @param {boolean} [options.fetch] If `false`, no fetching is done.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this if `options.fetch` is `false`.
     */
    switchMode: function (options) {
      if (!(this.state.isClientMode = !this.state.isClientMode)) {
        this.off(null, null, this.fullCollection);
        // empty out the full collection to save memory
        this.fullCollection.reset();
      }

      if (options && this._definedAndNotNull(options.fetch) && !options.fetch) {
        return this;
      }

      return this.fetch(options);
    },

    /**
       Fetch the first page in server mode, or reset the current page of this
       collection to the first page in client mode.

       @param {Object} options {@link #getPage} options.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this.
     */
    getFirstPage: function (options) {
      return this.getPage(this.state.firstPage, options);
    },

    /**
       Fetch the previous page in server mode, or reset the current page of this
       collection to the previous page in client mode.

       @param {Object} options {@link #getPage} options.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this.
     */
    getPreviousPage: function (options) {
      return this.getPage(this.state.currentPage - 1, options);
    },

    /**
       Fetch the next page in server mode, or reset the current page of this
       collection to the next page in client mode.

       @param {Object} options {@link #getPage} options.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this.
     */
    getNextPage: function (options) {
      return this.getPage(this.state.currentPage + 1, options);
    },

    /**
       Fetch the last page in server mode, or reset the current page of this
       collection to the last page in client mode.

       @param {Object} options {@link #getPage} options.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this.
     */
    getLastPage: function (options) {
      return this.getPage(this.state.lastPage, options);
    },

    /**
       Given a page index, set #state.currentPage to that index. If this
       collection is in server mode, fetch the page using the updated state,
       otherwise, reset the current page of this collection to the page
       specified by `pageIndex` in client mode. If `options.fetch` is true, a
       fetch can be forced in client mode before resetting the current page.

       @param {number} index The page index to go to.
       @param {Object} [options] {@link #fetch} options.
       @param {boolean} [options.fetch=false] If true, force a {@link #fetch} in
       client mode.

       @throws {TypeError} If `index` is not a finite integer.
       @throws {RangeError} If `index` is out of bounds.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this.
     */
    getPage: function (index, options) {

      this._typeCheckInt(index, "index");

      if (index < this.state.firstPage || index > this.state.lastPage) {
        throw new RangeError("`index` must be firstPage <= index <= lastPage");
      }

      options = options || {fetch: false};
      var state = this.state = this._checkState(_.extend({}, this.state,
                                                         {currentPage: index}));

      if (state.isClientMode && !options.fetch) {
        var pageStart = (state.firstPage === 0 ?
                         state.currentPage :
                         state.currentPage - 1) * state.pageSize;
        var pageEnd = pageStart + state.perPage;
        return this.reset(this.fullCollection.toArray().slice(pageStart, pageEnd));
      }

      return this.fetch(_.omit(options, "fetch"));
    },

    /**
       Parse server response data.

       This default implementation assumes the response data is in one of two
       structures:

           [
            {}, // Your new pagination state
            [{}, ...] // An array of JSON objects
           ]

       Or,

           [{}] // An array of JSON objects

       The first structure is the preferred form because the pagination states
       may have been updated on the server side, sending them down again allows
       this collection to update its states. If the response has a pagination
       state object, it is checked for errors.

       The second structure is the
       [Backbone.Collection#parse](http://backbonejs.org/#Collection-parse)
       default.

       @param {Array} resp The deserialized response data from the server.
       @param {jQuery.jqXHR} xhr

       @throws {TypeError} If the `resp` is not an array.

       @return {Array.<Object>} An array of model objects
     */
    parse: function (resp, xhr) {

      if (!_.isArray(resp)) {
        return new TypeError("The server response must be an array");
      }

      if (resp.length === 2 && _.isObject(resp[0]) && _.isArray(resp[1])) {

        var newState = _.clone(this.state);
        var serverState = resp[0];

        _.each(_.pairs(_.omit(this.queryParams, "directions")), function (kvp) {
          var k = kvp[0], v = kvp[1];
          newState[k] = serverState[v];
        });

        if (this._definedAndNotNull(serverState.order)) {
          newState.order = _.invert(this.queryParams.directions)[serverState.order] * 1;
        }

        this.state = this._checkState(newState);

        return resp[1];
      }

      return resp;
    },

    /**
       Fetch a page from the server in server mode, or all the pages in client
       mode. The query string is constructed by translating the current
       pagination state to your server API query parameter using #queryParams.
       The current page will reset after fetch.

       @param {Object} [options] Accepts all
       [Backbone.Collection#fetch](http://backbonejs.org/#Collection-fetch)
       options.

       @return {jQuery.jqXHR}
     */
    fetch: function (options) {
      options = options || {};
      var data = options.data = options.data || {};
      var self = this;
      var state = this.state;

      this._checkState(state);

      var queryParams = state.isClientMode ?
        _.pick(this.queryParams, "sortKey", "order", "directions") :
        this.queryParams;

      _.each(_.pairs(_.omit(queryParams, "directions")), function (kvp) {
        var k = kvp[0], v = kvp[1];
        if (self._definedAndNotNull(state[k])) data[v] = state[k];
      });

      if (state.order) {
        data[queryParams.order] = queryParams.directions[state.order + ""];
      }
      else {
        delete data[queryParams.order];
      }

      var BBColProto = Backbone.Collection.prototype;

      if (state.isClientMode) {
        var success = options.success;
        options.success = function (col, resp, opts) {
          // make sure the caller's intent is obeyed
          opts.silent = options.silent;
          this.fullCollection.reset(col.models, opts);
          if (success) success(col, resp, opts);
        };
        // silent the first reset from backbone
        return BBColProto.fetch.call(this, _.extend({}, options, {silent: true}));
      }

      return BBColProto.fetch.call(this, options);
    },

    /**
       Convenient method for setting a `comparator` sorted by a model attribute
       identified by `sortKey` and ordered by `order`, to this pageable
       collection for sorting on the client-side.

       Like a Backbone.Collection, a Backbone.PageableCollection will maintain
       the __current page__ in sorted order on the client side if a `comparator`
       is attached to it, which this method will do. If the collection is in
       client mode, you can attach a comparator to #fullCollection to have all
       the pages reflect the global sorting order by specifying an option `full`
       to `true`. You __must__ call `sort` manually or #fullCollection.sort if
       you've specified `option.full = true` after calling this method to force
       a resort.

       While you can use this method to sort the current page in server mode,
       the sorting order may not reflect the global sorting order due to the
       additions or removals of the records on the server since the last
       fetch. If you want the most updated page in a global sorting order, it is
       recommended that you set #state.sortKey and optionally #state.order, and
       then call #fetch.

       @param {string} [sortKey=this.state.sortKey] See `state.sortKey`.
       @param {number} [order=this.state.order] See `state.order`.
       @param {Object} [options]
       @param {boolean} [options.full] If `true`, set the comparator on
       fullCollection instead of just the parent pageable collection.

       See [Backbone.Collection.comparator](http://backbonejs.org/#Collection-comparator).
     */
    setComparator: function (sortKey, order, options) {
      sortKey = _.isUndefined(sortKey) ? this.state.sortKey : sortKey;
      order = _.isUndefined(order) ? this.state.order : order;
      options = options || {};

      this.state.sortKey = sortKey;
      this.state.order = order;

      if (!sortKey || !order) return this;

      var comparator = function (left, right) {
        var l = left.get(sortKey), r = right.get(sortKey), t;
        if (order === 1) t = l, l = r, r = t;
        if (l === r) return 0;
        else if (l < r) return -1;
        return 1;
      };

      if (this.state.isClientMode && options.full) {
        this.fullCollection.comparator = comparator;
      }
      else {
        this.comparator = comparator;
      }

      return this;
    }

  });

  return PageableCollection;

}));