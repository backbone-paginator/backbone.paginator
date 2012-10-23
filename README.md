# Backbone.Paginator

Backbone.Paginator is a set of opinionated components for paginating collections of data using Backbone.js. It aims to provide both solutions for assisting with pagination of requests to a server (e.g an API) as well as pagination of single-loads of data, where we may wish to further paginate a collection of N results into M pages within a view.

## Downloads And Source Code

You can either download the raw source code for the project, fork the repository or use one of these links:

* Production: [production version][min] 3.3K file size (1.1K gzipped)
* Development: [development version][max] 7.01K file size (2.28K gzipped)
* Examples: [tarball](https://github.com/addyosmani/backbone.paginator/zipball/)

[min]: https://raw.github.com/addyosmani/backbone.paginator/master/dist/backbone.paginator.min.js
[max]: https://raw.github.com/addyosmani/backbone.paginator/master/dist/backbone.paginator.js


## Paginator's pieces

Backbone.Paginator supports two main pagination components:

* **Backbone.Paginator.requestPager**: For pagination of requests between a client and a server-side API
* **Backbone.Paginator.clientPager**: For pagination of data returned from a server which you would like to further paginate within the UI (e.g 60 results are returned, paginate into 3 pages of 20)


## Live Examples

Live previews of both pagination components using the Netflix API can be found below. Fork the repository to experiment with these examples further.

* [Backbone.Paginator.requestPager()](http://addyosmani.github.com/backbone.paginator/examples/netflix-request-paging/index.html)
* [Backbone.Paginator.clientPager()](http://addyosmani.github.com/backbone.paginator/examples/netflix-client-paging/index.html)
* [Infinite Pagination (Backbone.Paginator.requestPager())](http://addyosmani.github.com/backbone.paginator/examples/netflix-infinite-paging/index.html)
* [Diacritic Plugin](http://addyosmani.github.com/backbone.paginator/examples/google-diacritic/index.html)

##Paginator.requestPager

In this section we're going to walkthrough actually using the requestPager.

####1. Create a new Paginated collection
First, we define a new Paginated collection using `Backbone.Paginator.requestPager()` as follows:

```javascript
var PaginatedCollection = Backbone.Paginator.requestPager.extend({
```
####2: Set the model for the collection as normal

Within our collection, we then (as normal) specify the model to be used with this collection followed by the URL (or base URL) for the service providing our data (e.g the Netflix API).

```javascript
        model: model,
```
####3. Configure the base URL and the type of the request

We need to set a base URL. The `type` of the request is `GET` by default, and the `dataType` is `jsonp` in order to enable cross-domain requests.

```javascript
		paginator_core: {
			// the type of the request (GET by default)
			type: 'GET',
			
			// the type of reply (jsonp by default)
			dataType: 'jsonp',
		
			// the URL (or base URL) for the service
			url: 'http://odata.netflix.com/Catalog/People(49446)/TitlesActedIn?'
		},
```

####4. Configure how the library will show the results

We need to tell the library how many items per page would we like to see, etc...

```javascript
		paginator_ui: {
			// the lowest page index your API allows to be accessed
			firstPage: 0,
		
			// which page should the paginator start from 
			// (also, the actual page the paginator is on)
			currentPage: 0,
			
			// how many items per page should be shown
			perPage: 3,
			
			// a default number of total pages to query in case the API or 
			// service you are using does not support providing the total 
			// number of pages for us.
			// 10 as a default in case your service doesn't return the total
			totalPages: 10
		},
```

####5. Configure the parameters we want to send to the server

Only the base URL won't be enough for most cases, so you can pass more parameters to the server.
Note how you can use functions insead of hardcoded values, and you can also reffer to the values you specified in `paginator_ui`.

```javascript
		server_api: {
			// the query field in the request
			'$filter': '',
			
			// number of items to return per request/page
			'$top': function() { return this.perPage },
			
			// how many results the request should skip ahead to
			// customize as needed. For the Netflix API, skipping ahead based on
			// page * number of results per page was necessary.
			'$skip': function() { return this.currentPage * this.perPage },
			
			// field to sort by
			'$orderby': 'ReleaseYear',
			
			// what format would you like to request results in?
			'$format': 'json',
			
			// custom parameters
			'$inlinecount': 'allpages',
			'$callback': 'callback'                                     
		},
```

####6. Finally, configure Collection.parse() and we're done

The last thing we need to do is configure our collection's `parse()` method. We want to ensure we're returning the correct part of our JSON response containing the data our collection will be populated with, which below is `response.d.results` (for the Netflix API). 

You might also notice that we're setting `this.totalPages` to the total page count returned by the API. This allows us to define the maximum number of (result) pages available for the current/last request so that we can clearly display this in the UI. It also allows us to infuence whether clicking say, a 'next' button should proceed with a request or not.

```javascript
        parse: function (response) {
            // Be sure to change this based on how your results
            // are structured (e.g d.results is Netflix specific)
            var tags = response.d.results;
            //Normally this.totalPages would equal response.d.__count
            //but as this particular NetFlix request only returns a
            //total count of items for the search, we divide.
            this.totalPages = Math.ceil(response.d.__count / this.perPage);
            return tags;
        }
    });

});
```

####Convenience methods:

For your convenience, the following methods are made available for use in your views to interact with the `requestPager`:

* **Collection.goTo( n, options )** - go to a specific page
* **Collection.requestNextPage( options )** - go to the next page
* **Collection.requestPreviousPage( options )** - go to the previous page
* **Collection.howManyPer( n )** - set the number of items to display per page

**requestPager** collection's methods `.goTo()`, `.requestNextPage()` and `.requestPreviousPage()` are all extension of the original [Backbone Collection.fetch() method](http://documentcloud.github.com/backbone/#Collection-fetch). As so, they all can take the same option object as parameter.

This option object can use `success` and `error` parameters to pass a function to be executed after server answer.

```javascript
Collection.goTo(n, {
	success: function( collection, response ) {
		// called is server request success
	},
	error: function( collection, response ) {
		// called if server request fail
	}
});
```

To manage callback, you could also use the [jqXHR](http://api.jquery.com/jQuery.ajax/#jqXHR) returned by these methods to manage callback.

```javascript
Collection
	.requestNextPage()
	.done(function( data, textStatus, jqXHR ) {
		// called is server request success
	})
	.fail(function( data, textStatus, jqXHR ) {
		// called if server request fail
	})
	.always(function( data, textStatus, jqXHR ) {
		// do something after server request is complete
	});
});
```

If you'd like to add the incoming models to the current collection, instead of replacing the collection's contents, pass `{add: true}` as an option to these methods.

```javascript
Collection.requestPreviousPage({ add: true });
```

##Paginator.clientPager

The `clientPager` works similar to the `requestPager`, except that our configuration values influence the pagination of data already returned at a UI-level. Whilst not shown (yet) there is also a lot more UI logic that ties in with the `clientPager`. An example of this can be seen in 'views/clientPagination.js'. 

####1. Create a new paginated collection with a model and URL
As with `requestPager`, let's first create a new Paginated `Backbone.Paginator.clientPager` collection, with a model:

```javascript
    var PaginatedCollection = Backbone.Paginator.clientPager.extend({
        
        model: model,
```

####2. Configure the base URL and the type of the request 

We need to set a base URL. The `type` of the request is `GET` by default, and the `dataType` is `jsonp` in order to enable cross-domain requests.

```javascript
		paginator_core: {
			// the type of the request (GET by default)
			type: 'GET',
			
			// the type of reply (jsonp by default)
			dataType: 'jsonp',
		
			// the URL (or base URL) for the service
			url: 'http://odata.netflix.com/v2/Catalog/Titles?&'
		},
```

####3. Configure how the library will show the results

We need to tell the library how many items per page would we like to see, etc...

```javascript
		paginator_ui: {
			// the lowest page index your API allows to be accessed
			firstPage: 1,
		
			// which page should the paginator start from 
			// (also, the actual page the paginator is on)
			currentPage: 1,
			
			// how many items per page should be shown
			perPage: 3,
			
			// a default number of total pages to query in case the API or 
			// service you are using does not support providing the total 
			// number of pages for us.
			// 10 as a default in case your service doesn't return the total
			totalPages: 10
		},
``` 

####4. Configure the parameters we want to send to the server

Only the base URL won't be enough for most cases, so you can pass more parameters to the server.
Note how you can use functions insead of hardcoded values, and you can also reffer to the values you specified in `paginator_ui`.

```javascript
		server_api: {
			// the query field in the request
			'$filter': 'substringof(\'america\',Name)',
			
			// number of items to return per request/page
			'$top': function() { return this.perPage },
			
			// how many results the request should skip ahead to
			// customize as needed. For the Netflix API, skipping ahead based on
			// page * number of results per page was necessary.
			'$skip': function() { return this.currentPage * this.perPage },
			
			// field to sort by
			'$orderby': 'ReleaseYear',
			
			// what format would you like to request results in?
			'$format': 'json',
			
			// custom parameters
			'$inlinecount': 'allpages',
			'$callback': 'callback'                                     
		},
```

####5. Finally, configure Collection.parse() and we're done

And finally we have our `parse()` method, which in this case isn't concerned with the total number of result pages available on the server as we have our own total count of pages for the paginated data in the UI.

```javascript
		parse: function (response) {
            var tags = response.d.results;
            return tags;
        }

    });
```

####Convenience methods:

As mentioned, your views can hook into a number of convenience methods to navigate around UI-paginated data. For `clientPager` these include:

* **Collection.goTo(n)** - go to a specific page
* **Collection.previousPage()** - go to the previous page
* **Collection.nextPage()** - go to the next page
* **Collection.howManyPer(n)** - set how many items to display per page
* **Collection.setSort(sortBy, sortDirection)** - update sort on the current view. Sorting will automatically detect if you're trying to sort numbers (even if they're strored as strings) and will do the right thing.
* **Collection.setFilter(filterFields, filterWords)** - filter the current view. Filtering supports multiple words without any specific order, so you'll basically get a full-text search ability. Also, you can pass it only one field from the model, or you can pass an array with fields and all of them will get filtered. Last option is to pass it an object containing a comparison method and rules. Currently, only ```levenshtein``` method is available.

```javascript
	this.collection.setFilter(
		{'Name': {cmp_method: 'levenshtein', max_distance: 7}}
		, "Amreican P" // Note the switched 'r' and 'e', and the 'P' from 'Pie'
	);
```

Also note that the levenshtein plugin should be loaded and enabled using the ```useLevenshteinPlugin``` variable.
Last but not less important: Performing Levenshtein comparison returns the ```distance``` between to strings. It won't let you *search* lenghty text.
The distance between two strings means the number of characters that should be added, removed or moved to the left or to the right so the strings get equal.
That means that comparing "Something" in "This is a test that could show something" will return 32, which is bigger than comparing "Something" and "ABCDEFG" (9).
Use levenshtein only for short texts (titles, names, etc).

* **Collection.doFakeFilter(filterFields, filterWords)** - returns the models count after fake-applying a call to ```Collection.setFilter```.

* **Collection.setFieldFilter(rules)** - filter each value of each model according to `rules` that you pass as argument. Example: You have a collection of books with 'release year' and 'author'. You can filter only the books that were released between 1999 and 2003. And then you can add another `rule` that will filter those books only to authors who's name start with 'A'. Possible rules: function, required, min, max, range, minLength, maxLength, rangeLength, oneOf, equalTo, containsAllOf, pattern.  Passing this an empty rules set will remove any FieldFilter rules applied.
```javascript
	my_collection.setFieldFilter([
		{field: 'release_year', type: 'range', value: {min: '1999', max: '2003'}},
		{field: 'author', type: 'pattern', value: new RegExp('A*', 'igm')}
	]);
	
	//Rules:
	//
	//var my_var = 'green';
	//
	//{field: 'color', type: 'equalTo', value: my_var}
	//{field: 'color', type: 'function', value: function(field_value){ return field_value == my_var; } }
	//{field: 'color', type: 'required'}
	//{field: 'number_of_colors', type: 'min', value: '2'}
	//{field: 'number_of_colors', type: 'max', value: '4'}
	//{field: 'number_of_colors', type: 'range', value: {min: '2', max: '4'} }
	//{field: 'color_name', type: 'minLength', value: '4'}
	//{field: 'color_name', type: 'maxLength', value: '6'}
	//{field: 'color_name', type: 'rangeLength', value: {min: '4', max: '6'}}
	//{field: 'color_name', type: 'oneOf', value: ['green', 'yellow']}
	//{field: 'color_name', type: 'pattern', value: new RegExp('gre*', 'ig')}
	//{field: 'color_name', type: 'containsAllOf', value: ['green', 'yellow', 'blue']}
```

* **Collection.doFakeFieldFilter(rules)** - returns the models count after fake-applying a call to ```Collection.setFieldFilter```.

####Implementation notes:

You can use some variables in your ```View``` to represent the actual state of the paginator.

```totalUnfilteredRecords``` - Contains the number of records, including all records filtered in any way. (Only available in ```clientPager```)

```totalRecords``` - Contains the number of records

```currentPage``` - The actual page were the paginator is at.

```perPage``` - The number of records the paginator will show per page.

```totalPages``` - The number of total pages.

```startRecord``` - The posicion of the first record shown in the current page (eg 41 to 50 from 2000 records) (Only available in ```clientPager```)

```endRecord``` - The posicion of the last record shown in the current page (eg 41 to 50 from 2000 records) (Only available in ```clientPager```)

## Plugins

**Diacritic.js**

A plugin for Backbone.Paginator that replaces diacritic characters (`´`, `˝`, `̏`, `˚`,`~` etc.) with characters that match them most closely. This is particularly useful for filtering.

To enable the plugin, set `this.useDiacriticsPlugin` to true, as can be seen in the example below:

```javascript
Paginator.clientPager = Backbone.Collection.extend({
	
		// Default values used when sorting and/or filtering.
		initialize: function(){
			this.useDiacriticsPlugin = true; // use diacritics plugin if available
		...	
```

## Team

* [Addy Osmani](http://github.com/addyosmani) - Developer Programs Engineer, Google
* [Alexander Nestorov](http://github.com/alexandernst) - Software Developer, EmeIEme

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "lib" subdirectory!_

## Release History

* 0.next - improve sorting and add filtering abilities. Add setSort() and setFilter() methods. Make pager() argument-less. Don't force attributes. Let the developer change the type of the request. Make the API cleaner. Some bug fixes.
* 0.15 - rewrite to simplify the project API, unify components under the same collection hood
* 0.14 - rewrite of all components
* 0.13 - initial release of client and request pagers
* 0.11 - initial work on version to work with requests to a server
* 0.1 - basic pagination of a single response from the server

## License
Copyright (c) 2012 Addy Osmani  
Licensed under the MIT license.
