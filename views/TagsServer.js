
(function ( views ) {
	views.TagsServer = Backbone.View.extend({
		el : '#content2',
		initialize : function () {

			_.bindAll (this, 'render', 'addAll', 'addOne');

			var self = this;
			var tags = self.collection;
			tags.fetch();

			self.collection.bind('reset', self.addAll);

		},

		addAll : function () {
			$(this.el).empty();
			this.collection.each (this.addOne);
		},
		
		addOne : function (model) {
			var view = new TagServer({model:model});
			view.render();
			$(this.el).append(view.el);
		}
	});

	var TagServer = Backbone.View.extend({
		tagName : 'li',
		render : function () {
			$(this.el).html(this.model.get('Name'));
		}
	});
})( App.views );


