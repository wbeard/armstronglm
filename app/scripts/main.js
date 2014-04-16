function proxy(func, thisObject) {
  return(function() {
    return func.apply(thisObject, arguments);
  });
}

function BedModel(options) {

  var calculateBags = function(capacity) {
      return this.area * (this.depth/12) / capacity;
  };

  this.id = options.id;

  this.listeners = {};

  this.calculateCubicYards = function() {
    return this.area * (this.depth/27);
  };

  this.calculateSquareYards = function() {
      return this.area / 9;
  };

  this.twoBags = calculateBags(2);

  this.threeBags = calculateBags(3);

  this.set = function(key, val) {
    this[key] = val;

    if(key === "length" || key === "width") {
      this.area = this.width * this.length;
    }

    this.publish("set");

  };

  this.get = function(key) {
    return this[key];
  };

  this.hasMinimumCriteria = function(key) {
    if(key === "bags") {
      return this.area && this.depth && this.capacity;
    } else if (key === "cubic") {
      return this.area && this.depth;
    } else if (key === "squareYards") {
      return this.area;
    }
  };

}

BedModel.prototype.subscribe = function(scope, channel, callback) {
  (this.listeners[channel] || (this.listeners[channel] = [])).push({
    "scope": scope,
    "fn": callback
  });
};

BedModel.prototype.publish = function(channel, data) {
  var subscribers = this.listeners[channel];
  for(var key in subscribers) {
    if(subscribers.hasOwnProperty(key)) {
      subscribers[key].fn.apply(subscribers[key].scope, data || {});
    }
  }
};

function BedView(model) {

  function roundUp(val) {
    if(val - parseInt(val) > 0) {
      return parseInt(val) + 1;
    } else {
      return val;
    }
  }

  this.model = model;

  this.template = $("#bedTemplate").html();

  this.render = function() {
    var obj = this.model;

    return this.template.replace(/\$\{([^\s\:\}]+)\}/g,
      function(match, key) {
        var val = obj[key];
        if(typeof val !== "undefined") {
          if(typeof val === "function") {
            return val();
          } else {
            return val;
          }
        } else {
          throw new Error("${" + key + "}, which is an expected key in the template, is not a member of the object passed. Please ensure all expected keys are included in the passed object.");
        }
      });

  };

  this.events = {
    '.recalc change': function(evt) {
      this.model.set($(evt.target).attr("data-controller-attr"), +$(evt.target).val());
    }
  };

  this.init = function() {
    var Evts = this.events;
    for(evt in Evts) {
      var selector = evt.split(' ')[0],
          event = evt.split(' ')[1];
      $(selector).on(event, proxy(Evts[evt], this));
    }
  };

}

var BedPlannerCollection = function(){
  this.el = "bedCollection";
  this.$el = $("#"+this.el);
  this.collection = [];
  this.$totalBedArea = $("#totalSquareFootage");
  this.add = function(model) {
    this.collection.push(model);
    model.subscribe(this, "set", function() {
      this.$totalBedArea.text(this.total("area"));
    });
  };
  this.total = function(prop, options) {
    var total = 0,
        collection = this.collection;
      for(item in collection) {
        if(collection.hasOwnProperty(item)) {
          if(options && options.asFunction) {
            total += collection[item].get[prop]();
          } else {
            total += collection[item][prop];
          }
        }
      }
      return total || 0;
  }
};

function AppView() {
  this.beds = new BedPlannerCollection();
  var bedCounter = 1;
  this.addBed = function(evt) {
    var newBed = new BedModel({
      id: bedCounter
    }),
    bedView = new BedView(newBed);

    this.beds.$el.append(bedView.render());
    bedView.init();
    this.beds.add(newBed);
    bedCounter++;
  }
  this.events = {
    '#addBed click': this.addBed
  };
  var Evts = this.events;
  for(evt in Evts) {
    var selector = evt.split(' ')[0],
        event = evt.split(' ')[1];
    $(selector).on(event, proxy(Evts[evt], this));
  }
}

var app = new AppView();
app.addBed();
