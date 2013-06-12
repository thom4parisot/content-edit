(function($){
  "use strict";

  var ContentEditPlugin = $.fn.editable.Constructor;

  module("ContentEditPlugin");

  function regularTests($editableContent, template){
    var $template = $("#" + (template || "regular") + "-template");
    var $cancelButton = $template.find("[data-toggle='cancel']");
    $editableContent.trigger("click");

    ok($template.hasClass("editable-editing"), "Template transitioned to editing state.");
    deepEqual($("form[data-editable-template].editable-editing").length, 1, "No other template has been opened.");
    deepEqual($template.find("[data-editable-content]").val(), $editableContent.text(), "Original content is ready to be edited.");
    deepEqual($template.find(".original-content").text(), $editableContent.text(), "Original content is also available read-only.");

    $editableContent.data("plugin_editable").setContent("Brand New Title");
    deepEqual($template.find("[data-editable-content]").val(), "Brand New Title", "Editable content field has changed.");
    deepEqual($template.find(".original-content").text(), $editableContent.text(), "Read-only content remained untouched.");

    $cancelButton.trigger("click");

    ok($template.hasClass("editable-idle"), "Template transitioned to idle state.");
    deepEqual($("form[data-editable-template].editable-idle").length, 1, "No other template has been canceled.");
    deepEqual($template.find("[data-editable-content]").val(), "", "Editable content has been cleared out.");
    deepEqual($template.find(".original-content").text(), "", "Read-only content has been cleared out.");
    notDeepEqual($editableContent.text(), "Brand New Title", "Original title has not changed.");
  }

  function customTemplateTests($editableContent){
    $editableContent.trigger("click");

    ok($("#longtext-template.editable-editing").length, "Template transitioned to editing state.");
    deepEqual($("form[data-editable-template].editable-editing").length, 1, "No other template has been opened.");
    deepEqual($("#longtext-template [data-editable-content]").val(), $editableContent.html(), "Original content is ready to be edited.");
    deepEqual($("#longtext-template .original-content").text(), $editableContent.html(), "Original content is also available read-only.");

    $editableContent.data("plugin_editable").setState("idle");

    ok($("#longtext-template.editable-idle").length, "Template transitioned to idle state.");
    deepEqual($("form[data-editable-template].editable-idle").length, 1, "No other template has been canceled.");
    notDeepEqual($editableContent.text(), "Brand New Content", "Original title has not changed.");
  }

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
    regularTests( $("#qunit-fixture h2") );
  });

  test("Edit and Cancel (custom template)", function(){
    customTemplateTests($("#qunit-fixture div[data-editable-template]"));
  });

  test("Manual transformed as editable (regular)", function(){
    regularTests( $(".non-editable:first").editable({}) );
  });

  test("Manual transformed as editable (custom template)", function(){
    regularTests( $(".non-editable:first").editable({
      identifier: "longtext"
    }), "longtext");
  });

  test("Prevent Default And Custom Save", function(){
    var $editableElement = $(".non-editable:first");
    var newValue = "Jolly Jumper";

    expect(2);

    $editableElement.editable({
      identifier: "longtext",
      //opposite values of the default ones
      preventDefault: {
        "form": true
      }
    });

    $editableElement.trigger("click");
    $("#longtext-template [data-editable-content]").val(newValue);

    $editableElement.on("editable.saving", function(event, editable){
      strictEqual(editable.oldValue, "Edit me if you can.");
      strictEqual(editable.value, newValue);
    });

    $("#longtext-template [type='submit']").trigger("click");
  });

  /*
   Previously, the second opening would not work due to an editable.sourceElement mismatch.
   Especially because the check on the `editable.state` was misleading (perceived as editing though it was idle).
   */
  test("Tricky workflow", function(){
    var $regularTemplateContent = $("#editable-title");
    var $regularProxyTemplateContent = $("a[data-editable]");
    var $cancelButton = $("#regular-template [data-toggle='cancel']");

    $regularTemplateContent.trigger("click");
    ok($("#regular-template.editable-editing").length, "Template transitioned to editing state.");

    $cancelButton.trigger("click");
    ok($("#regular-template.editable-idle").length, "Template transitioned to idle state.");

    $regularProxyTemplateContent.trigger("click");
    ok($("#regular-template.editable-editing").length, "Template transitioned to editing state.");

    $cancelButton.trigger("click");
    ok($("#regular-template.editable-idle").length, "Template transitioned to idle state.");

    $regularTemplateContent.trigger("click");
    ok($("#regular-template.editable-editing").length, "Template transitioned to editing state.");
  });
})(jQuery);