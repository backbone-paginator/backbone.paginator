(function ( mixins ) {

	// @name: clientPaginator
	//
	// @tagline: Paginator for client-side data
	// @description:
	//
	// The paginator is responsible for providing pagination
	// and sort capabilities for a collection of data that has
	// already been returned by a server. You may wish to use
	// the client-side paginator for single data payloads 
	// e.g return 500 results, allow this data to be paginated
	// on the client-side

	mixins.clientPaginator = {

		// @name: cParams
		// Configures how data returned from the server should be locally paginated in
		// a view. For example, if the server returns a payload of 50 results
		// (in the current setup) this will paginate the results with 20 shown
		// per 'page', beginning with page 1

		cParams : {

			// how many items to show per page in the view?
			perPage : 20,

			// page to start off on for pagination in the view?
			page : 1,

			// sort field
			sortField: 'text',

			// sort direction
			sortDirection: 'asc'

		},

		nextPage : function () {
			this.cParams.page = ++this.cParams.page;
			this.pager();
		},

		previousPage : function () {
			this.cParams.page = --this.cParams.page || 1;
			this.pager();
		},

		goTo : function (page) {
			this.cParams.page = parseInt(page,10);
			this.pager();
		},

		howManyPer : function (perPage) {
			this.cParams.page = 1;
			this.cParams.perPage = perPage;
			this.pager();
		},


		// where column is the key to sort on
		setSort : function (column, direction) {
			this.pager(column, direction);
		},

		pager : function (sort, direction) {
			var self = this,
				start = (self.cParams.page-1)*this.cParams.perPage,
				stop  = start+self.cParams.perPage;

			if (self.orgmodels === undefined) {
				self.orgmodels = self.models;
			}

			self.models = self.orgmodels;

			if (sort) {
				self.models = self._sort(self.models, sort, direction);
			}

			self.reset(
				self.models.slice(start,stop)
			);
		},

		_sort : function (models, sort, direction) {
			models = models.sort(function(a,b) {
				var a = a.get(sort),
					b = b.get(sort);

				if (direction === 'desc') {
					if (a > b) {
						return -1;
					}

					if (a < b) {
						return 1;
					}
				}
				else {
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

		info : function () {
			var self = this,
				info = {},
				totalRecords = (self.orgmodels) ? self.orgmodels.length : self.length,
				totalPages = Math.ceil(totalRecords/self.perPage);

			info = {
				totalRecords  : totalRecords,
				page          : self.cParams.page,
				perPage       : self.cParams.perPage,
				totalPages    : totalPages,
				lastPage      : totalPages,
				lastPagem1    : totalPages-1,
				previous      : false,
				next          : false,
				page_set      : [],
				startRecord   : (self.cParams.page - 1) * self.cParams.perPage + 1,
				endRecord     : Math.min(totalRecords, self.cParams.page * self.cParams.perPage)
			};

			if (self.page > 1) {
				info.prev = self.cParams.page - 1;
			}

			if (self.page < info.totalPages) {
				info.next = self.cParams.page + 1;
			}

			info.pageSet = self.setPagination(info);
			
			self.information = info;
			return info;
		},


		setPagination : function (info) {
			var pages = [];


			// How many adjacent pages should be shown on each side?
			var ADJACENT = 3;
			var ADJACENTx2 = ADJACENT*2;
			var LASTPAGE = Math.ceil(info.totalRecords/info.perPage);
			var LPM1 = -1;

			if (LASTPAGE > 1) {
				// not enough pages to bother breaking it up
				if (LASTPAGE < (7 + ADJACENTx2)) {
					for (var i=1,l=LASTPAGE; i <= l; i++) {
						pages.push(i);
					}
				}
				// enough pages to hide some
				else if (LASTPAGE > (5 + ADJACENTx2)) {

					//close to beginning; only hide later pages
					if (info.page < (1 + ADJACENTx2)) {
						for (var i=1, l=4+ADJACENTx2; i < l; i++) {
							pages.push(i);				
						}
					}

					// in middle; hide some front and some back
					else if(LASTPAGE - ADJACENTx2 > info.page && info.page > ADJACENTx2) {
						for (var i = info.page - ADJACENT; i <= info.page + ADJACENT; i++) {
							pages.push(i);				
						}	
					}
					// close to end; only hide early pages
					else{
						for (var i = LASTPAGE - (2 + ADJACENTx2); i <= LASTPAGE; i++) {
							pages.push(i);					
						}
					}
				}
			}

			return pages;
		}
	};

})( App.mixins );




