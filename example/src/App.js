import React, { Component } from 'react';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { plugins, schema } from './editor';

import 'sanitize.css/sanitize.css';
import 'prosemirror-example-setup/style/style.css';
import 'prosemirror-menu/style/menu.css';
import 'prosemirror-view/style/prosemirror.css';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      view: null,
    };
  }

  componentDidMount() {
    const doc = schema.node('doc', null, [
      schema.node('paragraph', null, [
        schema.text('Before '),
        schema.node('mention', { type: 'user', id: 42, label: 'Some User' }),
        schema.text(' and after @abc @def @ghi @jkl @mno @pqr @stu @vwx @yz')
      ]),
    ]);

    const state = EditorState.create({ doc, schema, plugins: plugins(this.setState) });
    const editor = new EditorView(this.editorEl, {
      state,
      dispatchTransaction: (transaction) => {
        const newState = this.state.editor.apply(transaction);

        this.setState({
          editor: newState,
        });

        editor.updateState(newState);
      },
    });

    this.setState({ editor: state });
  }

  render() {
    return (
      <div className="App">
        <div className="column" ref={el => this.editorEl = el}>
        </div>
        <div className="column">
          <pre>
            {this.state.editor ? JSON.stringify(this.state.editor.toJSON(), null, 2) : ''}
          </pre>
        </div>
        <div className="column">
          <pre>

          </pre>
        </div>
      </div>
    );
  }
}

export default App;
