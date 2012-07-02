(function (collections, model, paginator) {

	collections.PaginatedCollection = paginator.clientPager.extend({

		model: model,

		paginator_core: {
			// the type of the request (GET by default)
			type: 'GET',
			
			// the type of reply (jsonp by default)
			dataType: 'jsonp',
		
			// the URL (or base URL) for the service
			url: 'http://query.yahooapis.com/v1/public/yql?'
		},
		
		paginator_ui: {
			// the lowest page index your API allows to be accessed
			firstPage: 1,
		
			// which page should the paginator start from 
			// (also, the actual page the paginator is on)
			currentPage: 1,
			
			// how many items per page should be shown
			perPage: 5,
			
			// a default number of total pages to query in case the API or 
			// service you are using does not support providing the total 
			// number of pages for us.
			// 10 as a default in case your service doesn't return the total
			totalPages: 5
		},
		
		server_api: {
			// the query field in the request
			'q': function() { return encodeURIComponent('select title, content, url from google.search where q = "aksenttimerkkejä"') },
			
			// how many results the request should skip ahead to
			// customize as needed. For the Netflix API, skipping ahead based on
			// page * number of results per page was necessary.
			'start': function() { return this.currentPage * this.perPage },
			
			// what format would you like to request results in?
			'format': 'json',

			'diagnostics': 'false',			
			'env': function() { return encodeURIComponent('store://datatables.org/alltableswithkeys') }
		},

		parse: function (response) {
			// Be sure to change this based on how your results
			// are structured
			
			var tags = response.query.results.results;
			return tags;
		}

	});

})( app.collections, app.models.Item, Backbone.Paginator);