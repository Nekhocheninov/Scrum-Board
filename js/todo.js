var input = document.querySelector("input[type = 'text']");
var imgs = document.getElementsByTagName("img");
var lists = document.querySelectorAll(".list");
var draggedItem = null;

function addScrum(list, child) {
  const node = document.getElementById(list);
  node.appendChild(child);
}

function handleEditClick(span, parent) {
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

function handleImgClick(img) {
  var node = img.parentNode;

  switch (img.className) {
    case "trash":
      node.remove();
      break;
    case "img-right":
      addScrum("list2", node);
      break;
    case "img-left":
      addScrum("list1", node);
      break;
    case "edit":
      var span = node.getElementsByTagName("span")[0];
      handleEditClick(span, node);
      break;
  }

  event.stopImmediatePropagation();
}

for (let img of imgs)
  if (img.className === "trash" || img.className === "img-right" || img.className === "img-left" || img.className === "edit")
    img.addEventListener("click", function () { handleImgClick(img); });

function handleListClick(event) {
  if (!(event.target.tagName === "LI")) return;

  var target = event.target;
  target.classList.remove("editmode");
  target.getElementsByTagName("span")[0].setAttribute("contenteditable", "false");
  target.classList.toggle("closed");
}

const getNextElement = (cursorPosition, currentElement) => {
  const currentElementCoord = currentElement.getBoundingClientRect();
  const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;
  const nextElement = cursorPosition < currentElementCenter ? currentElement : currentElement.nextElementSibling;
  return nextElement;
};

lists.forEach(function (list) {
  list.addEventListener("click", handleListClick);
  list.addEventListener("dragend", function (event) {
    event.target.classList.remove("selected");
    if (draggedItem) draggedItem = null;
  });

  list.addEventListener("dragover", function (event) {
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
  });
});

document.addEventListener("dragstart", function (event) {
  if (event.target.tagName === "LI") {
    event.target.classList.add("selected");
    draggedItem = event.target;
  }
});

function handleInputKeyPress(keyPressed) {
  if (keyPressed.which === 13 && input.value !== "") {
    var newTodo = input.value;
    const node = document.getElementById("list1");
    var clone = node.querySelector("li").cloneNode(true);
    clone.style = "";
    clone.insertBefore(document.createTextNode(newTodo), clone.firstChild);
    var currentDate = new Date();
    clone.querySelector(".DateTime").appendChild(document.createTextNode(currentDate.toLocaleString("ru-RU")));
    node.appendChild(clone);
    input.value = "";
    Todo();
  }
}

input.addEventListener("keypress", handleInputKeyPress);
