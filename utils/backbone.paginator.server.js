(function ( mixins ) {


		// @name: serverPaginator
		//
		// @tagline: Paginator for server-side data
		// @description:
		//
		// The paginator is responsible for providing pagination
		// and sort capabilities for requests to a server-side
		// data service.

		mixins.serverPaginator = {
	

			requestNextPage: function(){
				if(this.queryParams.page >= 0){
					this.queryParams.page += 1;
					this.queryMap.$skip =  this.queryParams.page * this.queryParams.perPage;	
					this.fetch({});
				}
			},

			requestPreviousPage: function(){
				if(this.queryParams.page >= 0){
					this.queryParams.page -= 1;
					this.queryMap.$skip =  this.queryParams.page * this.queryParams.perPage;
					this.fetch({});
				}
			},

			updateOrder: function (column){
				this.queryParams.sortField = column;
				this.queryMap.orderBy = column;
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

		// @name: queryMap
		// @description:
		// queryMap contains name mappings for parameters you'll be passing back
		// to the server. In the case of this example, we're using NetFlix OData
		// which uses $top, $skip etc. to define what paginated data should be
		// returned from their service. If you had your own data service of the form
		// http://domain.com/api/?query=houses&page=2&sortBy=year, your queryMap
		// would just contain
		// query: mixins.Paginator.query
		// page: mixins.Paginator.page
		// sortBy: mixins.Paginator.sortField

		// As can be seen below, the queryMap can contain not just direct references
		// to values in the queryParams object but can also contain mutated values
		// such as $skip, which is composed by multipying the current page by the 
		// number of items per page. You can also choose to mix values from the 
		// queryParams object with custom string information (see $filter) so this
		// is fairly flexible.

		mixins.serverPaginator.queryMap = {
			
			$top: mixins.serverPaginator.queryParams.perPage,

			$skip: mixins.serverPaginator.queryParams.page * mixins.serverPaginator.queryParams.perPage,

			orderBy: mixins.serverPaginator.queryParams.sortField,

			$inlinecount: mixins.serverPaginator.queryParams.customParam1,

			$filter: "substringof%28%27" + mixins.serverPaginator.queryParams.query + "%27,%20Name%29%20eq%20true",

			$format: mixins.serverPaginator.queryParams.format,

			$callback: mixins.serverPaginator.queryParams.customParam2

		};

	
})( App.mixins );


