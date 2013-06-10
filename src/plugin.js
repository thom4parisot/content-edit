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
   * @type {HTMLElement|null}
   */
  this.sourceElement = null;

  /**
   * DOM Element used to let the user edit the content.
   * @type {HTMLElement|null}
   */
  this.templateElement = null;

  /**
   * Plugins instance holder.
   * @type {Object}
   */
  this.plugins = {};

  //init process. It populates the previous attributes.
  this.init(element);
  this.initEvents();
}

/**
 * Initialize elements and resolve their dependencies between each other.
 *
 * @api
 */
ContentEditPlugin.prototype.init = function init (sourceElement) {
  this.sourceElement = sourceElement;
  this.templateElementLookup(this.sourceElement);
};

/**
 * Initialize events by… hooking events on the contentElement.
 * We act this way to let the build process totally modular and expandable at no cost.
 *
 * @api
 */
ContentEditPlugin.prototype.initEvents = function initEvents () {
  var $contentElement = $(this.sourceElement);

  $contentElement.on("editable.editing", $.proxy(this.startEdit, this));
  $contentElement.on("editable.idle", $.proxy(this.endEdit, this));
};

/**
 * Displays the form element and let the user edit the content.
 * Usually used when transitioning to 'editing' state.
 *
 * @api
 */
ContentEditPlugin.prototype.startEdit = function startEdit () {
  $(this.templateElement).data("editable-source", this);

  this.setContent(this.sourceElement.innerHTML);

  $(this.templateElement)
    .find(".original-content")
      .text(this.sourceElement.innerHTML)
      .end()
    .removeClass(this.options.visibilityTogglingClass);
};

/**
 * Set the new content value of the Content Edit form.
 * It is not saved yet so the user can still alter it before hitting the *save* button.
 *
 * @api
 * @param {String} value
 */
ContentEditPlugin.prototype.setContent = function setContent(value){
  $(this.templateElement).find("[data-editable-content]").val(value);
};

/**
 * Hides the form and resets everything back.
 * Usually used when transitioning back to 'idle' state.
 *
 * @api
 */
ContentEditPlugin.prototype.endEdit = function endEdit () {
  $(this.templateElement).data("editable-source", null);

  $(this.templateElement)
    .addClass(this.options.visibilityTogglingClass)
    .find(".original-content")
      .text("");

  this.setContent("");
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

  var $contentElement = $(this.sourceElement);

  this.previousState = this.state;
  this.state = newState;

  $contentElement.trigger("editable.any", [this]).trigger("editable." + this.state, [this]);

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
  visibilityTogglingClass: "hidden",
  preventDefault: {
    "a": true,
    "form": false
  }
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

ContentEditPlugin.findContextSource = function findContextSource(context){
  var $this = $(context), el;

  /* jshint validthis:true */
  if ($this.attr("data-editable-template")){
    el = context;
  }

  if (!el && $this.parents("form[data-editable-template]").length){
    el = $this.parents("form[data-editable-template]").get(0);
  }

  if (!el && $this.find("form[data-editable-template]").length){
    el = $this.find("form[data-editable-template]").get(0);
  }

  return $(el).data("editable-source");
};

/**
 * Handles any form submission.
 *
 * @todo refactor with cancelEdit
 */
ContentEditPlugin.submitEdit = function submitEdit (event) {
  /* jshint validthis:true */
  var editable = ContentEditPlugin.findContextSource(this);

  if (editable.options.preventDefault.form){
    event.preventDefault();
  }

  editable.setState("saving");
};


/**
 * Handles any form cancellation.
 *
 * @todo refactor with submitEdit
 */
ContentEditPlugin.cancelEdit = function cancelEdit(event) {
  /* jshint validthis:true */
  var editable = ContentEditPlugin.findContextSource(this);

  if (editable.options.preventDefault.a){
    event.preventDefault();
  }

  editable.setState("idle");
};

/*
  Hooking event delegation.
 */
(function contentEditBootstrap($document){
  function editElement(event) {
    /* jshint validthis:true */

    var target;
    var targetSelector = (this.getAttribute("href") || "").trim();

    event.preventDefault();
    target = (targetSelector[0] === "#" && $(targetSelector).get(0) ) || this;

    $(target).editable();
  }

  $document.on("click", "[data-editable]", editElement);
  $document.on("submit", "[data-editable-template]", ContentEditPlugin.submitEdit);
  $document.on("click", "[data-editable-template] [type='submit']", ContentEditPlugin.submitEdit);
  $document.on("click", "[data-editable-template] [data-toggle='cancel']", ContentEditPlugin.cancelEdit);
})($(document));


