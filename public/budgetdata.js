let database;

//  create an indexed database to manage budget data
const request = indexedDB.open("progressive-budget-dtm-hw18", 1);

request.onupgradeneeded = function (event) {

//  create an empty/open object
  const database = event.target.result;
  database.createObjectStore("open", { autoIncrement: true });
};

request.onsuccess = function (event) {
  database = event.target.result;

//  validate the app is available and go to the database or throw an error in the console if there is an issue
  if (navigator.onLine) {
    gotoDB();
  }
};

request.onerror = function (event) {
  console.log("ERROR: " + event.target.errorCode);
};

//  set the database for updates and add data
function saveData(data) {
  const dataUpdate = database.transaction(["open"], "readwrite");

  const store = dataUpdate.objectStore("open");

  store.add(data);
}

//  gather database information for use
function gotoDB() {
  const dataUpdate = database.transaction(["open"], "readwrite");

  const store = dataUpdate.objectStore("open");

  const pullAllData = store.pullAllData();

//  verifies successful pull and sets for update/use/closure
  pullAllData.onsuccess = function () {
    if (pullAllData.result.length > 0) {
      fetch("/api/dataUpdate/bulk", {
        method: "POST",
        body: JSON.stringify(pullAllData.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then(() => {
          const dataUpdate = database.transaction(["open"], "readwrite");

          const store = dataUpdate.objectStore("open");

          store.clear();
        });
    }
  };
}
//  listener for app availability and DB start
window.addEventListener("online", gotoDB);
