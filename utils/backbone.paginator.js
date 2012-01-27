(function ( mixins ) {

	// @name: Paginator
	// @description:
	// The paginator is responsible for providing pagination
	// and sort capabilities for a collection. It's main role
	// in the demo application is showing how this can be applied
	// to data returned from the server. It is not responsible
	// for allowing us to page through server-side results as
	// this is done using the logic in our View along with the
	// backbone.paginator.config.js's queryMap and queryParams
	// objects. These are loaded alongside the Paginator in
	// our collection. 

	mixins.Paginator = {

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

			info.queryTotalPages = self.queryParams.totalPages;
			info.queryPage     = self.queryParams.page;


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
				//not enough pages to bother breaking it up
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

					//in middle; hide some front and some back
					else if(LASTPAGE - ADJACENTx2 > info.page && info.page > ADJACENTx2) {
						for (var i = info.page - ADJACENT; i <= info.page + ADJACENT; i++) {
							pages.push(i);				
						}	
					}
					//close to end; only hide early pages
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





