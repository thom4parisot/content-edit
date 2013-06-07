function ContentEditHistoryPlugin(editable){
  this.editable = editable;

  this.historyElement = null;

  this.init(editable);
}

ContentEditHistoryPlugin.prototype.init = function init(editable){
  this.historyElement = $(editable.templateElement).siblings("[data-editable-extension='history']").get(0);
};

ContentEditHistoryPlugin.prototype.idle = function idle(){
  $(this.historyElement)
    .addClass("hidden");
};

ContentEditHistoryPlugin.prototype.editing = function editing(){
  $(this.historyElement)
    .removeClass("hidden");
};


(function($document){

  function spyOn(event, editable){
    var history = editable.plugins.history;

    if (!history){
      history = editable.plugins.history = new ContentEditHistoryPlugin(editable);
    }

    history.historyElement && history[editable.state] && history[editable.state](event);
  }

  $document.on("state.*", "[data-editable]", spyOn);
})($(document));