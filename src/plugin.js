/**
 *
 * @param {HTMLElement} element
 * @param {Object=} options
 * @constructor
 */
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

  $(this.templateElement).data("content-edit-source", this);
};

/**
 *
 */
ContentEditPlugin.prototype.initEvents = function initEvents () {
  var $contentElement = $(this.contentElement);

  $contentElement.on("state.in-edit", $.proxy(this.displayForm, this));
  $contentElement.on("state.idle", $.proxy(this.resetForm, this));
  $contentElement.on("state.idle", $.proxy(this.hideForm, this));
};

ContentEditPlugin.prototype.displayForm = function displayForm () {
  $(this.templateElement)
    .find("[data-editable-content]")
      .val(this.contentElement.innerHTML)
      .end()
    .find(".original-content")
      .text(this.contentElement.innerHTML)
      .end()
    .show();
};

ContentEditPlugin.prototype.resetForm = function resetForm () {
  $(this.templateElement)
    .find("[data-editable-content]")
      .val("")
      .end()
    .find(".original-content")
      .text("");
};

ContentEditPlugin.prototype.hideForm = function hideForm () {
  $(this.templateElement).hide();
};

/**
 *
 * @param sourceElement
 * @returns {*}
 */
ContentEditPlugin.prototype.contentElementLookup = function contentElementLookup (sourceElement) {
  var targetSelector = (sourceElement.getAttribute("href") || sourceElement.getAttribute("data-editable-target") || "").trim();

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
ContentEditPlugin.prototype.setState = function setState (newState) {
  if (newState === this.state || !~ContentEditPlugin.states.indexOf(newState)){
    return false;
  }

  this.previousState = this.state;
  this.state = newState;

  $(this.contentElement)
    .trigger("state", [this])
    .trigger("state." + this.state, [this])
    .removeClass("editable-"+this.previousState)
    .addClass("editable-"+this.state);
};

/**
 *
 */
ContentEditPlugin.prototype.edit = function edit() {
  this.setState("in-edit");
};

/**
 *
 */
ContentEditPlugin.prototype.cancel = function cancel () {
  this.setState("idle");
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
(function contentEditBootstrap($document){
  function editElement(event) {
    /* jshint validthis:true */
    event.preventDefault();

    $(this).editable('edit');
  }

  function cancelEdit() {
    /* jshint validthis:true */
    $(this).parents("form[data-editable-template]").data("content-edit-source").cancel();
  }

  $document.on("click", "[data-editable]", editElement);
  $document.on("click", "[data-editable-template] [data-toggle='cancel']", cancelEdit);
})($(document));


