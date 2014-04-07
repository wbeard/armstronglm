BedPlanner = {

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

BedPlannerController = {
  init: function() {
    var Evts = this.events;
    for(evt in Evts) {
      $(Evts[evt].selector).on(Evts[evt].evt, Evts[evt].fn);
    }
  },
  events: [
    {
      selector: '.recalc',
      evt: 'change',
      fn: function(evt) {
        BedPlanner.set($(evt.target).attr("data-controller-attr"), $(evt.target).val());

        if(BedPlanner.hasMinimumCriteria("bags")) {
          $("#bagsOfMulch").text(parseInt(roundUp(BedPlanner.calculateBags())));
        }

        if(BedPlanner.hasMinimumCriteria("cubic")) {
          $("#cubicYardsOfMulch").text(parseFloat(BedPlanner.calculateCubicYards()).toFixed(2));
        }

        if(BedPlanner.hasMinimumCriteria("squareYards")) {
          $("#squareYardsOfSod").text(parseFloat(BedPlanner.calculateSquareYards()).toFixed(2));
        }
      }
    },
    {
      selector: '#inputBedArea',
      evt: 'change',
      fn: function(evt) {
        $("#inputBedLength, #inputBedWidth").val('');
      }
    },
    {
      selector: '#inputBedLength, #inputBedWidth',
      evt: 'change',
      fn: function(evt) {
        $("#inputBedArea").val('');
      }
    },
    {
      selector: '#mulchCubicFeetOtherValue',
      evt: 'click',
      fn: function(evt) {
        $("#mulchCubicFeetOther").trigger("click");
      }
    }
  ]
};

BedPlannerController.init();

function roundUp(val) {
  if(val - parseInt(val) > 0) {
    return parseInt(val) + 1;
  } else {
    return val;
  }
}