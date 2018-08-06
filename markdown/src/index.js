import { MarkdownSerializer, MarkdownParser } from 'prosemirror-markdown';

export function markdownSerializer() {
  return (state, node) => {
    const label = state.esc(node.attrs.label || '');
    const uri = state.esc(`mention://${node.attrs.type}/${node.attrs.id}`);

    state.write(`@[${label}](${uri})`)
  };
}

export function addMentionsToMarkdownSerializer(serializer) {
  return new MarkdownSerializer({
    ...serializer.nodes,
    mention: markdownSerializer(),
  }, serializer.marks);
}

export function markdownParser() {
  return {
    node: 'mention',
    getAttrs: ({ mention: { type, id, label } }) => ({ type, id, label }),
  };
}

export function addMentionsToMarkdownParser(parser) {
  return new MarkdownParser(parser.schema, parser.tokenizer, {
    ...parser.tokens,
    mention: markdownParser(),
  });
}
