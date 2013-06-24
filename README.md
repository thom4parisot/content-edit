# Content Edit

[![Build Status](https://travis-ci.org/oncletom/content-edit.png?branch=master)](https://travis-ci.org/oncletom/content-edit)

**Content Edit** is a jQuery plugin to edit an HTML content the good way.

Its goal is to process only the frontend part: pick a content, let the user edit it and notify your backend.

**What is the good way?**
An *edit in place* is nice but can rarely catch on your UI/UX needs or more complex workflows.
Because in the real life, you may have several other requirements than the edit (your backoffice framework for example).

The idea is then to *almost look inline edit* by **fully relying on HTML forms you totally own and control**.

![Animated Demo GIF Presents…](demo/demo.gif)

## Install

### *via* bower

```bash
bower install --save oncletom/content-edit
```

### *via* npm

```bash
npm install --save oncletom/content-edit
```

### *via* git

```bash
git clone https://github.com/oncletom/content-edit.git
```

## Usage

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Are Cats more Evil then Satan?</h1>

  <!-- Editable Content -->
  <div data-editable>
    <strong>Cats rule the world.</strong>
    Cats are evil and control the world due to a virus they produce that causes
    humans to commit suicide and causes them to get the uncontrollable urge to take
    care of cats. The virus also infects ants so that when ants eat the cat poop they
    go and stand up on the edge of grass so birds will eat them and then the bird is
    infected. The bird will then fly lower or won't fly away when the cat comes near
    so the cat can eat the bird. Very evil.
  </div>

  <!-- Template Used to edit the content -->
  <form data-editable-template action="/save" method="POST">
    <label for="longtext-input-edit"></label>
    <textarea id="longtext-input-edit" name="whatever-name-you-need" data-editable-content required></textarea>

    <button type="submit">Save</button>
  </form>

  <script src="/path/to/jquery.min.js">
  <script src="/path/to/jquery.content-edit.min.js">
</body>
</html>
```

For a more in-depth example, checkout the project and [run the demo](demo/index.html).

## `data-*` Attributes API

Every setting is scoped by the `data-editable` attribute.

### `data-editable`

Notify that this HTML content is actually editable.

Minilistic example:
```html
<p data-editable>This paragraph content will be editable.</p>
```

#### `data-editable` + `href`

Used in combination, it acts as a proxy for another editable content in the document.

```html
<p data-editable id="edit-me-please">I am editable from 2 places, isn't it great?</p>

<p><a href="#edit-me-please" data-editable>Click me to edit the paragraph</a>.</p>
```

#### `data-editable` + `data-editable-template="identifier"`

Used in combination, it will use this specific and unique template for the edit.

```html
<p>This is an <a href="http://example.com" data-editable data-editable-template="shorttext">editable hyperlink</a>.</p>

…

<form action="…" method="POST" data-editable-template="shorttext">
…
</form>
```

### `data-editable-template`

Notify that this HTML tag encloses the editable template.
This HTML bit will be used by the user to edit the content.

```html
<form action="…" method="POST" data-editable-template>
…
</form>
```

### `data-editable-template`

The source content will be dropped into his element to be edited by the user.

```html
<form action="…" method="POST" data-editable-template>

  <textarea name="…" data-editable-content required></textarea>

</form>
```

### `data-toggle`

Specify what general action to perform in an editable template.

```html
<form action="…" method="POST" data-editable-template>
…
  <button type="button" data-toggle="cancel">Cancel</button>
</form>
```

**Natively supported**: *cancel* (resets and close the edit form).

## Events

Events are triggered for each *new* state change in the lifecycle of the content edit.
The plugin even uses these events internally.

### `idle`

The editable content is no more edited. It appears as it was prior to its edit.

```javascript
$("[data-editable]").on("editable.idle", function(event, editable){
  if (editable.previousState === "saving"){
    alert("Thanks for your submission!"); //you may find a better way than `alert` to inform the user.
  }
});
```

### `editing`

The editable content is asked to be edited by the user.

```javascript
// Example of AJAX saving of the content.
$("[data-editable]").on("editable.editing", function(event, editable){
  //display some help, transition fullscreen or whatever is relevant to assist the user
});
```

### `saving`

A new version of the content is requested to be saved.

```javascript
// Example of AJAX saving of the content.
$("[data-editable]").on("editable.saving", function(event, editable){
  event.preventDefault();

  var deferred = $.post("/save", {
    value: editable.value,
    oldValue: editable.oldValue
  });

  deferred.done(function saveSuccess(){
    //use the response data to invite the user to fix his submission
    //restore the initial state
    editable.setState("idle");
  });

  deferred.fail(function saveFailure(){
    //use the response data to invite the user to fix his submission
    //return back in the edit state
    editable.setState("editing");
  });
});
```

### `any`

Special event name. It is fired every time a state change.

```javascript
$("[data-editable]").on("editable.any", function(event, editable){
  console.log("Transitioning from %s to %s state.", editable.previousState, editable.state);
});
```

## License

This software is edited under the [Apache 2.0 license](http://opensource.org/licenses/Apache-2.0).

This software is developped by [Thomas Parisot](https://oncletom.io) for the [BBC R&D](http://www.bbc.co.uk/rd).

