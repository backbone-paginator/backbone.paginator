(function ( views ) {

	views.AppView = Backbone.View.extend({

		el : '#content',

		initialize : function () {

			var tags = this.collection;

			tags.on('reset', this.addAll, this);
			tags.on('all', this.render, this);
			
			tags.fetch({
				success: function(){
					tags.pager();
				},
				silent:true
			});


		},
		addAll : function () {
			this.$el.empty();
			this.collection.each (this.addOne);
		},
		
		addOne : function ( item ) {
			var view = new views.ResultView({model:item});
			$('#content').append(view.render().el);
		},

		render: function(){
		}
	});

})( app.views );
