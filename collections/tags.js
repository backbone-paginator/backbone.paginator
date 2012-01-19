(function ( collections , pagination , model ) {
	collections.Tags = Backbone.Collection.extend({
		model : model,
		url: 'search.json',

		parse : function (resp) {
			var tags = resp.results;
			return tags;
		}
	});

	_.extend(collections.Tags.prototype, pagination);
})( App.collections, App.mixins.Pagination, App.models.Tag );