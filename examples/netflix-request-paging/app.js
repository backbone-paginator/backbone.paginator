//Top-level namespaces for our code

(function(){

	window.app = {};
	app.collections = {};
	app.models = {};
	app.views = {};
	app.mixins = {};

	// Defer initialization until doc ready.
	$(function(){
		if(!(app.collections.TagsRequest==undefined)){
			var requestTags = new app.collections.TagsRequest();
			app.views.requestView = new app.views.TagsRequest({collection: requestTags});
			app.views.requestPaging = new app.views.requestPagination({collection:requestTags});
		}
	});

})();



