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
  // 4.1.2
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
  var ShapeFactory = function() {
    this.type = {}; // 'red' or 'blue'

    // 4.1.1
    this.create = function(type) {
      return new this.type[type]().get();
    };

    this.register = function(type, cls) {
      if (cls.prototype.init && cls.prototype.get) {
        this.type[type] = cls;
      }
    };
  };

  /** Adapter design pattern */
  function StageAdapter(id) {
    this.index = 0;
    this.context = $(id);
  }
  StageAdapter.prototype.SIG = "stageItem_";
  StageAdapter.prototype.add = function(item) {
    ++this.index;
    item.addClass(this.SIG + this.index);
    this.context.append(item);
  };
  StageAdapter.prototype.remove = function(index) {
    this.context.remove("." + this.SIG + index);
  };

  /**
   * Composite design pattern
   */
  function CompositeController(a) {
    this.a = a;
  }
  CompositeController.prototype.action = function(act) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    for (var item in this.a) {
      this.a[item][act].apply(this.a[item], args);
    }
  };

  /** Abstracting Singleton design pattern */
  var CircleGeneratorSingleton = (function() {
    var instance;

    function init() {
      var _aCircle = [],
        _stage,
        _cf = new ShapeFactory(),
        _cc = new CompositeController(_aCircle);

      // function _position(circle, left, top) {
      //   circle.move(left, top);
      // }

      // 2.1 create object from ShapeFactory constructor
      function registerShape(name, cls) {
        _cf.register(name, cls);
      }

      // 3.1 set value to _stage
      function setStage(stg) {
        _stage = stg;
      }

      // 4.1
      function create(left, top, type) {
        var circle = _cf.create(type);
        circle.move(left, top);
        // _position(circle, left, top);
        return circle;
      }

      function tint(clr) {
        _cc.action("color", clr);
      }

      function move(left, top) {
        _cc.action("move", left, top);
      }

      function add(circle) {
        _stage.add(circle.get());
        _aCircle.push(circle);
        console.log("Abstracting Sigleton method add _aCircle: ", _aCircle);
      }

      function index() {
        return _aCircle.length;
      }

      return {
        // 1.1 return method to public
        index: index,
        create: create,
        add: add,
        register: registerShape,
        setStage: setStage,
        tint: tint,
        move: move
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
    // 1. get method form CircleGeneratorSingleton
    var cg = CircleGeneratorSingleton.getInstance();

    console.log("document ready cg: ", cg);

    // 2. register compoent
    cg.register("red", RedCircleBuilder);
    cg.register("blue", BlueCircleBuilder);

    // 3. setStage arg come from StageAdater constructor
    cg.setStage(new StageAdapter(".advert"));

    // Event from mouse
    $(".advert").click(function(e) {
      // 4.
      var circle = cg.create(e.pageX - 25, e.pageY - 25, "red");

      console.log("$(.advert).click() circle: ", circle);

      // 5.
      cg.add(circle);
    });

    // Event from keyboard
    $(document).keypress(function(e) {
      if (e.key == "a") {
        var circle = cg.create(
          Math.floor(Math.random() * 600),
          Math.floor(Math.random() * 600),
          "blue"
        );

        cg.add(circle);
      } else if (e.key === "t") {
        cg.tint("black");
      } else if (e.key === "r") {
        cg.move("+=5px", "+=0px");
      } else if (e.key === "l") {
        cg.move("-=5px", "+=0px");
      }
    });
  });
})(window, jQuery);
