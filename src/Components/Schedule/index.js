/**
 * Google Drive
 *
 * Screen for sheet started from #
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  PermissionsAndroid,
  ScrollView, TouchableOpacity, Dimensions
} from 'react-native';
import RNFS from "react-native-fs"
import XLSX from 'xlsx';
import {Dropdown} from "react-native-material-dropdown";
let {width, height} = Dimensions.get('window');

const downloadHeaderPath = RNFS.DocumentDirectoryPath + '/data.xml' // see more path directory https://github.com/itinance/react-native-fs#api


export default class Equipment extends Component {

  constructor(props) {
    super(props)

    this.state = {
      data: null,
      apiToken: null,
      dateMode: 'all'
    }
    this.currentDate = new Date().getTime()/1000;
  }

  getCurrentDay = (dateString) => {

  }

  getLastWeekDay = (dateString) => {
    var curr = new Date; // get current date
    var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6
    var lastday = new Date(curr.setDate(last));
    console.log('getLastWeekDay', lastday)
  }

  getLastMonthDay = () => {
    var date = new Date(), y = date.getFullYear(), m = date.getMonth();
    var lastDay = new Date(y, m + 1, 0);

    console.log('getLastMonthDay', lastDay);
  }

  getLastYearDay = () => {
    let lastday = new Date(new Date().getFullYear(), 11, 31)
    console.log('getLastYearDay', lastday);
  }

  getWeekNumber = (d) => {
    // Copy date so don't modify original
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    // Make Sunday's day number 7
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    // Get first day of year
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    // Calculate full weeks to nearest Thursday
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);

    console.log('getWeekNumber', d.getUTCFullYear(), weekNo)

    // Return array of year and week number
    return [d.getUTCFullYear(), weekNo];
  }

  renderRows = () => {
    console.log('render Schedule Rows', this.state)
    if (this.state.data) {
      let tasks = this.state.data;
      let that = this;
      if (this.state.dateMode == 'all') {
        tasks = this.state.data;
      } else if (this.state.dateMode == 'week') {
        let currentWeekNumber = that.getWeekNumber(new Date());
        tasks = this.state.data.filter(function (el) {
          let taskWeekNumber = that.getWeekNumber(new Date(el.date));
          return taskWeekNumber[0] == currentWeekNumber[0] && taskWeekNumber[1] == currentWeekNumber[1]
        });
      } else if (this.state.dateMode == 'month') {
        let currentMonthNumber = new Date().getMonth();
        let currentYaerhNumber = new Date().getFullYear();
        tasks = this.state.data.filter(function (el) {
          let taskMonthNumber = new Date(el.date).getMonth();
          let taskYearNumber = new Date(el.date).getFullYear();
          return taskMonthNumber == currentMonthNumber && taskYearNumber == currentYaerhNumber
        });
      } else if (this.state.dateMode == 'year') {
        let currentMonthNumber = new Date().getFullYear();
        tasks = this.state.data.filter(function (el) {
          let taskMonthNumber = new Date(el.date).getFullYear();
          return taskMonthNumber == currentMonthNumber
        });
      }
      return (
        <View
          style={styles.rowsContainer}
        >
          <ScrollView style={{
            width: '100%',
          }}>
            {this.renderItems(tasks)}
          </ScrollView>
        </View>
      )
    } else {
      return (
        <View/>
      )
    }
  }

  renderItems(items) {
    return items.map( item => {
      return (
        <View
          key={item.date}
          style={
            styles.itemContainer
        }>
          <View style={{
            height: 50,
            justifyContent: 'center'
          }}>
            <Text style={{
              color: '#333',
              fontSize: 18
            }}>
              {item.date}
            </Text>
          </View>
          <View style={{
            height: 30,
            justifyContent: 'flex-start'
          }}>
            <Text style={{
              color: '#4a4749',
              fontSize: 16,
              fontWeight: '600'
            }}>
              {item.taskName}
            </Text>
          </View>
          <View style={{
            height: 80,
            justifyContent: 'flex-start'
          }}>
            <Text>
              {item.details}
            </Text>
          </View>
        </View>
      )
    })
  }

  componentDidMount() {
    const data = this.props.navigation.getParam("data");
    const token = this.props.navigation.getParam("token");
    console.log('Schedule did mount', data, token)
    this.setState({
      apiToken: token,
      data: data,
    })
  }

  render() {
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
            onPress={()=>{
              console.log('on press')
              this.props.navigation.goBack();
            }}
            style={{
              width: 50,
              height: 50,
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}
          >
            <Text style={{
              fontSize: 16,
              fontWeight: '600'
            }}>
              Back
            </Text>
          </TouchableOpacity>
          <View style={{
            width: width-50,
            height: 50,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600'
            }}>
              Schedule Table
            </Text>
          </View>
        </View>
        <View style={{
          width: width,
          height: 50,
          marginBottom: 20
        }}>
          <Dropdown
              dropdownPosition={1}
              onChangeText={ (text) => {
                this.setState({
                  dateMode: text
                })
              }}
              value={this.state.dateMode}
              containerStyle={{
                marginLeft: 10
              }}
              data={[{
                value: 'all',
              }, {
                value: 'week',
              }, {
                value: 'month',
              }, {
                value: 'year',
              }]}
          />
        </View>
        <View style={{
          width: '100%',
        }}>
        {
          this.renderRows()
        }
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
    alignItems: 'flex-start'
  },
  itemContainer: {
    width: '100%',
    height: 150,
    paddingLeft: 20,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#979797',
    paddingVertical: 5,
    backgroundColor: '#f6f8f8',
  },
  text: {
    textAlign: 'center',
    color: '#111',
    margin: 10,
  },
  buttonGetData: {
    backgroundColor: '#999',
    padding: 10,
  }
});