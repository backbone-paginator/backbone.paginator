(function ( views ) {
	views.Pagination = Backbone.View.extend({

		events : {
			'click a.first'        		: 'gotoFirst',
			'click a.prev'         		: 'gotoPrev',
			'click a.next'        		: 'gotoNext',
			'click a.last'         		: 'gotoLast',
			'click a.page'         		: 'gotoPage',
			'click .howmany a'     		: 'changeCount',
			'click a.sortAsc' 			: 'sortByAscending',
			'click a.sortDsc'			: 'sortByDescending',
			'click a.servernext'		: 'nextResultPage',
			'click a.serverprevious' 	: 'previousResultPage'
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

		sortByAscending: function(e){
		    e.preventDefault();
		    var currentSort = this.getSortOption();
			this.collection.pager(currentSort, 'asc');

			// reset only this field as the pagination is
			// being refreshed
			this.preserveSortOption(currentSort);
			
		},

		getSortOption: function(){
			var sel = $('#sortByOption').val();
			return sel;	
		},

		preserveSortOption: function(option){
			$('#sortByOption').val(option);
		},

		sortByDescending: function(e){
			e.preventDefault();
		    var currentSort = this.getSortOption();
			this.collection.pager(currentSort, 'desc');
			this.preserveSortOption(currentSort);
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