import React, { Component, PropTypes } from 'react';
import { link } from 'react-router';
import radium from 'radium';

import {
    TableRow,
    TableRowColumn
} from 'material-ui';

// @radium
// default?

export default class EventContent extends Component {

    render(){
        let data = JSON.stringify(this.props.eventItem.data, null, '\t');
        return (
            <TableRow>
                <TableRowColumn>{this.props.eventItem.typeId}</TableRowColumn>
                <TableRowColumn>{this.props.eventItem.createdAt}</TableRowColumn>
                <TableRowColumn>{this.props.eventItem.action}</TableRowColumn>
                <TableRowColumn>{this.props.eventItem.severity}</TableRowColumn>
                <TableRowColumn>{this.props.eventItem.nodeId}</TableRowColumn>
                <TableRowColumn style={{width: '30%'}}>
                    <div>
                        <details>
                            <summary>data</summary>
                            <pre>{data}</pre>
                        </details>
                    </div>
                </TableRowColumn>
            </TableRow>
        )
    }
};
            //<TableRow>
                //<TableRowColumn>{this.props.event.typeId}</TableRowColumn>
                //<TableRowColumn>{this.props.event.action}</TableRowColumn>
                //<TableRowColumn>{this.props.event.severity}</TableRowColumn>
                //<TableRowColumn>{this.props.event.nodeId}</TableRowColumn>
                //<TableRowColumn>{this.props.event.data}</TableRowColumn>
            //</TableRow>

                //<TableRowColumn>{this.props.eventItem.action}</TableRowColumn>
                //<TableRowColumn>{this.props.eventItem.severity}</TableRowColumn>
                //<TableRowColumn>{this.props.eventItem.nodeId}</TableRowColumn>
                //<TableRowColumn>{this.props.eventItem.data}</TableRowColumn>

