(function(win, $) {
  function RedCircle() {}
  RedCircle.prototype.create = function() {
    this.item = $('<div class="circle"></div>');
    return this;
  };

  function BlueCircle() {}
  BlueCircle.prototype.create = function() {
    this.item = $('<div class="circle" style="background:blue"></div>');
    return this;
  };

  var CircleFactory = function() {
    this.type = {}; // 'red' or 'blue'

    this.create = function(type) {
      return new this.type[type]().create();
    };

    this.register = function(type, cls) {
      if (cls.prototype.create) {
        this.type[type] = cls;
      }
    };
  };

  var CircleGeneratorSingleton = (function() {
    var instance;

    function init() {
      var _aCircle = [],
        _stage = $(".advert"),
        _cf = new CircleFactory();

      _cf.register("red", RedCircle);
      _cf.register("blue", BlueCircle);

      function _position(circle, left, top) {
        circle.css("left", left);
        circle.css("top", top);
      }

      function create(left, top, type) {
        var circle = _cf.create(type).item;
        _position(circle, left, top);
        return circle;
      }

      function add(circle) {
        _stage.append(circle);
        _aCircle.push(circle);
      }

      function index() {
        return _aCircle.length;
      }

      return {
        index: index,
        create: create,
        add: add
      };
    }

    return {
      getInstance: function() {
        if (!instance) {
          instance = init();
        }

        return instance;
      }
    };
  })();

  $(win.document).ready(function() {
    // Event from mouse
    $(".advert").click(function(e) {
      var cg = CircleGeneratorSingleton.getInstance();
      var circle = cg.create(e.pageX - 25, e.pageY - 25, "red");

      console.log("cg: ", cg);
      console.log("circle: ", circle);

      cg.add(circle);
    });

    // Event from keyboard
    $(document).keypress(function(e) {
      if (e.key == "a") {
        var cg = CircleGeneratorSingleton.getInstance();
        var circle = cg.create(
          Math.floor(Math.random() * 600),
          Math.floor(Math.random() * 600),
          "blue"
        );

        cg.add(circle);
      }
    });
  });
})(window, jQuery);
