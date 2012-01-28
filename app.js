var App = {
	collections : {},
	models : {},
	views : {},
	mixins : {},
	init : function () {	

		//Client
		var clientTags  = new App.collections.TagsClient();
		App.views.tagsClient = new App.views.TagsClient({collection: clientTags});
		App.views.clientPaging = new App.views.clientPagination({collection: clientTags});

		//Server
		var serverTags = new App.collections.TagsServer();
		App.views.serverView = new App.views.TagsServer({collection: serverTags});
		App.views.serverPaging = new App.views.serverPagination({collection:serverTags});

	}
};

$(function(){
	App.init();
});

