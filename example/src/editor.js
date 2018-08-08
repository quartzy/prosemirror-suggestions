import { Schema } from 'prosemirror-model';
import { schema as basicSchema } from 'prosemirror-schema-basic';
import { exampleSetup } from 'prosemirror-example-setup';

import { addMentionNodes, suggestionsPlugin, triggerCharacter } from '@quartzy/prosemirror-suggestions';

export const schema = new Schema({
  nodes: addMentionNodes(basicSchema.spec.nodes),
  marks: basicSchema.spec.marks,
});

export const plugins = setState => {
  return [
    suggestionsPlugin({
      debug: true,
      matcher: triggerCharacter('@', { allowSpaces: true }),
      onEnter(args) {
        console.log('start', args);
      },
      onChange(args) {
        console.log('change', args);
      },
      onExit(args) {
        console.log('stop', args);
      },
      onKeyDown({ view, event }) {
        // console.log(event.key);
        return false;
      },
    }),
    ...exampleSetup({ schema }),
  ];
};
