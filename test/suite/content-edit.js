(function($){
  "use strict";

  var ContentEditPlugin = $.fn.editable.Constructor;

  test("Basics", function(){
    ok($.fn.editable, "Plugin exists");
    deepEqual($("[data-editable-template][class*='editable-']").length, 0, "Everything remained untouched.");

    throws(function(){
      new $.fn.editable.Constructor();
    }, TypeError, "Constructor can't work if not binded to an element.");
  });

  test("findContextSource", function(){
    var f = ContentEditPlugin.findContextSource;

    equal(f( document.querySelector("#qunit")).get(0), null);
    equal(f( document.querySelector("#idontexist")).get(0), null);
    equal(f( document.querySelector("#regular-template") ).get(0), document.querySelector("#regular-template"));
    equal(f( document.querySelector("#qunit-fixture") ).get(0), document.querySelector("#longtext-template"));
    equal(f( document.querySelector("textarea") ).get(0), document.querySelector("#longtext-template"));
  });

  test("Basic Edit and Cancel", function(){
    var $editableContent = $("#qunit-fixture h2");
    $editableContent.trigger("click");

    ok(document.querySelector("#regular-template.editable-editing"), "Template transitioned to editing state.");
    deepEqual(document.querySelectorAll("form[data-editable-template].editable-editing").length, 1, "No other template has been opened.");
    deepEqual($("#regular-template [data-editable-content]").val(), $editableContent.text(), "Original content is ready to be edited.");
    deepEqual($("#regular-template .original-content").text(), $editableContent.text(), "Original content is also available read-only.");

    $editableContent.data("plugin_editable").setContent("Brand New Title");
    deepEqual($("#regular-template [data-editable-content]").val(), "Brand New Title", "Editable content field has changed.");
    deepEqual($("#regular-template .original-content").text(), $editableContent.text(), "Read-only content remained untouched.");

    $editableContent.data("plugin_editable").setState("idle");

    ok(document.querySelector("#regular-template.editable-idle"), "Template transitioned to idle state.");
    deepEqual(document.querySelectorAll("form[data-editable-template].editable-idle").length, 1, "No other template has been canceled.");
    deepEqual($("#regular-template [data-editable-content]").val(), "", "Editable content has been cleared out.");
    deepEqual($("#regular-template .original-content").text(), "", "Read-only content has been cleared out.");
    notDeepEqual($editableContent.text(), "Brand New Title", "Original title has not changed.");
  });
})(jQuery);