(function (collections, model, paginator) {

    collections.PaginatedCollection = paginator.clientPager.extend({

        model: model,

        url: 'http://odata.netflix.com/v2/Catalog/Titles?&',

        // map paginator attributes to the parameters supported by your API
        
        // @param-name for the query field in the 
        // request (e.g query/keywords/search)
        queryAttribute: '$filter',

        // @param-name for number of items to return per request/page
        perPageAttribute: '$top',

        // @param-name for how many results the request should skip ahead to
        skipAttribute: '$skip',

        // @param-name for field to sort by
        orderAttribute: 'orderBy',

        // @param-name for the format of the request
        formatAttribute: '$format',

        // @param-name for a custom attribute 
        customAttribute1: '$inlinecount',

        // @param-name for another custom attribute
        customAttribute2: '$callback',

        // current page to query from the service
        page: 1,

        // how many results to query from the service
        perPage: 30,

        // how many results to display per 'client page'
        displayPerPage: 3,

        // sort direction
        sortDirection: 'asc',

        // sort field
        sortField: 'ReleaseYear',
        //or year(Instant/AvailableFrom)
        
        // query
        query: "substringof('" + escape('america') + "',Name)",

        // request format
        format: 'json',

        // custom parameters for the request that may be specific to your
        // application
        customParam1: 'allpages',

        customParam2: 'callback',


        parse: function (response) {
            // Be sure to change this based on how your results
            // are structured
            var tags = response.d.results;
            //this.totalPages = response.d.__count;
            return tags;
        }

    });


})( app.collections, app.models.Item, Backbone.Paginator);