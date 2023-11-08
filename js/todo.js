var input = document.querySelector("input[type = 'text']");
var imgs = document.getElementsByTagName("img");

var lists = document.querySelectorAll(".list");
var draggedItem = null;

const getNextElement = (cursorPosition, currentElement) => {
  const currentElementCoord = currentElement.getBoundingClientRect();
  const currentElementCenter = currentElementCoord.y + currentElementCoord.height / 2;
  const nextElement = (cursorPosition < currentElementCenter) ?
      currentElement :
      currentElement.nextElementSibling;
  return nextElement;
};

lists.forEach(function (list){
  list.addEventListener("click", function (event){
    if (!(event.target.tagName === "LI")) return;
    event.target.classList.remove("editmode")
    event.target.getElementsByTagName("span")[0].setAttribute("contenteditable", "false");
    event.target.classList.contains("closed") ? event.target.classList.remove("closed") : event.target.classList.add("closed");
  });

  list.addEventListener("dragend", function (event){
    event.target.classList.remove("selected");
    if (draggedItem) draggedItem = null;
  });

  list.addEventListener("dragover", function (event){
    event.preventDefault();
    if (!draggedItem) return;

    const currentElement = event.target;

    if (currentElement.tagName === "LI" && draggedItem !== currentElement){
      const activeElement = document.querySelector(`.selected`);
      const nextElement = getNextElement(event.clientY, currentElement);
      if (nextElement && activeElement === nextElement.previousElementSibling || activeElement === nextElement) return;
      list.insertBefore(draggedItem, nextElement);
    }
    else if (currentElement.tagName === "UL" && !currentElement.lastElementChild)
      list.appendChild(draggedItem);
    else if (currentElement.tagName === "UL" && event.clientY > currentElement.lastElementChild.getBoundingClientRect().top)
      list.appendChild(draggedItem);
  });
});

document.addEventListener("dragstart", function (event){
  if (event.target.tagName !== "LI") return;
  event.target.classList.add("selected");
  draggedItem = event.target;
});

function Todo(){
  for(let img of imgs){
    if (img.className == "trash"){
      img.addEventListener ("click", function (){
        img.parentElement.remove();
        event.stopImmediatePropagation();
      });
    }
    if (img.className == "img-right"){
      img.addEventListener ("click", function (){
        var node = img.parentNode;
        if (node.parentNode.id == "list1") addScrum('list2', node);
        else addScrum('list3', node);
        event.stopImmediatePropagation();
      });
    }
    if (img.className == "img-left"){
      img.addEventListener ("click", function (){
        var node = img.parentNode;
        if (node.parentNode.id == "list3") addScrum('list2', node);
        else addScrum('list1', node);
        event.stopImmediatePropagation();
      });
    }
    if (img.className == "edit"){
      img.addEventListener ("click", function (){
        var span= img.parentElement.getElementsByTagName("span")[0];
        if (span.getAttribute("contenteditable") === "false" || !span.hasAttribute("contenteditable")){
          span.setAttribute("contenteditable", "true");
          const range = document.createRange();
          range.selectNodeContents(span);
          range.collapse(false);

          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          img.parentElement.classList.add("editmode");
          img.parentElement.classList.remove("closed");
        }
        else{
          span.setAttribute("contenteditable", "false");
          img.parentElement.classList.remove("editmode");
        }
        event.stopImmediatePropagation();
      });
    }
  }
}

function addScrum(list, childe){
  const node = document.getElementById(list);
  node.appendChild(childe);
}

input.addEventListener("keypress", function(keyPressed){
  if((keyPressed.which === 13) && (this.value != "")){
    var newTodo = this.value;
    const node = document.getElementById('list1');
    var clone = node.querySelector('li').cloneNode(true);
    clone.style = '';
    clone.insertBefore(document.createTextNode(newTodo), clone.firstChild);
    var currentDate = new Date();
    clone.querySelector('.DataTime').appendChild(document.createTextNode(currentDate.toLocaleString('ru-RU')));
    node.appendChild(clone);
    this.value = "" ;
    Todo();
  }
});

Todo();