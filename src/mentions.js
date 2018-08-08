/**
 * @type {NodeSpec}
 */
export const mentionNodeSpec = {
  attrs: {
    type: {},
    id: {},
    label: {},
  },

  group: 'inline',
  inline: true,
  selectable: false,
  atom: true,

  toDOM: node => ['span', {
    'class': 'mention',
    'data-mention-type': node.attrs.type,
    'data-mention-id': node.attrs.id,
  }, `@${node.attrs.label}`],

  parseDOM: [{
    tag: 'span[data-mention-type][data-mention-id]',

    /**
     * @param {Element} dom
     * @returns {{type: string, id: string, label: string}}
     */
    getAttrs: dom => {
      const type = dom.getAttribute('data-mention-type');
      const id = dom.getAttribute('data-mention-id');
      const label = dom.innerText;

      return { type, id, label };
    },
  }],
};

/**
 * @param {OrderedMap} nodes
 * @returns {OrderedMap}
 */
export function addMentionNodes(nodes) {
  return nodes.append({
    mention: mentionNodeSpec,
  });
}
