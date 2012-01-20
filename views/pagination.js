(function ( views ) {
	views.Pagination = Backbone.View.extend({

		events : {
			'click a.first'        : 'gotoFirst',
			'click a.prev'         : 'gotoPrev',
			'click a.next'         : 'gotoNext',
			'click a.last'         : 'gotoLast',
			'click a.page'         : 'gotoPage',
			'click .howmany a'     : 'changeCount',
			'click a.sortAlphabetUp' : 'sortAlphabetAscending',
			'click a.sortAlphabetDown': 'sortAlphabetDescending',
			'click a.servernext': 'nextServerPage',
			'click a.serverprevious' : 'previousServerPage'
		},

		tagName : 'aside',
		initialize : function () {

			this.collection.bind('reset', this.render, this);
			this.collection.bind('change', this.render, this);
			this.tmpl = _.template($('#tmpPagination').html());
			$(this.el).appendTo('#pagination');

		},
		render : function () {
			var html = this.tmpl(this.collection.info());
			$(this.el).html(html);
		},

		gotoFirst : function (e) {
			e.preventDefault();
			this.collection.goTo(1);
		},

		gotoPrev : function (e) {
			e.preventDefault();
			this.collection.previousPage();
		},

		gotoNext : function (e) {
			e.preventDefault();
			this.collection.nextPage();
		},

		gotoLast : function (e) {
			e.preventDefault();
			this.collection.goTo(this.collection.information.lastPage);
		},

		gotoPage : function (e) {
			e.preventDefault();
			var page = $(e.target).text();
			this.collection.goTo(page);
		},

		changeCount : function (e) {
			e.preventDefault();
			var per = $(e.target).text();
			this.collection.howManyPer(per);
		},

		sortAlphabetAscending: function(e){
		    e.preventDefault();
			var sortSelector =  $('#sortByOption'),
		        sorter = sortSelector.val();
			this.collection.pager(sorterVal, 'asc');
			sortSelector.val(sorterVal);
			
		},

		sortAlphabetDescending: function(e){
			e.preventDefault();
			var sortSelector =  $('#sortByOption'),
		        sorter = sortSelector.val();
			this.collection.pager(sorter, 'desc');
			sortSelector.val(sorter);

		},

		nextServerPage: function(e){
			e.preventDefault();
			this.collection.requestNextPage();

		},

		previousServerPage : function(e){
			e.preventDefault();
			this.collection.requestPreviousPage();
		}
	});
})( App.views );