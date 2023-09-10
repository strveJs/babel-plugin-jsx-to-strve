# babel-plugin-jsx-to-strve

This plugin converts JSX into Tagged Templates that work with strve.

## Usage

In your Babel configuration (`.babelrc`, `babel.config.js`, `"babel"` field in package.json, etc), add the plugin:

```js
{
  "plugins": [
    ["babel-plugin-jsx-to-strve"]
  ]
}
```

### options

#### `tag=html`

By default, `babel-plugin-jsx-to-strve` will process all Tagged Templates with a tag function named `html`. To use a different name, use the `tag` option in your Babel configuration:

```js
{"plugins":[
  ["babel-plugin-jsx-to-strve", {
    "tag": "html"
  }]
]}
```

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2023-present, maomincoding
