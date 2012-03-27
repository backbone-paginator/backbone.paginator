(function ( views ) {
	views.TagsClient = Backbone.View.extend({
		el : '#content',
		initialize : function () {

			//todo: move towards the 3 sig .on from 0.9.x
			_.bindAll (this, 'render', 'addAll', 'addOne');

			var self = this;
			var tags = self.collection;

			tags.fetch({
				success: function(){
					self.collection.pager();
				},
				silent:true
			});

			self.collection.bind('reset', self.addAll);

		},
		addAll : function () {
			$(this.el).empty();
			this.collection.each (this.addOne);
		},
		
		addOne : function (model) {
			var view = new TagClient({model:model});
			view.render();
			$(this.el).append(view.el);
		}
	});

	var TagClient = Backbone.View.extend({
		tagName : 'li',
		render : function () {

			//todo: it's late, but this needs to be moved to proper templating..
			$(this.el).html(this.model.get('Name') + ' (' + Math.floor(this.model.get('Runtime')/60) + ' mins)[' + this.model.get('Rating') + ']');
		}
	});
})( app.views );

