(function (views) {
	views.Tags = Backbone.View.extend({
		tagName : 'ul',
		initialize : function () {
			_.bindAll (this, 'render', 'addAll', 'addOne');
			var self = this;
			self.collection.fetch({
				success : function () {
					self.collection.pager();
				},
				silent:true
			});
			self.collection.bind('reset', self.addAll);
			$(self.el).appendTo('body');
		},
		addAll : function () {
			var self = this;

			$(self.el).empty();
			self.collection.each (self.addOne);
		},

		addOne : function (model) {
			var self = this;

			var view = new Tag({model:model});
			view.render();
			$(self.el).append(view.el);
		}
	});

	var Tag = Backbone.View.extend({
		tagName : 'li',
		render : function () {
			$(this.el).html(this.model.get('name'));
		}
	});
})(App.views);

