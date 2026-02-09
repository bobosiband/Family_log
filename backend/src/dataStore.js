import * as fs from 'fs';

let data = {
    users: [],
    totalusersevercreated: 0
};

/**
 * 
 * @returns 
 * 
 */
function getData() {
    return data;
}

function loadDataOnStartup() {
  try {
    const rawData = fs.readFileSync('data.json', 'utf-8');
    data = JSON.parse(rawData);
  } catch {
    console.log('Existing data could not be loaded or was not found, using default empty dataStore');
  }
}

/**
  * Save Data
  * Should be called every time an endpoint returns successfully
  * We should also consider calling it every time when an async function finishes running
*/
function saveDataPersistently() {
  try {
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  } catch {
    console.log('Data could not be saved persistantly');
  }
}

export {
    getData,
    loadDataOnStartup,
    saveDataPersistently,
}
