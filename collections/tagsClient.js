(function (collections, model, paginator) {

    collections.TagsClient = paginator.clientPager.extend({
        model: model,

        url: 'http://odata.netflix.com/v2/Catalog/Titles?' + '$top=30&' + '$skip=0&' + '$orderby=ReleaseYear&' + '$inlinecount=allpages&' + '$filter=substringof%28%27the%27,%20Name%29%20eq%20true&' + '$format=json&' + '$callback=callback',

        // @name: queryParams
        // Configures how data returned from the server should be locally paginated in
        // a view. For example, if the server returns a payload of 50 results
        // (in the current setup) this will paginate the results with 20 shown
        // per 'page', beginning with page 1
        queryParams: {

            // how many items to show per page in the view?
            perPage: 20,

            // page to start off on for pagination in the view?
            page: 1,

            // sort field
            sortField: 'text',

            // sort direction
            sortDirection: 'asc'

        },

        parse: function (response) {
            // Be sure to change this based on how your results
            // are structured
            var tags = response.d.results;
            //this.queryParams.totalPages = response.d.__count;
            return tags;
        }

    });


})(App.collections, App.mixins.clientPaginator, Backbone.Paginator);