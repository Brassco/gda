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
  TouchableOpacity,
  PermissionsAndroid,
  ScrollView
} from 'react-native';
import RNFS from "react-native-fs"
import XLSX from 'xlsx';
const downloadHeaderPath = RNFS.DocumentDirectoryPath + '/data.xml' // see more path directory https://github.com/itinance/react-native-fs#api


export default class Equipment extends Component {

  constructor(props) {
    super(props)

    this.state = {
      searched: '',
      searchResult: null,
      data: null,
      apiToken: null
    }
  }

  search = (searchedString) => {
    if (this.state.searched.length < 2) {
      console.log('set all list', this.state);
      this.setState({
        searchResult: this.state.data.items,
      })
    } else {
      let result = [];
      for(let key in this.state.data.sheet) {
        if (key[0] == '!' || key == 'A1') continue
        let searchedString = this.state.searched.toString().toLowerCase();
        let searchIn = this.state.data.sheet[key].v.toString().toLowerCase();
        if (searchIn.indexOf(searchedString) >= 0) {
          result.push(this.state.data.sheet[key].v)
        }
      }
      console.log('search result', result);
      this.setState({
        searched: '',
        searchResult: result
      });
    }
  }

  onTextChange = (text) => {
    console.log('onTextChange', text)
    this.setState({
      searched: text
    })
  }

  renderRows = () => {
    console.log('render Equipment Rows', this.state)
    if (this.state.data) {
      return (
        <View
          style={styles.rowsContainer}
        >
          <View style={{
            width: '100%',
            height: 50,
            marginHorizontal: 10,
            // borderWidth: 1,
            // borderColor: '#111'
          }}>
            <Text>
              {this.state.data.title}
            </Text>
          </View>
          <ScrollView style={{
            width: '100%',
          }}>
            {this.renderItems(this.state.searchResult)}
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
          key={item.name}
          style={
          styles.itemContainer
        }>
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
    console.log('Equipment did mount', data, token)
    this.setState({
      apiToken: token,
      data: data,
      searchResult: data.items
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
              Equipment Table
            </Text>
          </View>
        </View>
        <View style={{
          flexDirection:'row',
          height: 50,
          width: '100%',
          marginBottom: 20
        }}>
          <View style={{
            flex:1,
          }}>
            <TextInput
              value={this.state.searched}
              onChangeText={this.onTextChange}
              placeholder={'Search'}
            />
          </View>
          <View style={{
            flex:1
          }}>
            <TouchableHighlight
              style={styles.buttonGetData}
              onPress={this.search}>
              <Text style={styles.text}>
                Search Equipment
              </Text>
            </TouchableHighlight>
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
    height: 50,
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