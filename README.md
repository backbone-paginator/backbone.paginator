This project seeks to provide a stable, comprehensive pagination component for Backbone.js. Please try out the demo then take a look at backbone.paginator.js and the accompanying models, collections and views to see how it could be used.

##API

* ```Paginator.cParams.page```: The first 'page' to display in the paginated view
* ```Paginator.cParams.perPage```: The number of results to display per 'page' 
* ```Paginator.queryParams.page```: The current page in the service being displayed (e.g /?page=1)
* ```Paginator.queryParams.perPage```: The number of results per query/page to request from the service
* ```Paginator.queryParams.totalPages```: The total number of pages available to query from the service
* ```Paginator.nextPage()```: Go to the next `page` in the paginated view
* ```Paginator.previousPage()```: Go to the previous `page` in the paginated view
* ```Paginator.goTo(page)```: Go to a specific page
* ```Paginator.setSort(key, direction)```: Sort by a specific key in a direction ('asc'/'desc')
* ```Paginator.requestNextPage()```: Request the next page of results from the service
* ```Paginator.requestPreviousPage()```: Request the previous page of results from the service

Currently in the process of extending queryParam support for sending sort and other parameters to the backend so sorting it possible there as well as client-side.

##Credits

This project is based on initial prior work on a paginator by @bmsterling and has been extended by @addyosmani in both the paginator and views to cover a few extra pieces (code cleanup, sort by fields, ajax/query pagination, requests etc.)

##Project status

I currently consider this work to be in an experimental phase. Once we've nailed down the structure of the pagination component, tests and further documentation will be added.