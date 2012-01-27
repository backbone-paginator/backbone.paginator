var App = {
	collections : {},
	models : {},
	views : {},
	mixins : {},
	init : function () {
		var collection = new App.collections.Tags();
		App.views.tags = new App.views.Tags({collection:collection});
		new App.views.clientPagination({collection:collection});
	}
};

$(function(){
	App.init();
});