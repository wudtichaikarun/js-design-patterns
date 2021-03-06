(function(win, $) {
  /** Prototype desing pattern
   * clone properties and method
   */
  function clone(src, out) {
    for (var attr in src.prototype) {
      out.prototype[attr] = src.prototype[attr];
    }
  }

  /** Builder desing pattern
   * Circle constructor
   * */
  function Circle() {
    this.item = $('<div class="circle"></div>');
  }
  Circle.prototype.color = function(clr) {
    this.item.css("background", clr);
  };
  Circle.prototype.move = function(left, top) {
    this.item.css("left", left);
    this.item.css("top", top);
  };
  Circle.prototype.get = function() {
    return this.item;
  };

  function Rect() {
    this.item = $('<div class="rect"></div>');
  }

  /**
   * Rect()
   * clone every prototype method from Circle constructor
   */
  clone(Circle, Rect);

  /** Build red circle */
  function RedCircleBuilder() {
    this.item = new Circle();
    console.log("RedCircleBuilder this.item = new Circle(): ", this.item);
    this.init();
  }
  RedCircleBuilder.prototype.init = function() {
    // NOTHING
  };
  RedCircleBuilder.prototype.get = function() {
    return this.item;
  };

  /** Build blue circle */
  function BlueCircleBuilder() {
    this.item = new Circle();
    this.init();
  }
  BlueCircleBuilder.prototype.init = function() {
    this.item.color("blue");

    var rect = new Rect();
    rect.color("yellow");
    rect.move(40, 40);

    this.item.get().append(rect.get());
  };
  BlueCircleBuilder.prototype.get = function() {
    return this.item;
  };

  /** Factory design pattern */
  var CircleFactory = function() {
    this.type = {}; // 'red' or 'blue'

    this.create = function(type) {
      return new this.type[type]().get();
    };

    this.register = function(type, cls) {
      if (cls.prototype.init && cls.prototype.get) {
        this.type[type] = cls;
      }
    };
  };

  /** Singleton design pattern */
  var CircleGeneratorSingleton = (function() {
    var instance;

    function init() {
      var _aCircle = [],
        _stage = $(".advert"),
        _cf = new CircleFactory();

      _cf.register("red", RedCircleBuilder);
      _cf.register("blue", BlueCircleBuilder);

      // function _position(circle, left, top) {
      //   circle.move(left, top);
      // }

      function create(left, top, type) {
        var circle = _cf.create(type);
        circle.move(left, top);
        // _position(circle, left, top);
        return circle;
      }

      function add(circle) {
        _stage.append(circle.get());
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
