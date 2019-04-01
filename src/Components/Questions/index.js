/**
 * Google Drive
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableHighlight,
  PermissionsAndroid
} from 'react-native';
import {requestReadStoragePermission, requestWriteStoragePermission,
  getFilesList, getFileById, getFolderItems, setApiToken, createFolder,
  downloadFile
} from './src/Func';
// import GoogleSignIn from 'react-native-google-sign-in';
// import GDrive from "react-native-google-drive-api-wrapper";
import RNFS from "react-native-fs"
import XLSX from 'xlsx';
const downloadHeaderPath = RNFS.DocumentDirectoryPath + '/data.xml' // see more path directory https://github.com/itinance/react-native-fs#api


export default class Questions extends Component {
  constructor(props) {
    super(props)

    this.state = {
      A_Q: null,
      apiToken: null
    }
  }

  // download and read file to get data content in downloaded file
  downloadAndReadFile = (file) => {

    const fromUrl = downloadFile(file.id)
    let downloadFileOptions = {
      fromUrl: fromUrl,
      toFile: downloadHeaderPath,
    }
    downloadFileOptions.headers = Object.assign({
      "Authorization": `Bearer ${this.state.apiToken}`
    }, downloadFileOptions.headers);

    console.log('downloadFileOptions', downloadFileOptions)

    RNFS.downloadFile(downloadFileOptions).promise.then(res => {
      console.log(res)
      console.log('downloadHeaderPath', downloadHeaderPath)
      // return RNFS.writeFile(downloadHeaderPath, res, 'ascii');
      return RNFS.readFile(downloadHeaderPath, 'ascii');
    }).then(content => {
      console.log('file content', content)
      const workbook = XLSX.read(content, {type:'binary'});
      console.log('file content after reading',file.name,  workbook);

      if (file.name[0] == '@') {

      } else if (file.name[0] == '#') {
        let props = {
          sheet: workbook.Sheets.Sheet1
        };
        let items = [];
        for (let label in workbook.Sheets.Sheet1) {
          if (label == 'A1') {
            props.title = workbook.Sheets.Sheet1[label].v;
          } else {
            if (label[1] > 2) {
              if (label[0] == 'A') {
                items.push(workbook.Sheets.Sheet1[label].v)
              }
            }
          }
        }
        props.items = items;
        this.setState({
          A_Q: null,
          Items: props,
        })
      } else {
        let QuestionsArray = [];
        let AnswearsArray = [];
        for (let label in workbook.Sheets.Sheet1) {
          if (label[1] > 2) {
            if (label[0] == 'A') {
              QuestionsArray[label[1]] = workbook.Sheets.Sheet1[label].v
            }
            if (label[0] == 'B') {
              AnswearsArray[label[1]] = workbook.Sheets.Sheet1[label].v
            }
          }
        }
        this.setState({
          A_Q: {
            questions: QuestionsArray,
            answearsTypes: AnswearsArray
          },
          Items: null
        })
      }
    }).catch(err => {
      console.log('error', err)
    });
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
    if (this.state.A_Q) {
      let rowsArray = [];
      return this.state.data.questions.map((q, index) => {
        console.log('ROW - ', q, index);
        return (
          <View
            style={{
              width: '100%',
              borderWidth: 1,
              borderColor: '#111'
            }}
            key={'Q' + index}
          >
            <View>
              <Text>
                {q}
              </Text>
            </View>
            <View style={{
              width: '80%',
              borderWidth: 1,
              borderColor: '#111'
            }}>
              {this.renderField(this.state.A_Q.answearsTypes[index])}
            </View>
          </View>
        )
      })
    } else if (this.state.Items) {
      return (
        <View
          style={{
            width: '100%',
            borderWidth: 1,
            borderColor: '#111'
          }}
        >
          <View>
            <Text>
              this.state.Items.title
            </Text>
          </View>
          <View style={{
            width: '80%',
            borderWidth: 1,
            borderColor: '#111'
          }}>
            {this.renderItems(this.state.Items.items)}
          </View>
        </View>
      )
    } else {
      return (
        <View/>
      )
    }
    // for ( let label in this.state.data) {
    //   if (label.indexOf('A') == 0) {
    //     rowsArray.push(
    //       <View key={label}>
    //         <Text>
    //           {this.state.data[label].v}
    //         </Text>
    //       </View>
    //     )
    //   }
    // }
    // console.log('rowsArray', rowsArray);
    // return rowsArray;
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

  renderFolderItems = () => {
    if (this.state.files == null) {
      return (
        <TouchableHighlight style={styles.buttonGetData} onPress={this.checkFolderItems}>
          <Text style={styles.text}>
            Get data from Folder
          </Text>
        </TouchableHighlight>
      )
    }
    let buttonsArray=[];
    this.state.files.forEach( item => {
      buttonsArray.push(
        <TouchableHighlight
          key={item.name}
          style={styles.buttonGetData} onPress={() => this.downloadAndReadFile(item)}>
          <Text style={styles.text}>
            Get file {item.name}
          </Text>
        </TouchableHighlight>
      )
    })
    return (
      <View>
        {buttonsArray}
      </View>
    )
  }

  componentDidMount() {
    this.props.navigation.getParameter('data')
  }

  render() {
    return (
      <View style={styles.container}>
        {
          this.renderFolderItems()
        }
        <TouchableHighlight style={styles.buttonGetData} onPress={this.downloadAndReadFile}>
          <Text style={styles.text}>
            Get file
          </Text>
        </TouchableHighlight>
        <TouchableHighlight style={styles.buttonGetData} onPress={this.createFolder}>
          <Text style={styles.text}>
            Create Folder
          </Text>
        </TouchableHighlight>
        <View>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
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