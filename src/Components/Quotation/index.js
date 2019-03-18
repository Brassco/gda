/**
 * Google Drive
 *
 * screen for tables begin with @
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView, TouchableOpacity,
} from 'react-native';

export default class Quotation extends Component {
  constructor(props) {
    super(props)

    this.state = {
      data: null,
      apiToken: null
    }
  }


  renderField(type) {
    switch (type) {
      case 'SS':
        return (
          <TextInput
            maxSize={255}
            placeholder={'answer'}
          />
        )
        break;
      case 'SL':
        return (
          <TextInput
            multiline={true}
            numberOfLines={3}
            maxSize={1500}
            placeholder={'answer'}
          />
        )
        break;
      case 'N':
        return (
          <TextInput
            keyboardType={'numeric'}
            placeholder={'answer'}
          />
        )
        break;
      default:
        return (
          <Text> this is list</Text>
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
              borderWidth: 1,
              marginBottom: 5,
              padding: 10,
              borderColor: '#111'
            }}
            key={'Q' + index}
          >
            <View>
              <Text>
                {q}
              </Text>
            </View>
            <ScrollView style={{
              width: '90%',
              borderWidth: 1,
              borderColor: '#111'
            }}>
              {this.renderField(this.state.data.answearsTypes[index])}
            </ScrollView>
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
    return items.map( item => {
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
              Quotation Table
            </Text>
          </View>
        </View>
        <View style={styles.rowsContainer}>
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