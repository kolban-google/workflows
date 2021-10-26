import React from 'react';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import DeleteIcon from '@material-ui/icons/Delete';
import IconButton from '@material-ui/core/IconButton';
import PropTypes from 'prop-types';

/**
 * Take as input an array of
 * {
 *   name: ...
 *   value: ...
 * }
 * 
 * objects and display these allowing items to be added, deleted, moved up or moved down.
 * 
 * Usage:
 * <NameValueList items={array of items}/>
 */

class NameValueList extends React.Component {


    constructor(props) {
        super(props);
        this.state = {
            items: [...props.items]
        }
    }

    _stateChange(items) {
        this.setState({ items: items });
        this.props.onChange(items);
    }

    _nameChange(e, i) {
        const newArray = this.state.items.map((element, index) => {
            if (i !== index) {
                return element;
            }
            return {
                name: e.target.value,
                value: element.value
            }
        });
        this._stateChange(newArray);
        //this.setState({items: newArray});
    }

    _valueChange(e, i) {
        const newArray = this.state.items.map((element, index) => {
            if (i !== index) {
                return element;
            }
            return {
                name: element.name,
                value: e.target.value
            }
        });
        this._stateChange(newArray);
        //this.setState({items: newArray});
    }

    _delete(i) {
        const newArray = this.state.items.filter((element, index) => index !== i);
        this._stateChange(newArray);
        //this.setState({items: newArray});  
    }

    _add() {
        const newArray = [...this.state.items];
        newArray.push({ name: "", value: "" });
        this._stateChange(newArray);
        //this.setState({items: newArray});
    }

    _up(i) {
        if (i === 0) {
            return;
        }
        const newArray = [...this.state.items];
        let t1 = newArray[i];
        newArray[i] = newArray[i - 1];
        newArray[i - 1] = t1;
        this._stateChange(newArray);
        //this.setState({items: newArray});
    }

    _down(i) {
        if (i === (this.state.items.length - 1)) {
            return;
        }
        const newArray = [...this.state.items];
        let t1 = newArray[i];
        newArray[i] = newArray[i + 1];
        newArray[i + 1] = t1;
        this._stateChange(newArray);
        //this.setState({items: newArray});
    }

    render() {
        return (
            <div>
                <List>
                    {this.state.items.map((item, index) => (
                        <ListItem key={index} dense>
                            {this.props.hideNames === false ? (
                                <TextField label="name"
                                    required
                                    inputProps={{
                                        spellCheck: 'false'
                                    }}
                                    variant="outlined"
                                    value={item.name} onChange={(e) => this._nameChange(e, index)} />
                            ) : ""}
                            &nbsp;
                            <TextField label="value"

                                required
                                inputProps={{
                                    spellCheck: 'false'
                                }}
                                variant="outlined"
                                value={item.value} onChange={(e) => this._valueChange(e, index)} />
                            <IconButton onClick={(e) => this._up(index)} disabled={index === 0}>
                                <ArrowUpwardIcon />
                            </IconButton>
                            <IconButton onClick={(e) => this._down(index)} disabled={index === (this.state.items.length - 1)} >
                                <ArrowDownwardIcon />
                            </IconButton>
                            <IconButton onClick={(e) => this._delete(index)}>
                                <DeleteIcon />
                            </IconButton >
                        </ListItem>
                    ))}
                </List>
                <Button onClick={this._add.bind(this)}>Add</Button>
            </div>
        );
    }
}

NameValueList.propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    hideNames: PropTypes.bool,
    onChange: PropTypes.func.isRequired
};

NameValueList.defaultProps = {
    hideNames: false
}

export default NameValueList;