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
  ScrollView, TouchableOpacity
} from 'react-native';
import RNFS from "react-native-fs"
import XLSX from 'xlsx';
const downloadHeaderPath = RNFS.DocumentDirectoryPath + '/data.xml' // see more path directory https://github.com/itinance/react-native-fs#api


export default class Equipment extends Component {

  constructor(props) {
    super(props)

    this.state = {
      data: null,
      apiToken: null
    }
  }

  renderRows = () => {
    console.log('render Schedule Rows', this.state)
    if (this.state.data) {
      return (
        <View
          style={styles.rowsContainer}
        >
          <ScrollView style={{
            width: '100%',
          }}>
            {this.renderItems(this.state.data)}
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
          <View>
            <Text>
              {item.date}
            </Text>
          </View>
          <View>
            <Text>
              {item.taskName}
            </Text>
          </View>
          <View>
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
              Schedule Table
            </Text>
          </View>
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
    alignItems: 'flex-start',
    // backgroundColor: '#789'
  },
  itemContainer: {
    width: '100%',
    // height: 50,
    paddingLeft: 20,
    justifyContent: 'center',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#111',
    paddingVertical: 5
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