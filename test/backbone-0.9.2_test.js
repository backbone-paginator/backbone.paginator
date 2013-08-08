/*globals Backbone:false, _:false, jQuery:false, $: false,
      describe: true, xdescribe: true, expect: true, sinon: true,
      it: true, xit: true, beforeEach: true, afterEach: true,
      fakeAjax: true, makePager: true */

// this file contains tests which target behaviour found in backbone 0.9.2
describe("Backbone 0.9.2 specific functionality", function() {

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

    var doSync = function(coll, respStatus, ev, done) {
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
        expect(model.trigger.withArgs(ev).called).to.equal(true);
        done();
      });

      server.restore();
    };

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
        }, PagedCollection = Backbone.Paginator.clientPager.extend(OPTS);

      it("should emit 'sync' event when has been successfully synced with the server in ClientPager", function(done){
        doSync(new PagedCollection(), 200, 'sync', done);
      });

      it("should emit 'sync' event when has been successfully synced with the server in ServerPager", function(done){
        doSync(makePager(), 200, 'sync', done);
      });

      it("should emit 'error' event when a call fails on the server in ClientPager", function(done){
        doSync(new PagedCollection(), 404, 'error', done);
      });

      it("should emit 'error' event when a call fails on the server in ServerPager", function(done){
        doSync(makePager(), 404, 'error', done);
      });
    });
  });
});
