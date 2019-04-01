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
  PermissionsAndroid, Dimensions
} from 'react-native';
import {requestReadStoragePermission, requestWriteStoragePermission,
  getFilesList, getFileById, getFolders, getFolderItems, setApiToken, createFolder,
  downloadFile
} from '../../Func';
import {GoogleSignin} from 'react-native-google-signin';
import RNFS from "react-native-fs"
import XLSX from 'xlsx';
import {Button} from 'react-native-elements';
let {width, height} = Dimensions.get('window');

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
      apiToken: null,
      isLoading: false,
      isLoadingFile: false
    }

    this.checkPermission()
  }

  // check storage permission
  checkPermission = () => {
    this.initialGoogle()
  }

  initialGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.configure({
        webClientId: '1076060332370-flkb82nvs0rjg7pgbtf2soc86k4lkf6k.apps.googleusercontent.com',
        iosClientId: '1076060332370-n7komarcfqedc61rig3arsalthp1kquq.apps.googleusercontent.com',
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.appdata',
          'https://www.googleapis.com/auth/drive.file'],
        shouldFetchBasicProfile: true,
        offlineAccess: true
      });

      const user = await GoogleSignin.signIn();
      //set api token
      console.log('initialGoogle', user);
      this.setState({ apiToken: user.accessToken})
      setApiToken(user.accessToken)
    } catch (e) {
      console.log('config ERROR', e)
    }
  }

  // download and read file to get data content in downloaded file
  downloadAndReadFile = (file) => {

    this.setState({
      isLoadingFile: true
    })
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
      this.setState({
        isLoadingFile: false
      })
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
          let obj = {};
          if (label == 'A1') {
            props.title = workbook.Sheets.Sheet1[label].v;
          } else {
            if (label[1] > 1) {
              // if (label[0] == 'A') {
              //   items.push(workbook.Sheets.Sheet1[label].v)
              // }
              if (label[0] == 'A') {
                obj.equipmentName = workbook.Sheets.Sheet1[label].w
                items[label[1]] = obj;
              } else if (label[0] == 'B') {
                items[label[1]].manufacturer = workbook.Sheets.Sheet1[label].w;
              } else if (label[0] == 'C') {
                items[label[1]].model = workbook.Sheets.Sheet1[label].w
              } else if (label[0] == 'D') {
                items[label[1]].serial = workbook.Sheets.Sheet1[label].w
              } else if (label[0] == 'E') {
                items[label[1]].physicalLocation = workbook.Sheets.Sheet1[label].w
              } else if (label[0] == 'F') {
                items[label[1]].servicesLocation = workbook.Sheets.Sheet1[label].w
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
        for (let label in workbook.Sheets.Sheet1) {
          if (label[1] > 2) {
            if (label[0] == 'A') {
              QuestionsArray[label[1]] = {
                question: workbook.Sheets.Sheet1[label].v,
                type: workbook.Sheets.Sheet1['B'+label[1]].v,
              }
              if (QuestionsArray[label[1]].type == 'L') {
                QuestionsArray[label[1]].list = [
                  {value: workbook.Sheets.Sheet1['C'+label[1]].v},
                  {value: workbook.Sheets.Sheet1['D'+label[1]].v},
                  ]
                if (workbook.Sheets.Sheet1.hasOwnProperty('E'+label[1])) {
                  QuestionsArray[label[1]].list.push({ value: workbook.Sheets.Sheet1['E'+label[1]].v})
                }
                if (workbook.Sheets.Sheet1.hasOwnProperty('F'+label[1])) {
                  QuestionsArray[label[1]].list.push({ value: workbook.Sheets.Sheet1['F'+label[1]].v})
                }
              }
            }
          }
        }

        this.props.navigation.push("Quotation", {
          data: {
            questions: QuestionsArray
          },
          token: this.state.apiToken
        });
      }
    }).catch(err => {
      console.log('error', err)
    });
  }

  checkFolders = () => {
    this.setState({
      isLoading: true
    })
    getFolders().then( folders => {
      this.setState({
        folders,
        isLoading: false
      })
    });
  }

  checkFolderItems = (folder) => {
    this.setState({
      isLoading: true
    })
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
        files: files,
        isLoading: false
      })
    }).catch((error) => {
      console.log('error', error)
    })
  }

  // crete Folder to upload
  createFolder = () => {
    createFolder()
  }

  renderFolders = () => {
    if (this.state.apiToken == null) {
      return (
        <ActivityIndicator size={'large'}/>
      )
    }
    if (this.state.folders == null) {
      return (
          <Button
              title="Get data from Drive"
              type="outline"
              onPress={this.checkFolders}
              disabled={this.state.isLoading}
              loading={this.state.isLoading}
          />
      )
    }
    let buttonsArray=[];
    if (this.state.folders) {
      buttonsArray=[];
      console.log('this state', this.state);
      this.state.folders.forEach( item => {
        buttonsArray.push(
            <Button
                key={item.name}
              title={`Get files from folder ${item.name}` }
              type="outline"
              onPress={() => this.checkFolderItems(item)}
              disabled={this.state.isLoading}
              loading={this.state.isLoading}
              />
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
    if (this.state.isLoadingFile) {
      return (
          <View style={{
            width: width,
            height: height,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <ActivityIndicator size={'large'}/>
          </View>
      )
    }
    if (this.state.folders && this.state.files) {
      let buttonsArray=[];
      this.state.files.forEach( item => {
        buttonsArray.push(
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
                title={`Get file ${item.name}` }
                type="outline"
                onPress={() => this.downloadAndReadFile(item)}
                disabled={this.state.isLoading}
                loading={this.state.isLoading}
              />
            </View>
        )
      })
      return (
        <View>
          <View style={{
            width:'100%',
            height: 80,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Text>
              Files in folder:
            </Text>
          </View>
            <View style={{
              width: width * 0.8 ,
              justifyContent: 'center',
              alignItems: 'flex-start'
            }}>
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
    width,
    height,
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