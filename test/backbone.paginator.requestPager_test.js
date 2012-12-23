/*globals Backbone:false, _:false, jQuery:false, $: false,
      describe: true, expect: true, sinon: true
      it: true, beforeEach: true, afterEach: true*/
describe('backbone.paginator.requestPager',function(){

  describe('sync method', function(){

    var spy;
    beforeEach(function(){
      spy = sinon.spy($, 'ajax');
    });
    afterEach(function(){
      spy.restore();
    });

    it('should set default values for "paginator_ui" if not specified', function(){
      //Setup
      var requestPagerTest = {
        paginator_ui: {},
        paginator_core: {}
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      // execute
      var options = {};
      requestPagerTest.sync(null, null, options);

      // verify
      expect(requestPagerTest.paginator_ui.firstPage).to.equal(0);
      expect(requestPagerTest.paginator_ui.currentPage).to.equal(1);
      expect(requestPagerTest.paginator_ui.perPage).to.equal(5);
      expect(requestPagerTest.paginator_ui.totalPages).to.equal(10);
    });

    it('should not set default values for "paginator_ui" if specified', function(){
      //Setup
      var requestPagerTest = {
        paginator_ui: {
          firstPage: 10,
          currentPage: 7,
          perPage: 20,
          totalPages: 99
        },
        paginator_core: {}
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      // execute
      var options = {};
      requestPagerTest.sync(null, null, options);

      // verify
      expect(requestPagerTest.paginator_ui.firstPage).to.equal(10);
      expect(requestPagerTest.paginator_ui.currentPage).to.equal(7);
      expect(requestPagerTest.paginator_ui.perPage).to.equal(20);
      expect(requestPagerTest.paginator_ui.totalPages).to.equal(99);
    });

    it('should change scope of "paginator_ui" values to current object', function(){
      var requestPagerTest = {
        //currentPage: 999,

        paginator_ui: {
          firstPage: 10,
          someVariable: 99,
          currentPage: 1
        },
        paginator_core: {}
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      // ----- TODO: These are failing in phantomjs
      // expect(requestPagerTest.firstPage).to.be.an('undefined');
      //expect(requestPagerTest.someVariable).to.be.an('undefined');
      //expect(requestPagerTest.currentPage).to.be.an('undefined');

      // execute
      var options = {};
      requestPagerTest.sync(null, null, options);

      // verify
      expect(requestPagerTest.firstPage).to.equal(10);
      expect(requestPagerTest.someVariable).to.equal(99);
      expect(requestPagerTest.currentPage).to.equal(1);
    });

    it('should only change scope of "paginator_ui" values to current object when one not exists', function(){
      var requestPagerTest = {
        currentPage: 999,

        paginator_ui: {
          someVariable: 99,
          currentPage: 1
        },
        paginator_core: {}
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      // ----- TODO: These are failing in phantomjs
      //expect(requestPagerTest.someVariable).to.be.an('undefined');
      //expect(requestPagerTest.currentPage).to.equal(999);

      // execute
      var options = {};
      requestPagerTest.sync(null, null, options);

      // verify
      expect(requestPagerTest.someVariable).to.equal(99);
      expect(requestPagerTest.currentPage).to.equal(999);
    });

    it("should use 'paginator_core' values as query options to ajax call", function(){
      var requestPagerTest = {
        paginator_ui: {},
        paginator_core: {
          type: 'POST',
          dataType: 'jsonType'
        }
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      var options = {};
      requestPagerTest.sync(null, null, options);

      expect(spy.callCount).to.equal(1);
      expect(spy.lastCall.args[0]['type']).to.equal("POST");
      expect(spy.lastCall.args[0]['dataType']).to.equal("jsonType");

    });

    it("should set default values for query options for the ajax call if not provided in 'paginator_core'", function(){
      var requestPagerTest = {
        paginator_ui: {},
        paginator_core: {}
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      var options = {};
      requestPagerTest.sync(null, null, options);

      expect(spy.callCount).to.equal(1);
      expect(spy.lastCall.args[0]['timeout']).to.equal(25000);
      expect(spy.lastCall.args[0]['cache']).to.equal(false);
      expect(spy.lastCall.args[0]['type']).to.equal("GET");
      expect(spy.lastCall.args[0]['dataType']).to.equal("jsonp");
    });

    it("should set 'processData' to 'false' for query options for the ajax call", function(){
      var requestPagerTest = {
        paginator_ui: {},
        paginator_core: {
        }
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      var options = {};
      requestPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['processData']).to.equal(false);
    });

    it("should set url as query option from the evaluated url function value from 'paginator_core'", function(){
      var requestPagerTest = {
        paginator_ui: {},
        paginator_core: {
          url: function(){
            return '/rest/search/presidents';
          }
        }
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      var options = {};
      requestPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['url']).to.equal('/rest/search/presidents');
    });

    it ("should set 'data' query param for the ajax call from 'server_api'", function(){
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

      var options = {};
      requestPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['data']).to.equal('pageZeroBased=1&searchTerm=Obama&sortBy=lastName');
    });

    it ("should take the result of 'server_api' if it is a callable", function(){
      var requestPagerTest = {
        paginator_ui: {},
        paginator_core: {},
        server_api: function () {
          return {
            pageZeroBased: 1,
            searchTerm: function () { return 'Obama'; },
            sortBy: 'lastName'
          };
        }
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      var options = {};
      requestPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['data']).to.equal('pageZeroBased=1&searchTerm=Obama&sortBy=lastName');
    });

    it("should evaluate value as function (if it is) before setting 'data' query param for the ajax call from 'server_api'", function(){
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

      var options = {};
      requestPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['data']).to.equal('searchTerm=Barack+Obama');
    });

    it("should create serialized representation of value before setting 'data' query param for the ajax call from 'server_api'", function(){
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

      var options = {};
      requestPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['data']).to.equal('a[one]=1&a[two]=2&a[three]=3');
    });

    it("should emit 'request' event when collection has started a request to the server", function(){
      var requestPagerTest = {
        paginator_ui: {},
        paginator_core: {}
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      var model = {
        trigger: sinon.spy()
      };

      // execute
      var options = {};
      requestPagerTest.sync('read', model, options);

      // verify
      expect(model.trigger.withArgs('request').calledOnce).to.equal(true);
    });

    it("should emit 'sync' event when has been successfully synced with the server", function(done){
      var requestPagerTest = {
        paginator_ui: {},
        paginator_core: {
          type: 'GET',
          dataType: 'json'
        }
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      var server = sinon.fakeServer.create();
      server.autoRespond = true;
      server.respondWith([200, {}, ""]);

      // execute
      var model = {
        trigger: sinon.spy()
      };
      var options = {};
      requestPagerTest.sync('read', model, options).always(function(){
        // verify
        expect(model.trigger.withArgs('sync').calledOnce).to.equal(true);
        done();
      });

      server.restore();
    });

    it("should emit 'error' event when a call fails on the server", function(done){
      var requestPagerTest = {
        paginator_ui: {},
        paginator_core: {
          type: 'GET',
          dataType: 'json'
        }
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      var server = sinon.fakeServer.create();
      server.autoRespond = true;
      server.respondWith([404, {}, ""]);

      // execute
      var model = {
        trigger: sinon.spy()
      };
      var options = {};
      requestPagerTest.sync('read', model, options).always(function(){
        // verify
        expect(model.trigger.withArgs('error').calledOnce).to.equal(true);
        done();
      });

      server.restore();
    });
  });

  describe('pager method', function(){

    it("should delegate to sync method indirectly through backbone's fetch method", function(){
      var requestPagerTest = {
        paginator_ui: {},
        paginator_core: {}
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());
      var spy = sinon.spy(requestPagerTest, 'sync');

      requestPagerTest.pager();

      expect(spy.calledOnce).to.equal(true);

      spy.restore();
    });
  });

  describe("info method", function(){

    it("should return common pagination values extracted from server", function(){
      var requestPagerTest = {
        currentPage: 9,
        firstPage: 1,
        totalPages: 100,
        perPage: 20,
        totalRecords: 2000
      };
      _.extend(requestPagerTest, new Backbone.Paginator.requestPager());

      var info = requestPagerTest.info();

      expect(info.currentPage).to.equal(9);
      expect(info.firstPage).to.equal(1);
      expect(info.totalPages).to.equal(100);
      expect(info.lastPage).to.equal(100);
      expect(info.perPage).to.equal(20);
      expect(info.totalRecords).to.equal(2000);
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
      var spy = sinon.spy(requestPagerTest, 'pager');

      // 'requestNextPage' method supposed to be called after server fetch
      var options = {};
      requestPagerTest.sync(null, null, options);
      requestPagerTest.requestNextPage();

      expect(requestPagerTest.currentPage).to.equal(13);
      expect(spy.calledOnce).to.equal(true);

      spy.restore();
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
      var spy = sinon.spy(requestPagerTest, 'pager');

      // 'requestPreviousPage' method supposed to be called after server fetch
      var options = {};
      requestPagerTest.sync(null, null, options);
      requestPagerTest.requestPreviousPage();

      expect(requestPagerTest.currentPage).to.equal(11);
      expect(spy.calledOnce).to.equal(true);

      spy.restore();
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
      var spy = sinon.spy(requestPagerTest, 'pager');

      var options = {};
      requestPagerTest.sync(null, null, options);
      requestPagerTest.goTo(4);

      expect(requestPagerTest.currentPage).to.equal(4);
      expect(spy.calledOnce).to.equal(true);

      spy.restore();
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
      var spy = sinon.spy(requestPagerTest, 'pager');

      var options = {};
      requestPagerTest.sync(null, null, options);
      requestPagerTest.howManyPer(10);

      expect(requestPagerTest.perPage).to.equal(10);
      expect(spy.calledOnce).to.equal(true);

      spy.restore();
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
      var spy = sinon.spy(requestPagerTest, 'pager');

      var options = {};
      requestPagerTest.sync(null, null, options);
      requestPagerTest.howManyPer(10);

      expect(requestPagerTest.currentPage).to.equal(1);

      spy.restore();
    });
  });
});
