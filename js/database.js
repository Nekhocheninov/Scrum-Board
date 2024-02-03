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

    addInitialTasks(objectStore);

    console.log("Database upgrade finished");
};

// Function to add initial tasks to the database.
function addInitialTasks(objectStore) {
    const task1 = {
        title: "Start Task Management",
        description: "Thank you for taking the time to check out my project! I hope you enjoyed it! :)",
        datetime: new Date().toLocaleString("ru-RU"),
        list: "list3",
        position: 0,
        state: 0
    };
    objectStore.add(task1);

    const task2 = {
        title: "Learn to Use",
        description: "1. Creating Tasks.\n" +
            "To create a new task, enter a name in the Title area, then press Enter on your keyboard.\n" +
            "\n2. Opening/Closing Task Details.\n" +
            "Just click on the task card.\n" +
            "\n3. Editing Task Details.\n" +
            "Click the Edit icon then update the task description. Click the Edit icon again to save the changes.\n" +
            "\n4. Moving Tasks.\n" +
            "Move tasks using drag and drop.\n" +
            "\n5. Deleting Tasks.\n" +
            "To delete a task, open the task then click the trash can icon.",
        datetime: new Date().toLocaleString("ru-RU"),
        list: "list2",
        position: 0,
        state: 1
    };
    objectStore.add(task2);
}