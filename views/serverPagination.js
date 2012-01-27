(function ( views ) {

	views.serverPagination = Backbone.View.extend({

		events : {
			'click a.servernext'		: 'nextResultPage',
			'click a.serverprevious' 	: 'previousResultPage',
			'click a.orderUpdate'		: 'updateServerOrder',
		},

		tagName : 'aside',

		initialize : function () {
			this.collection.bind('reset', this.render, this);
			this.collection.bind('change', this.render, this);

			this.tmpl = _.template($('#tmpServerPagination').html());
			$(this.el).appendTo('#pagination');

		},
		render : function () {
			var html = this.tmpl(this.collection.info());
			$(this.el).html(html);
		},

		updateServerOrder: function(e){
			e.preventDefault();
			var sort = $('#sortByField').val();
			this.collection.updateOrder(sort);
		},

		nextResultPage: function(e){
			e.preventDefault();
			this.collection.requestNextPage();

		},

		previousResultPage : function(e){
			e.preventDefault();
			this.collection.requestPreviousPage();
		}
	});

})( App.views );
