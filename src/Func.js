import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  PermissionsAndroid
} from 'react-native';
import GoogleSignIn from 'react-native-google-signin';
import GDrive from "react-native-google-drive-api-wrapper";
import RNFS from "react-native-fs"

let apiToken = null
const url = 'https://www.googleapis.com/drive/v3' // demo method to understand easier https://developers.google.com/drive/v3/reference/files/list
const uploadUrl = 'https://www.googleapis.com/upload/drive/v3'
const downloadHeaderPath = RNFS.DocumentDirectoryPath + '/data.xlsx' // see more path directory https://github.com/itinance/react-native-fs#api
const boundaryString = 'gda' // can be anything unique, needed for multipart upload https://developers.google.com/drive/v3/web/multipart-upload


export const initialGoogle = async () => {
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

/**
 * query params
 */
function queryParams(params) {
  return encodeURIComponent("mimeType = 'application/vnd.google-apps.folder'")
}

/**
 * Set api token
 */
export const setApiToken = (token) => {
  apiToken = token
}


/**
 * configure post method for FOLDER
 */
function configurePostFolderOptions() {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${apiToken}`)
  headers.append('Content-Type', `application/json`)
  headers.append('Accept', `application/json`)
  return {
    method:'POST',
    headers,
  }
}

/**
 * configure get method
 */
function configureGetOptions() {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${apiToken}`)
  return {
    method: 'GET',
    headers,
  }
}

/**
 * create download url based on id
 */
export const downloadFile = (existingFileId) => {
  const options = configureGetOptions()
  console.log(existingFileId)
  if (!existingFileId) throw new Error('Didn\'t provide a valid file id.')
  return `${url}/files/${existingFileId}?alt=media`
}


/**
 * create New folder
 */
export const createFolder = (userData) => {
  const body = JSON.stringify({
    "name" : "Folder Test",
    "mimeType" : "application/vnd.google-apps.folder",
  });
  const options = configurePostFolderOptions();
  console.log('createFolder Func', `${uploadUrl}/files`, options, body)

  return fetch(`https://www.googleapis.com/drive/v3/files`, {
    ...options,
    body,
  })
    .then(parseAndHandleErrors)
}

/**
 * returns the files meta data only. the id can then be used to download the file
 */
export const getFolders = () => {
  const qParams = queryParams()
  const options = configureGetOptions()
console.log('getFolders options', apiToken, `${url}/files?q=${qParams}`, options)
  return fetch(`${url}/files?q=${qParams}`, options)
    .then(parseAndHandleErrors)
    .then((body) => {
      console.log('folders', body)
      if (body && body.files && body.files.length > 0){
        let result = body.files.filter( folder => {
          return (folder.name[0] == '#' || folder.name[0] == '@' || folder.name[0] == '$')
        })
        console.log('result', result);
        return result
      }
      return null
    })
}

export const getFolderItems = (folderId='1tebFjFKrniwohRKzAM3s4uqDOayBLVT7') => {
  const qParams = encodeURIComponent("fileId = '1tebFjFKrniwohRKzAM3s4uqDOayBLVT7'")
  const options = configureGetOptions()
  console.log('getFolderItems options', apiToken, `${url}/files/?q='${folderId}'+in+parents`, options)
  return fetch(`${url}/files/?q='${folderId}'+in+parents`, options)
    .then(parseAndHandleErrors)
    .then((body) => {
      console.log('getFolderItems body', body)
      if (body && body.files && body.files.length > 0) {
        return body.files
      }
      return null
    })
}

export const getFileById = (fileId="1fpuMh8doq0KSrlhqehvbJZpkBJaCfg5o") => {
  const qParams = encodeURIComponent("fileId ="+fileId)
  const options = configureGetOptions()
  console.log('options', apiToken, `${url}/files/${fileId}`, options)
  return fetch(`${url}/files/${fileId}`, options)
    .then(parseAndHandleErrors)
    .then((body) => {
      console.log('getFileById body', body)
      if (body && body.files && body.files.length > 0) return body.files
      return null
    })
}

/**
 * returns the files meta data only. the id can then be used to download the file
 */
export const getFilesList = () => {
  const qParams = queryParams()
  const options = configureGetOptions()
  console.log('options', apiToken, `${url}/files?q=${qParams}`, options)
  return fetch(`${url}/files?q=${qParams}`, options)
    .then(parseAndHandleErrors)
    .then((body) => {
      console.log(body)
      if (body && body.files && body.files.length > 0) return body.files
      return null
    })
}

export const gDriveUpload = (content) => {
  GDrive.setAccessToken(apiToken);
  GDrive.init();
  if (GDrive.isInitialized() ) {
    GDrive.files.createFileMultipart(
        content,
        'application/vnd.ms-excel',
        {name: 'TestSheet.xml'}
    ).then( res=> console.log('gDriveUpload', res))
  }else {
    console.log('gDrive error - not initialized')
  }
}

/**
 * crete multi body
 */
function createMultipartBody(body, isUpdate = false) {
  // https://developers.google.com/drive/v3/web/multipart-upload defines the structure
  const metaData = {
    name: 'Answers.excel',
    description: 'Answers to questions',
    mimeType: 'application/vnd.google-apps.spreadsheet',
  }
  // if it already exists, specifying parents again throws an error
  // if (!isUpdate) metaData.parents = ['appDataFolder']

  // request body
  const multipartBody = `\r\n--${boundaryString}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`
      + `${JSON.stringify(metaData)}\r\n`
      + `--${boundaryString}\r\nContent-Type: text/csv\r\n\r\n`
      + `${body}\r\n`
      + `--${boundaryString}--`

  return multipartBody
}

/**
 * configure post method
 */
function configurePostOptions(bodyLength, isUpdate = false) {
  const headers = new Headers()
  headers.append('Authorization', `Bearer ${apiToken}`)
  headers.append('Content-Type', `multipart/related; boundary=${boundaryString}`)
  headers.append('Content-Length', bodyLength)
  return {
    method: 'POST',
    headers,
  }
}


/**
 * upload file to google drive
 */
export const uploadFile2 = (content, existingFileId) => {
  const body = createMultipartBody(content, !!existingFileId)
  const options = configurePostOptions(body.length, !!existingFileId)


  console.log('uploadFile2 header', options)
  console.log('uploadFile2 body', body)
  console.log('uploadFile2 url', `${uploadUrl}/files?uploadType=multipart`)
  return fetch(`${uploadUrl}/files?uploadType=multipart`, {
    ...options,
    body,
  })
      .then(parseAndHandleErrors)
}



/**
 * handle error
 */
function parseAndHandleErrors(response) {
  console.log(response)
  if (response.ok) {
    return response.json()
  }
  return response.json()
    .then((error) => {
      throw new Error(JSON.stringify(error))
    })
}

/**
 * require write storage permission
 */
export const requestWriteStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      {
        'title': 'Write your android storage Permission',
        'message': 'Write your android storage to save your data'
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can write storage")
    } else {
      console.log("Write Storage permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}


/**
 * * require read storage permission
 */
export const requestReadStoragePermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        'title': 'Read your android storage Permission',
        'message': 'Read your android storage to save your data'
      }
    )
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("You can Read storage")
    } else {
      console.log("Read Storage permission denied")
    }
  } catch (err) {
    console.warn(err)
  }
}