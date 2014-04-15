function BedModel(options) {

  this.id = options.id;

  this.calculateBags = function() {
      return this.area * (this.depth/12) / this.capacity;
  };

  this.calculateCubicYards = function() {
    return this.area * (this.depth/27);
  };

  this.calculateSquareYards = function() {
      return this.area / 9;
  };

  this.set= function(key, val) {
    this[key] = val;

    if(key === "length" || key === "width") {
      this.area = this.width * this.length;
    }

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

function BedView(model) {

  var outerScope = this;

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

    console.log(obj);

    return this.template.replace(/\$\{([^\s\:\}]+)\}/g,
      function(match, key) {
        var val = obj[key];
        if(typeof val !== "undefined") {
          return val;
        } else {
          throw new Error("${" + key + "}, which is an expected key in the template, is not a member of the object passed. Please ensure all expected keys are included in the passed object.");
        }
      });

  };

  this.events = [
    {
      selector: '.recalc',
      evt: 'change',
      fn: function(evt) {
        outerScope.model.set($(evt.target).attr("data-controller-attr"), +$(evt.target).val());
      }
    }
  ];

  this.init = function() {
    var Evts = this.events;
    for(evt in Evts) {
      $(Evts[evt].selector).on(Evts[evt].evt, Evts[evt].fn);
    }
  };

}


var BedPlannerCollection = function(){
  this.el = "bedCollection";
  this.$el = $("#"+this.el);
  this.collection = [];
  this.add = function(model) {
    this.collection.push(model);
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
}

function AppView() {
  var appScope = this;
  this.beds = new BedPlannerCollection();
  this.$totalBedArea = $("#totalSquareFootage");
  var bedCounter = 1;
  this.addBed = function(evt) {
    var newBed = new BedModel({
      id: bedCounter
    }),
    bedView = new BedView(newBed);
    appScope.beds.$el.append(bedView.render());
    bedView.init();
    appScope.beds.add(newBed);
    bedCounter++;
  }
  this.events = [
    {
      selector: '#addBed',
      evt: 'click',
      fn: this.addBed
    }
  ];
  this.init = function() {
  var Evts = this.events;
  for(evt in Evts) {
    $(Evts[evt].selector).on(Evts[evt].evt, Evts[evt].fn);
  }
}

var app = new AppView();
app.addBed();
