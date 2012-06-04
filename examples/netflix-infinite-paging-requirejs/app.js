//Top-level namespaces for our code

(function(){

	window.app = {};
	app.collections = {};
	app.models = {};
	app.views = {};
	app.mixins = {};

	// Defer initialization until doc ready.
	$(function(){
			app.collections.paginatedMovies = new app.collections.Movies();
			app.views.app = new app.views.MoviesView({collection: app.collections.paginatedMovies});
			app.views.pagination = new app.views.PaginatedView({collection:app.collections.paginatedMovies});
	});

})();

