
var App = {
	collections : {},
	models : {},
	views : {},
	mixins : {},
	init : function () {	

		// If not using a specific option, simply delete the client or server
		// variation below.

		//Client
		if(!(App.collections.TagsClient==undefined)){
			var clientTags  = new App.collections.TagsClient();
			App.views.tagsClient = new App.views.TagsClient({collection: clientTags});
			App.views.clientPaging = new App.views.clientPagination({collection: clientTags});
		}

		//Server
		if(!(App.collections.TagsServer==undefined)){
			var serverTags = new App.collections.TagsServer();
			App.views.serverView = new App.views.TagsServer({collection: serverTags});
			App.views.serverPaging = new App.views.serverPagination({collection:serverTags});
		}

	}
};

$(function(){
	App.init();
});

