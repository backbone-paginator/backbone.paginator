(function ( mixins ) {


		// @name: serverPaginator
		//
		// Paginator for server-side data
		//
		// @description:
		// The paginator is responsible for providing pagination
		// and sort capabilities for requests to a server-side
		// data service.

		mixins.serverPaginator = {
	

			// Use with updateMap() to syncronize parameters used internally
			// with those passed back to the server
			queryMap:{},

			requestNextPage: function(){
				if(this.queryParams.page >= 0){
					this.queryParams.page += 1;
					// customize as needed. For the Netflix API, skipping ahead based on
					// page * number of results per page was necessary. You may have a
					// simpler server-side pagination API where just updating 
					// mixins.serverPaginator.queryParams.page is all you need to do.
					// This applies similarly to requestPreviousPage()
					this.queryMap.$skip =  this.queryParams.page * this.queryParams.perPage;	
					this.pager();
				}
			},

			requestPreviousPage: function(){
				if(this.queryParams.page >= 0){
					this.queryParams.page -= 1;
					// customize as needed.
					this.queryMap.$skip =  this.queryParams.page * this.queryParams.perPage;
					this.pager();
				}
			},

			updateOrder: function (column){
				if(column){
					this.queryParams.sortField = column;
					this.queryMap.orderBy = column;
					this.pager();		
				}

			},

			goTo: function(page){
				this.queryParams.page = parseInt(page,10);
				this.pager();	
			},

			howManyPer: function(count){
				this.queryParams.page = 1;
				this.queryParams.perPage = count;
				this.pager();
			},

			sort: function(){
				
			},

			info: function(){
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
			pager: function(){
				this.fetch({});
			}

		
		};


			// @name: Paginator.queryParams
			// @description:
			// queryParams contains the actual values being passed
			// back to the server between requests. It uses a set of
			// standard key names that the application internally uses
			// to handle pagination and these can be easily mapped
			// against the actual variables you need to pass back
			// between requests in the queryMap. 

			// The reason for a mapper and queryParams object is to 
			// make it as quick and easy to get pagination setup in 
			// your application as possible. Values for anything in 
			// queryParams can be modified via the UI or on a collection 
			// changing (e.g a new paged set is received and we wish to 
			// update the totalPages value). If you would prefer

			// Parameters to pass back to the server
			

			mixins.serverPaginator.queryParams = {
			
				// current page to query from the service
				page: 1,

				// how many results to query from the service
				perPage: 30,

				// maximum number of pages that can be queried from the server
				totalPages: 10, // a default. This should be overridden in the collection's parse()

				// sort direction
				sortDirection: 'asc',

				// sort field
				sortField: 'ReleaseYear', //or year(Instant/AvailableFrom)

				// query
				query: 'the',

				// request format
				format: 'json',

				// custom parameters for the request that may be specific to your
				// application
				customParam1: 'allpages',

				customParam2: 'callback'

			};




	
})( App.mixins );


