/**
 * Content Edit Plugin Constructor
 *
 * Link and initialize elements together.
 *
 * @param {HTMLElement} element
 * @param {Object=} options
 * @constructor
 */
function ContentEditPlugin(element, options) {
  this.options = $.extend({}, ContentEditPlugin.defaults, options);

  /**
   * Active state of the content edit.
   * It is used for a naive state machine approach and transition
   * @type {string}
   */
  this.state = "idle";

  /**
   * Previous state of the content edit.
   * Mainly used to detect if we're asked to transition in a new state.
   * @type {string}
   */
  this.previousState = this.state;

  /**
   * DOM Element from which the edit has been requested (not necessarily the one we edit).
   * @type {HTMLElement}
   */
  this.sourceElement = element;

  /**
   * DOM Element we want to edit.
   * @type {HTMLElement|null}
   */
  this.contentElement = null;

  /**
   * DOM Element used to let the user edit the content.
   * @type {HTMLElement|null}
   */
  this.templateElement = null;

  //init process. It populates the previous attributes.
  this.init();
  this.initEvents();
}

/**
 * Initialize elements and resolve their dependencies between each other.
 *
 * @api
 */
ContentEditPlugin.prototype.init = function init () {
  this.contentElementLookup(this.sourceElement);
  this.templateElementLookup(this.contentElement);

  $(this.templateElement).data("content-edit-source", this);
};

/**
 * Initialize events by… hooking events on the contentElement.
 * We act this way to let the build process totally modular and expandable at no cost.
 *
 * @api
 */
ContentEditPlugin.prototype.initEvents = function initEvents () {
  var $contentElement = $(this.contentElement);

  $contentElement.on("state.editing", $.proxy(this.startEdit, this));
  $contentElement.on("state.idle", $.proxy(this.endEdit, this));
};

/**
 * Displays the form element and let the user edit the content.
 * Usually used when transitioning to 'editing' state.
 *
 * @api
 */
ContentEditPlugin.prototype.startEdit = function startEdit () {
  $(this.templateElement)
    .find("[data-editable-content]")
      .val(this.contentElement.innerHTML)
      .end()
    .find(".original-content")
      .text(this.contentElement.innerHTML)
      .end()
    .show();
};

/**
 * Hides the form and resets everything back.
 * Usually used when transitioning back to 'idle' state.
 *
 * @api
 */
ContentEditPlugin.prototype.endEdit = function endEdit () {
  $(this.templateElement)
    .hide()
    .find("[data-editable-content]")
      .val("")
      .end()
    .find(".original-content")
      .text("");
};

/**
 * Resolve the `contentElement`.
 * This can be either the clicked element or a link-targeted one.
 *
 * @param {HTMLElement} sourceElement
 * @returns {HTMLElement}
 */
ContentEditPlugin.prototype.contentElementLookup = function contentElementLookup (sourceElement) {
  var targetSelector = (sourceElement.getAttribute("href") || sourceElement.getAttribute("data-editable-target") || "").trim();

  this.contentElement = (targetSelector[0] === "#" && $(targetSelector).get(0) ) || sourceElement;

  return this.contentElement;
};

/**
 * Resolve the `templateElement`.
 * The edit process will happen in the
 *
 * @param {HTMLElement} contentElement
 * @returns {HTMLElement}
 */
ContentEditPlugin.prototype.templateElementLookup = function templateElementLookup (contentElement) {
  var templateSelector = contentElement.getAttribute("data-editable-template") || "";

  this.templateElement = $("form[data-editable-template='"+templateSelector+"']").get(0);

  return this.templateElement;
};

/**
 * Transition the edit process in a new state.
 *
 * @param {String} newState
 */
ContentEditPlugin.prototype.setState = function setState (newState) {
  if (newState === this.state || !~ContentEditPlugin.states.indexOf(newState)){
    return false;
  }

  var $contentElement = $(this.contentElement);

  this.previousState = this.state;
  this.state = newState;

  $contentElement.trigger("state", [this]).trigger("state." + this.state, [this]);

  $contentElement.add(this.templateElement)
    .removeClass("editable-"+this.previousState)
    .addClass("editable-"+this.state);
};

/**
 * Default plugin options.
 * Override them to alter *all the future new instances* of content edition.
 *
 * @type {Object}
 */
ContentEditPlugin.defaults = {
};

/**
 * Supported states of the content edition.
 * If you may add items in there, removing one of these may harm a little penguin.
 *
 * @type {Array}
 */
ContentEditPlugin.states = ["idle", "editing", "saving"];

/**
 * Public jQuery Plugin Declaration.
 *
 * @param {Object|String=} options
 * @returns {jQuery}
 */
$.fn.editable = function (options) {
  return this.each(function () {
    if (!$.data(this, "plugin_editable")) {
      $.data(this, "plugin_editable", new ContentEditPlugin(this, typeof options === "object" && options));
    }

    if (typeof options === "string" || options === undefined) {
      $.data(this, "plugin_editable").setState(options || "editing");
    }
  });
};


/*
  Exposing the Plugin API
 */
$.fn.editable.Constructor = ContentEditPlugin;

/*
  Hooking event delegation.
 */
(function contentEditBootstrap($document){
  function editElement(event) {
    /* jshint validthis:true */
    event.preventDefault();

    $(this).editable();
  }

  function cancelEdit() {
    /* jshint validthis:true */
    $(this).parents("form[data-editable-template]").data("content-edit-source").setState("idle");
  }

  $document.on("click", "[data-editable]", editElement);
  $document.on("click", "[data-editable-template] [data-toggle='cancel']", cancelEdit);
})($(document));


