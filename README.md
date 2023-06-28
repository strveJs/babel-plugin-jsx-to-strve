# babel-plugin-jsx-to-strve

This plugin converts JSX into Tagged Templates that work with strve.

```js
// input:
const state = {
	count: 0,
};
const Hello = () => <h1 $key>{state.count}</h1>

// output:
h`<h1 $key>${state.count}</h1>`;
```

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

#### `tag=h`

By default, `babel-plugin-jsx-to-strve` will process all Tagged Templates with a tag function named `h`. To use a different name, use the `tag` option in your Babel configuration:

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