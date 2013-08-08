/*globals Backbone:false, _:false, jQuery:false, $: false,
      describe: true, xdescribe: true, expect: true, sinon: true,
      it: true, xit: true, beforeEach: true, afterEach: true,
      fakeAjax: true, makePager: true */

// this file contains tests which target behaviour found in backbone 1.0.0

/* 0.9.10 had changed the arguments but 1.0.0 reverted back to what it used to be
   in 0.9.9 and earlier */
describe("Backbone 1.0.0 specific functionality", function() {

  it("should use 'promise-style' `options.success` arguments for sync", function(done){

    var requestPagerTest = makePager();
    var options = {
      success: function(response, status, xhr) {
        expect(response['key']).to.equal('value');
        expect(status).to.equal('success');
        expect(xhr).to.have.property('status', 200);
        done();
      }
    };

    fakeAjax(function(requests){
      requestPagerTest.sync(null, {}, options);
      expect(requests.length).to.equal(1);
      requests[0].respond(200, {"Content-Type": "application/json"},'{ "key": "value" }');
    });
  });

  it("should use 'promise-style' `options.success` arguments for fetch", function(done){

    var requestPagerTest = makePager();
    var options = {
      success: function(model, response, options) {
        expect(model.toJSON()[0].key).to.equal("value");
        expect(response['key']).to.equal('value');
        done();
      }
    };

    fakeAjax(function(requests){
      requestPagerTest.fetch(options);
      expect(requests.length).to.equal(1);
      requests[0].respond(200, {"Content-Type": "application/json"},'{ "key": "value" }');
    });
  });

  it('should use "promise-style" `options.error` arguments', function(done){

    var requestPagerTest = makePager();
    var options = {
      error: function(model, xhr, options) {
        expect(model.toJSON().length).to.equal(0);
        expect(xhr).to.have.property("status", 401);
        expect(options).to.have.property("data", "");
        done();
      }
    };

    fakeAjax(function(requests){
      requestPagerTest.fetch(options);
      expect(requests.length).to.equal(1);
      requests[0].respond(401, {"Content-Type": "application/json"}, "{}");
    });
  });

  describe('"sync" and "error" events ', function() {
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
      }, PagedCollection = Backbone.Paginator.clientPager.extend(OPTS),

      doSync = function(coll, respStatus, ev, done) {
        var server = sinon.fakeServer.create();
        server.autoRespond = true;
        server.respondWith([respStatus, {}, ""]);

        // execute
        var model = {
          trigger: sinon.spy()
        };
        var options = {};
        coll.sync('read', model, options).always(function(){
          // verify
          expect(model.trigger.withArgs(ev).called).to.equal(false);
          done();
        });

        server.restore();
      };

    it("should not emit 'sync' event when has been successfully synced with the server in ClientPager", function(done){
      doSync(new PagedCollection(), 200, 'sync', done);
    });

    it("should not emit 'sync' event when has been successfully synced with the server in RequestPager", function(done){
      doSync(makePager(), 200, 'sync', done);
    });

    it("should not emit 'error' event when a call fails on the server in ClientPager", function(done){
      doSync(new PagedCollection(), 404, 'error', done);
    });

    it("should not emit 'error' event when a call fails on the server in RequestPager", function(done){
      doSync(makePager(), 404, 'error', done);
    });
  });
});
