(function ( collections , pagination , model ) {
	collections.Tags = Backbone.Collection.extend({
		model : model,

		/*by using the &callback=? option, Backbone will switch to JSONP for us*/
		url: 'http://search.twitter.com/search.json?q=batman' + '&rpp=' + pagination.queryPerPage + ' &include_entities=true&result_type=recent&callback=?',

		parse : function (resp) {
			var tags = resp.results;
			return tags;
		}
	});

	_.extend(collections.Tags.prototype, pagination);
})( App.collections, App.mixins.Pagination, App.models.Tag );

