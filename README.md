# Backbone.Paginator

Backbone.Paginator is a set of opinionated components for paginating collections of data using Backbone.js. It aims to provide both solutions for assisting with pagination of requests to a server (e.g an API) as well as pagination of single-loads of data, where we may wish to further paginate a collection of N results into M pages within a view.

## Downloads And Source Code

You can either download the raw source code for the project, fork the repository or use one of these links:

* Production: [production version][min] 3.17K file size (1.5K gzipped)
* Development: [development version][max] 6.69K file size (2.18K gzipped)

[min]: https://raw.github.com/addyosmani/backbone.baginator/master/dist/backbone.paginator.min.js
[max]: https://raw.github.com/addyosmani/backbone.baginator/master/dist/backbone.paginator.js


## Paginator's pieces

Backbone.Paginator supports two main pagination components:

* **Backbone.Paginator.requestPager**: For pagination of requests between a client and a server-side API
* **Backbone.Paginator.clientPager**: For pagination of data returned from a server which you would like to further paginate within the UI (e.g 60 results are returned, paginate into 3 pages of 20)


## Live Examples

Live previews of both pagination components using the Netflix API can be found below. Fork the repository to experiment with these examples further.

* [Backbone.Paginator.requestPager()](http://addyosmani.github.com/backbone.paginator/examples/netflix-request-paging/index.html)
* [Backbone.Paginator.clientPager()](http://addyosmani.github.com/backbone.paginator/examples/netflix-client-paging/index.html)


##Paginator.requestPager

In this section we're going to walkthrough actually using the requestPager.

####1. Create a new Paginated collection
First, we define a new Paginated collection using `Backbone.Paginator.requestPager()` as follows:

```javascript
var PaginatedCollection = Backbone.Paginator.requestPager.extend({
```
####2: Set the model and base URL for the collection as normal

Within our collection, we then (as normal) specify the model to be used with this collection followed by the URL (or base URL) for the service providing our data (e.g the Netflix API).

```javascript
        model: model,
        url: 'http://odata.netflix.com/v2/Catalog/Titles?&',

```
####3. Map the attributes supported by your API (URL)
Next, we're going to map the request (URL) parameters supported by your API or backend data service back to attributes
that are internally used by Backbone.Paginator.

For example: the NetFlix API refers to it's parameter for stating how many results to skip ahead by as `$skip` and it's number of items to return per page as `$top` (amongst others). We determine these by looking at a sample URL pointing at the service:

```javascript
http://odata.netflix.com/v2/Catalog/Titles?&callback=callback&$top=30&$skip=30&orderBy=ReleaseYear&$inlinecount=allpages&$format=json&$callback=callback&$filter=substringof%28%27the%27,%20Name%29%20eq%20true&_=1332702202090
```

We then simply map these parameters to the relevant Paginator equivalents shown on the left hand side of the next snippets to get everything working:

```javascript
        // @param-name for the query field in the 
        // request (e.g query/keywords/search)
        queryAttribute: '$filter',

        // @param-name for number of items to return per request/page
        perPageAttribute: '$top',

        // @param-name for how many results the request should skip ahead to
        skipAttribute: '$skip',

        // @param-name for the direction to sort in
        sortAttribute: '$sort',

        // @param-name for field to sort by
        orderAttribute: 'orderBy',

        // @param-name for the format of the request
        formatAttribute: '$format',

        // @param-name for a custom attribute 
        customAttribute1: '$inlinecount',

        // @param-name for another custom attribute
        customAttribute2: '$callback',

```

**Note**: you can define support for new custom attributes in Backbone.Paginator if needed (e.g customAttribute1) for those that may be unique to your service.

####4. Configure the default pagination, query and sort details for the paginator
Now, let's configure the default values in our collection for these parameters so that as a user navigates through the paginated UI, requests are able to continue querying with the correct field to sort on, the right number of items to return per request etc.

e.g: If we want to request the:

* 1st page of results 
* for the search query 'superman'
* in JSON format
* sorted by release year 
* in ascending order
* where only 30 results are returned per request

This would look as follows:


```javascript

        // The lowest page index your API allows to be accessed
        firstPage: 0, //some begin with 1

        // current page to query from the service
        page: 5,

        // how many results to query from the service 
        // (i.e how many to return per request) perPage: 30,
        // maximum number of pages that can be queried from 
        // the server (only here as a default in case your 
        // service doesn't return the total pages available)
        totalPages: 10,

        // how many results to query from the service (i.e how many to return
        // per request)
        perPage: 30,
        
        // what field should the results be sorted on?
        sortField: 'ReleaseYear',
        
        // what direction should the results be sorted in?
        sortDirection: 'asc',

        // what would you like to query (search) from the service?
        // as Netflix reqires additional parameters around the query
        // we simply fill these around our search term
        query: "substringof('" + escape('the') + "',Name)",

        // what format would you like to request results in?
        format: 'json',

        // what other custom parameters for the request do 
        // you require
        // for your application?
        customParam1: 'allpages',

        customParam2: 'callback',

```
As the particular API we're using requires `callback` and `allpages` parameters to also be passed, we simply define the values for these as custom parameters which can be mapped back to requestPager as needed.

####5. Finally, configure Collection.parse() and we're done

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
            this.totalPages = Math.floor(response.d.__count / this.perPage);
            return tags;
        }
    });

});
```

####Convenience methods:

For your convenience, the following methods are made available for use in your views to interact with the `requestPager`:

* **Collection.goTo(n)** - go to a specific page
* **Collection.requestNextPage()** - go to the next page
* **Collection.requestPreviousPage()** - go to the previous page
* **Collection.howManyPer(n)** - set the number of items to display per page


##Paginator.clientPager

The `clientPager` works similar to the `requestPager`, except that our configuration values influence the pagination of data already returned at a UI-level. Whilst not shown (yet) there is also a lot more UI logic that ties in with the `clientPager`. An example of this can be seen in 'views/clientPagination.js'. 

####1. Create a new paginated collection with a model and URL
As with `requestPager`, let's first create a new Paginated `Backbone.Paginator.clientPager` collection, with a model and base URL:

```javascript
    var PaginatedCollection = Backbone.Paginator.clientPager.extend({
        
        model: model,

        url: 'http://odata.netflix.com/v2/Catalog/Titles?&',
```

####2. Map the attributes supported by your API (URL)
We're similarly going to map request parameter names for your API to those supported in the paginator:

```javascript
        perPageAttribute: '$top',

        skipAttribute: '$skip',

        orderAttribute: 'orderBy',

        customAttribute1: '$inlinecount',

        queryAttribute: '$filter',

        formatAttribute: '$format',

        customAttribute2: '$callback',

```

####3. Configure how to paginate data at a UI-level
We then get to configuration for the paginated data in the UI. `perPage` specifies how many results to return from the server whilst `displayPerPage` configures how many of the items in returned results to display per 'page' in the UI. e.g If we request 100 results and only display 20 per page, we have 5 sub-pages of results that can be navigated through in the UI.

```javascript
        // M: how many results to query from the service
        perPage: 40,

        // N: how many results to display per 'page' within the UI
        // Effectively M/N = the number of pages the data will be split into.
        displayPerPage: 20,
```

####4. Configure the rest of the request parameter default values

We can then configure default values for the rest of our request parameters:

```javascript
        // current page to query from the service
        page: '1',
        
        // a default. This should be overridden in the collection's parse()
        // sort direction
        sortDirection: 'asc',

        // sort field
        sortField: 'ReleaseYear',
        //or year(Instant/AvailableFrom)
        
        // query
        query: "substringof('" + escape('the') + "',Name)",

        // request format
        format: 'json',

        // custom parameters for the request that may be specific to your
        // application
        customParam1: 'allpages',

        customParam2: 'callback',
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
* **Collection.pager(sortBy, sortDirection)** - update sort on the current view


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt](https://github.com/cowboy/grunt).

_Also, please don't edit files in the "dist" subdirectory as they are generated via grunt. You'll find source code in the "lib" subdirectory!_

## Release History

* 0.15 - rewrite to simplify the project API, unify components under the same collection hood
* 0.14 - rewrite of all components
* 0.13 - initial release of client and request pagers
* 0.11 - initial work on version to work with requests to a server
* 0.1 - basic pagination of a single response from the server

## License
Copyright (c) 2012 Addy Osmani  
Licensed under the MIT license.
