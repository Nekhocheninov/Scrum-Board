var input = document.querySelector("input[type = 'text']");
var imgs = document.getElementsByTagName("img");

var lists = document.querySelectorAll(".list");

// Add drag and drop functionality
lists.forEach(function (list) {
  list.addEventListener("dragover", function (event){
    event.preventDefault();
  });

  list.addEventListener("drop", function (event){
    event.preventDefault();
    if (draggedItem) {
      list.appendChild(draggedItem);
      draggedItem = null;
    }
  });
});

var draggedItem = null;

document.addEventListener("dragstart", function (event){
  if (event.target.classList.contains("list")) return;
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
    node.appendChild(clone).append(newTodo);
    this.value = "" ;
    Todo();
  }
});

Todo();