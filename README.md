# @quartzy/prosemirror-suggestions

[![Latest Version on NPM][ico-version]][link-npm]
[![Software License][ico-license]](LICENSE)
[![Build Status][ico-circleci]][link-circleci]
[![Total Downloads][ico-downloads]][link-downloads]

A plugin for [ProseMirror](https://prosemirror.net/) that helps you add suggestions to your editor.

"Suggestions" is a loose concept; while we originally designed this plugin around `@mentions` or `#hash-tags`, we hope
that it can be adapted to other use cases.

This plugin will not render any UI for you. The goal is to handle triggers, giving you tools to render your own UI
elements however you choose.

## Installation

```bash
yarn add @quartzy/prosemirror-suggestions
```

## Usage

An example project can be found in the `example` folder in this repository.

To use this plugin, first import the helpers:

```js
import {
  addMentionNodes,
  suggestionsPlugin,
  triggerCharacter
} from "@quartzy/prosemirror-suggestions";
// Or, for commonjs:
//   const { addMentionNodes, suggestionsPlugin, triggerCharacter } = require('@quartzy/prosemirror-suggestions');
```

Next extend the `nodes` of your schema with `addMentionNodes`:

```js
import { Schema } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";

const schema = new Schema({
  nodes: addMentionNodes(basicSchema.spec.nodes),
  marks: basicSchema.spec.marks
});
```

Finally add `suggestionsPlugin(...)` to your list of plugins:

```js
const plugins = [
  suggestionsPlugin({
    debug: true,
    matcher: triggerCharacter("@", { allowSpaces: true }),
    onEnter(args) {
      console.log("start", args);
      return false;
    },
    onChange(args) {
      console.log("change", args);
      return false;
    },
    onExit(args) {
      console.log("stop", args);
      return false;
    },
    onKeyDown({ view, event }) {
      // console.log(event.key);
      return false;
    }
  })
  /* OTHER PLUGINS HERE */
];
```

`suggestionsPlugin` accepts the following options:

- `matcher` — determines when to trigger suggestions; defaults to `triggerCharacter('#')`
- `suggestionClass` — adds a class to the active suggestion; defaults to `'ProseMirror-suggestion'`
- `debug` — adds a blue background/border to the active suggestion; defaults to `false`
- `onEnter({ view, range, text})` — when entering suggestion mode (return value ignored)
- `onChange({view, range, text})` — when the current suggestion text changes (return value ignored)
- `onExit({view, range, text})` — when leaving suggestion mode (return value ignored)
- `onKeyDown({view, event})` — equivalent to the [ProseMirror `handleKeyDown`](https://prosemirror.net/docs/ref/#view.EditorProps.handleKeyDown) callback, except only called when suggestion is active (return `true` to prevent default, otherwise return `false`)

## Development

```bash
# Run tests
yarn test

# Build distributable
yarn build

# Build and watch for changes
yarn watch
```

## Credits

- [Tristan Pemble](https://github.com/tristanpemble)
- [All Contributors][link-contributors]

## License

The Apache License, v2.0. Please see [License File](LICENSE) for more information.

[ico-version]: https://img.shields.io/npm/v/@quartzy/prosemirror-suggestions.svg?style=flat-square
[ico-license]: https://img.shields.io/badge/license-Apache%202.0-brightgreen.svg?style=flat-square
[ico-circleci]: https://img.shields.io/circleci/project/github/quartzy/prosemirror-suggestions/master.svg?style=flat-square
[ico-downloads]: https://img.shields.io/npm/dt/@quartzy/prosemirror-suggestions.svg?style=flat-square
[link-npm]: https://www.npmjs.com/package/@quartzy/prosemirror-suggestions
[link-circleci]: https://circleci.com/gh/quartzy/prosemirror-suggestions/tree/master
[link-downloads]: https://www.npmjs.com/package/@quartzy/prosemirror-suggestions
[link-contributors]: ../../contributors
