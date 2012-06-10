describe('backbone.paginator.requestPager',function(){
	
	describe('sync method', function(){
		
		xit('should set default values for "paginator_ui" if not provided', function(){
			//Setup
			var requestPagerTest = {
					paginator_ui: {totalPages: 22},
					paginator_core: {}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			
			// execute
			requestPagerTest.sync();
			
			// verify
			expect(requestPagerTest.paginator_ui.firstPage).toEqual(0);
			expect(requestPagerTest.paginator_ui.currentPage).toEqual(1);
			expect(requestPagerTest.paginator_ui.perPage).toEqual(5);
			expect(requestPagerTest.paginator_ui.totalPages).toEqual(22);
		});
		
		it('should change scope of "paginator_ui" values to current object under test if one not defined', function(){
			var requestPagerTest = {
					currentPage: 999,
					
					paginator_ui: {
						firstPage: 10,
						someVariable: 99,
						currentPage: 1
					},
					paginator_core: {}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			
			expect(requestPagerTest.firstPage).toBeUndefined();
			expect(requestPagerTest.someVariable).toBeUndefined();
			expect(requestPagerTest.currentPage).toEqual(999);
			
			
			// execute
			requestPagerTest.sync();
			
			// verify
			expect(requestPagerTest.firstPage).toEqual(10);
			expect(requestPagerTest.someVariable).toEqual(99);
			expect(requestPagerTest.currentPage).toEqual(999);
		});	
		
		it ("should use 'paginator_core' values as query options to ajax call", function(){
			spyOn($, 'ajax');
			
			var requestPagerTest = {
					paginator_ui: {},
					paginator_core: {
						type: 'POST',
						dataType: 'jsonType'	
					}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			
			requestPagerTest.sync();
			
			expect($.ajax.callCount).toEqual(1);
			expect($.ajax.mostRecentCall.args[0]['type']).toEqual("POST");
			expect($.ajax.mostRecentCall.args[0]['dataType']).toEqual("jsonType");
		});

		it ("should set default values for query options for the ajax call if not provided in 'paginator_core'", function(){
			spyOn($, 'ajax');
			
			var requestPagerTest = {
					paginator_ui: {},
					paginator_core: {}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			
			requestPagerTest.sync();
			
			expect($.ajax.callCount).toEqual(1);
			//expect($.ajax.mostRecentCall.args[0]).toEqual(25000);
			expect($.ajax.mostRecentCall.args[0]['timeout']).toEqual(25000);
			expect($.ajax.mostRecentCall.args[0]['cache']).toEqual(false);
			expect($.ajax.mostRecentCall.args[0]['type']).toEqual("GET");
			expect($.ajax.mostRecentCall.args[0]['dataType']).toEqual("jsonp");
		});
		
		it ("should set 'jsonpCallback' and 'processData' for query options for the ajax call", function(){
			spyOn($, 'ajax');
			
			//@addyosmani : 
			// 1) 'jsonpCallBack' is not needed if returned dataType is 'json'?
			//    But now we are always setting it out. Can we check to set it only for 'jsonp' type?? 
			//    -- not a big deal but makes it cleaner 
			//2) Why do we need 'processData' to be set for ajax call?
			var requestPagerTest = {
					paginator_ui: {},
					paginator_core: {
						jsonpCallback: 'override_me'
					}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			
			requestPagerTest.sync();
			
			//expect($.ajax.mostRecentCall.args[0]).toEqual(25000);
			expect($.ajax.mostRecentCall.args[0]['jsonpCallback']).toEqual('callback');
			expect($.ajax.mostRecentCall.args[0]['processData']).toEqual(false);
		});
		
		it ("should set url as query option from the evaluated url function value from 'paginator_core'", function(){
			spyOn($, 'ajax');
			
			var requestPagerTest = {
					paginator_ui: {},
					paginator_core: {
						url: function(){
							return '/rest/search/presidents';
						}
					}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			
			requestPagerTest.sync();
			
			expect($.ajax.mostRecentCall.args[0]['url']).toEqual('/rest/search/presidents');
		});

		it ("should set 'data' query param for the ajax call from 'server_api'", function(){
			spyOn($, 'ajax');
			
			var requestPagerTest = {
					paginator_ui: {},
					paginator_core: {},
					server_api: {
						pageZeroBased: 1,
						searchTerm: 'Obama',
						sortBy: 'lastName'
					}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			
			requestPagerTest.sync();
			
			//expect($.ajax.mostRecentCall.args[0]).toEqual(25000);
			expect($.ajax.mostRecentCall.args[0]['data']).toEqual('pageZeroBased=1&searchTerm=Obama&sortBy=lastName');
		});
		
		it ("should evaluate value as function (if it is) before setting 'data' query param for the ajax call from 'server_api'", function(){
			spyOn($, 'ajax');
			
			var requestPagerTest = {
					paginator_ui : {},
					paginator_core: {},
					server_api: {
						searchTerm: function(){
							return 'Barack' + ' ' + 'Obama';
						}
					}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			
			requestPagerTest.sync();
			
			expect($.ajax.mostRecentCall.args[0]['data']).toEqual('searchTerm=Barack+Obama');
		});
		
		it ("should create serialized representation of value before setting 'data' query param for the ajax call from 'server_api'", function(){
			spyOn($, 'ajax');
			
			var requestPagerTest = {
					paginator_ui : {},
					paginator_core: {},
					server_api: {
						a: {
						    one: 1, 
						    two: 2, 
						    three: 3
						  }
					}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			
			requestPagerTest.sync();
			
			expect($.ajax.mostRecentCall.args[0]['data']).toEqual('a[one]=1&a[two]=2&a[three]=3');
		});
	});
	
	describe('pager method', function(){
		
		it("should delegate to sync method indirectly through backbone's fetch method", function(){
			var requestPagerTest = {
				paginator_ui: {},
				paginator_core: {}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			spyOn(requestPagerTest, 'sync');
			
			requestPagerTest.pager();
			
			expect(requestPagerTest.sync).toHaveBeenCalled();
		});	
	});
	
	describe("info method", function(){
		
		it("should return common pagination values extracted from server", function(){
			var requestPagerTest = {
				currentPage: 9,
				firstPage: 1,
				totalPages: 100,
				perPage: 20,
				totalCount: 2000				
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			
			var info = requestPagerTest.info();
			
			expect(info.currentPage).toEqual(9);
			expect(info.firstPage).toEqual(1);
			expect(info.totalPages).toEqual(100);
			expect(info.lastPage).toEqual(100);
			expect(info.perPage).toEqual(20);
			expect(info.totalCount).toEqual(2000);
		});
	});
	
	describe("requestNextPage", function(){
		
		it("should increment 'currentPage' by 1 and call pager method", function(){
			var requestPagerTest = {
					paginator_ui: {
						currentPage: 12
					},
					paginator_core: {}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			spyOn(requestPagerTest, 'pager');
			
			// 'requestNextPage' method supposed to be called after server fetch
			requestPagerTest.sync();
			requestPagerTest.requestNextPage();
			
			expect(requestPagerTest.currentPage).toEqual(13);
			expect(requestPagerTest.pager).toHaveBeenCalled();
		});
	});
	
	describe("requestPreviousPage", function(){
		
		it("should decrement 'currentPage' by 1 and call pager method", function(){
			var requestPagerTest = {
					paginator_ui: {
						currentPage: 12
					},
					paginator_core: {}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			spyOn(requestPagerTest, 'pager');
			
			// 'requestPreviousPage' method supposed to be called after server fetch
			requestPagerTest.sync();
			requestPagerTest.requestPreviousPage();
			
			expect(requestPagerTest.currentPage).toEqual(11);
			expect(requestPagerTest.pager).toHaveBeenCalled();
		});
	});
	
	describe("goto", function(){
		
		it("should set currentPage to the page we want goto and call pager method", function(){
			var requestPagerTest = {
					paginator_ui: {
						currentPage: 12
					},
					paginator_core: {}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			spyOn(requestPagerTest, 'pager');
			
			requestPagerTest.sync();
			requestPagerTest.goTo(4);
			
			expect(requestPagerTest.currentPage).toEqual(4);
			expect(requestPagerTest.pager).toHaveBeenCalled();
		});
	});
	
	describe("howManyPer", function(){
		
		it("should change 'perPage' to the number we want to and call pager method", function(){
			var requestPagerTest = {
					paginator_ui: {
						perPage: 5
					},
					paginator_core: {}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			spyOn(requestPagerTest, 'pager');
			
			requestPagerTest.sync();
			requestPagerTest.howManyPer(10);
			
			expect(requestPagerTest.perPage).toEqual(10);
			expect(requestPagerTest.pager).toHaveBeenCalled();
		});
		
		it("should reset 'currentPage' to the 'firstPage'", function(){
			var requestPagerTest = {
					paginator_ui: {
						firstPage: 1,
						currentPage: 8,
						perPage: 5
					},
					paginator_core: {}
			};
			_.extend(requestPagerTest, new Backbone.Paginator.requestPager());
			spyOn(requestPagerTest, 'pager');
			
			requestPagerTest.sync();
			requestPagerTest.howManyPer(10);
			
			expect(requestPagerTest.currentPage).toEqual(1);
		});
	});
	
	
});