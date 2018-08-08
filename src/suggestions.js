import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

/**
 * Create a matcher that matches when a specific character is typed. Useful for @mentions and #tags.
 *
 * @param {String} char
 * @param {Boolean} allowSpaces
 * @returns {function(*)}
 */
export function triggerCharacter(char, allowSpaces = false) {
  /**
   * @param {ResolvedPos} $position
   */
  return $position => {
    // Matching expressions used for later
    const suffix = new RegExp(`\\s${char}$`);
    const regexp = allowSpaces
      ? new RegExp(`${char}.*?(?=\\s${char}|$)`, 'g')
      : new RegExp(`(?:^)?${char}[^\\s${char}]*`, 'g');

    // Lookup the boundaries of the current node
    const textFrom = $position.before();
    const textTo = $position.end();

    const text = $position.doc.textBetween(textFrom, textTo, '\0', '\0');

    let match;

    while (match = regexp.exec(text)) {
      // JavaScript doesn't have lookbehinds; this hacks a check that first character is " " or the line beginning
      const prefix = match.input.slice(Math.max(0, match.index - 1), match.index);
      if (!/^[\s\0]?$/.test(prefix)) {
        continue;
      }

      // The absolute position of the match in the document
      const from = match.index + $position.start();
      let to = from + match[0].length;

      // Edge case handling; if spaces are allowed and we're directly in between two triggers
      if (allowSpaces && suffix.test(text.slice(to - 1, to + 1))) {
        match[0] += ' ';
        to++;
      }

      // If the $position is located within the matched substring, return that range
      if (from < $position.pos && to >= $position.pos) {
        return { range: { from, to }, text: match[0] };
      }
    }
  }
}

/**
 * @returns {Plugin}
 */
export function suggestionsPlugin({
  matcher = triggerCharacter('#'),
  suggestionClass = 'ProseMirror-suggestion',
  onEnter = () => false,
  onChange = () => false,
  onExit = () => false,
  onKeyDown = () => false,
  escapeOnSelectionChange = true,
  escapeKeys = ['Escape', 'ArrowRight', 'ArrowLeft'],
  debug = false,
}) {
  return new Plugin({
    key: new PluginKey('suggestions'),

    view() {
      return {
        update: (view, prevState) => {
          const prev = this.key.getState(prevState);
          const next = this.key.getState(view.state);

          // See how the state changed
          const moved = prev.active && next.active && prev.range.from !== next.range.from;
          const started = !prev.active && next.active;
          const stopped = prev.active && !next.active;
          const changed = !started && !stopped && prev.text !== next.text;

          // Trigger the hooks when necessary
          if (stopped || moved) onExit({ view, range: prev.range, text: prev.text });
          if (changed && !moved) onChange({ view, range: next.range, text: next.text });
          if (started || moved) onEnter({ view, range: next.range, text: next.text });
        },
      };
    },

    state: {
      /**
       * Initialize the plugin's internal state.
       *
       * @returns {Object}
       */
      init() {
        return {
          active: false,
          range: {},
          text: null,
        };
      },

      /**
       * Apply changes to the plugin state from a view transaction.
       *
       * @param {Transaction} tr
       * @param {Object} prev
       *
       * @returns {Object}
       */
      apply(tr, prev) {
        const meta = tr.getMeta(this.key);
        if (meta) { return meta; }
        const { selection } = tr;
        const next = { ...prev };
        if (escapeOnSelectionChange && !tr.docChanged && tr.selectionSet) { // allow user to escape with arrow keys
          next.active = false;
        } else if (selection.from === selection.to) { // We can only be suggesting if there is no selection
          // Reset active state if we just left the previous suggestion range
          if (selection.from < prev.range.from || selection.from > prev.range.to) {
            next.active = false;
          }

          // Try to match against where our cursor currently is
          const $position = selection.$from;
          const match = matcher($position);

          // If we found a match, update the current state to show it
          if (match) {
            next.active = true;
            next.range = match.range;
            next.text = match.text;
          } else {
            next.active = false;
          }
        } else {
          next.active = false;
        }

        // Make sure to empty the range if suggestion is inactive
        if (!next.active) {
          next.range = {};
          next.text = null;
        }

        return next;
      },
    },

    props: {
      /**
       * Call the keydown hook if suggestion is active.
       *
       * @param view
       * @param event
       * @returns {boolean}
       */
      handleKeyDown(view, event) {
        const { active } = this.getState(view.state);

        if (!active) return false

        if (escapeKeys.includes(event.key)) {
          let tr = view.state.tr.setMeta(this.key, {
            active: false,
            range: {},
            text: null
          });
          view.dispatch(tr);
          return false;
        }

        return onKeyDown({ view, event });
      },

      /**
       * Setup decorator on the currently active suggestion.
       *
       * @param {EditorState} editorState
       *
       * @returns {?DecorationSet}
       */
      decorations(editorState) {
        const { active, range } = this.getState(editorState);

        if (!active) return null;

        return DecorationSet.create(editorState.doc, [
          Decoration.inline(range.from, range.to, {
            nodeName: 'span',
            class: suggestionClass,
            style: debug ? 'background: rgba(0, 0, 255, 0.05); color: blue; border: 2px solid blue;' : null,
          }),
        ]);
      },
    },
  });
}
