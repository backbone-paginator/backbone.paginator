(function (collections, model, paginator) {

    collections.TagsClient = paginator.clientPager.extend({
        model: model,

        url: 'http://odata.netflix.com/v2/Catalog/Titles?&',

        // mapping attributes to the parameters supported by your API
        perPageAttribute: '$top',
        skipAttribute: '$skip',
        orderAttribute: 'orderBy',
        customAttribute1: '$inlinecount',
        queryAttribute: '$filter',
        formatAttribute: '$format',
        customAttribute2: '$callback',

        // current page to query from the service
        page: '1',

        // how many results to query from the service
        perPage: '30',

        // how many results to display per 'client page'
        displayPerPage: '20',

        // a default. This should be overridden in the collection's parse()
        // sort direction
        sortDirection: 'asc',

        // sort field
        sortField: 'ReleaseYear',
        //or year(Instant/AvailableFrom)
        // query
        query: 'substringof%28%27the%27,%20Name%29%20eq%20true', //basically a query for 'the' 

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


})( app.collections, app.mixins.clientPaginator, Backbone.Paginator);