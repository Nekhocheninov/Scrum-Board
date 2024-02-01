var input = document.querySelector("input[type = 'text']");
var draggedItem = null;
var originalList = null;

/*
    Updates the list of tasks on the page.
    @param {string} list - List id to update.
*/
function UpdateList(list) {
    getTasksByList(list, function(tasks) {
        const node = document.getElementById(list);
        if (list == "list1") while (node.children.length > 1) node.removeChild(node.lastChild);
        else node.innerHTML = "";
        tasks.forEach(task => {
            var clone = document.getElementById("list1").querySelector("li").cloneNode(true);
            clone.id = task.id
            clone.style = '';
            clone.querySelector(".DateTime").appendChild(document.createTextNode(task.datetime));
            clone.querySelector(".Description").appendChild(document.createTextNode(task.description));
            clone.insertBefore(document.createTextNode(task.title), clone.firstChild);
            node.appendChild(clone);
        })
        addEventListenersToImages();
        addEventListenersToLists();
    });
}

/*
    Event handler for pressing the Enter key in an input field.
    Creates a new task when you press Enter and then updates the list.
*/
input.addEventListener("keypress", function(keyPressed) {
    if((keyPressed.which === 13) && (this.value != "")) {
        const node = document.querySelectorAll('#list1 li');
        const numberOfItems = node.length - 1;
        let currentDate = new Date();
        let newTask = {
            title:       this.value,
            description: "Description",
            datetime:    currentDate.toLocaleString("ru-RU"),
            list:        "list1",
            position:    numberOfItems
        };
        addTask(newTask);
        this.value = "" ;
        UpdateList("list1");
    }
});

/*
    Adds event handlers to task images.
*/
function addEventListenersToImages() {
    let imgs = document.querySelectorAll("img.trash");
    for (let img of imgs) {
        img.removeEventListener("click", TrashClickHandler);
        img.addEventListener("click", TrashClickHandler);
    }
    imgs = document.querySelectorAll("img.edit");
    for (let img of imgs) {
        img.removeEventListener("click", TrashClickHandler);
        img.addEventListener("click", TrashClickHandler);
    }
    imgs = document.querySelectorAll("img.img-right");
    for (let img of imgs) {
        img.removeEventListener("click", TrashClickHandler);
        img.addEventListener("click", TrashClickHandler);
    }
    imgs = document.querySelectorAll("img.img-left");
    for (let img of imgs) {
        img.removeEventListener("click", TrashClickHandler);
        img.addEventListener("click", TrashClickHandler);
    }
}

/*
    Click handler on the trash can image (deleting a task).
    @param {Event} event - Image click event.
*/
function TrashClickHandler(event) {
    const id = parseInt(event.target.closest('li').id);
    const list = event.target.closest('li').closest('ul');
    const items = list.querySelectorAll('li:not(#none)');

    getTask(id, function(task) {
        changePositions(items, task.position + 1, items.length);
    });

    deleteTask(id);
    UpdateList(list.id);
}

/*
    Changes the positions of tasks in the list.
    @param {HTMLElement[]} items - An array of task elements for changing positions.
    @param {number} start - The starting index in the `items` array.
    @param {number} end - The ending index in the `items` array.
    @param {number} [num=-1] - An optional parameter that determines how much to change task positions.
*/
function changePositions(items, start, end, num = -1) {
    for (let i = start; i < end; i++) {
        getTask(parseInt(items[i].id), function(task) {
            task.position += num;
            updateTask(task);
        });
    }
}

/*

*/
function handleEditClick(event) {
    if (!span || span.getAttribute("contenteditable") === "false" || !span.hasAttribute("contenteditable")) {
        span.setAttribute("contenteditable", "true");
        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(false);
    
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    
        parent.classList.add("editmode");
        parent.classList.remove("closed");
    } else {
        span.setAttribute("contenteditable", "false");
        parent.classList.remove("editmode");
    }
}

/*
    Handler for the "dragstart" event.
    Adds the "selected" class to the dragged list item and stores it in the `draggedItem` variable.
    Also stores the parent of the dragged element in the `originalList` variable.
*/
document.addEventListener("dragstart", function (event) {
    if (event.target.tagName === "LI") {
        event.target.classList.add("selected");
        draggedItem = event.target;
        originalList = event.target.parentNode;
    }
});

/*
    Adds event handlers for tasks.
*/
function addEventListenersToLists() {
    let lists = document.querySelectorAll(".list");
    for (let list of lists) {
        list.removeEventListener("click", listClickHandler);
        list.addEventListener("click", listClickHandler);

        list.removeEventListener("dragend", listdragendHandler);
        list.addEventListener("dragend", listdragendHandler);

        list.removeEventListener("dragover", listdragoverHandler);
        list.addEventListener("dragover", function(event) {
            listdragoverHandler(event, list);
        });
    }
}

/*
    Task click handler.
    @param {Event} event - Task click event.
*/
function listClickHandler(event) {
    if (!(event.target.tagName === "LI")) return;
    var target = event.target;
    target.classList.remove("editmode");
    target.getElementsByTagName("span")[0].setAttribute("contenteditable", "false");
    target.classList.toggle("closed");
}

/*

*/
function listdragendHandler(event) {
    event.target.classList.remove("selected");
    if (draggedItem) {
        if ((event.target.parentNode.id) == (originalList.id)){
            getTask(parseInt(event.target.id), function(task) {
                const items = event.target.closest('ul').querySelectorAll('li:not(#none)');
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id == event.target.id) {
                        if (task.position < i) {
                            changePositions(items, task.position, i);
                        } else {
                            changePositions(items, i + 1, task.position + 1, 1);
                        }
                        task.position = i;
                        updateTask(task);
                        break;
                    }
                }
            });
        } else {
            const items2 = originalList.querySelectorAll('li:not(#none)');
            getTask(parseInt(event.target.id), function(task) {
                for (let i = task.position; i < items2.length; i ++) {
                    changePositions(items2, i, items2.length);
                }
                const items = event.target.closest('ul').querySelectorAll('li:not(#none)');
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id == event.target.id) {
                        changePositions(items, i + 1, items.length, 1);
                        task.position = i;
                        task.list = event.target.closest('ul').id;
                        updateTask(task);
                        break;
                    }
                }
            });
        }
        draggedItem = null;
        originalList = null;
    }
}

/*
    "dragover" event handler for the list.
    Moves the dragged element above the current list.
    @param {DragEvent} event - "dragover" event.
    @param {HTMLElement} list - The list over which the element is floated.
*/
function listdragoverHandler(event, list) {
    event.preventDefault();
    if (!draggedItem) return;

    const currentElement = event.target;

    if (currentElement.tagName === "LI" && draggedItem !== currentElement) {
        const activeElement = document.querySelector(`.selected`);
        const nextElement = getNextElement(event.clientY, currentElement);
        if (nextElement && (activeElement === nextElement.previousElementSibling || activeElement === nextElement)) return;
        list.insertBefore(draggedItem, nextElement);
    } else if (currentElement.tagName === "UL" && !currentElement.lastElementChild) {
        list.appendChild(draggedItem);
    } else if (currentElement.tagName === "UL" && event.clientY > currentElement.lastElementChild.getBoundingClientRect().top) {
        list.appendChild(draggedItem);
    }
}

/*
    Returns the next element relative to the specified cursor position relative to the current element.
    If the cursor position is less than the center of the current element, returns the current element.
    Otherwise, it returns the next element after the current one in the DOM tree.
    @param {number} cursorPosition - Cursor position.
    @param {HTMLElement} currentElement - The current element.
    @returns {HTMLElement} - The next element after the current one in the DOM tree.
*/
function getNextElement (cursorPosition, currentElement) {
    const currentElementCoord = currentElement.getBoundingClientRect();
    const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;
    const nextElement = cursorPosition < currentElementCenter ? currentElement : currentElement.nextElementSibling;
    return nextElement;
}

UpdateList("list1");
UpdateList("list2");
UpdateList("list3");