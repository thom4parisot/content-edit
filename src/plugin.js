/* globals $ */
function ContentEditPlugin (element, options){
  this.element = element;
  this.options = $.extend({}, ContentEditPlugin.defaults, options);
  this.state = "idle";
  this.init();
}

ContentEditPlugin.prototype.init = function () {
};

ContentEditPlugin.prototype.toggle = function toggle(){

};

ContentEditPlugin.defaults = {};

ContentEditPlugin.states = ["idle", "in-edit", "in-save"];

$.fn.editable = function ( options ) {
  return this.each(function() {
    if (!$.data(this, "plugin_editable")) {
      $.data(this, "plugin_editable", new ContentEditPlugin(this, typeof options === "object" && options));
    }

    if (typeof options === "string" || options === undefined){
      $.data(this, "plugin_editable")[options || "edit"]();
    }
  });
};

$(document).on("click", "[data-editable]", function(event){
  event.preventDefault();

  var $this = $(this).editable();
});
