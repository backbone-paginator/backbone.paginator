
var App = {
	collections : {},
	models : {},
	views : {},
	mixins : {},
	init : function () {	

		//Server
		if(!(App.collections.TagsRequest==undefined)){
			var requestTags = new App.collections.TagsRequest();
			App.views.requestView = new App.views.TagsRequest({collection: requestTags});
			App.views.requestPaging = new App.views.requestPagination({collection:requestTags});
		}

	}
};

$(function(){
	App.init();
});

