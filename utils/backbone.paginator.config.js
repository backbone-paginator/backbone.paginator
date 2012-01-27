(function(mixins){


		// @name: Paginator.queryParams
		// @description:
		// queryParams contains the actual values being passed
		// back to the server between requests. It uses a set of
		// standard keynames that the application internally uses
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
		mixins.Paginator.queryParams = {
		
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
		// As can be seen below, the queryMap can contain not just direct references
		// to values in the queryParams object but can also contain mutated values
		// such as $skip, which is composed by multipying the current page by the 
		// number of items per page. You can also choose to mix values from the 
		// queryParams object with custom string information (see $filter) so this
		// is fairly flexible.

		mixins.Paginator.queryMap = {
			
			$top: mixins.Paginator.queryParams.perPage,

			$skip: mixins.Paginator.queryParams.page * mixins.Paginator.queryParams.perPage,

			orderBy: mixins.Paginator.queryParams.sortField,

			$inlinecount: mixins.Paginator.queryParams.customParam1,

			$filter: "substringof%28%27" + mixins.Paginator.queryParams.query + "%27,%20Name%29%20eq%20true",

			$format: mixins.Paginator.queryParams.format,

			$callback: mixins.Paginator.queryParams.customParam2

		};


		// @name: cParams
		// Configures how data returned from the server should be paginated in
		// a view. For example, if the server returns a payload of 50 results
		// (in the current setup) this will paginate the results with 20 shown
		// per 'page', beginning with page 1

		mixins.Paginator.cParams = {

			// how many items to show per page in the view?
			perPage : 20,

			// page to start off on for pagination in the view?
			page : 1,

			// sort field
			sortField: 'text',

			// sort direction
			sortDirection: 'asc'

		};




})( App.mixins);
