var App = {
	collections : {},
	models : {},
	views : {},
	mixins : {},
	init : function () {		
		var collection = new App.collections.Tags();
		App.views.tags = new App.views.Tags({collection:collection});
		App.views.clientPaging = new App.views.clientPagination({collection:collection});
		App.views.serverPaging = new App.views.serverPagination({collection:collection});
	}
};

$(function(){
	App.init();
});