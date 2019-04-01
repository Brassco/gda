/**
 * crete multi body
 */
function createMultipartBody(body, isUpdate = false) {
    // https://developers.google.com/drive/v3/web/multipart-upload defines the structure
    const metaData = {
        name: 'data.json',
        description: 'Backup data for my app',
        mimeType: 'application/json',
    }
    // if it already exists, specifying parents again throws an error
    // if (!isUpdate) metaData.parents = ['appDataFolder']

    // request body
    const multipartBody = `\r\n--${boundaryString}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`
        + `${JSON.stringify(metaData)}\r\n`
        + `--${boundaryString}\r\nContent-Type: application/json\r\n\r\n`
        + `${JSON.stringify(body)}\r\n`
        + `--${boundaryString}--`

    return multipartBody
}

/**
* configure post method
*/
function configurePostOptions(bodyLength, isUpdate = false) {
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${apiToken}`)
    headers.append('Content-Type', `multipart/related; boundary=brassco`)
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
    return fetch(`${uploadUrl}/files?uploadType=multipart`, {
        ...options,
        body,
    })
        .then(parseAndHandleErrors)
}