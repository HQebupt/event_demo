import React, { Component, PropTypes } from 'react';
import { link } from 'react-router';
import radium from 'radium';
import EventContent from './EventContent';

import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn
} from 'material-ui';

// TODO @radium
// TODO default?

export default class EventTable extends Component {

    renderHeader(){
        // TODO what if don't have this branch?
        // will react determine which element to flush?
        //if (this.props.showHeader) {
            return (
                <TableHeader
                    displaySelectAll={false}
                    adjustForCheckbox={false}
                >
                    <TableRow>
                        <TableHeaderColumn>typeId</TableHeaderColumn>
                        <TableHeaderColumn>createdAt</TableHeaderColumn>
                        <TableHeaderColumn>action</TableHeaderColumn>
                        <TableHeaderColumn>severity</TableHeaderColumn>
                        <TableHeaderColumn>nodeId</TableHeaderColumn>
                        <TableHeaderColumn style={{width: "30%"}}>data</TableHeaderColumn>
                    </TableRow>
                </TableHeader>
            )
        //}
    }

    renderContent(){
        let self = this;

        let eventList = [];
        self.props.eventItems.forEach(function(item, key){
            eventList.push(
                <EventContent
                    key={key}
                    eventItem={item}/>
            )
        });

        return eventList;
    }

    render(){
        return (
            <div>
                <Table>
                    {this.renderHeader()}
                    <TableBody>
                        {this.renderContent()}
                    </TableBody>
                </Table>
            </div>
        )
    }
};
