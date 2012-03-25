(function ( views ) {
	views.TagsClient = Backbone.View.extend({
		el : '#content',
		initialize : function () {

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
			$(this.el).html(this.model.get('Name'));
		}
	});
})( app.views );

