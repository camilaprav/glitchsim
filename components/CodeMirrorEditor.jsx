import d from '@dominant/core';

class CodeMirrorEditor {
  constructor(props) { this.props = props }

  onAttach = () => {
    if (this.root.childNodes.length) { return }

    this.editor = CodeMirror(this.root, {
      theme: 'monokai',
      mode: 'javascript',
      lineNumbers: true,
      ...this.props.libOpt || {},
    });

    this.editorBinding = new CodemirrorBinding(
      this.props.content, this.editor, this.props.awareness,
      { yUndoManager: this.props.undoMan });
  };

  render = () => this.root = (
    <div
      onAttach={this.onAttach}
      class={this.props.class}
    />
  );
}

export default CodeMirrorEditor;
