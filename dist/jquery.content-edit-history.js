(function($){ "use strict";/**
 * Content Edit Revision History constructor.
 *
 * It acts as a showcase on how to extend any behavior of the core experience of the Content Edit plugin.
 * Anyway, it hooks
 *
 * @param editable
 * @constructor
 */
function ContentEditHistoryPlugin(editable){
  /**
   * Stores a reference to the editable source we work on.
   * @type {ContentEditPlugin}
   */
  this.editable = editable;

  /**
   * DOM Element used to display the revisions history.
   * @type {HTMLElement|null}
   */
  this.historyElement = null;

  this.init(editable);
}

/**
 * Plugin Namespace.
 * @type {string}
 */
ContentEditHistoryPlugin.namespace = "history";

/**
 * Initialize the plugin for the first time.
 * It will mostly resolves dependencies and link them together.
 *
 * @param {ContentEditPlugin} editable
 */
ContentEditHistoryPlugin.prototype.init = function init(editable){
  this.historyElement = this.resolveHistoryElement(editable);

  $(this.historyElement).data("editable-source", editable);
};

/**
 * Resolve the history element location.
 * By default, a sibling in the same location, otherwise document lookup.
 *
 * @param {ContentEditPlugin} editable
 * @returns {HTMLElement}
 */
ContentEditHistoryPlugin.prototype.resolveHistoryElement = function resolveHistoryElement(editable){
  var el;
  var $templateElement = $(editable.templateElement);
  var selector = editable.selector(ContentEditHistoryPlugin.namespace);

  var lookups = [
    function(s){ return $templateElement.siblings(s); },
    function(s){ return $(s); }
  ];

  while(!el && lookups.length){
    el = lookups.shift()(selector).get(0);
  }

  return el;
};

/**
 * Hide the history when the Content Edit elements goes in `idle` state.
 *
 * @api
 */
ContentEditHistoryPlugin.prototype.idle = function idle(){
  $(this.historyElement).addClass("hidden");

  //this helps to retrieve what is the source we are working on without knowing it directly
  $(this.historyElement).data("editable-source", null);
};

/**
 * Display the history when the Content Edit element goes in `editing` state.
 *
 * @api
 */
ContentEditHistoryPlugin.prototype.editing = function editing(){
  //this helps to retrieve what is the source we are working on without knowing it directly
  $(this.historyElement).data("editable-source", this.editable);

  $(this.historyElement).removeClass("hidden");
};

/**
 * Revert to a specific revision (copy + editable.saving).
 *
 * @api
 * @param {HTMLElement} revisionElement
 */
ContentEditHistoryPlugin.prototype.revertRevision = function revertRevision(revisionElement){
  this.copyRevision(revisionElement);

  this.editable.setState("saving");
};

/**
 * Copy a revision into the editable form.
 *
 * @api
 * @param {HTMLElement} revisionElement
 */
ContentEditHistoryPlugin.prototype.copyRevision = function revertRevision(revisionElement){
  this.editable.setContent( $(revisionElement).find("[data-editable-history-revision]").html() );

  this.editable.setState("editing");
};

/**
 * Hook on the Content Edit element to determine what to do according to its state.
 *
 * @api
 * @param {MouseEvent} event
 * @param {ContentEditPlugin} editable
 */
ContentEditHistoryPlugin.UIStateHandler = function UIStateHandler(event, editable){
  var history = editable.plugins[ContentEditHistoryPlugin.namespace];

  if (!history){
    history = editable.plugins[ContentEditHistoryPlugin.namespace] = new ContentEditHistoryPlugin(editable);
  }

  // where all the magic happens!
  if (event.namespace === editable.state || event.namespace === "any"){
    history.historyElement && history[editable.state] && history[editable.state](event);
  }
};

/**
 * Handle *revision* actions and deals with the remote Content Edit form.
 *
 * @api
 */
ContentEditHistoryPlugin.processRevisionAction = function processRevisionAction(){
  var ns = ContentEditHistoryPlugin.namespace;

  var editable = $(this).parents("[data-editable-"+ns+"]").data("editable-source");
  var revisionAction = this.getAttribute("data-editable-"+ns+"-action") + "Revision";

  var history = editable.plugins[ns];
  history.historyElement && history[revisionAction] && history[revisionAction]( $(this).parents(".editable-history-item").get(0) );
};

/**
 * Hook Event Delegation on a context.
 * Usually the context is `$(document)`.
 *
 * @static
 * @param {jQuery} $context
 */
ContentEditHistoryPlugin.dispatch = function dispatch($context){
  $context.on("editable.construct editable.any", "[data-editable]", ContentEditHistoryPlugin.UIStateHandler);
  $context.on("click", "a[data-editable-history-action]", ContentEditHistoryPlugin.processRevisionAction);
};

$.fn.editable.historyPluginConstructor = ContentEditHistoryPlugin;

(ContentEditHistoryPlugin.dispatch)($(document));})(jQuery,document,window);