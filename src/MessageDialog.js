import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import PropTypes from 'prop-types';


/**
 * <MessageDialog
 *   open
 *   message
 *   title
 *   onClose
 * />
 */
class MessageDialog extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            message: this.props.message
        }
    } // constructor

    componentDidUpdate(prevProps) {
        if (prevProps.message !== this.props.message) {
            this.setState({ message: this.props.message });
        }
    } // componentDidUpdate

    render() {
        return (
            <Dialog open={this.props.open} fullWidth>
                <DialogTitle>{this.props.title}</DialogTitle>
                <DialogContent>
                    {this.state.message}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={this.props.onClose}
                        variant="contained"
                        color="primary">Close
                    </Button>
                </DialogActions>
            </Dialog>
        );
    } // render
}

MessageDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    message: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object
    ]),
    title: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default MessageDialog;