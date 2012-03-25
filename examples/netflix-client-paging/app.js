//Top-level namespaces for our code

(function(){

	window.app = {};
	app.collections = {};
	app.models = {};
	app.views = {};
	app.mixins = {};

	// Defer initialization until doc ready.
	$(function(){
		if(!(app.collections.TagsClient==undefined)){
			var clientTags  = new app.collections.TagsClient();
			app.views.tagsClient = new app.views.TagsClient({collection: clientTags});
			app.views.clientPaging = new app.views.clientPagination({collection: clientTags});
		}
	});

})();



