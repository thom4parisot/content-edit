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

  /**
   * Actual value of the editable content.
   * @type {String}
   */
  this.value = "";

  /**
   * Previous value of the editable content.
   * Normally filed when saving occurs.
   * @type {String}
   */
  this.oldValue = "";

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
  if (!sourceElement.hasAttribute("data-editable")){
    sourceElement.setAttribute("data-editable", "");
    this.options.identifier && sourceElement.setAttribute("data-editable-template", this.options.identifier);
  }

  this.sourceElement = sourceElement;
  this.templateElementLookup(this.sourceElement);

  $(this.sourceElement).trigger("editable.construct", [this]);
};

/**
 *
 * @api
 * @param {String} namespace
 * @returns {string}
 */
ContentEditPlugin.prototype.selector = function selector (namespace) {
  return "[data-editable-%ns%='%id%']"
    .replace("%ns%", namespace)
    .replace("%id%", this.templateElement.getAttribute("data-editable-template") || "");
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
  $contentElement.on("editable.saving", $.proxy(this.onSave, this));
};

/**
 * Displays the form element and let the user edit the content.
 * Usually used when transitioning to 'editing' state.
 *
 * @api
 */
ContentEditPlugin.prototype.startEdit = function startEdit () {
  var $templateElement = $(this.templateElement);
  var sourceContent = $(this.sourceElement).html();
  var override = this.options.overwriteDefaultContent;

  $templateElement.data("editable-source", this);

  if (override || (!override && this.getContent() === "")){
    this.setContent(sourceContent);
    $templateElement.find(".original-content").text(sourceContent);
  }

  $templateElement.removeClass(this.options.visibilityTogglingClass);
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
    .find(".original-content").text("").end();

  this.setContent("");
};

/**
 * Hides the form and resets everything back.
 * Usually used when transitioning back to 'idle' state.
 *
 * @api
 */
ContentEditPlugin.prototype.onSave = function onSave () {
  var userValue = this.getContent();

  if (userValue !== this.value){
    this.oldValue = this.value;
    this.value = userValue;
  }
};

/**
 * Retrieves the actual editable content value.
 *
 * @api
 * @returns {String}
 */
ContentEditPlugin.prototype.getContent = function getContent(){
  return $(this.templateElement).find("[data-editable-content]").val();
};

/**
 * Set the new content value of the Content Edit form.
 * It is not saved yet so the user can still alter it before hitting the *save* button.
 *
 * @api
 * @param {String} value
 */
ContentEditPlugin.prototype.setContent = function setContent(value){
  value = this.applyFilters(value, this.options.inputFilters);

  $(this.templateElement).find("[data-editable-content]").val(value);

  //@todo find a better way to manage the old/value (redundancy)
  this.oldValue = this.value;
  this.value = value;
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
 * Apply filters on a content, basically an editable content value.
 *
 * @todo static method?
 * @param {String} content
 * @param {Array|Function} filters
 * @returns {String}
 */
ContentEditPlugin.prototype.applyFilters = function applyFilters(content, filters){
  if (!$.isArray(filters)){
    filters = $.isFunction(filters) ? [filters] : [];
  }

  $.each(filters, function filterInputIteration(i, filter){
    if ($.isFunction(filter)){
      content = filter(content);
    }
  });

  return content;
};

/**
 * Default plugin options.
 * Override them to alter *all the future new instances* of content edition.
 *
 * @type {Object}
 */
ContentEditPlugin.defaults = {
  identifier: "",
  inputFilters: [
    "trim" in String.prototype && function(text){ return text.trim(); },
    function(text){ return text.replace("&gt;", ">").replace("&lt;", "<"); }
  ],
  overwriteDefaultContent: false,
  preventDefault: {
    "a": true,
    "form": false
  },
  visibilityTogglingClass: "hidden"
};

/**
 * Supported states of the content edition.
 * If you may add items in there, removing one of these may harm a little penguin.
 *
 * @type {Array}
 */
ContentEditPlugin.states = ["idle", "editing", "saving"];

/**
 * Find the editable template contextual to an HTML element.
 *
 * @static
 * @param {HTMLElement} context
 * @returns {jQuery} The DOM element supposed to contain a link the editable content.
 */
ContentEditPlugin.findContextSource = function findContextSource(context){
  var $this = $(context), el;

  if (!context){
    return $this;
  }

  /* jshint validthis:true */
  if (context.hasAttribute("data-editable-template") && !context.hasAttribute("data-editable")){
    el = context;
  }

  if (!el && $this.parents("form[data-editable-template]").length){
    el = $this.parents("form[data-editable-template]").get(0);
  }

  if (!el && $this.find("form[data-editable-template]").length){
    el = $this.find("form[data-editable-template]").get(0);
  }

  return $(el);
};

/**
 * Handles any form submission.
 *
 * @todo refactor with cancelEdit
 * @static
 * @param {MouseEvent} event
 */
ContentEditPlugin.UISubmitHandler = function UISubmitHandler (event) {
  /* jshint validthis:true */
  var editable = ContentEditPlugin.findContextSource(this).data("editable-source");

  if (editable.options.preventDefault.form){
    event.preventDefault();
  }

  editable.setState("saving");
};


/**
 * Handles any form cancellation.
 *
 * @todo refactor with submitEdit
 * @static
 * @param {MouseEvent} event
 */
ContentEditPlugin.UICancelHandler = function UICancelHandler (event) {
  /* jshint validthis:true */
  var editable = ContentEditPlugin.findContextSource(this).data("editable-source");

  if (editable.options.preventDefault.a){
    event.preventDefault();
  }

  editable.setState("idle");
};

/**
 * Handle the click on an editable element.
 * Delegates to a remote editable if it's an hyperlink whose anchor resolves an editable element.
 *
 * @static
 * @param {MouseEvent} event
 * @constructor
 */
ContentEditPlugin.UIEDitHandler = function UIEDitHandler (event) {
  /* jshint validthis:true */

  var target;
  var targetSelector = (this.getAttribute("href") || "").trim();

  event.preventDefault();
  target = (targetSelector[0] === "#" && $(targetSelector).get(0) ) || this;

  $(target).editable();
};

/**
 * Hook Event Delegation on a context.
 * Usually the context is `$(document)`.
 *
 * @static
 * @param {jQuery} $context
 */
ContentEditPlugin.dispatch = function dispatch($context){
  $context.on("click", "[data-editable]", ContentEditPlugin.UIEDitHandler);
  $context.on("submit", "[data-editable-template]", ContentEditPlugin.UISubmitHandler);
  $context.on("click", "[data-editable-template] [type='submit']", ContentEditPlugin.UISubmitHandler);
  $context.on("click", "[data-editable-template] [data-toggle='cancel']", ContentEditPlugin.UICancelHandler);
};


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

$.fn.editable.Constructor = ContentEditPlugin;

/*
  Hooking event delegation.
 */
(ContentEditPlugin.dispatch)($(document));


