/**
 * Google Drive
 *
 * screen for tables begin with @
 */

import React, {Component} from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    Dimensions,
    ScrollView, TouchableOpacity,
    Alert,
    Picker
} from 'react-native';
import RNFS from 'react-native-fs';
import XLSX from 'xlsx';
import {uploadFile2, gDriveUpload} from '../../Func';
import {Button, Input} from 'react-native-elements';
import { Dropdown } from 'react-native-material-dropdown';

let {height, width} = Dimensions.get('window');

export default class Quotation extends Component {
    constructor(props) {
        super(props)

        this.state = {
            data: null,
            apiToken: null,
            answears: {},
            isLoading: false
        }
        this.answerPath = RNFS.DocumentDirectoryPath + '/Answers.xlsx';
        this.generateAnswearsJson = this.generateAnswearsJson.bind(this);
    }

    onChangeText(field, data) {
        let answears = this.state.answears;
        answears[field] = data
        this.setState({
            answears: answears
        })
    }

    generateAnswearsJson() {
        let data = [];
        for (let i in this.state.answears) {
            data.push({
                question: i,
                answear: this.state.answears[i]
            })
        }
        console.log('path', this.answerPath)
        /* convert from array of arrays to workbook */
        var worksheet = XLSX.utils.json_to_sheet(data);
        let csv = XLSX.utils.sheet_to_csv(worksheet)
        /* write a workbook */
        uploadFile2(csv);
        Alert.alert(
            'Thank you',
            'Your answers were sended',
            [
                {text: 'OK', onPress: () => this.props.navigation.goBack()},
            ],
            {cancelable: false},
        )
        // this.props.navigate.goBack()
    }

    renderField(row) {
        switch (row.type) {
            case 'SS':
                return (
                    <View style={{
                        width:'100%',
                        height: 80,
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}>
                        <Input
                            onChangeText={(text) => this.onChangeText(row.question, text)}
                            maxSize={255}
                            value={this.state.answears[row.question] ? this.state.answears[row.question] : ''}
                            placeholder={'answer'}
                        />
                    </View>
                )
                break;
            case 'SL':
                return (
                    <View style={{
                        width:'100%',
                        height: 80,
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}>
                        <Input
                            onChangeText={(text) => this.onChangeText(row.question, text)}
                            multiline={true}
                            numberOfLines={3}
                            maxSize={1500}
                            value={this.state.answears[row.question] ? this.state.answears[row.question] : ''}
                            placeholder={'answer'}
                        />
                    </View>
                )
                break;
            case 'N':
                return (
                    <View style={{
                        width:'100%',
                        height: 80,
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}>
                        <Input
                            onChangeText={(text) => this.onChangeText(row.question, text)}
                            value={this.state.answears[row.question] ? this.state.answears[row.question] : ''}
                            keyboardType={'numeric'}
                            placeholder={'answer'}
                        />
                    </View>
                )
                break;
            default:
                return (
                    <Dropdown
                        containerStyle={{
                            marginLeft: 10
                        }}
                        data={row.list}
                    />
                )
        }
    }

    renderRows = () => {
        console.log('renderRows', this.state)
        if (this.state.data) {
            let rowsArray = [];
            return this.state.data.questions.map((q, index) => {
                return (
                    <View
                        style={{
                            width: '100%',
                        }}
                        key={'Q' + index}
                    >
                        <View style={{
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            paddingLeft: 10,
                        }}>
                            <Text style={{
                                color: '#333',
                                fontSize: 17,
                                fontWeight: '500'
                            }}>
                                {q.question}
                            </Text>
                        </View>
                        <View style={{
                            width: '100%',
                            height: 80,
                        }}>
                            {this.renderField(q)}
                        </View>
                    </View>
                )
            })
        } else {
            return (
                <View/>
            )
        }
    }

    renderItems(items) {
        return items.map(item => {
            return (
                <View>
                    <Text>
                        {item}
                    </Text>
                </View>
            )
        })
    }

    componentDidMount() {
        const data = this.props.navigation.getParam("data");
        const token = this.props.navigation.getParam("token");
        console.log('Quotation did mount', data, token)
        this.setState({
            apiToken: token,
            data: data
        })
    }

    render() {
        console.log('Quotation', this.state)
        return (
            <View style={styles.container}>
                <View style={{
                    height: 50,
                    width: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row'
                    // backgroundColor: '#789'
                }}>
                    <TouchableOpacity
                        onPress={() => {
                            console.log('on press')
                            this.props.navigation.goBack();
                        }}
                        style={{
                            width: 50,
                            height: 50,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text>
                            Back
                        </Text>
                    </TouchableOpacity>
                    <View style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Text style={styles.text}>
                            Quotation Table
                        </Text>
                    </View>
                </View>
                <View style={styles.rowsContainer}>
                    <ScrollView style={{
                        width: '90%',
                    }}>
                    {
                        this.renderRows()
                    }
                    </ScrollView>
                </View>
                <View style={{
                    width: '100%',
                    height: 100,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                    <View style={{
                        width: width*0.8,
                        height: 80,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}>
                        <Button
                            style={{
                                width: width*0.8
                            }}
                            title={`Submit` }
                            type="outline"
                            onPress={this.generateAnswearsJson}
                            disabled={this.state.isLoading}
                            loading={this.state.isLoading}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    rowsContainer: {
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    text: {
        textAlign: 'center',
        color: '#FFFFFF',
        margin: 10,
    },
    textData: {
        textAlign: 'center',
        color: '#333333',
        margin: 10,
    },
    buttonGetData: {
        backgroundColor: '#333',
        padding: 10,
        margin: 10,
    }
});