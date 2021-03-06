import React, { Component } from 'react';
//let React = require('react');
//let Control = require('react-redux-form');
//let Select = require('react-select');
import { Control } from 'react-redux-form';
import Select from 'react-select';

let fs = require('fs');

let tutorLocation = require('path').resolve(__dirname, '..', '..','data', 'mockTutorData.json');
// let loadTutorData = JSON.parse(fs.readFileSync(tutorLocation));

class MultiSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categoryValue: null,
            courses: null,
            options: [],
            idToIndex: {}
        };
        this.handleSelectChange = this.handleSelectChange.bind(this);
        this.setUp = this.setUp.bind(this);
        this.setUp();
        this.preload();
    }

    setUp() {
        let targetId = this.props.tutorId;
        console.log("targetId");
        console.log(targetId);
        console.log("loadTurorData");
        let loadTutorData = this.props.tutorData;
        console.log(loadTutorData);
        let result = null;
        for (let i=0; i<loadTutorData.length; i++){
            if (loadTutorData[i].id == targetId) {
                result=loadTutorData[i];
            }
        }
        console.log("result");
        console.log(result);
        if (this.props.isWilling == true) {
            console.log("in willing");
            this.state.courses = result.tutorPreferences.coursePreferences.WILLING;
            for (let i=0; i<this.state.courses.length; i++) {
                this.state.options.push({
                    value: this.state.courses[i].id,
                    label: this.state.courses[i].name
                });
                this.state.idToIndex[this.state.courses[i].id] = i;
            }
            console.log("this.state.idToIndex");
            console.log(this.state.idToIndex);
        }
        else {
            console.log("in prefer");
            this.state.courses = result.tutorPreferences.coursePreferences.PREFER;
            for (let i=0; i<this.state.courses.length; i++) {
                this.state.options.push({
                    value: this.state.courses[i].id,
                    label: this.state.courses[i].name
                });
                this.state.idToIndex[this.state.courses[i].id] = i;
            }
            console.log("this.state.idToIndex");
            console.log(this.state.idToIndex);
        }
    }

    preload() {
        console.log("this.props.tutorCourse");
        console.log(this.props.tutorCourse);

        if (this.state.categoryValue == null && this.props.tutorCourse.length > 0) {
            let valueList = [];
            console.log("id");
            for (let i=0; i<this.props.tutorCourse.length; i++) {
                console.log(this.props.tutorCourse[i].id);
                if (this.state.idToIndex[this.props.tutorCourse[i].id] != null) {
                    valueList.push(this.props.tutorCourse[i].id.toString());
                }
            }
            console.log("valueList");
            console.log(valueList);
            this.state.categoryValue = valueList.join();
            console.log("this.state.categoryValue");
            console.log(this.state.categoryValue);
            this.setCoursesAssigned(this.state.categoryValue);
        }
    }

    handleSelectChange(value){
        console.log("in handleSelecChange");
        this.setState({ categoryValue: value });
        this.setCoursesAssigned(value);
    };

    setCoursesAssigned(value) {
        console.log("in multiselect.setCoursesAssigned");
        console.log("value");
        console.log(value);
        let categoryValueList = value.split(",");
        let courses = [];
        let idStr = null;
        let id = 0;
        let index = 0;
        for (let i=0; i<categoryValueList.length; i++) {
            idStr = categoryValueList[i];
            console.log("idStr");
            console.log(idStr);
            if (idStr == "") {
                continue;
            }
            id = parseInt(idStr);
            console.log("id");
            console.log(id);
            index = this.state.idToIndex[id];
            courses.push(this.state.courses[index]);
        }
        console.log("courses");
        console.log(courses);
        this.props.setCoursesAssigned(courses);
    }

    render() {
        let reactSelect = props => (
          <Select
            {...props}
          />
        );
        console.log("this.state.categoryValue");
        console.log(this.state.categoryValue);
        // console.log(this.state.categoryValue.length);

        return (
            <div className="form__row">
                <div className="form__label">
                    <span className="form__title">
                        {this.props.title}
                        {this.props.isRequired ? (
                            <span className="form__required">*</span>
                        ) : (
                        ''
                        )}
                    </span>
                </div>
                <Control.custom
                    model={this.props.model}
                    mapProps={
                        {
                            onChange: (props) => props.onChange
                        }
                    }
                    id={this.props.model}
                    component={reactSelect}
                    simpleValue
                    multi
                    value={this.state.categoryValue}
                    options={this.state.options}
                    onChange={this.handleSelectChange}
                    joinValues
                    name={this.props.model}
                    required
                />
            </div>
        );
    }
}

export default MultiSelect;
