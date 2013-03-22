/*globals Backbone:false, _:false, jQuery:false, $: false,
      describe: true, xdescribe: true, expect: true, sinon: true,
      it: true, xit: true, beforeEach: true, afterEach: true*/
describe('backbone.paginator.clientPager', function() {

  beforeEach(function() {
    // some test don't seem to clean up after them which makes the phantom run fail
    _.each([this.addSpy, this.removeSpy, this.defaultsStub], function(spy){
      if(spy){
        spy.restore();
      }
    });
    this.addSpy = sinon.stub(Backbone.Paginator.clientPager.prototype, 'addModel');
    this.removeSpy = sinon.stub(Backbone.Paginator.clientPager.prototype, 'removeModel');
    this.defaultsStub = sinon.stub(Backbone.Paginator.clientPager.prototype, 'setDefaults');

    this.clientPagerTest = new Backbone.Paginator.clientPager();
  });
  afterEach(function() {
    this.addSpy.restore();
    this.removeSpy.restore();
    this.defaultsStub.restore();
  });

  describe('initialize', function() {

    it('should set "defaults_ui" object with default values', function() {
      expect(this.clientPagerTest.defaults_ui).to.be.an('object');
      expect(this.clientPagerTest.defaults_ui).to.have.property('firstPage', 0);
      expect(this.clientPagerTest.defaults_ui).to.have.property('currentPage', 1);
      expect(this.clientPagerTest.defaults_ui).to.have.property('perPage', 5);
      expect(this.clientPagerTest.defaults_ui).to.have.property('totalPages', 10);
      expect(this.clientPagerTest.defaults_ui).to.have.property('pagesInRange', 4);
    });

    it('should fire "add" event', function() {
      var called = false;
      this.clientPagerTest.on("add", function(){
        called = true;
      });
      this.clientPagerTest.add(new Backbone.Model());
      expect(called).to.equal(true);
    });

    it('should fire "remove" event', function() {
      var called = false;
      this.clientPagerTest.on("remove", function(){
        called = true;
      });
      this.clientPagerTest.origModels = [];
      var model = new Backbone.Model();
      this.addSpy.restore();
      this.clientPagerTest.add(model);
      this.clientPagerTest.remove(model);

      expect(called).to.equal(true);
    });

    it('should set defauls by calling "setDefaults" function', function() {
      this.clientPagerTest.add(new Backbone.Model());
      expect(this.defaultsStub.calledOnce).to.equal(true);
    });
  });

  describe('setDefaults', function() {
    it('should set default values for "paginator_ui" from "defaults_ui" object', function() {
      this.clientPagerTest.paginator_ui = {};
      this.defaultsStub.restore();
      this.clientPagerTest.setDefaults();

      expect(this.clientPagerTest.defaults_ui).to.have.property('firstPage', 0);
      expect(this.clientPagerTest.defaults_ui).to.have.property('currentPage', 1);
      expect(this.clientPagerTest.defaults_ui).to.have.property('perPage', 5);
      expect(this.clientPagerTest.defaults_ui).to.have.property('totalPages', 10);
      expect(this.clientPagerTest.defaults_ui).to.have.property('pagesInRange', 4);
    });
    it('should not over write default values for "paginator_ui" from "defaults_ui" object when provided', function() {
      this.clientPagerTest.paginator_ui = {
        firstPage: 1,
        currentPage: 99,
        perPage: 22,
        totalPages: 100
      };
      this.defaultsStub.restore();
      this.clientPagerTest.setDefaults();

      expect(this.clientPagerTest.paginator_ui).to.have.property('firstPage', 1);
      expect(this.clientPagerTest.paginator_ui).to.have.property('currentPage', 99);
      expect(this.clientPagerTest.paginator_ui).to.have.property('perPage', 22);
      expect(this.clientPagerTest.paginator_ui).to.have.property('totalPages', 100);
      expect(this.clientPagerTest.paginator_ui).to.have.property('pagesInRange', 4);
    });
    it('should update global ui settings with values from paginator_ui & defaults_ui', function() {
      this.clientPagerTest.paginator_ui = {
        firstPage: 1,
        currentPage: 99,
        perPage: 22,
        totalPages: 100
      };
      this.defaultsStub.restore();
      this.clientPagerTest.setDefaults();

      expect(this.clientPagerTest).to.have.property('firstPage', 1);
      expect(this.clientPagerTest).to.have.property('currentPage', 99);
      expect(this.clientPagerTest).to.have.property('perPage', 22);
      expect(this.clientPagerTest).to.have.property('totalPages', 100);
      expect(this.clientPagerTest).to.have.property('pagesInRange', 4);
    });
  });
  describe('addModel', function() {
    it('should add model to "origModels" array', function() {
      this.clientPagerTest.origModels = [];
      var model = new Backbone.Model();
      this.addSpy.restore();
      this.clientPagerTest.addModel(model);

      expect(this.clientPagerTest.origModels[0]).to.equal(model);
    });
  });
  describe('removeModel', function() {
    it('should remove model from "origModels" array', function() {
      var model = new Backbone.Model();
      this.clientPagerTest.origModels = [model];
      this.removeSpy.restore();

      expect(this.clientPagerTest.origModels).to.include(model);
      this.clientPagerTest.removeModel(model);

      expect(this.clientPagerTest.origModels).not.to.include(model);
    });
  });
  describe('sync', function(){

    var spy;
    beforeEach(function(){
      if(spy){
        spy.restore();
      }
      spy = sinon.spy($, 'ajax');
    });
    afterEach(function(){
      spy.restore();
    });

    it('should call "setDefaults" function', function() {
      this.clientPagerTest.paginator_core = {};
      this.clientPagerTest.paginator_ui = {};

      this.clientPagerTest.sync(null, null, {});

      expect(this.clientPagerTest.defaults_ui).to.have.property('firstPage', 0);
      expect(this.clientPagerTest.defaults_ui).to.have.property('currentPage', 1);
      expect(this.clientPagerTest.defaults_ui).to.have.property('perPage', 5);
      expect(this.clientPagerTest.defaults_ui).to.have.property('totalPages', 10);
      expect(this.clientPagerTest.defaults_ui).to.have.property('pagesInRange', 4);
    });

    it("should use 'paginator_core' values as query options to ajax call", function(){
      var clientPagerTest = {
        paginator_core: {
          type: 'POST',
          dataType: 'jsonType'
        }
      };
      _.extend(clientPagerTest, new Backbone.Paginator.clientPager());

      var options = {};
      clientPagerTest.sync(null, null, options);

      expect(spy.callCount).to.equal(1);
      expect(spy.lastCall.args[0]['type']).to.equal("POST");
      expect(spy.lastCall.args[0]['dataType']).to.equal("jsonType");

    });

    it("should set default values for query options for the ajax call if not provided in 'paginator_core'", function(){
      var clientPagerTest = {
        paginator_core: {}
      };
      _.extend(clientPagerTest, new Backbone.Paginator.clientPager());

      var options = {};
      clientPagerTest.sync(null, null, options);

      expect(spy.callCount).to.equal(1);
      expect(spy.lastCall.args[0]['timeout']).to.equal(25000);
      expect(spy.lastCall.args[0]['cache']).to.equal(false);
      expect(spy.lastCall.args[0]['type']).to.equal("GET");
      expect(spy.lastCall.args[0]['dataType']).to.equal("jsonp");
    });

    it("should set 'processData' to 'false' for query options for the ajax call", function(){
      var clientPagerTest = {
        paginator_core: {
        }
      };
      _.extend(clientPagerTest, new Backbone.Paginator.clientPager());

      var options = {};
      clientPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['processData']).to.equal(false);
    });

    it("should set url as query option from the evaluated url function value from 'paginator_core'", function(){
      var clientPagerTest = {
        paginator_core: {
          url: function(){
            return '/rest/search/presidents';
          }
        }
      };
      _.extend(clientPagerTest, new Backbone.Paginator.clientPager());

      var options = {};
      clientPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['url']).to.equal('/rest/search/presidents');
    });

    it ("should set 'data' query param for the ajax call from 'server_api'", function(){
      var clientPagerTest = {
        paginator_ui: {},
        paginator_core: {},
        server_api: {
          pageZeroBased: 1,
          searchTerm: 'Obama',
          sortBy: 'lastName'
        }
      };
      _.extend(clientPagerTest, new Backbone.Paginator.clientPager());

      var options = {};
      clientPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['data']).to.equal('pageZeroBased=1&searchTerm=Obama&sortBy=lastName');
    });

    it("should evaluate value as function (if it is) before setting 'data' query param for the ajax call from 'server_api'", function(){
      var clientPagerTest = {
        paginator_ui : {},
        paginator_core: {},
        server_api: {
          searchTerm: function(){
            return 'Barack' + ' ' + 'Obama';
          }
        }
      };
      _.extend(clientPagerTest, new Backbone.Paginator.clientPager());

      var options = {};
      clientPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['data']).to.equal('searchTerm=Barack+Obama');
    });

    it("should create serialized representation of value before setting 'data' query param for the ajax call from 'server_api'", function(){
      var clientPagerTest = {
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
      _.extend(clientPagerTest, new Backbone.Paginator.clientPager());

      var options = {};
      clientPagerTest.sync(null, null, options);

      expect(spy.lastCall.args[0]['data']).to.equal('a[one]=1&a[two]=2&a[three]=3');
    });


    it('should use the correct "options.success" arguments', function(done){
      // This is to keep compatibility with Backbone 0.9.10
      var clientPagerTest = {
        paginator_ui: {},
        paginator_core: {
          type: 'GET',
          dataType: 'json'
        }
      };
      _.extend(clientPagerTest, new Backbone.Paginator.clientPager());

      var server = sinon.fakeServer.create();
      server.autoRespond = true;
      server.respondWith([200, { "Content-Type": "application/json" }, '{ "key": "value" }']);

      var bbVer = Backbone.VERSION.split('.');
      var promiseSuccessFormat = !(parseInt(bbVer[0], 10) === 0 &&
                                   parseInt(bbVer[1], 10) === 9 &&
                                   parseInt(bbVer[2], 10) === 10);

      var model = {};

      var options = {
        success: function(model_, resp_, options) {
          // verify
          var bbVer = Backbone.VERSION.split('.');
          if (promiseSuccessFormat) {
            var status_ = resp_;
            resp_ = model_;
            var xhr_ = options;
            expect(resp_['key']).to.equal('value');
            expect(status_).to.equal('success');
            expect(xhr_).to.have.property('status', 200);
          } else {
            expect(model_).to.equal(model);
            expect(resp_['key']).to.equal('value');
            expect(options).to.have.property('xhr');
          }
          done();
        }
      };

      // execute
      clientPagerTest.sync(null, model, options);

      server.restore();
    });

    describe('"request" "sync" and "error" events ', function() {
      var OPTS = {
          model: Backbone.Model,
          paginator_ui: {
            firstPage: 1,
            currentPage: 1,
            perPage: 3,
            totalPages: 10,
            pagesInRange: 4
          },
          paginator_core: {
            url: 'test',
            dataType: 'json'
          },
          parse: function (response) {
            return response;
          }
        }, getModels = function(){
          return _.map(_.range(30), function(i){
            return {name: "Johnny Cash", id: i};
          });
        }, PagedCollection = Backbone.Paginator.clientPager.extend(OPTS);

      it("should emit 'request' event when collection has started a request to the server", function(){
        var coll = new PagedCollection();

        var model = {
          trigger: sinon.spy()
        };

        // execute
        var options = {};
        coll.sync('read', model, options);

        // verify
        expect(model.trigger.withArgs('request').calledOnce).to.equal(true);
      });


      it("should emit 'sync' event when has been successfully synced with the server", function(done){
        var coll = new PagedCollection();

        var server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.respondWith([200, {}, ""]);

        // execute
        var model = {
          trigger: sinon.spy()
        };
        var options = {};
        coll.sync('read', model, options).always(function(){
          // verify
          expect(model.trigger.withArgs('sync').calledOnce).to.equal(true);
          done();
        });

        server.restore();
      });

      it("should emit 'error' event when a call fails on the server", function(done){
        var coll = new PagedCollection();

        var server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.respondWith([404, {}, ""]);

        // execute
        var model = {
          trigger: sinon.spy()
        };
        var options = {};
        coll.sync('read', model, options).always(function(){
          // verify
          expect(model.trigger.withArgs('error').calledOnce).to.equal(true);
          done();
        });

        server.restore();
      });
    });
  });

  describe("nextPage", function(){
    var pagerSpy;
    beforeEach(function() {
      if (pagerSpy){
        pagerSpy.restore();
      }
      pagerSpy = sinon.stub(this.clientPagerTest, 'pager');
      this.clientPagerTest.information = {totalPages : 99};
    });
    afterEach(function() {
      pagerSpy.restore();
    });
    it('should increment "currentPage" by 1 and call pager', function() {
      this.clientPagerTest.currentPage = 9;

      this.clientPagerTest.nextPage();

      expect(this.clientPagerTest.currentPage).to.equal(10);
      expect(pagerSpy.calledOnce).to.equal(true);
    });
    it('should not increment "currentPage"', function() {
      this.clientPagerTest.currentPage = 99;

      this.clientPagerTest.nextPage();

      expect(this.clientPagerTest.currentPage).to.equal(99);
      expect(pagerSpy.calledOnce).to.equal(false);
    });
    it('should accept an options param and pass it to the pager method', function() {
      this.clientPagerTest.currentPage = 9;

      var options = {success: function() {}};
      this.clientPagerTest.nextPage(options);
      expect(pagerSpy.lastCall.args[0]).to.equal(options);
    });
  });
  describe('previousPage', function() {
    var pagerSpy;
    beforeEach(function() {
      if (pagerSpy){
        pagerSpy.restore();
      }
      pagerSpy = sinon.stub(this.clientPagerTest, 'pager');
    });
    afterEach(function() {
      pagerSpy.restore();
    });
    it('should decrement "currentPage" by 1 and call pager', function() {
      this.clientPagerTest.currentPage = 9;

      this.clientPagerTest.previousPage();

      expect(this.clientPagerTest.currentPage).to.equal(8);
      expect(pagerSpy.calledOnce).to.equal(true);
    });
    it('should not decrement the page when currentPage is 1', function() {
      this.clientPagerTest.currentPage = 1;

      this.clientPagerTest.previousPage();

      expect(this.clientPagerTest.currentPage).to.equal(1);
      expect(pagerSpy.calledOnce).to.equal(false);
    });
    it('should accept an options param and pass it to the pager method', function() {
      this.clientPagerTest.currentPage = 2;

      var options = {success: function() {}};
      this.clientPagerTest.previousPage(options);
      expect(pagerSpy.lastCall.args[0]).to.equal(options);
    });
  });
  describe('goTo', function() {

    var pagerSpy;
    beforeEach(function() {
      if (pagerSpy){
        pagerSpy.restore();
      }
      pagerSpy = sinon.stub(this.clientPagerTest, 'pager');
    });
    afterEach(function() {
      pagerSpy.restore();
    });

    it('should set "currentPage" and call "pager" method', function() {
      this.clientPagerTest.goTo(98);

      expect(this.clientPagerTest.currentPage).to.equal(98);
      expect(pagerSpy.calledOnce).to.equal(true);
      this.clientPagerTest.goTo(99);
      expect(this.clientPagerTest.currentPage).to.equal(99);
    });

    it('should not do anything if goTo page is undefined', function() {
      this.clientPagerTest.currentPage = 7;
      this.clientPagerTest.goTo();

      expect(this.clientPagerTest.currentPage).to.equal(7);
      expect(pagerSpy.calledOnce).to.equal(false);
    });
  });
  describe('prevPage', function() {
    it('should be an alias for the previousPage function', function() {
      expect(this.clientPagerTest.prevPage).to.equal(this.clientPagerTest.previousPage);
    });
  });

  describe('howManyPer', function() {
    it('should set perPage, currentPage and call pager method', function() {
      var pagerSpy = sinon.stub(this.clientPagerTest, 'pager');

      this.clientPagerTest.perPage = 4;
      this.clientPagerTest.currentPage = 5;
      this.clientPagerTest.howManyPer(3);

      expect(this.clientPagerTest.currentPage).to.equal(6);
      expect(pagerSpy.calledOnce).to.equal(true);

      pagerSpy.restore();
    });
    it('should not do anything if  perPage is undefined', function() {
      var pagerSpy = sinon.stub(this.clientPagerTest, 'pager');
      this.clientPagerTest.howManyPer();

      expect(pagerSpy.calledOnce).to.equal(false);

      pagerSpy.restore();
    });
  });
  describe('bootstrap', function() {
    beforeEach(function() {
      this.defaultsStub.restore();
      var OPTS = {
        paginator_core: {
          dataType: 'json',
          url: '/'
        },
        paginator_ui: {
          currentPage: 1,
          perPage: 1
        }
      };
      var baseCollection = [{id: 1}, {id: 2}];
      var PagedCollection = Backbone.Paginator.clientPager.extend(OPTS);
      this.clientPagerTest = new PagedCollection(baseCollection);
    });
    it('should set the currentPage to 1', function() {
      this.clientPagerTest.bootstrap();
      expect(this.clientPagerTest.currentPage).to.equal(1);
    });
    it('should set the info.totalPages to 2', function() {
      this.clientPagerTest.bootstrap();
      expect(this.clientPagerTest.information.totalPages).to.equal(2);
    });
    it('should set bootstrap options to instance defaults', function() {
      this.clientPagerTest.bootstrap({totalRecords: 12});
      expect(this.clientPagerTest.totalRecords).to.equal(12);
    });
    it('should return an instance of this', function() {
      expect(this.clientPagerTest.bootstrap()).to.equal(this.clientPagerTest);
    });
  });
  describe('pager', function() {
    // TODO: write many more tests for this function
    it('should accept an options param and call a success callback', function() {
      var successCallbackSpy = sinon.spy();
      this.clientPagerTest.pager({success: successCallbackSpy});
      expect(successCallbackSpy.calledOnce).to.equal(true);
    });
    it('should not try to invoke an undefined success callback', function() {
      expect(this.clientPagerTest.pager()).to.equal(undefined);
      expect(this.clientPagerTest.pager({error: function() {}})).to.equal(undefined);
    });
  });

  //TODO: write tests for these methods
  //setSort
  //setFieldFilter
  //doFakeFieldFilter
  //setFilter
  //doFakeFilter
  //pager
  //_sort
  //_filedFilter
  //_filter
  //info
  //setPagination
});
