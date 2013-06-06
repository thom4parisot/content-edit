/* globals $ */
function ContentEditPlugin(element, options) {
  this.options = $.extend({}, ContentEditPlugin.defaults, options);
  this.state = "idle";
  this.previousState = this.state;

  this.sourceElement = element;
  this.contentElement = null;
  this.templateElement = null;

  this.init();
  this.initEvents();
}

/**
 *
 */
ContentEditPlugin.prototype.init = function init () {
  this.contentElementLookup(this.sourceElement);
  this.templateElementLookup(this.contentElement);

  this._transitionTo("in-edit");
};

/**
 *
 */
ContentEditPlugin.prototype.initEvents = function initEvents () {

};

/**
 *
 * @param sourceElement
 * @returns {*}
 */
ContentEditPlugin.prototype.contentElementLookup = function contentElementLookup (sourceElement) {
  var targetSelector = (sourceElement.getAttribute("href") || sourceElement.getAttribute("data-editable-target") || '').trim();

  this.contentElement = (targetSelector[0] === "#" && $(targetSelector).get(0) ) || sourceElement;

  return this.contentElement;
};

/**
 *
 * @param contentElement
 * @returns {*}
 */
ContentEditPlugin.prototype.templateElementLookup = function templateElementLookup (contentElement) {
  var templateSelector = contentElement.getAttribute("data-editable-template") || "";

  this.templateElement = $("form[data-editable-template='"+templateSelector+"']").get(0);

  return this.templateElement;
};

/**
 *
 * @param {String} newState
 * @private
 */
ContentEditPlugin.prototype._transitionTo = function _transitionTo (newState) {
  if (newState === this.state || !~ContentEditPlugin.states.indexOf(newState)){
    return false;
  }

  this.previousState = this.state;
  this.state = newState;

  $([this.sourceElement, this.contentElement])
    .trigger("state", [this])
    .trigger("state." + this.state, [this])
    .removeClass('editable-'+this.previousState)
    .addClass('editable-'+this.state);
};

/**
 *
 */
ContentEditPlugin.prototype.edit = function edit() {

};

/**
 *
 */
ContentEditPlugin.prototype.cancel = function cancel () {

};

/**
 *
 * @type {{}}
 */
ContentEditPlugin.defaults = {
};

ContentEditPlugin.states = ["idle", "in-edit", "in-save"];

$.fn.editable = function (options) {
  return this.each(function () {
    if (!$.data(this, "plugin_editable")) {
      $.data(this, "plugin_editable", new ContentEditPlugin(this, typeof options === "object" && options));
    }

    if (typeof options === "string" || options === undefined) {
      $.data(this, "plugin_editable")[options || "edit"]();
    }
  });
};


// Exposing the Plugin API
$.fn.editable.Constructor = ContentEditPlugin;

//
$(document).on("click", "[data-editable]", function (event) {
  event.preventDefault();

  var $this = $(this).editable();
});
