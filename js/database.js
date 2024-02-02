// Open or create a database.
const requestDB = indexedDB.open("ScrumBoard", 1);

// Database open success handler.
requestDB.onsuccess = function(event) {
    console.log("Database opened successfully");
};

// Database open error handler.
requestDB.onerror = function(event) {
    console.error("Database error: " + event.target.errorCode);
};

// Database version change handler.
requestDB.onupgradeneeded = function(event) {
    let db = event.target.result;
  
    // Creating a table for tasks in the database.
    const objectStore = db.createObjectStore("tasks", { keyPath: "id", autoIncrement: true });

    objectStore.createIndex("title"      , "title"      , { unique: false });
    objectStore.createIndex("description", "description", { unique: false });
    objectStore.createIndex("datetime"   , "datetime"   , { unique: false });
    objectStore.createIndex("list"       , "list"       , { unique: false });
    objectStore.createIndex("position"   , "position"   , { unique: false });
    objectStore.createIndex("state"      , "state"      , { unique: false });

    console.log("Database upgrade finished");
};

