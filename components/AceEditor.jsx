import ace from 'brace';
import 'brace/theme/solarized_dark';
import 'brace/mode/javascript';

class AceEditor {
  constructor(props) { this.props = props }

  onAttach = () => {
    if (!this.root.childNodes.length) {
      this.editor = ace.edit(this.root);
      this.editor.session.setTabSize(2);
      this.onBeforeUpdate();

      this.editor.session.on('change', () => {
        this.lastContent = this.props.content = this.editor.getValue();
      });
    }

    d.on('beforeUpdate', this.onBeforeUpdate);
  };

  onDetach = () => d.off('beforeUpdate', this.onBeforeUpdate);

  onBeforeUpdate = () => {
    let { theme, mode, content } = this.props;

    if (this.lastTheme !== theme) {
      this.editor.setTheme(theme);
      this.lastTheme = theme;
    }

    if (this.lastMode !== mode) {
      this.editor.session.setMode(mode);
      this.lastMode = mode;
    }

    if (this.lastContent !== content) {
      this.editor.setValue(content);
      this.editor.clearSelection();
      this.lastContent = content;
    }
  };

  render = () => this.root = (
    <div
      onAttach={this.onAttach}
      onDetach={this.onDetach}
      class={this.props.class}
    />
  );
}

export default AceEditor;