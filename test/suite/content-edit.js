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

  test("Uneditable elements", function(){
    var $nonEditableElement = $(".non-editable:first");

    function testSuite(){
      deepEqual(/editable-/.test($nonEditableElement.attr("class")), false, "No editable class has been detected.");
      deepEqual($("[data-editable-template].editable-editing").length, 0, "No editable form is active.");
      deepEqual($("[data-editable-template] [data-editable-content]").text(), "", "Editable form content is empty.");
    }

    testSuite();
    $nonEditableElement.trigger("click");
    testSuite();
  });

  test("Edit and Cancel (regular)", function(){
    var $editableContent = $("#qunit-fixture h2");
    $editableContent.trigger("click");

    ok($("#regular-template.editable-editing").length, "Template transitioned to editing state.");
    deepEqual($("form[data-editable-template].editable-editing").length, 1, "No other template has been opened.");
    deepEqual($("#regular-template [data-editable-content]").val(), $editableContent.text(), "Original content is ready to be edited.");
    deepEqual($("#regular-template .original-content").text(), $editableContent.text(), "Original content is also available read-only.");

    $editableContent.data("plugin_editable").setContent("Brand New Title");
    deepEqual($("#regular-template [data-editable-content]").val(), "Brand New Title", "Editable content field has changed.");
    deepEqual($("#regular-template .original-content").text(), $editableContent.text(), "Read-only content remained untouched.");

    $editableContent.data("plugin_editable").setState("idle");

    ok($("#regular-template.editable-idle").length, "Template transitioned to idle state.");
    deepEqual($("form[data-editable-template].editable-idle").length, 1, "No other template has been canceled.");
    deepEqual($("#regular-template [data-editable-content]").val(), "", "Editable content has been cleared out.");
    deepEqual($("#regular-template .original-content").text(), "", "Read-only content has been cleared out.");
    notDeepEqual($editableContent.text(), "Brand New Title", "Original title has not changed.");
  });

  test("Edit and Cancel (custom template)", function(){
    var $editableContent = $("#qunit-fixture div[data-editable-template]");
    $editableContent.trigger("click");

    ok($("#longtext-template.editable-editing").length, "Template transitioned to editing state.");
    deepEqual($("form[data-editable-template].editable-editing").length, 1, "No other template has been opened.");
    deepEqual($("#longtext-template [data-editable-content]").val(), $editableContent.html(), "Original content is ready to be edited.");
    deepEqual($("#longtext-template .original-content").text(), $editableContent.html(), "Original content is also available read-only.");

    $editableContent.data("plugin_editable").setState("idle");

    ok($("#longtext-template.editable-idle").length, "Template transitioned to idle state.");
    deepEqual($("form[data-editable-template].editable-idle").length, 1, "No other template has been canceled.");
    notDeepEqual($editableContent.text(), "Brand New Content", "Original title has not changed.");
  });

  test("Manual transformed as editable.", function(){
    expect(0);
  });
})(jQuery);