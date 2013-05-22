(function (collections, model, paginator) {

	collections.PaginatedCollection = paginator.clientPager.extend({

		model: model,

		paginator_core: {
			// the type of the request (GET by default)
			type: 'GET',
			
			// the type of reply (jsonp by default)
			dataType: 'jsonp',
		
			// the URL (or base URL) for the service
			url: 'https://api.github.com/repos/twitter/bootstrap/issues?'
		},
		
		paginator_ui: {
			// the lowest page index your API allows to be accessed
			firstPage: 1,
		
			// which page should the paginator start from 
			// (also, the actual page the paginator is on)
			currentPage: 1,
			
			// how many items per page should be shown
			perPage: 3,
			
			// a default number of total pages to query in case the API or 
			// service you are using does not support providing the total 
			// number of pages for us.
			// 10 as a default in case your service doesn't return the total
			totalPages: 10,
			
			pagesInRange: 3
		},
		
		server_api: {
			// number of items to return per request/page
			'per_page': function() { return this.perPage },
			
			// how many results the request should skip ahead to
			'page': function() { return this.currentPage },
			
			// field to sort by
			'sort': 'created',
			
			// custom parameters
			'callback': '?'
		},

		parse: function (response) {
			// Be sure to change this based on how your results
			// are structured
			var issues = response.data;
			return issues;
		}

	});

})( app.collections, app.models.Item, Backbone.Paginator);
