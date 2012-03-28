(function (collections, model, paginator) {

        // Create a new collection using one of Backbone.Paginator's
        // pagers. We're going to begin using the requestPager first.

    collections.PaginatedCollection = paginator.requestPager.extend({

        // As usual, let's specify the model to be used
        // with this collection
        model: model,
        
        // followed by the URL (or base URL) for the service
        // providing our data (e.g the Netflix API)
        url: 'http://odata.netflix.com/Catalog/People(49446)/TitlesActedIn?',

        // Next, we're going to map the parameters supported by
        // your API or backend data service back to attributes
        // that are internally used by Backbone.Paginator. 

        // e.g the NetFlix API refers to it's parameter for 
        // stating how many results to skip ahead by as $skip
        // and it's number of items to return per page as $top

        // We simply map these to the relevant Paginator equivalents
        // shown on the left hand side to get everything working.

        // Note that you can define support for new custom attributes
        // in Backbone.Paginator if needed (e.g customAttribute1) for
        // those that may be unique to your service.

        // @param-name for the query field in the request (e.g 
        // query/keywords/search)
        queryAttribute: '$filter',

        // @param-name for number of items to return per request/page
        perPageAttribute: '$top',

        // @param-name for how many results the request should skip ahead to
        skipAttribute: '$skip',

        // @param-name for the direction to sort in
        sortAttribute: 'sort',

        // @param-name for field to sort by
        orderAttribute: '$orderby',

        // @param-name for the format of the request
        formatAttribute: '$format',

        // @param-name for a custom attribute 
        customAttribute1: '$inlinecount',

        // @param-name for another custom attribute
        customAttribute2: '$callback',

        // Now, let's configure the values for these parameters so that
        // as a user navigates through the paginated UI, requests are able
        // to continue querying with the correct field to sort on, the 
        // right number of items to return per request etc.

        // The lowest page index your API allows to be accessed
        firstPage: 0, //some begin with 1

        // current page to query from the service
        page: 0,

        // how many results to query from the service (i.e how many to return
        // per request)
        perPage: 5,

        // maximum number of pages that can be queried from the server (only
        // here as a default in case your service doesn't return the total
        // pages available)
        totalPages: 10,

        // what field should the results be sorted on?
        sortField: 'ReleaseYear',//ReleaseYear,ShortName asc, ShortName
        
        // what direction should the results be sorted in?
        sortDirection: 'asc',

        // what would you like to query (search) from the service?
        //query: "substringof('" + escape('and') + "',Name)",
        query: "",

        // what format would you like to request results in?
        format: 'json',

        // what other custom parameters for the request do you require
        // for your application?
        customParam1: 'allpages',

        customParam2: 'callback',


        parse: function (response) {
            // Be sure to change this based on how your results
            // are structured (e.g d.results is Netflix specific)
            var tags = response.d.results;
            this.totalPages = response.d.__count;
            return tags;
        }

    });

})( app.collections, app.models.Item, Backbone.Paginator);