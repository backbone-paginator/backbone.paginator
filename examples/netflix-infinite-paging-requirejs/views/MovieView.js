( function ( views ){

	views.MovieView = Backbone.View.extend({
		tagName : 'li',
		template: _.template($('#resultMovieTemplate').html()),

		initialize: function() {
			this.model.bind('change', this.render, this);
			this.model.bind('destroy', this.remove, this);
		},

		render : function () {
			this.$el.html(this.template(this.model.toJSON()));
			return this;
		}
	});

})( app.views );