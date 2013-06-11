/**
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
};

ContentEditHistoryPlugin.prototype.resolveHistoryElement = function resolveHistoryElement(editable){
  var el;
  var $templateElement = $(editable.templateElement);

  return $templateElement.siblings("[data-editable-"+ContentEditHistoryPlugin.namespace+"]").get(0);
};

/**
 * Hide the history when the Content Edit elements goes in `idle` state.
 *
 * @api
 */
ContentEditHistoryPlugin.prototype.idle = function idle(){
  $(this.historyElement).addClass("hidden");

  //this helps to retrieve what is the source we are working on without knowing it directly
  $(this.historyElement).data("content-edit-source", null);
};

/**
 * Display the history when the Content Edit element goes in `editing` state.
 *
 * @api
 */
ContentEditHistoryPlugin.prototype.editing = function editing(){
  //this helps to retrieve what is the source we are working on without knowing it directly
  $(this.historyElement).data("content-edit-source", this.editable);

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
  this.editable.setContent( $(revisionElement).find("[data-editable-history-revision]").html().trim() );
};

/**
 * Hook on the Content Edit element to determine what to do according to its state.
 *
 * @api
 * @param {MouseEvent} event
 * @param {ContentEditPlugin} editable
 */
ContentEditHistoryPlugin.bootstrap = function bootstrapContentEditHistoryPlugin(event, editable){
  var history = editable.plugins[ContentEditHistoryPlugin.namespace];

  if (!history){
    history = editable.plugins[ContentEditHistoryPlugin.namespace] = new ContentEditHistoryPlugin(editable);
  }

  // where all the magic happens!
  history.historyElement && history[editable.state] && history[editable.state](event);
};

/**
 * Handle *revision* actions and deals with the remote Content Edit form.
 *
 * @api
 */
ContentEditHistoryPlugin.processRevisionAction = function processRevisionAction(){
  var ns = ContentEditHistoryPlugin.namespace;

  var editable = $(this).parents("[data-editable-"+ns+"]").data("content-edit-source");
  var revisionAction = this.getAttribute("data-editable-"+ns+"-action") + "Revision";

  var history = editable.plugins[ns];
  history.historyElement && history[revisionAction] && history[revisionAction]( $(this).parents(".editable-history-item").get(0) );
};

(function($document){
  $document.on("editable.any", "[data-editable]", ContentEditHistoryPlugin.bootstrap);
  $document.on("click", "a[data-editable-history-action]", ContentEditHistoryPlugin.processRevisionAction);
})($(document));