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
  ScrollView, Dimensions
} from 'react-native';
import RNFS from "react-native-fs"
import XLSX from 'xlsx';
import {Button, Input, ListItem } from "react-native-elements";

let {width, height} = Dimensions.get('window');
const downloadHeaderPath = RNFS.DocumentDirectoryPath + '/data.xml' // see more path directory https://github.com/itinance/react-native-fs#api

export default class Equipment extends Component {

  constructor(props) {
    super(props)

    this.state = {
      searched: '',
      searchResult: null,
      data: null,
      apiToken: null,
      expanded: null,
      isSearching: false
    }
  }

  search = (searchedString) => {
    if (this.state.searched.length < 2) {
console.log('set all list', this.state);
      this.setState({
        isSearching: true,
        searchResult: this.state.data.items,
      })
    } else {
      let result = [];
      for(let key in this.state.data.items) {
        if (key[0] == '!' || key == 'A1') continue
        let searchedString = this.state.searched.toString().toLowerCase();
        let searchIn = this.state.data.items[key];
        for(let key in searchIn) {
          if (searchIn[key].toString().toLowerCase().indexOf(searchedString) >= 0) {
            result.push(searchIn)
          }
        }
      }
      this.setState({
        searched: '',
        isSearching: false,
        searchResult: result
      });
    }
  }

  onTextChange = (text) => {
    this.setState({
      searched: text
    })
  }

  renderRows = () => {
    if (this.state.data) {
      return (
        <View
          style={styles.rowsContainer}
        >
          <View style={{
            width: '100%',
            height: 0,
            marginHorizontal: 10,
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

  renderAdditionInfo = (obj) => {
    console.log('renderAdditionInfo', obj)
    let result = [];
    for (let key in obj) {
      result.push(
      <View style={{
        flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center'
      }}>
      <View style={{
        flex: 1,
        justifyContent: 'center',
            alignItems: 'flex-start',
            paddingLeft: 10
      }}>
        <Text style={{
          color: 'black',
              fontSize: 18,
            fontWeight: '500'
      }}>
          {key}
        </Text>
      </View>
      <View style={{
        flex: 1,
        justifyContent: 'center',
            alignItems: 'flex-start',
            paddingLeft: 10
      }}>
        <Text>
          {obj[key]}
        </Text>
      </View>
      </View>
      )
    }
    return (
        <View style={{
          width: '100%',
              height: 200,
        }}>
        {result}
        </View>
    )
}

  renderItems(items) {
    return items.map( item => {
      return (
        <View>
          <ListItem
              chevronColor={'#345'}
              onPress={() => {
                this.setState({
                  expanded: this.state.expanded == item.equipmentName ? null : item.equipmentName
                })
              }}
              title={item.equipmentName}
          />
  {console.log(this.state.expanded, item.equipmentName, this.state.expanded == item.equipmentName)}
  {
    this.state.expanded == item.equipmentName &&
        this.renderAdditionInfo(item)
  }
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
          height: 80,
          width: '100%',
          marginBottom: 20
        }}>
          <View style={{
            flex:1,
          }}>
            <Input
              value={this.state.searched}
              onChangeText={this.onTextChange}
              placeholder={'Search'}
            />
          </View>
          <View style={{
            flex:1
          }}>
            <Button
                style={{
                  width: '100%'
                }}
                title={`Search Equipment` }
                type="outline"
                onPress={this.search}
                disabled={this.state.isSearching}
                loading={this.state.isSearching}
            />
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