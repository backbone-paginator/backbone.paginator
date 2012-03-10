// Backbone.Paginator v0.13
//
// Copyright (C)2011 Addy Osmani
// Distributed under MIT License
//
Backbone.Paginator = (function (Backbone, _, $) {

	var Paginator = {};
	Paginator.version = "0.13";


	// @name: clientPager
	//
	// @tagline: Paginator for client-side data
	// @description:
	// The paginator is responsible for providing pagination
	// and sort capabilities for a collection of data that has
	// already been returned by a server. You may wish to use
	// the client-side paginator for single data payloads 
	// e.g return 500 results, allow this data to be paginated
	// on the client-side
	// @dependencies:
	// Requires a queryParams object to be supplied for URL
	// parameters. See tagsClient.js for a usage example.
	Paginator.clientPager = Backbone.Collection.extend({

		sync: function (method, model, options) {

			var queryMap = {
				$top: this.queryParams.perPage,
				$skip: this.queryParams.page * this.queryParams.perPage,
				orderBy: this.queryParams.sortField,
				$inlinecount: this.queryParams.customParam1,
				$filter: "substringof%28%27" + this.queryParams.query + "%27,%20Name%29%20eq%20true",
				$format: this.queryParams.format,
				$callback: this.queryParams.customParam2
			};


			var params = _.extend({
				type: 'GET',
				dataType: 'jsonp',
				jsonpCallback: 'callback',
				data: decodeURIComponent($.param(queryMap)),
				url: this.url,
				processData: false
			}, options);


			return $.ajax(params);
		},

		nextPage: function () {
			this.queryParams.page = ++this.queryParams.page;
			this.pager();
		},

		previousPage: function () {
			this.queryParams.page = --this.queryParams.page || 1;
			this.pager();
		},

		goTo: function (page) {
			this.queryParams.page = parseInt(page, 10);
			this.pager();
		},

		howManyPer: function (perPage) {
			this.queryParams.page = 1;
			this.queryParams.perPage = perPage;
			this.pager();
		},


		// where column is the key to sort on
		setSort: function (column, direction) {
			this.pager(column, direction);
		},

		pager: function (sort, direction) {
			var self = this,
				start = (self.queryParams.page - 1) * this.queryParams.displayPerPage;
				stop = start + this.queryParams.displayPerPage;

			if (self.orgmodels === undefined) {
				self.orgmodels = self.models;
			}

			self.models = self.orgmodels;

			if (sort) {
				self.models = self._sort(self.models, sort, direction);
			}

			self.reset(
			self.models.slice(start, stop));
		},

		_sort: function (models, sort, direction) {
			models = models.sort(function (a, b) {
				var a = a.get(sort),
					b = b.get(sort);

				if (direction === 'desc') {
					if (a > b) {
						return -1;
					}

					if (a < b) {
						return 1;
					}
				} else {
					if (a < b) {
						return -1;
					}

					if (a > b) {
						return 1;
					}
				}

				return 0;
			});

			return models;
		},

		info: function () {
			var self = this,
				info = {},
				totalRecords = (self.orgmodels) ? self.orgmodels.length : self.length,
				totalPages = Math.ceil(totalRecords / self.perPage);

			info = {
				totalRecords: totalRecords,
				page: self.queryParams.page,
				perPage: this.queryParams.displayPerPage,
				totalPages: totalPages,
				lastPage: totalPages,
				lastPagem1: totalPages - 1,
				previous: false,
				next: false,
				page_set: [],
				startRecord: (self.queryParams.page - 1) * this.queryParams.displayPerPage + 1,
				endRecord: Math.min(totalRecords, self.queryParams.page * this.queryParams.displayPerPage)
			};

			if (self.page > 1) {
				info.prev = self.queryParams.page - 1;
			}

			if (self.page < info.totalPages) {
				info.next = self.queryParams.page + 1;
			}

			info.pageSet = self.setPagination(info);

			self.information = info;
			return info;
		},


		setPagination: function (info) {
			var pages = [];


			// How many adjacent pages should be shown on each side?
			var ADJACENT = 3;
			var ADJACENTx2 = ADJACENT * 2;
			var LASTPAGE = Math.ceil(info.totalRecords / info.perPage);
			var LPM1 = -1;

			if (LASTPAGE > 1) {
				// not enough pages to bother breaking it up
				if (LASTPAGE < (7 + ADJACENTx2)) {
					for (var i = 1, l = LASTPAGE; i <= l; i++) {
						pages.push(i);
					}
				}
				// enough pages to hide some
				else if (LASTPAGE > (5 + ADJACENTx2)) {

					//close to beginning; only hide later pages
					if (info.page < (1 + ADJACENTx2)) {
						for (var i = 1, l = 4 + ADJACENTx2; i < l; i++) {
							pages.push(i);
						}
					}

					// in middle; hide some front and some back
					else if (LASTPAGE - ADJACENTx2 > info.page && info.page > ADJACENTx2) {
						for (var i = info.page - ADJACENT; i <= info.page + ADJACENT; i++) {
							pages.push(i);
						}
					}
					// close to end; only hide early pages
					else {
						for (var i = LASTPAGE - (2 + ADJACENTx2); i <= LASTPAGE; i++) {
							pages.push(i);
						}
					}
				}
			}

			return pages;
		}

	});


	// @name: serverPager
	//
	// Paginator for server-side data
	//
	// @description:
	// The paginator is responsible for providing pagination
	// and sort capabilities for requests to a server-side
	// data service.
	// @dependencies:
	// Requires a queryParams object to be supplied for URL
	// parameters. See tagsServer.js for a usage example.
	Paginator.serverPager = Backbone.Collection.extend({

		sync: function (method, model, options) {


			// A map (queryMap) object contains name mappings for parameters you'll be passing back
			// to the server. In the case of this example, we're using NetFlix OData
			// which uses $top, $skip etc. to define what paginated data should be
			// returned from their service. If you had your own data service of the form
			// http://domain.com/api/?query=houses&page=2&sortBy=year, your queryMap
			// would just contain
			// query: mixins.Paginator.query
			// page: mixins.Paginator.page
			// sortBy: mixins.Paginator.sortField
			// The map can contain not just direct references
			// to values in the queryParams object but can also contain mutated values
			// such as $skip, which is composed by multipying the current page by the 
			// number of items per page. You can also choose to mix values from the 
			// queryParams object with custom string information (see $filter) so this
			// is fairly flexible.
			var queryMap = {
				$top: this.queryParams.perPage,
				$skip: this.queryParams.page * this.queryParams.perPage,
				orderBy: this.queryParams.sortField,
				$inlinecount: this.queryParams.customParam1,
				$filter: "substringof%28%27" + this.queryParams.query + "%27,%20Name%29%20eq%20true",
				$format: this.queryParams.format,
				$callback: this.queryParams.customParam2
			};

			var params = _.extend({
				type: 'GET',
				dataType: 'jsonp',
				jsonpCallback: 'callback',
				data: decodeURIComponent($.param(queryMap)),
				url: this.url,
				processData: false
			}, options);

			return $.ajax(params);
		},


		requestNextPage: function () {
			if (this.queryParams.page >= 0) {
				this.queryParams.page += 1;
				// customize as needed. For the Netflix API, skipping ahead based on
				// page * number of results per page was necessary. You may have a
				// simpler server-side pagination API where just updating 
				// mixins.serverPaginator.queryParams.page is all you need to do.
				// This applies similarly to requestPreviousPage()
				this.queryMap.$skip = this.queryParams.page * this.queryParams.perPage;
				this.pager();
			}
		},

		requestPreviousPage: function () {
			if (this.queryParams.page >= 0) {
				this.queryParams.page -= 1;
				// customize as needed.
				this.queryMap.$skip = this.queryParams.page * this.queryParams.perPage;
				this.pager();
			}
		},

		updateOrder: function (column) {
			if (column) {
				this.queryParams.sortField = column;
				this.queryMap.orderBy = column;
				this.pager();
			}

		},

		goTo: function (page) {
			this.queryParams.page = parseInt(page, 10);
			this.pager();
		},

		howManyPer: function (count) {
			this.queryParams.page = 1;
			this.queryParams.perPage = count;
			this.pager();
		},

		sort: function () {

		},

		info: function () {
			var info = {
				page: this.queryParams.page,
				totalPages: this.queryParams.totalPages,
				lastPage: this.queryParams.totalPages
			};

			this.information = info;
			return info;
		},

		// fetches the latest results from the server, taking the most recent
		// queryParams into account
		pager: function () {
			this.fetch({});
		}


	});

	return Paginator;

})(Backbone, _, $);