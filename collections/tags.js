(function ( collections , pagination , model ) {
	collections.Tags = Backbone.Collection.extend({
		model : model,

		/*by using the &callback=? option, Backbone will switch to JSONP for us*/
		url: 'http://search.twitter.com/search.json?q=batman' + '&rpp=' + pagination.queryPerPage + ' &include_entities=true&result_type=recent&callback=?',

		parse : function ( response ) {
			var tags = response.results;

			/*
			uncomment if you wish to return the total
			number of available results that are available

			this.queryTotalPages = resonse.totalPages;
			*/

			return tags;
		}
	});

	_.extend(collections.Tags.prototype, pagination);
})( App.collections, App.mixins.Paginator, App.models.Tag );

