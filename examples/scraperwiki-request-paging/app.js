(function() {
	window.app = {};
	app.collections = {};
	app.models = {};
	app.views = {};
	app.mixins = {};
	// Defer initialization until doc ready.
	$(function() {
		jQuery.support.cors = true;
		app.collections.paginatedItems = new app.collections.PaginatedCollection();
		app.views.app = new app.views.AppView({
			collection : app.collections.paginatedItems
		});
		app.views.pagination = new app.views.PaginatedView({
			collection : app.collections.paginatedItems
		});
	});
})();