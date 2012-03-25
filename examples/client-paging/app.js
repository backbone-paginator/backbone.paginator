
var App = {
	collections : {},
	models : {},
	views : {},
	mixins : {},
	init : function () {	

		//Client
		if(!(App.collections.TagsClient==undefined)){
			var clientTags  = new App.collections.TagsClient();
			App.views.tagsClient = new App.views.TagsClient({collection: clientTags});
			App.views.clientPaging = new App.views.clientPagination({collection: clientTags});
		}

	}
};

$(function(){
	App.init();
});

