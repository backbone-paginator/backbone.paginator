(function (collections, model, paginator) {

    collections.TagsClient = paginator.clientPager.extend({
        model: model,

        url: 'http://odata.netflix.com/v2/Catalog/Titles?&',


        // @name: queryParams
        // Configures how data returned from the server should be locally paginated in
        // a view. For example, if the server returns a payload of 50 results
        // (in the current setup) this will paginate the results with 20 shown
        // per 'page', beginning with page 1

        queryParams: {

            // current page to query from the service
            page: 1,

            // how many results to query from the service
            perPage: 30,

            // how many results to display per 'client page'
            displayPerPage: 20,

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
            //this.queryParams.totalPages = response.d.__count;
            return tags;
        }

    });


})( app.collections, app.mixins.clientPaginator, Backbone.Paginator);