(function ( collections , pagination , model ) {
	collections.Tags = Backbone.Collection.extend({
		model : model,
		url : 'tags.json',
		
		parse : function (resp) {
			var tags = resp.tags;
			return tags;
		}
	});

	_.extend(collections.Tags.prototype, pagination);
})( App.collections, App.mixins.Pagination, App.models.Tag );