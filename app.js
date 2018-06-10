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
  /** Chain of resposibility  */
  Circle.prototype.next = function(shp) {
    if (shp) this.nexShape = shp;
    return this.nexShape;
  };
  Circle.prototype.chainDo = function(action, args, count) {
    this[action].apply(this, args);
    if (count && this.nexShape) {
      setTimeout(
        binder(this, function() {
          this.nexShape.chainDo(action, args, --count);
        }),
        20
      );
    }
  };
  /** ------------------------ */
  Circle.prototype.getID = function() {
    return this.id;
  };
  Circle.prototype.setID = function(id) {
    this.id = id;
  };

  /**
   * Rect()
   * clone every prototype method from Circle constructor
   */
  function Rect() {
    this.item = $('<div class="rect"></div>');
  }

  clone(Circle, Rect);

  /** Proxy design pattern */
  function binder(scope, fun) {
    return function() {
      return fun.apply(scope, arguments);
    };
  }

  /** Facade design pattern */
  function shapeFacade(shp) {
    return {
      color: binder(shp, shp.color),
      move: binder(shp, shp.move),
      getID: binder(shp, shp.getID)
    };
  }

  /** Decorator design pattern */
  function selfDestructDecorator(obj) {
    obj.item.click(function() {
      obj.kill();
    });
    obj.kill = function() {
      obj.item.remove();
    };
  }

  /** Observer design pattern */
  function eventDispatcherDecorator(o) {
    var list = {};
    o.addEvent = function(type, listener) {
      if (!list[type]) {
        list[type] = [];
      }

      if (list[type].indexOf(listener) === -1) {
        list[type].push(listener);
        //console.log(list[type]);
      }
    };

    o.removeEvent = function(type, listener) {
      var a = list[type];
      if (a) {
        var index = a.indexOf(listener);
        if (index > -1) {
          a.splice(index, 1);
        }
      }
    };

    o.dispatchEvent = function(e) {
      // console.log(e.type);
      // console.log(list["over"][0]);
      var aList = list[e.type];
      if (aList) {
        if (!e.target) {
          e.target = this;
        }

        for (var index in aList) {
          aList[index](e);
        }
      }
    };
  }

  // observer
  var o = {};
  var fun = function() {
    console.log("it's over 2");
  };
  eventDispatcherDecorator(o);
  o.addEvent("over", function() {
    console.log("it's over");
  });
  /** note: fun invoked 2 time
   * but process are same
   * function will called just 1 time
   */
  o.addEvent("over", fun);
  o.addEvent("over", fun);
  o.addEvent("over", function() {
    console.log("it's over 3");
  });
  // remove evert over , fun
  o.removeEvent("over", fun);
  o.dispatchEvent({ type: "over" });

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

    // create rectagle shape
    var rect = new Rect();
    rect.color("yellow");
    rect.move(40, 40);

    // click for delete rectangle shape
    selfDestructDecorator(rect);

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

  /** Fly Weight design pattern */
  function flyWeightFader(item) {
    if (item.hasClass("circle")) {
      item.fadeTo(0.5, item.css("opacity") * 0.5);
    }
  }

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
        var circle = _cf.create(type),
          index = _aCircle.length - 1;

        circle.move(left, top);
        circle.setID(_aCircle.length);
        _aCircle.push(circle);

        console.log(_aCircle);

        // chain responsibility
        if (index != -1) {
          _aCircle[index].next(circle);
        }

        return shapeFacade(circle);
      }

      // chain
      function chainTint(count) {
        var index = Math.max(0, _aCircle.length - count),
          clr =
            "#" +
            Math.floor(Math.random() * 255).toString(16) +
            Math.floor(Math.random() * 255).toString(16) +
            Math.floor(Math.random() * 255).toString(16);
        _aCircle[index].chainDo("color", [clr], count);
      }

      function tint(clr) {
        _cc.action("color", clr);
      }

      function move(left, top) {
        _cc.action("move", left, top);
      }

      function add(circle) {
        _stage.add(_aCircle[circle.getID()].get());
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
        chainTint: chainTint,
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

      // chain
      cg.chainTint(5);

      // layer and opacity
      flyWeightFader($(e.target));
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
