// Copyright 2015, EMC, Inc.

import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { findDOMNode } from 'react-dom';

import merge from 'lodash/merge';

import Messenger from 'src-common/lib/Messenger';
import config from 'src-config';
import ProgressEventsMessenger from 'src-common/messengers/ProgressEventsMessenger';
import AppContainer from 'src-common/views/AppContainer';
import GraphProgressTable from './GraphProgressTable';
import {LinearProgress, AppBar} from 'material-ui';
import {
    FlatButton
} from 'material-ui';

export default class App extends Component {

    constructor() {
        super();

        let self = this;

        self.tableHeaderSent = true;

        self.graphProgressCollection = [];
        self.graphFinished = [];

        console.log("Starting to monitor websocket");
        self.events = new ProgressEventsMessenger();
        self.events.connect();
        self.events.listen(msg => {

            if(! self.state.hasFirstEvent) {
                self.setState({hasFirstEvent: true});
            }

            console.log(msg);

            //let action = self.checkEventAction(msg);
            //console.log(action);

            //if (action === 'progress')
            //{
            self.decodeProgress(msg.data.data);
            //} else if (action === 'finished') {
                //self.decodeFinish(msg.data.typeId, msg.data.data);
            //}

            console.log('-----graphProgressCollection', self.graphProgressCollection);

            self.setState(self.graphProgressCollection);
        });

        return this;
    }

    state = {
        hasFirstEvent: false,
        graphProgress : 0,
        graphDesc: '',
        graphName: '',
        graphId: '',
        taskProgress: 0,
        taskName: '',
        taskId: '',
        taskDesc: ''
    }

    static contextTypes = {
        muiTheme: PropTypes.any,
        router: PropTypes.any
    }

    checkEventAction = (msg) => {
        console.log(msg.id);
        let exp = new RegExp('graph.started');
        if ((msg.id.match(exp))) {
            return "started";
        }

        exp = new RegExp('graph.finished.information');
        if ((msg.id.match(exp))) {
            return "finished";
        }

        exp = new RegExp('graph.progress');
        if ((msg.id.match(exp))) {
            return "progress";
        }

        return "ignore";
    }

    decodeFinish = (graphId, payload) => {
        var self = this;
        if (!self.graphProgressCollection.hasOwnProperty(graphId)) {
            return;
        }
        self.graphProgressCollection[graphId].graphStatus = payload.status;
        console.log(graphId);
        console.log(self.graphProgressCollection[graphId].graphStatus);
    }

    decodeProgress = (payload) => {

        var self = this;

        let graphId = payload.graphId;

        if (self.graphFinished.indexOf(graphId) > 0) {
            return;
        }

        // Get graph info
        if (!self.graphProgressCollection.hasOwnProperty(graphId)) {
            self.graphProgressCollection[graphId] = {
                graphId: payload.graphId,
                graphDesc: payload.progress.description,
                graphName: payload.graphName,
                graphProgress: parseInt(payload.progress.percentage),
                tasks: {}
            };
        }
        else {
            self.graphProgressCollection[graphId].graphDesc =
                payload.progress.description;
            self.graphProgressCollection[graphId].graphProgress =
                parseInt(payload.progress.percentage);
        }

        console.log(payload.progress.description);
        if (self.graphProgressCollection[graphId].graphProgress < 100) {
            self.graphProgressCollection[graphId].graphStatus = "running";
        }
        else if (payload.progress.description.match(new RegExp('cancelled'))){
            self.graphProgressCollection[graphId].graphStatus = "cancelled";
            for (var key in self.graphProgressCollection[graphId].tasks) {
                self.graphProgressCollection[graphId].tasks[key].taskStatus = "cancelled";
            }
            self.graphFinished.push(graphId);
            return;
        }
        else {
            self.graphProgressCollection[graphId].graphStatus = "succeeded";
        }

        for (var key in self.graphProgressCollection[graphId].tasks) {
            if (key.match(/TBD*/)){
                delete self.graphProgressCollection[graphId].tasks[key];
            }
        }

        if (!payload.hasOwnProperty("taskProgress")) {
            return;
        }

        let taskId = payload.taskProgress.taskId;

        if (!self.graphProgressCollection[graphId].tasks.hasOwnProperty(taskId)) {
            self.graphProgressCollection[graphId].tasks[taskId] = {
                taskName: payload.taskProgress.taskName,
                taskProgress: parseInt(payload.taskProgress.progress.percentage),
                taskDesc: payload.taskProgress.progress.description
            };
        }
        else {
            self.graphProgressCollection[graphId].tasks[taskId].taskDesc =
                payload.taskProgress.progress.description;
            self.graphProgressCollection[graphId].tasks[taskId].taskProgress =
                payload.taskProgress.progress.hasOwnProperty("percentage")?
                parseInt(payload.taskProgress.progress.percentage):
                Math.floor(100*payload.taskProgress.progress.value/payload.taskProgress.progress.maximum);
        }

        if (self.graphProgressCollection[graphId].tasks[taskId].taskProgress < 100) {
            self.graphProgressCollection[graphId].tasks[taskId].taskStatus = "running";
        }
        else {
            self.graphProgressCollection[graphId].tasks[taskId].taskStatus = "succeeded";
        }

        var count = Object.keys(self.graphProgressCollection[graphId].tasks).length;
        //console.log("!!!!", count);
        //console.log(payload.progress.value);
        //console.log(payload.progress.maximum);
        for (let i = count; i < payload.progress.maximum; i ++) {
            //console.log(i);
            self.graphProgressCollection[graphId].tasks["TBD "+(i+1)]={
                taskStatus: "pending",
                taskProgress: 0
            };
        }
    }

    renderHeader = () => {
        return (
            <AppBar
                title="Tools for demo graph progress from AMQP event"
            />
        )
    }

    renderContent = () => {
        var self = this;

        if(! self.state.hasFirstEvent) {
            return (
                <div>
                    <FlatButton label="No notification arrive yet"/>
                </div>
            )
        }
        let graphProgressElements = [];

        let showHeader = true;

        Object.keys(self.graphProgressCollection).forEach(function(graphId){

            let graphState = self.state[graphId];

            graphProgressElements.push(
                <div>
                    <GraphProgressTable
                        key={graphId}
                        showHeader={showHeader}
                        graphData={graphState}
                    />
                </div>
            )

            showHeader = false;
        });

        return (
            <div>
                {graphProgressElements}
            </div>
        )

    }

    render(){
        return (
            <AppContainer key="app">
                {this.renderHeader()}
                {this.renderContent()}
            </AppContainer>
        )
    }
};

