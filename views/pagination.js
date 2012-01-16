(function (views) {
	views.Pagination = Backbone.View.extend({

		events : {
			'click a.first'        : 'gotoFirst',
			'click a.prev'         : 'gotoPrev',
			'click a.next'         : 'gotoNext',
			'click a.last'         : 'gotoLast',
			'click a.page'         : 'gotoPage',
			'click .howmany a'     : 'changeCount'
		},

		tagName : 'aside',
		initialize : function () {
			_.bindAll (this, 'render');
			var self = this;

			self.tmpl = _.template($('#tmpPagination').html());
			self.collection.bind('reset', this.render);
			$(self.el).appendTo('body');
		},
		render : function () {
            var self;
            self = this;

			var html = this.tmpl(self.collection.info());
			$(this.el).html(html);
		},

		gotoFirst : function (e) {
			e.preventDefault();

			var self = this;

			self.collection.goTo(1);
		},

		gotoPrev : function (e) {
			e.preventDefault();

			var self = this;

			self.collection.previousPage();
		},

		gotoNext : function (e) {
			e.preventDefault();

			var self = this;

			self.collection.nextPage();
		},

		gotoLast : function (e) {
			e.preventDefault();

			var self = this;

			self.collection.goTo(self.collection.information.lastPage);
		},

		gotoPage : function (e) {
			e.preventDefault();

			var self = this;
			var page = $(e.target).text();

			self.collection.goTo(page);
		},

		changeCount : function (e) {
			e.preventDefault();

			var self = this;
			var per = $(e.target).text();

			self.collection.howManyPer(per);
		}
	});
})(App.views);