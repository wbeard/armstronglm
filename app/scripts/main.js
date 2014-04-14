function BedModel() {

  return {

    calculateBags: function() {
      return this.area * (this.depth/12) / this.capacity;
    },

    calculateCubicYards: function() {
      return this.area * (this.depth/27);
    },

    calculateSquareYards: function() {
      return this.area / 9;
    },

    set: function(key, val) {
      this[key] = val;

      if(key === "length" || key === "width") {
        this.area = this.width * this.length;
      }

    },

    get: function(key) {
      return this[key];
    },

    hasMinimumCriteria: function(key) {
      if(key === "bags") {
        return this.area && this.depth && this.capacity;
      } else if (key === "cubic") {
        return this.area && this.depth;
      } else if (key === "squareYards") {
        return this.area;
      }
    }

  };

}

function BedPlannerView(model) {

  function roundUp(val) {
    if(val - parseInt(val) > 0) {
      return parseInt(val) + 1;
    } else {
      return val;
    }
  }

  this.model = model;

  this.render = function(template) {
    var obj = this.model;

    return template.replace(/\$\{([^\s\:\}]+)\}/g,
      function(match, key) {
        var val = obj[key];
        if(typeof val !== "undefined") {
          return val;
        } else {
          throw new Error("${" + key + "}, which is an expected key in the template, is not a member of the object passed. Please ensure all expected keys are included in the passed object.");
        }
      });
    };

  }

  this.events = [
    {
      selector: '.recalc',
      evt: 'change',
      fn: function(evt) {
        this.model.set($(evt.target).attr("data-controller-attr"), $(evt.target).val());
      }
    }
  ];

  this.init = function() {
    var Evts = this.events;
    for(evt in Evts) {
      $(Evts[evt].selector).on(Evts[evt].evt, Evts[evt].fn);
    }
  };

  this.init();

}


BedPlannerCollection = {
  el: "bedCollection",
  $el: $(this.domId),
  init: function() {
    this.collection = [];
  },
  total: function(prop, asFunction) {
    var total = 0;
    for(item in this.collection) {
      if(collection.hasOwnProperty(item) && typeof collection[item] === "number") {
        if(asFunction) {
          total += this.collection[item].get[prop]();
        } else {
          total += this.collection[item].get[prop];
        }
      }
    }
    return total;
  }
}

