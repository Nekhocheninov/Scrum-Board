/*
    Adding a task to the database.
    @param {Object} task - An object representing a task. Object structure:
    {
        title:       string,
        description: string,
        datetime:    string,
        list:        string,
        position:    number
    }
*/
function addTask(task) {
    const requestDB = indexedDB.open('ScrumBoard', 1);
    requestDB.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["tasks"], "readwrite");
        const objectStore = transaction.objectStore("tasks");
        const request = objectStore.add(task);
        
        request.onsuccess = function(event) {
            console.log("Task added successfully");
        };
        
        request.onerror = function(event) {
            console.error("Error adding task: " + event.target.errorCode);
        };

        transaction.oncomplete = function(event) {
            db.close();
        };
    };
    
    requestDB.onerror = function(event) {
        console.error("Error opening database: " + event.target.errorCode);
    };
}
/*
    Getting a task by id from the database.
    @param {number} id - id of the task to be retrieved.
    @param {function} callback - The callback function to which the received task will be passed.
                                 The callback function takes one parameter, the task object.
*/
function getTask(id, callback) {
    const requestDB = indexedDB.open('ScrumBoard', 1);
    requestDB.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["tasks"], "readonly");
        const objectStore = transaction.objectStore("tasks");
        const request = objectStore.get(id);

        request.onsuccess = function(event) {
            let task = event.target.result;
            callback(task);
        };
            
        request.onerror = function(event) {
            console.error("Error getting task: " + event.target.errorCode);
        };

        transaction.oncomplete = function(event) {
            db.close();
        };
    };
    
    requestDB.onerror = function(event) {
        console.error("Error opening database: " + event.target.errorCode);
    };
}
/*
    Removing a task by id from the database.
    @param {number} id - id of the task to be retrieved.
*/
function deleteTask(id) {
    const requestDB = indexedDB.open('ScrumBoard', 1);
    requestDB.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["tasks"], "readwrite");
        const objectStore = transaction.objectStore("tasks");
        const request = objectStore.delete(id);
            
        request.onsuccess = function(event) {
            console.log("Task deleted successfully");
        };
            
        request.onerror = function(event) {
            console.error("Error deleting task: " + event.target.errorCode);
        };

        transaction.oncomplete = function(event) {
            db.close();
        };
    };
    
    requestDB.onerror = function(event) {
        console.error("Error opening database: " + event.target.errorCode);
    };
}
/*
    Updating a task in the database.
    @param {Object} task - Object of the task that needs to be updated in the database.
*/
function updateTask(task) {
    const requestDB = indexedDB.open('ScrumBoard', 1);
    requestDB.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["tasks"], "readwrite");
        const objectStore = transaction.objectStore("tasks");
        const request = objectStore.put(task);
            
        request.onsuccess = function(event) {
            console.log("Task updated successfully");
        };
            
        request.onerror = function(event) {
            console.error("Error updating task: " + event.target.errorCode);
        };

        transaction.oncomplete = function(event) {
            db.close();
        };
    };
    
    requestDB.onerror = function(event) {
        console.error("Error opening database: " + event.target.errorCode);
    };
}
/*
    Getting tasks by list from the database.
    @param {string} list - List id for which you need to get tasks.
    @param {function} callback - The callback function to which received tasks will be passed.
                                 The callback function takes one parameter, an array of task objects.
*/
function getTasksByList(list, callback) {
    const requestDB = indexedDB.open('ScrumBoard', 1);
    requestDB.onsuccess = function (event) {
        const db = event.target.result;
        const transaction = db.transaction(["tasks"], "readonly");
        const objectStore = transaction.objectStore("tasks");
        const index = objectStore.index("list");
        const range = IDBKeyRange.only(list);
        const request = index.openCursor(range);

        let tasks = [];

        request.onsuccess = function(event) {
            let cursor = event.target.result;
            if (cursor) {
                tasks.push(cursor.value);
                cursor.continue();
            } else {
                tasks.sort((a, b) => a.position - b.position);
                callback(tasks);
            }
        };

        request.onerror = function(event) {
            console.error("Error getting tasks by list: " + event.target.errorCode);
        };

        transaction.oncomplete = function(event) {
            db.close();
        }; 
    };
    
    requestDB.onerror = function(event) {
        console.error("Error opening database: " + event.target.errorCode);
    };
}

