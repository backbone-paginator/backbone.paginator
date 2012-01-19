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

		    var sorter = $('#sortByOption').val();

			this.collection.comparator = function(model) {
				var str = model.get(sorter);
     			str = str.toLowerCase();
     			str = str.split();
				str = _.map(str, function(letter) { 
				    return String.fromCharCode((letter.charCodeAt(0))); 
				  });         
				 return str;
				}
	

			this.collection.pager();
			
		},

		sortAlphabetDescending: function(e){
			e.preventDefault();
		    var sorter = $('#sortByOption').val();
		   
			this.collection.comparator = function(model) {
				var str = model.get(sorter);
     			str = str.toLowerCase();
     			str = str.split();
				str = _.map(str, function(letter) { 
				    return String.fromCharCode(-(letter.charCodeAt(0))); 
				  });         
				 return str;
			}

			this.collection.pager();

		},

		nextServerPage: function(e){
			e.preventDefault();
			this.collection.queryPage += 1;
			this.collection.fetch({data: {page: (this.collection.queryPage)}});

		},

		previousServerPage : function(e){
			e.preventDefault();
			this.collection.queryPage -= 1;
			this.collection.fetch({data: {page: (this.collection.queryPage)}});
		}
	});
})( App.views );