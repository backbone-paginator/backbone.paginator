(function ( views ) {
	views.Tags = Backbone.View.extend({
		el : '#content',
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
			

		},
		addAll : function () {
			$(this.el).empty();
			this.collection.each (this.addOne);
		},

		addOne : function (model) {
			var view = new Tag({model:model});
			view.render();
			$(this.el).append(view.el);
		}
	});

	var Tag = Backbone.View.extend({
		tagName : 'li',
		render : function () {
			$(this.el).html(this.model.get('name'));
		}
	});
})( App.views );

