// Backbone.Paginator v0.15
//
// Copyright (C) 2012 Addy Osmani
// Distributed under MIT License
//
Backbone.Paginator = (function (Backbone, _, $) {

	var Paginator = {};
	Paginator.version = "0.15";

	// @name: clientPager
	//
	// @tagline: Paginator for client-side data
	//
	// @description:
	// The paginator is responsible for providing pagination
	// and sort capabilities for a collection of data that has
	// already been returned by a server. You may wish to use
	// the client-side paginator for single data payloads 
	// e.g return 500 results, allow this data to be paginated
	// on the client-side
	//
	Paginator.clientPager = Backbone.Collection.extend({

		sync: function (method, model, options) {

			var queryMap = {};
				queryMap[this.perPageAttribute] =  this.perPage;
				queryMap[this.skipAttribute] = this.page * this.perPage;
				queryMap[this.orderAttribute] =  this.sortField;
				queryMap[this.customAttribute1] =  this.customParam1;
				queryMap[this.formatAttribute] =  this.format;
				queryMap[this.customAttribute2] = this.customParam2;
				queryMap[this.queryAttribute] =  this.query; 

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
			this.page = this.page++;
			this.pager();
		},

		previousPage: function () {
			this.page = --this.page || 1;
			this.pager();
		},

		goTo: function (page) {
			this.page = parseInt(page, 10);
			this.pager();
		},

		howManyPer: function (perPage) {
			this.displayPerPage = perPage;
			this.pager();
		},


		// where column is the key to sort on
		setSort: function (column, direction) {
			this.pager(column, direction);
		},

		pager: function (sort, direction) {
			var self = this,
				start = (self.page - 1) * this.displayPerPage;
				stop = start + this.displayPerPage;

			if (self.origModels === undefined) {
				self.origModels = self.models;
			}

			self.models = self.origModels;

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
				totalRecords = (self.origModels) ? self.origModels.length : self.length,
				totalPages = Math.ceil(totalRecords / self.perPage);

			info = {
				totalRecords: totalRecords,
				page: self.page,
				perPage: this.displayPerPage,
				totalPages: totalPages,
				lastPage: totalPages,
				lastPagem1: totalPages - 1,
				previous: false,
				next: false,
				page_set: [],
				startRecord: (self.page - 1) * this.displayPerPage + 1,
				endRecord: Math.min(totalRecords, self.page * this.displayPerPage)
			};

			if (self.page > 1) {
				info.prev = self.page - 1;
			}

			if (self.page < info.totalPages) {
				info.next = self.page + 1;
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


	// @name: requestPager
	//
	// Paginator for server-side data being requested from a backend/API
	//
	// @description:
	// The paginator is responsible for providing pagination
	// and sort capabilities for requests to a server-side
	// data service.
	//
	Paginator.requestPager = Backbone.Collection.extend({

		sync: function (method, model, options) {

			var queryMap = {};
				queryMap[this.perPageAttribute] =  this.perPage;
				queryMap[this.skipAttribute] = this.page * this.perPage;
				queryMap[this.orderAttribute] =  this.sortField;
				queryMap[this.customAttribute1] =  this.customParam1;
				queryMap[this.formatAttribute] =  this.format;
				queryMap[this.customAttribute2] = this.customParam2;
				queryMap[this.queryAttribute] =  this.query;

				/*
			var queryMap = {
				$top: this.perPage,
				$skip: this.page * this.perPage,
				orderBy: this.sortField,
				$inlinecount: this.customParam1,
				$filter: "substringof%28%27" + this.query + "%27,%20Name%29%20eq%20true",
				$format: this.format,
				$callback: this.customParam2
			};*/

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
			if (this.page >= 0) {
				this.page += 1;
				// customize as needed. For the Netflix API, skipping ahead based on
				// page * number of results per page was necessary. You may have a
				// simpler server-side pagination API where just updating 
				// mixins.serverPaginator.queryParams.page is all you need to do.
				// This applies similarly to requestPreviousPage()
				this.pager();
			}
		},

		requestPreviousPage: function () {
			if (this.page >= 0) {
				this.page -= 1;
				// customize as needed.
				this.pager();
			}
		},

		updateOrder: function (column) {
			if (column) {
				this.sortField = column;
				this.pager();
			}

		},

		goTo: function (page) {
			this.page = parseInt(page, 10);
			this.pager();
		},

		howManyPer: function (count) {
			this.page = 1;
			this.perPage = count;
			this.pager();
		},

		sort: function () {

		},

		info: function () {
			var info = {
				page: this.page,
				totalPages: this.totalPages,
				lastPage: this.totalPages
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