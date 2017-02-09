// Copyright 2015, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { findDOMNode } from 'react-dom';

import merge from 'lodash/merge';

import Messenger from 'src-common/lib/Messenger';
import config from 'src-config';
import RackHDRestAPIv2_0 from 'src-common/messengers/RackHDRestAPIv2_0';
import ProgressEventsMessenger from 'src-common/messengers/ProgressEventsMessenger';
import AppContainer from 'src-common/views/AppContainer';
import GraphProgressTable from './GraphProgressTable';
import EventTable from './EventTable';
import {LinearProgress, AppBar} from 'material-ui';
import {
    FlatButton,
    DropDownMenu,
    MenuItem,
    TextField
} from 'material-ui';

export default class App extends Component {

    constructor() {
        super();

        let self = this;

        self.tableHeaderSent = true;
        self.userMap = ['heartbeat', 'polleralert', 'graph', 'node'];
        self.messagesEnd;

        self.eventList = [];

        console.log("Starting to monitor websocket");
        self.events = new Messenger('text', config.MonoRail_WSS);
        self.events.connect();
        self.events.on('message', rcv => {

            let newState = {};

            if(! self.state.hasFirstEvent) {
                newState.hasFirstEvent = true;
                self.eventList = [];
            }

            let exp = new RegExp('^'+self.userMap[self.state.userOption - 1]);
            if ((rcv.deliveryInfo.routingKey.match(exp)) &&
                (rcv.msg.hasOwnProperty('version'))){
                console.log('valid msg', rcv.msg);
                self.eventList.push(rcv.msg);
                newState.events = self.eventList;
                self.setState(newState);
                self.scrollToBottom();
            }
        });

        return self;
    }

    state = {
        userOption: 2,
        hasFirstEvent: false,
        events: {}
    }

    static contextTypes = {
        muiTheme: PropTypes.any,
        router: PropTypes.any
    }

    scrollToBottom = () => {
        const node = findDOMNode(this.messagesEnd);
        node.scrollIntoView({behavior: "smooth"});
    }

    renderHeader = () => {
        return (
            <AppBar
                title="Tools for demo event format"
            />
        )
    }

    renderContent = () => {
        var self = this;

        if(! self.state.hasFirstEvent) {
            return (
                <div style={{clear:"both"}}>
                    <FlatButton label="No notification arrive yet"/>
                </div>
            )
        }

        return (
            <div style={{clear:"both"}}>
                <EventTable
                    eventItems={self.state.events}
                />
            </div>
        )
    }

    handleUserOption = (event, index, val) => {
        this.setState({userOption: val, hasFirstEvent: false});
    }

    renderDropDownMenu = () => {
        return (
            <div style={{float:"left"}}>
                <DropDownMenu value={this.state.userOption} onChange={this.handleUserOption}>
                    <MenuItem value={1} primaryText="heartbeat" />
                    <MenuItem value={2} primaryText="polleralert" />
                    <MenuItem value={3} primaryText="graph" />
                    <MenuItem value={4} primaryText="node" />
                </DropDownMenu>
            </div>
        )
    }

    renderAmqpInfo = () => {
        var tmpStr = "routingKey: " + this.userMap[this.state.userOption - 1] +
                ".<action>.<severity>.<typeId>.<nodeId>"
        return (
            <div style={{clear:"both"}}>
                <TextField
                    fullWidth={true}
                    value={tmpStr} />
            </div>
        )
    }

    render(){
        return (
            <AppContainer key="app">
                {this.renderHeader()}
                {this.renderDropDownMenu()}
                {this.renderAmqpInfo()}
                {this.renderContent()}
                <div style={{ float:"left", clear: "both" }}
                    ref={(el) => { this.messagesEnd = el; }}>
                </div>
            </AppContainer>
        )
    }
};

