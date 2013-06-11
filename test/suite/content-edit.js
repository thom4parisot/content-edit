(function($){
  "use strict";

  var ContentEditPlugin = $.fn.editable.Constructor;

  test("Basics", function(){
    ok($.fn.editable, "Plugin exists");

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
})(jQuery);