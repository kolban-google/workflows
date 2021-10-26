import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import PropTypes from 'prop-types';
import MessageDialog from './MessageDialog.js';
import yaml from 'js-yaml';

/**
 * <YAMLInputDialog onLoad=<function>/>
 */
class YAMLInputDialog extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            yamlText: "",
            messageDialogShow: false,
            messageText: ""
        }
    } // constructor

    _onOk() {
        try {
            const yamlObj = yaml.load(this.state.yamlText);
            this.props.onOk(yamlObj);
        }
        catch (e) {
            console.dir(e);
            this.setState({messageDialogShow: true, messageText: e.message})
        }
    }// _onOk

    _paste() {
        navigator.clipboard.readText().then((clipText) => {
            this.setState({ yamlText: clipText });
        })
    }

    render() {
        return (
            <div>
            <Dialog open={this.props.open} fullWidth>
                <DialogTitle>Load YAML</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Yaml"
                        fullWidth
                        multiline
                        value={this.state.yamlText}
                        inputProps={{
                            style: { fontFamily: 'monospace', fontSize: "small" },
                            spellCheck: 'false'
                        }}
                        onChange={
                            (e) => {
                                this.setState({ yamlText: e.target.value })
                            }
                        }
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this._paste.bind(this)}
                        variant="contained"
                        color="primary">Paste
                    </Button>
                    &nbsp;
                    <Button
                        onClick={this._onOk.bind(this)}
                        variant="contained"
                        color="primary">OK
                    </Button>
                    &nbsp;
                    <Button
                        onClick={() => {
                            this.props.onCancel();
                        }}
                        variant="contained"
                        color="primary">Cancel</Button>
                </DialogActions>
            </Dialog>
            <MessageDialog open={this.state.messageDialogShow} message={this.state.messageText} title="YAML Parse Error" onClose={() => this.setState({messageDialogShow: false})}/>
            </div>
        );
    } // render
}

YAMLInputDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired
};

export default YAMLInputDialog;