import React from 'react';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';

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

    _nameChange(e, i) {
        const na = this.state.items.map((element, index) => {
            if (i !== index) {
                return element;
            }
            return {
                name: e.target.value,
                value: element.value
            }
        });
        this.setState({items: na});
    }

    _valueChange(e, i) {
        const na = this.state.items.map((element, index) => {
            if (i !== index) {
                return element;
            }
            return {
                name: element.name,
                value: e.target.value
            }
        });
        this.setState({items: na});
    }

    _delete(i) {
        const na = this.state.items.filter((element, index) => index !== i);
        this.setState({items: na});  
    }
    _add() {
        const na = [...this.state.items];
        na.push({name: "", value: ""});
        this.setState({items: na});
    }

    _up(i) {
        if (i ===0) {
            return;
        }
        const na = [...this.state.items];
        let t1 = na[i];
        na[i] = na[i-1];
        na[i-1] = t1;
        this.setState({items: na});
    }

    _down(i) {
        if (i === (this.state.items.length-1)) {
            return;
        }
        const na = [...this.state.items];
        let t1 = na[i];
        na[i] = na[i+1];
        na[i+1] = t1;
        this.setState({items: na});
    }

    render() {
        return (
            <div>
                <List>
                    {this.state.items.map((item, index) => (
                        <ListItem key={index} dense>
                            <TextField label="name" value={item.name} onChange={(e) => this._nameChange(e, index)}/>
                            &nbsp;
                            <TextField label="value" value={item.value} onChange={(e) => this._valueChange(e, index)}/>
                            <Button onClick={(e) => this._up(index)} disabled={index===0}>Up</Button>
                            <Button onClick={(e) => this._down(index)} disabled={index===(this.state.items.length-1)}>Down</Button>
                            <Button onClick={(e) => this._delete(index)}>Delete</Button>
                        </ListItem>
                    ))}
                </List>
                <Button onClick={this._add.bind(this)}>Add</Button>
            </div>);
    }
}

export default NameValueList;