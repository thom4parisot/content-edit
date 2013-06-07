function ContentEditHistoryPlugin(editable){
  this.editable = editable;

  this.historyElement = null;

  this.init(editable);
}

ContentEditHistoryPlugin.prototype.init = function init(editable){
  this.historyElement = $(editable.templateElement).siblings("[data-editable-extension='history']").get(0);

  $(this.historyElement).data("content-edit-source", editable);
};

ContentEditHistoryPlugin.prototype.idle = function idle(){
  $(this.historyElement)
    .addClass("hidden");
};

ContentEditHistoryPlugin.prototype.editing = function editing(){
  $(this.historyElement)
    .removeClass("hidden");
};

ContentEditHistoryPlugin.prototype.revertRevision = function revertRevision(revisionElement){
  this.copyRevision(revisionElement);

  this.editable.setState("saving");
};

ContentEditHistoryPlugin.prototype.copyRevision = function revertRevision(revisionElement){
  this.editable.setContent( $(revisionElement).find("[data-editable-history-revision]").html().trim() );
};

ContentEditHistoryPlugin.bootstrap = function bootstrapContentEditHistoryPlugin(event, editable){
  var history = editable.plugins.history;

  if (!history){
    history = editable.plugins.history = new ContentEditHistoryPlugin(editable);
  }

  history.historyElement && history[editable.state] && history[editable.state](event);
};

ContentEditHistoryPlugin.processRevisionAction = function processRevisionAction(){
  var editable = $(this).parents("[data-editable-extension='history']").data("content-edit-source");
  var history = editable.plugins.history;
  var revisionAction = this.getAttribute("data-editable-history-action") + "Revision";

  history.historyElement && history[revisionAction] && history[revisionAction]( $(this).parents(".data-editable-history-item").get(0) );
};

(function($document){
  $document.on("state.*", "[data-editable]", ContentEditHistoryPlugin.bootstrap);
  $document.on("click", "a[data-editable-history-action]", ContentEditHistoryPlugin.processRevisionAction);
})($(document));