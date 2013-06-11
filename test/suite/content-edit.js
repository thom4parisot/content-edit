(function($){
  test('Basics', function(){
    ok($.fn.editable, "Plugin exists");

    throws(function(){
      new $.fn.editable.Constructor();
    }, TypeError, "Constructor can't work if not binded to an element.");
  });
})(jQuery);