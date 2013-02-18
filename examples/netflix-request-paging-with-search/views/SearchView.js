(function (views) {

	views.SearchView = Backbone.View.extend({

		events: {
			'click input#searchSubmit': 'fetchResults',
		},

		template: _.template($('#searchFormTemplate').html()),

		initialize: function () {

			this.collection.on('reset', this.render, this);
			this.collection.on('change', this.render, this);

			this.$el.appendTo('#searchForm');

		},

		render: function () {
			var html = this.template(this.collection.info());
			this.$el.html(html);
		},

		fetchResults: function (e) {
			e.preventDefault();
			var searchText = $('#searchText').val();
			var searchQuery = "Name eq '";
			if (searchText && searchText !== "") {
				searchQuery = searchQuery + searchText + "'";
			}
			this.collection.goTo(1, 
				{
					data: {'$filter' : searchQuery} 
				}
			);
		},

	});

})( app.views );