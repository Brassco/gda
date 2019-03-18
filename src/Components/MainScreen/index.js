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
  ActivityIndicator,
  PermissionsAndroid
} from 'react-native';
import {requestReadStoragePermission, requestWriteStoragePermission,
  getFilesList, getFileById, getFolders, getFolderItems, setApiToken, createFolder,
  downloadFile
} from '../../Func';
import GoogleSignIn from 'react-native-google-sign-in';
import GDrive from "react-native-google-drive-api-wrapper";
import RNFS from "react-native-fs"
import XLSX from 'xlsx';
const downloadHeaderPath = RNFS.DocumentDirectoryPath + '/data.xml' // see more path directory https://github.com/itinance/react-native-fs#api


export default class MainScreen extends Component {
  constructor(props) {
    super(props)

    this.state = {
      searchResult: null,
      folders: null,
      files: null,
      A_Q: null,
      Items: null,
      apiToken: null
    }

    this.checkPermission()
  }

  // check storage permission
  checkPermission = () => {
    PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE).then((writeGranted) => {
      console.log('writeGranted', writeGranted)
      if (!writeGranted) {
        requestWriteStoragePermission()
      }
      PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then((readGranted) => {
        console.log('readGranted', readGranted)
        if (!readGranted) {
          requestReadStoragePermission()
        }
        this.initialGoogle()
      })
    })
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
    RNFS.downloadFile(downloadFileOptions).promise.then(res => {
      return RNFS.readFile(downloadHeaderPath, 'ascii');
    }).then(content => {
      const workbook = XLSX.read(content, {type:'binary'});
      console.log('file content after reading',file.name,  workbook);

      if (file.name[0] == '@') {
        let shedule=[];
        for (let label in workbook.Sheets.Sheet1) {
          let obj={};
          if (label[1] > 2) {
            console.log('label', label[0]);
            if (label[0] == 'A') {
              obj.date = workbook.Sheets.Sheet1[label].w
              shedule[label[1]] = obj;
            } else if (label[0] == 'B') {
              shedule[label[1]].taskName = workbook.Sheets.Sheet1[label].w;
            } else if (label[0] == 'C') {
              shedule[label[1]].responsibility = workbook.Sheets.Sheet1[label].w
            } else if (label[0] == 'D') {
              shedule[label[1]].details = workbook.Sheets.Sheet1[label].w
            }
          } else {
            continue
          }
          // shedule[obj.date] = obj;
        }
        this.props.navigation.push("Schedule", {
          data: shedule,
          token: this.state.apiToken
        });
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
        this.props.navigation.navigate("Equipment", {
          data: props,
          token: this.state.apiToken
        });
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

        this.props.navigation.push("Quotation", {
          data: {
            questions: QuestionsArray,
            answearsTypes: AnswearsArray
          },
          token: this.state.apiToken
        });
      }
    }).catch(err => {
      console.log('error', err)
    });
  }

  checkFolders = () => {
    getFolders().then( folders => {
      console.log('folderSSSSS', folders)
      this.setState({
        folders
      })
    });
  }

  checkFolderItems = (folder) => {
    getFolderItems(folder.id).then((file) => {
      console.log('checkFile file', file)
      let files = file.filter(item => {
        if (item.mimeType != "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
          return false;
        }
        return true;
      }).map( item => {
        return item;
      })
      console.log('files', files);
      this.setState({
        files: files
      })
    }).catch((error) => {
      console.log('error', error)
    })
  }

  // crete Folder to upload
  createFolder = () => {
    createFolder()
  }

  initialGoogle = async () => {
    await GoogleSignIn.configure({
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.appdata',
        'https://www.googleapis.com/auth/drive.file'],
      shouldFetchBasicProfile: true,
      offlineAccess: true
    });

    const user = await GoogleSignIn.signInPromise();
    //set api token
    console.log('initialGoogle', user);
    this.setState({ apiToken: user.accessToken})
    setApiToken(user.accessToken)
  }

  renderFolders = () => {
    if (this.state.apiToken == null) {
      return (
        <ActivityIndicator size={'large'}/>
      )
    }
    if (this.state.folders == null) {
      return (
        <TouchableHighlight style={styles.buttonGetData} onPress={this.checkFolders}>
          <Text style={styles.text}>
            Get data from Drive
          </Text>
        </TouchableHighlight>
      )
    }
    let buttonsArray=[];
    if (this.state.folders) {
      buttonsArray=[];
      console.log('this state', this.state);
      this.state.folders.forEach( item => {
        buttonsArray.push(
          <TouchableHighlight
            key={item.name}
            style={styles.buttonGetData} onPress={() => this.checkFolderItems(item)}>
            <Text style={styles.text}>
              Get files from folder {item.name}
            </Text>
          </TouchableHighlight>
        )
      })
    }
    return (
      <View>
        {buttonsArray}
      </View>
    )
  }

  renderFolderItems = () => {
    console.log('renderFolderItems', this.state);
    if (this.state.folders && this.state.files) {
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
          <View>
            <Text>
              Files in folder:
            </Text>
          </View>
            <View>
              {buttonsArray}
            </View>
        </View>
      )
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {
          this.renderFolders()
        }
        {
          this.renderFolderItems()
        }
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