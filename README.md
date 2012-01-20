This project seeks to provide a stable, comprehensive pagination component for Backbone.js. Until the README has been updated to provide more information, please see the index/demo page for further info on the project.


* ```Paginator.page```: The first 'page' to display in the paginated view
* ```Paginator.perPage```: The number of results to display per 'page' 
* ```Paginator.queryPage```: The current page in the service being displayed (e.g /?page=1)
* ```Paginator.queryPerPage```: The number of results per query/page to request from the service
* ```Paginator.queryTotalPages```: The total number of pages available to query from the service
* ```Paginator.nextPage()```: Go to the next `page` in the paginated view
* ```Paginator.previousPage()```: Go to the previous `page` in the paginated view
* ```Paginator.goTo(page)```: Go to a specific page
* ```Paginator.setSort(key, direction)```: Sort by a specific key in a direction ('asc'/'desc')
* ```Paginator.requestNextPage()```: Request the next page of results from the service
* ```Paginator.requestPreviousPage()```: Request the previous page of results from the service
