// Открытие или создание базы данных "todo"
const request = indexedDB.open('todo', 1);

// Обработчик обновления базы данных
request.onupgradeneeded = function(event) {
  const db = event.target.result;

  // Создание таблицы "users"
  const usersStore = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
  usersStore.createIndex('name'    , 'name'    , { unique: false });
  usersStore.createIndex('password', 'password', { unique: false });

  // Создание таблицы "tasks"
  const tasksStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
  tasksStore.createIndex('title'      , 'title'      , { unique: false });
  tasksStore.createIndex('description', 'description', { unique: false });
  tasksStore.createIndex('datetime'   , 'datetime'   , { unique: false });
  tasksStore.createIndex('list'       , 'list'       , { unique: false });

  // Создание таблицы "usertask"
  const usertaskStore = db.createObjectStore('usertask', { keyPath: 'id', autoIncrement: true });
  usertaskStore.createIndex('userid', 'userid', { unique: false });
  usertaskStore.createIndex('taskid', 'taskid', { unique: false });
  usertaskStore.createIndex('order' , 'order' , { unique: false });

  // Установка внешних ключей
  usertaskStore.createIndex('user_relation', ['userid', 'id'], { unique: true });
  usertaskStore.createIndex('task_relation', ['taskid', 'id'], { unique: true });
};

function addUser(name, password) {
    const request = indexedDB.open('todo', 1);
  
    request.onsuccess = function(event) {
      const db = event.target.result;
  
      // Начало транзакции для таблицы "users"
      const transaction = db.transaction('users', 'readwrite');
      const usersStore = transaction.objectStore('users');
  
      // Добавление пользователя
      const addUserRequest = usersStore.add({ name: name, password: password });
  
      addUserRequest.onsuccess = function(event) {
        console.log('Пользователь успешно добавлен в базу данных');
      };
  
      addUserRequest.onerror = function(event) {
        console.error('Ошибка при добавлении пользователя в базу данных');
      };
  
      // Завершение транзакции
      transaction.oncomplete = function(event) {
        db.close();
      };
    };
  
    request.onerror = function(event) {
      console.error('Ошибка при открытии базы данных');
    };
}

function addTask(title, description, datetime, userid, list, order) {
    const request = indexedDB.open('todo', 1);
  
    request.onsuccess = function(event) {
      const db = event.target.result;
  
      // Начало транзакции для таблиц "tasks" и "usertask"
      const transaction = db.transaction(['tasks', 'usertask'], 'readwrite');
      const tasksStore    = transaction.objectStore('tasks');
      const usertaskStore = transaction.objectStore('usertask');
  
      // Добавление таску
      const addtaskRequest = tasksStore.add({ title: title, description: description, datetime: datetime, list: list });
  
      addtaskRequest.onsuccess = function(event) {
        const taskid = event.target.result;

        // Создание связи в таблице "usertask"
        const addUserTaskRequest = usertaskStore.add({ userid: userid, taskid: taskid, order: order });

        addUserTaskRequest.onsuccess = function(event) {
            console.log('Задача успешно добавлена в базу данных и связана с пользователем');
        };

        addUserTaskRequest.onerror = function(event) {
        console.error('Ошибка при создании связи между задачей и пользователем');
        };
      };

      addtaskRequest.onerror = function(event) {
        console.error('Ошибка при добавлении таски в базу данных');
      };
  
      // Завершение транзакции
      transaction.oncomplete = function(event) {
        db.close();
      };
    };
  
    request.onerror = function(event) {
      console.error('Ошибка при открытии базы данных');
    };
}

function getTasks(userid) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('todo', 1);
  
      request.onsuccess = function(event) {
        const db = event.target.result;
  
        // Начало транзакции для таблиц "usertask" и "tasks"
        const transaction = db.transaction(['usertask', 'tasks'], 'readonly');
        const usertaskStore = transaction.objectStore('usertask');
        const tasksStore = transaction.objectStore('tasks');
  
        // Создание индекса для поиска задач пользователя
        const userIndex = usertaskStore.index('userid');
  
        // Открытие курсора для получения задач пользователя
        const cursorRequest = userIndex.openCursor(IDBKeyRange.only(userid));
  
        // Массив для хранения задач пользователя
        const tasksArray = [];
  
        // Обработчик успешного открытия курсора
        cursorRequest.onsuccess = function(event) {
          const cursor = event.target.result;
  
          if (cursor) {
            const taskid = cursor.value.taskid;
  
            // Получение задачи из таблицы "tasks"
            const getRequest = tasksStore.get(taskid);
  
            getRequest.onsuccess = function(event) {
              const task = event.target.result;
              tasksArray.push(task);
  
              cursor.continue();
            };
          }
        };
  
        // Завершение транзакции и возврат массива задач через промис
        transaction.oncomplete = function(event) {
          db.close();
          resolve(tasksArray);
        };
  
        transaction.onerror = function(event) {
          reject('Ошибка при выполнении транзакции');
        };
      };
  
      request.onerror = function(event) {
        reject('Ошибка при открытии базы данных');
      };
    });
}

function deleteTask(taskId) {
    const request = indexedDB.open('todo', 1);
  
    request.onsuccess = function(event) {
      const db = event.target.result;
  
      // Начало транзакции для таблиц "tasks" и "usertask"
      const transaction = db.transaction(['tasks', 'usertask'], 'readwrite');
      const tasksStore = transaction.objectStore('tasks');
      const usertaskStore = transaction.objectStore('usertask');
  
      // Удаление задачи из таблицы "tasks"
      const deleteTaskRequest = tasksStore.delete(taskId);
  
      deleteTaskRequest.onsuccess = function(event) {
        console.log('Задача успешно удалена из базы данных');
  
        // Удаление связи из таблицы "usertask"
        const index = usertaskStore.index('task_relation');
        const cursorRequest = index.openCursor(IDBKeyRange.only(taskId));
  
        cursorRequest.onsuccess = function(event) {
          const cursor = event.target.result;
  
          if (cursor) {
            cursor.delete();
            console.log('Связь задачи с пользователем успешно удалена из базы данных');
          }
        };
      };
  
      deleteTaskRequest.onerror = function(event) {
        console.error('Ошибка при удалении задачи из базы данных');
      };
  
      // Завершение транзакции
      transaction.oncomplete = function(event) {
        db.close();
      };
    };
  
    request.onerror = function(event) {
      console.error('Ошибка при открытии базы данных');
    };
}

function updateTaskDescription(taskid, newDescription) {
    const request = indexedDB.open('todo', 1);
  
    request.onsuccess = function(event) {
      const db = event.target.result;
  
      // Начало транзакции для таблицы "tasks"
      const transaction = db.transaction('tasks', 'readwrite');
      const tasksStore = transaction.objectStore('tasks');
  
      // Получение существующей задачи
      const getTaskRequest = tasksStore.get(taskid);
  
      getTaskRequest.onsuccess = function(event) {
        const existingTask = event.target.result;
  
        if (existingTask) {
          // Изменение поля description
          existingTask.description = newDescription;
  
          // Обновление задачи в таблице "tasks"
          const updateTaskRequest = tasksStore.put(existingTask);
  
          updateTaskRequest.onsuccess = function(event) {
            console.log('Поле description задачи успешно изменено в базе данных');
          };
  
          updateTaskRequest.onerror = function(event) {
            console.error('Ошибка при обновлении поля description задачи в базе данных');
          };
        } else {
          console.error('Задача с указанным идентификатором не найдена');
        }
      };
  
      // Завершение транзакции
      transaction.oncomplete = function(event) {
        db.close();
      };
    };
  
    request.onerror = function(event) {
      console.error('Ошибка при открытии базы данных');
    };
}

function updateTaskListAndOrder(taskid, userid, newList, newOrder) {
    const request = indexedDB.open('todo', 1);
  
    request.onsuccess = function(event) {
      const db = event.target.result;
  
      // Начало транзакции для таблицы "tasks"
      const transaction = db.transaction(['tasks', 'usertask'], 'readwrite');
      const tasksStore    = transaction.objectStore('tasks');
      const usertaskStore = transaction.objectStore('usertask');
  
      // Получение существующей таски
      const getTaskRequest = tasksStore.get(taskid);
  
      getTaskRequest.onsuccess = function(event) {
        const existingTask = event.target.result;
  
        if (existingTask) {
          // Изменение поля list
          existingTask.list = newList;
  
          // Обновление таски в таблице "tasks"
          const updateTaskRequest = tasksStore.put(existingTask);
  
          updateTaskRequest.onsuccess = function(event) {
            console.log('Поле list задачи успешно изменено в базе данных');
          };
  
          updateTaskRequest.onerror = function(event) {
            console.error('Ошибка при обновлении поля list задачи в базе данных');
          };
        } else {
          console.error('Задача с указанным идентификатором не найдена');
        }
      };

      // Создание составного ключа для поиска по полям userid и taskid
      const compositeKey = IDBKeyRange.bound([userid, taskid], [userid, taskid]);

      // Получение задачи по составному ключу
      const getUserTaskRequest = usertaskStore.get(compositeKey);
  
      getUserTaskRequest.onsuccess = function(event) {
        const existingTask = event.target.result;
  
        if (existingTask) {
          // Изменение поля order
          existingTask.order = newOrder;
  
          // Обновление таски в таблице "usertask"
          const updateUserTaskRequest = usertaskStore.put(existingTask);
  
          updateUserTaskRequest.onsuccess = function(event) {
            console.log('Поле order задачи успешно изменено в базе данных');
          };
  
          updateUserTaskRequest.onerror = function(event) {
            console.error('Ошибка при обновлении поля order задачи в базе данных');
          };
        } else {
          console.error('Задача с указанным идентификатором не найдена');
        }
      };
  
      // Завершение транзакции
      transaction.oncomplete = function(event) {
        db.close();
      };
    };
  
    request.onerror = function(event) {
      console.error('Ошибка при открытии базы данных');
    };
}