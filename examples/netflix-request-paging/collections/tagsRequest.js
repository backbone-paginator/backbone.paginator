(function (collections, model, paginator) {

    collections.TagsRequest = paginator.requestPager.extend({
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
        page: 1,

        // how many results to query from the service
        perPage: 30,

        // maximum number of pages that can be queried from the server (default)
        // in case the server doesn't return a value.
        totalPages: 10,

        // a default. This should be overridden in the collection's parse()
        // sort direction
        sortDirection: 'asc',

        // sort field
        sortField: 'ReleaseYear',
        //or year(Instant/AvailableFrom)
        // query
        query: 'substringof%28%27the%27,%20Name%29%20eq%20true',

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
            this.totalPages = response.d.__count;
            return tags;
        }

    });

})( app.collections, app.models.Tag, Backbone.Paginator);