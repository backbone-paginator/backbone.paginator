/*
  backbone-pageable
  http://github.com/wyuenho/backbone-pageable

  Copyright (c) 2012 Jimmy Yuen Ho Wong
  Licensed under the MIT @license.
*/

(function (factory) {

  // CommonJS
  if (typeof exports == "object") {
    module.exports = factory(require("underscore"), require("backbone"));
  }
  // AMD
  else if (typeof define == "function" && define.amd) {
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

  function finiteInt (val, name) {
    val *= 1;
    if (!_.isNumber(val) || _.isNaN(val) || !_.isFinite(val) || ~~val !== val) {
      throw new TypeError("`" + name + "` must be a finite integer");
    }
    return val;
  }

  // Quickly reset a collection by temporarily detaching the comparator of the
  // given collection, reset and then attach the comparator back to the
  // collection and sort.

  // @param {Backbone.Collection} collection
  // @param {...*} resetArgs
  // @return {Backbone.Collection} collection The same collection instance after
  // reset.
  function resetQuickly () {

    var collection = arguments[0];
    var resetArgs = _.toArray(arguments).slice(1);

    var comparator = collection.comparator;
    collection.comparator = null;

    try {
      collection.reset.apply(collection, resetArgs);
    }
    finally {
      collection.comparator = comparator;
      if (comparator) collection.sort();
    }

    return collection;
  }

  var PARAM_TRIM_RE = /[\s'"]/g;
  var URL_TRIM_RE = /[<>\s'"]/g;

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

       @property {number} [state.lastPage=null] The last page index. This value
       is __read only__ and it's calculated based on whether `firstPage` is 0 or
       1, during bootstrapping, fetching and resetting. Please don't change this
       value under any circumstances.

       @property {number} [state.currentPage=null] The current page index. You
       should only override this value during extension, initialization or reset
       by the server after fetching. This value should be read only at other
       times. Can be a 0-based or 1-based index, depending on whether
       `firstPage` is 0 or 1. If left as default, it will be set to `firstPage`
       on initialization.

       @property {number} [state.pageSize=25] How many records to show per
       page. This value is __read only__ after initialization, if you want to
       change the page size after initialization, you must call #setPageSize.

       @property {number} [state.totalPages=null] How many pages there are. This
       value is __read only__ and it is calculated from `totalRecords`.

       @property {number} [state.totalRecords=null] How many records there
       are. This value is __required__ under server mode. This value is optional
       for client mode as the number will be the same as the number of models
       during bootstrapping and during fetching, either supplied by the server
       in the metadata, or calculated from the size of the response.

       @property {string} [state.sortKey=null] The model attribute to use for
       sorting.

       @property {-1|0|1} [state.order=-1] The order to use for sorting. Specify
       -1 for ascending order or 1 for descending order. If 0, no client side
       sorting will be done and the order query parameter will not be sent to
       the server during a fetch.
    */
    state: {
      firstPage: 1,
      lastPage: null,
      currentPage: null,
      pageSize: 25,
      totalPages: null,
      totalRecords: null,
      sortKey: null,
      order: -1
    },

    /**
       @property {"server"|"client"|"infinite"} [mode="server"] The mode of
       operations for this collection. `"server"` paginates on the server-side,
       `"client"` paginates on the client-side and `"infinite"` paginates on the
       server-side for APIs that do not support `totalRecords`.
    */
    mode: "server",

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
       @property {string} [queryParams.directions={"-1": "asc", "1": "desc"}] A
       map for translating a Backbone.PageableCollection#state.order constant to
       the ones your server API accepts.
    */
    queryParams: {
      currentPage: "page",
      pageSize: "per_page",
      totalPages: "total_pages",
      totalRecords: "total_entries",
      sortKey: "sort_by",
      order: "order",
      directions: {
        "-1": "asc",
        "1": "desc"
      }
    },

    /**
       __INFINITE MODE ONLY__

       This property is only available under infinite paging mode to record link
       information. This object is also __read only__.

       @readonly

       @property {Object} [links]
       @property {string} [links.first]
       @property {string} [links.prev]
       @property {string} [links.next]
       @property {string} [links.last]
    */

    /**
       __CLIENT MODE ONLY__

       This collection is the internal storage for the bootstrapped or fetched
       models. You can use this if you want to operate on all the pages.

       @property {Backbone.Collection} fullCollection
    */

    /**
       Given a list of models or model attributues, bootstrap the full
       collection in client mode, or just the page you want in server mode. If
       you want to initialize this collection to a different state than the
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

       @param {boolean} [options.full] If `true`, and if #this.mode == "client" is
       `true, and either a `options.comparator` or `sortKey` is defined, the
       comparator is attached to the full collection instead of just the parent
       collection containing the current page.

       @param {Object} [options.state] The state attributes overriding the defaults.

       @param {string} [options.state.sortKey] The model attribute to use for
       sorting. If specified instead of `options.comparator`, a comparator will
       be automatically created using this value, and optionally a sorting order
       specified in `options.state.order`. The comparator is then attached to
       the new collection instance.

       @param {-1|1} [options.state.order] The order to use for sorting. Specify
       -1 for ascending order and 1 for descending order.

       @param {Object} [options.queryParam]
    */
    initialize: function (models, options) {

      options = options || {};

      var mode = this.mode = options.mode || this.mode || PageableProto.mode;

      var queryParams = _.extend({}, PageableProto.queryParams, this.queryParams,
                                 options.queryParams || {});

      queryParams.directions = _.extend({},
                                        PageableProto.queryParams.directions,
                                        this.queryParams.directions,
                                        queryParams.directions || {});

      this.queryParams = queryParams;

      var state = this.state = _.extend({}, PageableProto.state, this.state,
                                        options.state || {});

      state.currentPage = state.currentPage == null ?
        state.firstPage :
        state.currentPage;

      this.switchMode(mode, _.extend({fetch: false, resetState: false, models: models}, options));
      
      var comparator = options.comparator;

      if (mode == "client") {

        if (state.totalRecords == null && !_.isEmpty(models)) {
          state.totalRecords = models.length;
        }

        this.state = this._checkState(state);

        if (state.sortKey && !comparator) {
          comparator = this.makeComparator(state.sortKey, state.order, options);
        }
      }
      else this.state = this._checkState(state);

      if (mode != "server") {

        if (comparator) {
          if (options.full) {
            delete this.comparator;
            var fullCollection = this.fullCollection;
            fullCollection.comparator = comparator;
            fullCollection.sort();
          }
          else this.comparator = comparator;
        }

        // make sure the models in the current page and full collection have the
        // same references
        if (models && !_.isEmpty(models)) {
          this.getPage(state.currentPage);
          models.splice.apply(models, [0, models.length].concat(this.models));
        }
      }

      this._initState = _.clone(this.state);
    },

    /**
       Makes a Backbone.Collection that contains all the pages.

       @private
       @param {Array.<Object|Backbone.Model>} models
       @param {Object} options Options for Backbone.Collection constructor.
       @return {Backbone.Collection}
    */
    _makeFullCollection: function (models, options) {

      var properties = ["url", "model", "sync", "comparator"];
      var thisProto = this.constructor.prototype;
      var i, length, prop;

      var proto = {};
      for (i = 0, length = properties.length; i < length; i++) {
        prop = properties[i];
        if (!_.isUndefined(thisProto[prop])) {
          proto[prop] = thisProto[prop];
        }
      }

      var fullCollection = new (Backbone.Collection.extend(proto))(models, options);

      for (i = 0, length = properties.length; i < length; i++) {
        prop = properties[i];
        if (this[prop] !== thisProto[prop]) {
          fullCollection[prop] = prop;
        }
      }

      return fullCollection;
    },

    /**
       Factory method that returns a Backbone event handler that responses to
       the `all` event. The returned event handler will synchronize the current
       page collection and the full collection's models.

       @private

       @param {Backbone.PageableCollection} pageCol
       @param {Backbone.Collection} fullCol

       @return {function(string, Backbone.Model, Backbone.Collection, Object)}
       Collection event handler
    */
    _makeCollectionEventHandler: function (pageCol, fullCol) {

      return function collectionEventHandler (event, model, collection, options) {

        pageCol.off("all", collectionEventHandler);
        fullCol.off("all", collectionEventHandler);

        var state = _.clone(pageCol.state);
        var firstPage = state.firstPage;
        var currentPage = firstPage === 0 ?
          state.currentPage :
          state.currentPage - 1;
        var pageSize = state.pageSize;
        var pageStart = currentPage * pageSize, pageEnd = pageStart + pageSize;

        if (event == "add") {

          var fullIndex, addAt, colToAdd;

          if (collection == fullCol) {

            fullIndex = fullCol.indexOf(model);

            if (fullIndex >= pageStart && fullIndex < pageEnd) {
              colToAdd = pageCol;
              addAt = fullIndex - pageStart;
            }

          }
          else {
            fullIndex = pageStart + pageCol.indexOf(model);
            colToAdd = fullCol;
            var at = options && options.at || fullIndex;
            addAt = (at < pageStart || at >= pageEnd) ? at : fullIndex;
          }

          if (colToAdd) {
            colToAdd.add(model, _.extend({}, options || {}, {at: addAt}));
            pageCol.pop();
          }

          state.totalRecords++;
        }

        // remove the model from the other collection as well
        if (event == "remove") {

          var nextModel;

          if (collection == pageCol) {
            nextModel = fullCol.at(pageEnd);
            if (nextModel) pageCol.push(nextModel);
            fullCol.remove(model);
          }
          else if (options.index >= pageStart && options.index < pageEnd) {
            pageCol.remove(model);
            nextModel = fullCol.at(currentPage * (pageSize + options.index));
            if (nextModel) pageCol.push(nextModel);
          }

          // decrement totalRecords and update totalPages and lastPage
          if (!--state.totalRecords) {
            state.totalRecords = null;
            state.totalPages = null;
          }
          else {
            var totalPages = state.totalPages = Math.ceil(state.totalRecords / pageSize);
            state.lastPage = firstPage === 0 ? totalPages - 1 : totalPages;
            if (state.currentPage > totalPages) state.currentPage = state.lastPage;
          }
        }

        if (event == "reset" || event == "sort") {
          options = collection;
          collection = model;

          if (collection == pageCol && event == "reset") {
            var head = fullCol.models.slice(0, pageStart);
            var tail = fullCol.models.slice(pageStart + pageCol.models.length);
            resetQuickly(fullCol, head.concat(pageCol.models).concat(tail));
            options = _.extend(options, {silent: true});
          }

          if (event == "reset" || collection == fullCol) {
            resetQuickly(pageCol, fullCol.models.slice(pageStart, pageEnd),
                         options);
            state.totalRecords = fullCol.models.length;
          }
        }

        pageCol.state = pageCol._checkState(state);

        pageCol.on("all", collectionEventHandler);
        fullCol.on("all", collectionEventHandler);

      };
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

      var totalRecords = state.totalRecords;
      var pageSize = state.pageSize;
      var currentPage = state.currentPage;
      var firstPage = state.firstPage;
      var totalPages = state.totalPages;

      if (totalRecords != null && pageSize != null && currentPage != null &&
          firstPage != null) {

        totalRecords = finiteInt(totalRecords, "totalRecords");
        pageSize = finiteInt(pageSize, "pageSize");
        currentPage = finiteInt(currentPage, "currentPage");
        firstPage = finiteInt(firstPage, "firstPage");

        if (pageSize < 1) {
          throw new RangeError("`pageSize` must be >= 1");
        }

        totalPages = state.totalPages = Math.ceil(totalRecords / pageSize);

        if (firstPage === 0) {
          if (currentPage < firstPage || currentPage >= totalPages) {
            throw new RangeError("`currentPage` must be firstPage <= currentPage < totalPages if 0-based.");
          }
        }
        else if (firstPage === 1) {
          if (currentPage < firstPage || currentPage > totalPages) {
            throw new RangeError("`currentPage` must be firstPage <= currentPage <= totalPages if 1-based.");
          }
        }
        else {
          throw new RangeError("`firstPage must be 0 or 1`");
        }

        state.lastPage = firstPage === 0 ? totalPages - 1 : totalPages;
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
       @throws {RangeError} If `pageSize` is less than 1.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this.
    */
    setPageSize: function (pageSize, options) {

      pageSize = finiteInt(pageSize, "pageSize");

      options = options || {};

      this.state = this._checkState(_.extend({}, this.state, {
        pageSize: pageSize,
        totalPages: this.mode == "client" ?
          Math.ceil(this.fullCollection.size() / pageSize) :
          Math.ceil(this.state.totalRecords / pageSize)
      }));

      return this.getPage(this.state.currentPage, options);
    },

    /**
       Switching between client, server and infinite mode.

       If switching from client to server mode, the #fullCollection is emptied
       first and then deleted and a fetch is immediately issued for the current
       page from the server. Pass `false` to `options.fetch` to skip fetching.

       If switching to infinite mode, #links.first will be set to the the #url
       of this collection.

       If switching from server to client mode, all of the pages are immediately
       refetched. If you have too many pages, you can pass `false` to
       `options.fetch` to skip fetching.

       If switching to any mode from infinite mode, the #links will be deleted.

       @param {"server"|"client"|"infinite"} [mode] The mode to switch to.

       @param {Object} [options]

       @param {boolean} [options.fetch=true] If `false`, no fetching is done.

       @param {boolean} [options.resetState=true] If 'false', the state is not
       reset, but checked for sanity instead.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this if `options.fetch` is `false`.
    */
    switchMode: function (mode, options) {

      if (!_.contains(["server", "client", "infinite"], mode)) {
        throw new TypeError('`mode` must be one of "server", "client" or "infinite"');
      }

      options = options || {fetch: true, resetState: true};

      this.state = options.resetState ?
        _.clone(this._initState) :
        this._checkState(_.extend({}, this.state));

      this.mode = mode;

      var fullCollection = this.fullCollection, eh = this._eh;

      if (mode != "server" && !fullCollection) {
        fullCollection = this.fullCollection = this._makeFullCollection(options.models || []);
        eh = this._eh = this._makeCollectionEventHandler(this, fullCollection);
        fullCollection.on("all", eh);
        this.on("all", eh);
        fullCollection.comparator = this._fullComparator;
      }
      else if (mode == "server" && fullCollection) {
        fullCollection.off("all", eh);
        this.off("all", eh);
        this._fullComparator = fullCollection.comparator;
        delete this.fullCollection;
      }

      if (mode == "infinite") {
        var url = this.url;
        this.links = {first: url, current: url};
        this.links[this.state.currentPage] = url;
      }
      else if (this.links) delete this.links;

      return options.fetch ?
        this.fetch(_.omit(options, ["fetch", "resetState"])) :
        this;
    },

    /**
       Fetch the first page in server mode, or reset the current page of this
       collection to the first page in client or infinite mode.

       @param {Object} options {@link #getPage} options.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this.
    */
    getFirstPage: function (options) {
      return this.getPage("first", options);
    },

    /**
       Fetch the previous page in server mode, or reset the current page of this
       collection to the previous page in client or infinite mode.

       @param {Object} options {@link #getPage} options.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this.
    */
    getPreviousPage: function (options) {
      return this.getPage("prev", options);
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
      return this.getPage("next", options);
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
      return this.getPage("last", options);
    },

    /**
       Given a page index, set #state.currentPage to that index. If this
       collection is in server mode, fetch the page using the updated state,
       otherwise, reset the current page of this collection to the page
       specified by `index` in client mode. If `options.fetch` is true, a fetch
       can be forced in client mode before resetting the current page. Under
       infinite mode, if the index is less than the current page, a reset is
       done as in client mode. If the index is greater than the current page
       number, a fetch is made from #fullCollection using the same URL and the
       results are appended to #fullCollection instead of replaced. The current
       page will then be reset after fetching.

       @param {number|string} index The page index to go to, or the page name to
       look up from #links in infinite mode.
       @param {Object} [options] {@link #fetch} options or
       [reset](http://backbonejs.org/#Collection-reset) options for client mode
       when `options.fetch` is `false`.
       @param {boolean} [options.fetch=false] If true, force a {@link #fetch} in
       client mode.

       @throws {TypeError} If `index` is not a finite integer under server or
       client mode, or does not yield a URL from #links under infinite mode.

       @throws {RangeError} If `index` is out of bounds.

       @chainable
       @return {jQuery.jqXHR|Backbone.PageableCollection} The jqXHR from fetch
       or this.
    */
    getPage: function (index, options) {

      options = options || {fetch: false};

      var state = this.state,
      firstPage = state.firstPage,
      currentPage = state.currentPage,
      lastPage = state.lastPage,
      pageSize = state.pageSize;

      var pageNum = index;
      switch (index) {
        case "first": pageNum = firstPage; break;
        case "prev": pageNum = currentPage - 1; break;
        case "next": pageNum = currentPage + 1; break;
        case "last": pageNum = lastPage; break;
        default: pageNum = finiteInt(index, "index");
      }

      this.state = this._checkState(_.extend({}, state, {currentPage: pageNum}));

      var mode = this.mode;

      var reset = (mode == "client" ||
                   (mode == "infinite" && pageNum <= currentPage &&
                    this.fullCollection.length)) &&
        !options.fetch;

      if (reset) {
        var pageStart = (firstPage === 0 ? pageNum : pageNum - 1) * pageSize;
        var pageEnd = pageStart + pageSize;
        return this.reset(this.fullCollection.models.slice(pageStart, pageEnd),
                          _.omit(options, "fetch"));
      }

      if (mode == "infinite") {
        var links = this.links;

        if (!links[index]) throw new TypeError("No link found for '" + index + "'");

        var url = links.current = links[pageNum] = links[index];
        if (options.fetch) options.url = url;

        var fullCollection = this.fullCollection;
        var self = this;
        return this.fetch(_.extend({url: url,
                                    add: true,
                                    update: true,
                                    remove: false,
                                    at: fullCollection.length},
                                   _.omit(options, "fetch"))).
          done(function (resp, status, xhr) {
            _.extend(self.links, self.parseLinks(resp, {xhr: xhr}));
            return self.reset(fullCollection.models.slice(pageStart, pageEnd));
          });
      }

      return this.fetch(_.omit(options, "fetch"));
    },

    /**
       Parse pagination links from the server response. Only valid under
       infinite mode.

       Given a response body and a jqXHR object, extract pagination links from
       them for infinite paging. This default implementation parses the RFC 5988
       `Link` header and extract 4 links from it - `first`, `prev`, `next`,
       `last`. If a `previous` link is found, it is will be found in the `prev`
       key in the returned object hash. Any subclasses overriding this method
       __must__ return an object hash with the above keys. Any keys missing will
       result in a failure to traverse to that page. An empty object hash must
       be returned if there are no links found.

       @param {*} resp The deserialized response body.
       @param {jQuery.jqXHR} xhr The jqXHR object for this response.
       @return {Object}
    */
    parseLinks: function (resp, options) {
      var linkHeader = options.xhr.getResponseHeader("Link");
      var relations = ["first", "prev", "previous", "next", "last"];
      var links = {};
      _.each(linkHeader.split(","), function (linkValue) {
        var linkParts = linkValue.split(";");
        var url = linkParts[0].replace(URL_TRIM_RE, '');
        var params = linkParts.slice(1);
        _.each(params, function (param) {
          var paramParts = param.split("=");
          var key = paramParts[0].replace(PARAM_TRIM_RE, '');
          var value = paramParts[1].replace(PARAM_TRIM_RE, '');
          if (key == "rel" && _.contains(relations, value)) {
            if (value == "previous") links.prev = url;
            else links[value] = url;
          }
        });
      });
      return links;
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

       @throws {TypeError} If the `resp` is not an array.

       @return {Array.<Object>} An array of model objects
    */
    parse: function (resp) {

      if (!_.isArray(resp)) {
        return new TypeError("The server response must be an array");
      }

      if (resp.length === 2 && _.isObject(resp[0]) && _.isArray(resp[1])) {

        var queryParams = this.queryParams;
        var newState = _.clone(this.state);
        var serverState = resp[0];

        _.each(_.pairs(_.omit(queryParams, "directions")), function (kvp) {
          var k = kvp[0], v = kvp[1];
          newState[k] = serverState[v];
        });

        if (serverState.order) {
          newState.order = _.invert(queryParams.directions)[serverState.order] * 1;
        }

        this.state = this._checkState(newState);

        return resp[1];
      }

      return resp;
    },

    /**
       Fetch a page from the server in server mode, or all the pages in client
       mode. Under infinite mode, the current page is refetched by default and
       then reset.

       The query string is constructed by translating the current pagination
       state to your server API query parameter using #queryParams.  The current
       page will reset after fetch.

       @param {Object} [options] Accepts all
       [Backbone.Collection#fetch](http://backbonejs.org/#Collection-fetch)
       options.

       @return {jQuery.jqXHR}
    */
    fetch: function (options) {

      options = options || {};

      var data = options.data = options.data || {};

      var mode = this.mode;

      if (mode == "infinite" && !options.url) {
        return this.getPage(this.state.currentPage, {fetch: true});
      }

      var state = this._checkState(this.state);

      // map params except directions
      var queryParams = this.mode == "client" ?
        _.pick(this.queryParams, "sortKey", "order") :
        _.omit(_.pick(this.queryParams, _.keys(PageableProto.queryParams)),
               "directions");

      var i, kvp, k, v, kvps = _.pairs(queryParams), thisCopy = _.clone(this);
      for (i = 0; i < kvps.length; i++) {
        kvp = kvps[i], k = kvp[0], v = kvp[1];
        v = _.isFunction(v) ? v.call(thisCopy) : v;
        if (state[k] != null && v != null) {
          data[v] = state[k];
        }
      }

      // fix up sorting parameters
      if (state.sortKey && state.order) {
        data[queryParams.order] = this.queryParams.directions[state.order + ""];
      }
      else if (!state.sortKey) delete data[queryParams.order];

      // map extra query parameters
      var extraKvps = _.pairs(_.omit(this.queryParams,
                                     _.keys(PageableProto.queryParams)));
      for (i = 0; i < extraKvps.length; i++) {
        kvp = extraKvps[i];
        v = kvp[1];
        v = _.isFunction(v) ? v.call(thisCopy) : v;
        data[kvp[0]] = v;
      }

      var fullCollection = this.fullCollection;
      var BBColProto = Backbone.Collection.prototype;
      if (mode == "client") {
        var success = options.success;
        options.success = function (col, resp, opts) {
          // make sure the caller's intent is obeyed
          opts = opts || {};
          opts.silent = options.silent;
          fullCollection.reset(col.models, opts);
          if (success) success(col, resp, opts);
        };
        // silent the first reset from backbone
        return BBColProto.fetch.call(this, _.extend({}, options, {silent: true}));
      }

      return BBColProto.fetch.call(this, options);
    },

    /**
       Convenient method for making a `comparator` sorted by a model attribute
       identified by `sortKey` and ordered by `order`.

       Like a Backbone.Collection, a Backbone.PageableCollection will maintain
       the __current page__ in sorted order on the client side if a `comparator`
       is attached to it. If the collection is in client mode, you can attach a
       comparator to #fullCollection to have all the pages reflect the global
       sorting order by specifying an option `full` to `true`. You __must__ call
       `sort` manually or #fullCollection.sort after calling this method to
       force a resort.

       While you can use this method to sort the current page in server mode,
       the sorting order may not reflect the global sorting order due to the
       additions or removals of the records on the server since the last
       fetch. If you want the most updated page in a global sorting order, it is
       recommended that you set #state.sortKey and optionally #state.order, and
       then call #fetch.

       @param {string} [sortKey=this.state.sortKey] See `state.sortKey`.
       @param {number} [order=this.state.order] See `state.order`.

       See [Backbone.Collection.comparator](http://backbonejs.org/#Collection-comparator).
    */
    makeComparator: function (sortKey, order) {
      sortKey = sortKey == null ? this.state.sortKey : sortKey;
      order = order == null ? this.state.order : order;

      if (!sortKey || !order) return;

      var comparator = function (left, right) {
        var l = left.get(sortKey), r = right.get(sortKey), t;
        if (order === 1) t = l, l = r, r = t;
        if (l === r) return 0;
        else if (l < r) return -1;
        return 1;
      };

      return comparator;
    }

  });

  var PageableProto = PageableCollection.prototype;

  return PageableCollection;

}));
