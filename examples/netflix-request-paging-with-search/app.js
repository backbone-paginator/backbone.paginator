//Top-level namespaces for our code

(function(){

	window.app = {};
	app.collections = {};
	app.models = {};
	app.views = {};
	app.mixins = {};

	// Defer initialization until doc ready.
	$(function(){
			app.collections.paginatedItems = new app.collections.PaginatedCollection();
			app.views.search = new app.views.SearchView({collection:app.collections.paginatedItems});
			app.views.app = new app.views.AppView({collection: app.collections.paginatedItems});
			app.views.pagination = new app.views.PaginatedView({collection:app.collections.paginatedItems});
	});

})();

