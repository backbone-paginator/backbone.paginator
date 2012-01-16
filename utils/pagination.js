(function (mixins) {
	/**
	 * @class
	 * Pagination
	 */
	mixins.Pagination = {
		/**  how many items to show per page */
		perPage : 20,

		/** page to start off on */
		page : 1,

		/**
		 *
		 */
		nextPage : function () {
			var self = this;

			self.page = ++self.page;
			self.pager();
		},

		previousPage : function () {
			var self = this;

			self.page = --self.page || 1;
			self.pager();
		},

		goTo : function (page) {
			var self = this;

			self.page = parseInt(page,10);
			self.pager();
		},

		howManyPer : function (perPage) {
			var self = this;
			self.page = 1;
			self.perPage = perPage;
			self.pager();
		},

		setSort : function (column, direction) {
			var self = this;

			self.pager(column, direction);
		},

		pager : function (sort, direction) {
			var self = this,
				start = (self.page-1)*this.perPage,
				stop  = start+self.perPage;

			if (self.orgmodels === undefined) {
				self.orgmodels = self.models;
			}

			self.models = self.orgmodels;

			if (sort) {
				self.models = self._sort(self.models, sort);
			}

			self.reset(
				self.models.slice(start,stop)
			);
		},

		_sort : function (models, sort) {
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
				page          : self.page,
				perPage       : self.perPage,
				totalPages    : totalPages,
				lastPage      : totalPages,
				lastPagem1    : totalPages-1,
				previous      : false,
				next          : false,
				page_set      : [],
				startRecord   : (self.page - 1) * self.perPage + 1,
				endRecord     : Math.min(totalRecords, self.page * self.perPage)
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

})(App.mixins);