(function (collections, model, paginator) {

	collections.PaginatedCollection = paginator.requestPager.extend({

		model: model,
		
		scraper_name: 'slovenian_company_numbers',
		//scraper_name: 'departement-jobber',

		initialize: function()
		{
            
			var that = this;

			if(this.totalRecords === undefined) {
				$.getJSON(
					'https://api.scraperwiki.com/api/1.0/scraper/getinfo?format=jsondict&' + 
					'name=' + this.scraper_name + '&version=-1&quietfields=code|runevents|userroles|history|prevcommit|datasummary', 'jsonp'
				).success(function(data){
					that.totalRecords = data[0].records;
					that.pager();
				});
			};

		},
		
		paginator_core: {
			type: 		'GET',
			dataType: 	'json',
			url: 		'https://api.scraperwiki.com/api/1.0/datastore/sqlite?'
		},
		
		paginator_ui: {
			firstPage: 		1,
			currentPage: 	1,
			perPage: 		10,
			totalPages:		10,
			pagesInRange:	3
		},

		server_api: {
			'format' : 'jsondict',
			'name' : function() { return this.scraper_name; },
			'query' : function() {
				return 'select * from swdata limit ' + (this.currentPage - 1) * this.perPage + ', ' + this.perPage; 
			}                                  
		},

	});

})( app.collections, app.models.Item, Backbone.Paginator);