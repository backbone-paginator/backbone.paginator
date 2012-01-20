(function ( mixins ) {

	mixins.Pagination = {
		/**  how many items to show per page in the view */
		perPage : 20,

		/** page to start off on for pagination in the view */
		page : 1,

		/**current page to query from the service*/
		queryPage: 1,

		/*how many results to query from the service*/
		queryPerPage: 30,

		/*maximum number of pages that can be queried from the server*/
		queryMaxPages:10,

		/**
		 *
		 */
		nextPage : function () {
			this.page = ++this.page;
			this.pager();
		},

		previousPage : function () {
			this.page = --this.page || 1;
			this.pager();
		},

		goTo : function (page) {
			this.page = parseInt(page,10);
			this.pager();
		},

		howManyPer : function (perPage) {
			this.page = 1;
			this.perPage = perPage;
			this.pager();
		},


		// where column is the key to sort on
		setSort : function (column, direction) {
			this.pager(column, direction);
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

			//experimental
			info.queryMaxPages = self.queryMaxPages;
			info.queryPage     = self.queryPage;
			//

			self.information = info;
			return info;
		},

		// methods for fetching next/previous pages outside
		// of the internally managed collection

		requestNextPage: function(){
			if(this.queryPage >= 0){
				this.queryPage += 1;
			}

			this.fetch({data: {page: this.queryPage}});
		},

		requestPreviousPage: function(){
			if(this.queryPage >= 0){
				this.queryPage -= 1;
			}
			this.fetch({data: {page: this.queryPage}});	
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