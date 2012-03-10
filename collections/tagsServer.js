(function (collections, model, paginator) {

    collections.TagsServer = paginator.serverPager.extend({
        model: model,
        url: 'http://odata.netflix.com/v2/Catalog/Titles?&',

        queryParams: {

            // current page to query from the service
            page: 1,

            // how many results to query from the service
            perPage: 30,

            // maximum number of pages that can be queried from the server
            totalPages: 10,
            // a default. This should be overridden in the collection's parse()
            // sort direction
            sortDirection: 'asc',

            // sort field
            sortField: 'ReleaseYear',
            //or year(Instant/AvailableFrom)
            // query
            query: 'the',

            // request format
            format: 'json',

            // custom parameters for the request that may be specific to your
            // application
            customParam1: 'allpages',

            customParam2: 'callback'

        },

        parse: function (response) {
            // Be sure to change this based on how your results
            // are structured
            var tags = response.d.results;
            this.queryParams.totalPages = response.d.__count;
            return tags;
        }

    });

})(App.collections, App.models.Tag, Backbone.Paginator);