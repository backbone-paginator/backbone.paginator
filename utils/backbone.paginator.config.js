(function(mixins){


	//http://developer.netflix.com/docs/oData_Catalog
	
		/*Parameters to pass back to the server*/
		mixins.Paginator.queryParams = {
		
			/**current page to query from the service*/
			page: 1,

			/*how many results to query from the service*/
			perPage: 30,

			/*maximum number of pages that can be queried from the server*/
			totalPages: 10, // a default. This should be overridden in the collection's parse()

			/*sort direction*/
			sortDirection: 'asc',

			/*sort field*/
			sortField: 'ReleaseYear', //or year(Instant/AvailableFrom)

			/*query*/
			query: 'the'



		};



		mixins.Paginator.queryMap = {
			
			$top: mixins.Paginator.queryParams.perPage,

			$skip: mixins.Paginator.queryParams.page * mixins.Paginator.queryParams.perPage,

			orderBy: mixins.Paginator.queryParams.sortField,

			$inlinecount: "allpages",

			$filter: "substringof%28%27" + mixins.Paginator.queryParams.query + "%27,%20Name%29%20eq%20true",

			$format: "json",

			$callback: "callback"

		};


})( App.mixins);
