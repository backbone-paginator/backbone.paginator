(function (views) {

	views.requestPagination = Backbone.View.extend({

		events: {
			'click a.servernext': 'nextResultPage',
			'click a.serverprevious': 'previousResultPage',
			'click a.orderUpdate': 'updateSortBy',
			'click a.serverlast': 'gotoLast',
			'click a.serverpage': 'gotoPage',
			'click .serverhowmany a': 'changeCount'

		},

		tagName: 'aside',

		initialize: function () {
			this.collection.on('reset', this.render, this);
			this.collection.on('change', this.render, this);
			this.tmpl = _.template($('#tmpServerPagination').html());
			$(this.el).appendTo('#pagination');

		},

		render: function () {
			var html = this.tmpl(this.collection.info());
			$(this.el).html(html);
		},

		updateSortBy: function (e) {
			e.preventDefault();
			var sort = $('#sortByField').val();
			this.collection.updateOrder(sort);
		},

		nextResultPage: function (e) {
			e.preventDefault();
			this.collection.requestNextPage();
		},

		previousResultPage: function (e) {
			e.preventDefault();
			this.collection.requestPreviousPage();
		},

		gotoLast: function (e) {
			e.preventDefault();
			this.collection.goTo(this.collection.information.lastPage);
		},

		gotoPage: function (e) {
			e.preventDefault();
			var page = $(e.target).text();
			this.collection.goTo(page);
		},

		changeCount: function (e) {
			e.preventDefault();
			var per = $(e.target).text();
			this.collection.howManyPer(per);
		}

	});

})( app.views );