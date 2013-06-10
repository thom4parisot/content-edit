# Content Edit

**Content Edit** is a jQuery plugin to edit an HTML content the good way.

Its goal is to process only the frontend part: pick a content, let the user edit it and notify your backend.

**What is the good way?**
An *edit in place* is nice but can rarely catch on your UI/UX needs or more complex workflows.
Because in the real life, you may have several other requirements than the edit (your backoffice framework for example).

The idea is then too *almost look inline edit* but
to **fully rely on HTML forms you totally own and control**.


## Concepts

Here are some key concepts to know to understand the way this plugin is architectured.

### Editable Content

This is the *content we want to edit*.

### Editable Template

This is the *template UI used to edit*.

## Install

```bash
bower install --save oncletom/content-edit
```

## Usage

```html
<!DOCTYPE html>
<html>
<body>
  <h1>Are Cats more Evil then Satan?</h1>

  <div data-editable>
    <strong>Cats rule the world.</strong>
    Cats are evil and control the world due to a virus they produce that causes
    humans to commit suicide and causes them to get the uncontrollable urge to take
    care of cats. The virus also infects ants so that when ants eat the cat poop they
    go and stand up on the edge of grass so birds will eat them and then the bird is
    infected. The bird will then fly lower or won't fly away when the cat comes near
    so the cat can eat the bird. Very evil.
  </div>

  <form data-editable-template action="/save" method="POST">
    <label for="longtext-input-edit"></label>
    <textarea id="longtext-input-edit" name="whatever-name-you-need" data-editable-content required></textarea>

    <button type="submit">Save</button>
    <button type="button" data-toggle="cancel">Cancel</button>
  </form>

  <script src="/path/to/jquery.min.js">
  <script src="/path/to/jquery.content-edit.min.js">
</body>
</html>
```

## `data-*` Attributes API

Every setting is scoped by the `data-editable` attribute.

### `data-editable`

Notify that this HTML content is actually editable.

Minilistic example:
```html
<p data-editable>This paragraph content will be editable.</p>
```

### `data-editable` + `href`

Used in combination, it acts as a proxy for another editable content in the document.

```html
<p data-editable id="edit-me-please">I am editable from 2 places, isn't it great?</p>

<p><a href="#edit-me-please" data-editable>Click me to edit the paragraph</a>.</p>
```

### `data-editable-template`

Notify that this HTML tag encloses the editable template.
This HTML bit will be used by the user to edit the content.

```html
<form action="…" method="POST" data-editable-template>
…
</form>
```

If used on on an editable content, it will use this specific template.

```html
<p>This is an <a href="http://example.com" data-editable data-editable-template="shorttext">editable hyperlink</a>.</p>

<form action="…" method="POST" data-editable-template="shorttext">
…
</form>
```

## License

## Credits

