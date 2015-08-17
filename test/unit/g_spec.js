describe('G.', function() {

  var testApp,
      appName = 'TestAppName';

  beforeEach(function () {
    testApp = G.createApp(appName);
  });

  afterEach(function () {
    G.destroyApp(appName);
  });

  describe('method createApp', function() {
    it('should create App with certain name', function () {
      expect(G.apps[appName]).toBeDefined();
      expect(testApp.name).toBe(appName);
    });
  });

  describe('method destroyApp', function() {
    it('should remove App with certain name', function () {
      var appName2 = 'TestAppName2';
      G.createApp(appName2);
      expect(G.apps[appName2]).toBeDefined();
      G.destroyApp(appName2);
      expect(G.apps[appName2]).toBeUndefined();
    });
  });

  describe('method app', function() {
    it('should return app from cache by name', function () {
      expect(G.app(appName)).toBe(testApp);
    });
  });

  describe('App', function () {

    describe('modules', function () {
      var testElement,
          testModule,
          testModuleName,
          MockConstructor;

      beforeEach(function () {
        testElement = 'TEST';
        testModuleName = 'testModule';
        MockConstructor = function () {};
        MockConstructor.prototype = {
          foo: function () {
            return testElement;
          },
          bar: function () {
            return this.foo();
          }
        };
        testModule = testApp.createModule(testModuleName, MockConstructor);
      });

      describe('createModule', function () {
        it('should create new module with constructor', function () {
          spyOn(testModule, 'foo').and.callThrough();
          expect(testModule instanceof MockConstructor).toBe(true);
          expect(testModule.bar()).toBe(testElement);
          expect(testModule.foo).toHaveBeenCalled();
          expect(testModule.foo()).toBe(testElement);
        });
      });

      describe('module', function () {
        it('should return module by name', function () {
          expect(testApp.module(testModuleName)).toBe(testModule);
        });
      });
    });

    describe('configure', function () {
      it('should write config of app', function () {
        var config = {
          a: 1,
          b: 33,
          c: 15
        };
        testApp.configure(config);
        expect(testApp.config).toBe(config);
      });
    });

    describe('sandbox', function () {
      var someElement = 'someElement',
          someContent = 'someContent';

      beforeEach(function () {
        testApp.sandbox.add(someElement, someContent);
      });

      describe('method add', function () {
        it('should add element to "Sandbox"', function () {
          expect(testApp.sandbox[someElement]).toBeDefined();
          expect(testApp.sandbox[someElement]).toBe(someContent);
        });
      });

      describe('method remove', function () {
        it('should remove element from "Sandbox"', function () {
          expect(testApp.sandbox[someElement]).toBe(someContent);
          testApp.sandbox.remove(someElement);
          expect(testApp.sandbox[someElement]).toBeUndefined();
        });
      });

      describe('method get', function () {
        it('should get element from "Sandbox"', function () {
          var content = testApp.sandbox.get(someElement);
          expect(testApp.sandbox[someElement]).toBe(content);
        });
      });

      describe('method set', function () {
        it('should set existing element in "Sandbox"', function () {
          var content = 'someOtherContent';
          testApp.sandbox.set(someElement, content);
          expect(testApp.sandbox[someElement]).toBe(content);
        });
      });
    });
  });
});

