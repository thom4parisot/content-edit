
function Content(node){
  this.type = "text";
  this.value = "";
  this.node = node;

  this._validators = [];
}

Content.prototype.addValidator = function(fn){

};

Content.prototype.validate = function validate(){

};