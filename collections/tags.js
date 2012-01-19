(function ( collections , pagination , model ) {
	collections.Tags = Backbone.Collection.extend({
		model : model,

		/*by using the &callback=? option, Backbone will switch to JSONP for us*/
		url: 'http://search.twitter.com/search.json?q=batman' + '&rpp=' + pagination.queryPerPage + ' &include_entities=true&result_type=recent&callback=?',

		parse : function (resp) {
			var tags = resp.results;
			return tags;
		}
	});

	_.extend(collections.Tags.prototype, pagination);
})( App.collections, App.mixins.Pagination, App.models.Tag );

/*


We know that App.mixins.Pagination has details of paging, so maybe
we can sync based on this. Yeah?


(function ( collections , pagination , model ) {
	collections.Tags = Backbone.Collection.extend({
		model : model,
		url: 'search.json',

		parse : function (resp) {
			var tags = resp.results;
			return tags;
		}
	});

	_.extend(collections.Tags.prototype, pagination);
})( App.collections, App.mixins.Pagination, App.models.Tag );


Using JSONP with Backbone JS

JSON with Padding (JSONP) is a mechanism to support the retrieval of data from a server in a different domain. This is achieved by exploiting the fact that the HTML <script> element can be retrieved from an external domain.

By default, Backbone JS is unable to retrieve collection or model data from a url in a different domain. This is because Backbone is using the jQuery AJAX call with a data type of JSON rather than JSONP.

So, how do we change Backbone to use a data type of JSONP in its AJAX requests for a particular model or collection? The solution is to provide an overridden sync() function on the model/collection. Sync() is called by Backbone when a model/collection is synced with the data source at the url. Normally, it just calls the standard Backbone.sync() function, but overriding this function allows us to access and alter the options being passed to the jQuery AJAX call.

In the example below, a collection is defined that connects to the Twitter API to retrieve my last 5 tweets. The sync() function has been overridden and the AJAX options have been altered to use JSONP as a datatype (plus an increase in the timeout). After the options have been adjusted it is necessary to make a call to the standard Backbone.sync() function and return the results.

var TweetCollection = Backbone.Collection.extend({  
  model: Tweet,  
  url: "http://search.twitter.com/search.json?q=from:iainjmitchell+OR+@iainjmitchell&rpp=5",  
  sync: function(method, model, options){  
    options.timeout = 10000;  
    options.dataType = "jsonp";  
    return Backbone.sync(method, model, options);  
  }  
});  
Here is an example of a jQuery twitter plugin that uses Backbone JS JSONP calls.


You certainly can do it the way you are describing, but you can also add ‘&callback=?’ to the end of your URL and Backbone/jQuery will automatically change the dataType to jsonp….

'http://search.twitter.com/search.json?q=batman' + '&rpp=' + pagination.queryPerPage + ' &include_entities=true&result_type=mixed&page=' + pagination.queryPage + '&callback=?',
*/