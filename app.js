var App = {
	collections : {},
	models : {},
	views : {},
	mixins : {},
	init : function () {	


		App.collections.tagsClient  = new App.collections.TagsClient();
		App.collections.tagsServer  = new App.collections.TagsServer();

		//App.views.tagsClient = new App.views.TagsClient({collection:App.collections.tagsClient});
		App.views.tagsServer = new App.views.TagsServer({collection:App.collections.tagsServer});

		//App.views.clientPaging = new App.views.clientPagination({collection:App.collections.tagsClient});
		App.views.serverPaging = new App.views.serverPagination({collection:App.collections.tagsServer});
		//App.views.serverPaging.render();

	}
};

$(function(){
	App.init();
});