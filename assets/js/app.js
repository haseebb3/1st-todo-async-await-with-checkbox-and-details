const todoForm = document.getElementById("todoForm");
const updateTodoBtn = document.getElementById("updateTodoBtn");
const todoContainer = document.getElementById("todoContainer");
const spinner = document.getElementById("spinner");

const baseTodoUrl = `https://posts-crud-c2796-default-rtdb.firebaseio.com`;
const todoUrl = `${baseTodoUrl}/todowithcheckbox.json`;


function toggleSpinner(text = "Loading") {
    spinner.classList.toggle("d-none");
    spinner.innerHTML = `
        <button class="btn btn-primary" type="button" disabled>
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ${text}
        </button>
    `
}



function snackBar(msg, icon) {
    Swal.fire({
        text: msg,
        icon: icon,
        timer: 3000,
    });
}

const localState = {
    todoArray: [],
    editId: null,
};

function nesObjToArr(obj) {
    localState.todoArray = Object.entries(obj).map((obj) => ({ id: obj[0], ...obj[1] })).reverse();
}

// function handleNoTdos() {
//     if (localState.todoArray.length === 0) {
//         todoContainer.innerHTML = `<li class="list-group-item text-center text-danger noTodo" id="noTodoLi"><strong> No Todos Yet </strong></li>`
//     } else {
//         const noTodo = document.querySelector(".noTodo");
//         if(noTodo){
//             noTodo.remove();
//         }
//     }
// }

async function fetchTodos() {
    try {
        toggleSpinner("Loading...");
        let res = await fetch(todoUrl, {
            method: "GET",
            body: null,
            headers: {
                "Content-Type": "application/json",
                "Security": "JWT Token",
            },
        });

        if (!res.ok) {
            throw new Error(`Error : ${err.res.status}`);
        }

        let data = await res.json();
        nesObjToArr(data);
        renderTodos(localState.todoArray);
    } catch (err) {
        console.log(err);
        snackBar(`Error : ${err}`, "error");
    } finally {
        toggleSpinner();
    }
}

fetchTodos();

function renderTodos(arr) {
    let res = "";
    arr.forEach((obj, idx) => {
        res += `
            <li class="list-group-item" id="${obj.id}">
                            <div class="accordion" id="accordionExample-${obj.todoId}">
                                <div class="card">
                                    <div class="card-header" id="headingOne">
                                        <h2 class="mb-0 d-flex justify-content-between">

                                            <input onchange="onStateChange(this)" type="checkbox" ${obj.isCompleted ? "checked" : ""} class="mr-2"
                                                style="width:30px; height: 30px; margin-top:12px;">
                                            <button class="btn btn-block text-left text-dark">
                                                <strong class="h3">${obj.todoItem}</strong>
                                            </button>

                                            <button type="button" data-toggle="collapse" data-target="#collapseOne-${obj.todoId}"
                                                aria-expanded="true" aria-controls="collapseOne-${obj.todoId}"
                                                class="btn btn-sm btn-outline-dark h5 mr-2">Details</button>

                                            <div class="d-flex justify-content-between">
                                                <button onclick="onEdit(this)"
                                                    class="btn btn-sm btn-outline-primary h5 mr-2">Edit</button>
                                                <button onclick="onDelete(this)"
                                                    class="btn btn-sm btn-outline-danger h5">Remove</button>
                                            </div>
                                        </h2>
                                    </div>

                                    <div data-removeId="${obj.id}" id="collapseOne-${obj.todoId}" class="collapse" aria-labelledby="headingOne"
                                        data-parent="#todoContainer">
                                        <div class="card-body bg-dark text-white">
                                            <h5>Todo Details : </h5>
                                            ${obj.details}
                                        </div>
                                    </div>
                                </div>
                        </li>
        `;
    });

    todoContainer.innerHTML = res;
}


//create
async function onSubmit(event) {
    try {
        const statusControl = document.getElementById("status");
        const todoInputControl = document.getElementById("todoInput");
        const descriptionControl = document.getElementById("description");
        event.preventDefault();
        const newTodo = {
            todoItem: todoInputControl.value,
            isCompleted: statusControl.value === "yes" ? true : false,
            details: descriptionControl.value,
            todoId: Date.now()
        }
        toggleSpinner("Adding Todo...")
        let res = await fetch(todoUrl, {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: {
                "Content-Type": "application/json",
                "Security": "JWT Token",
            }
        });

        if (!res.ok) {
            throw new Error("Error", res.status)
        }

        let data = await res.json();
        newTodo.id = data.name;
        localState.todoArray.unshift(newTodo);
        let newLi = document.createElement("li");
        newLi.className = "list-group-item";
        newLi.id = data.name;
        newLi.innerHTML = `
        <div class="accordion" id="accordionExample-${newTodo.todoId}">
        <div class="card">
            <div class="card-header" id="headingOne">
                <h2 class="mb-0 d-flex justify-content-between">

                    <input onchange="onStateChange(this)" type="checkbox" ${newTodo.isCompleted ? "checked" : ""} class="mr-2"
                        style="width:30px; height: 30px; margin-top:12px;">
                    <button class="btn btn-block text-left text-dark">
                        <strong class="h3">${newTodo.todoItem}</strong>
                    </button>

                    <button type="button" data-toggle="collapse" data-target="#collapseOne-${newTodo.todoId}"
                        aria-expanded="true" aria-controls="collapseOne-${newTodo.todoId}"
                        class="btn btn-sm btn-outline-dark h5 mr-2">Details</button>

                    <div class="d-flex justify-content-between">
                        <button onclick="onEdit(this)"
                            class="btn btn-sm btn-outline-primary h5 mr-2">Edit</button>
                        <button onclick="onDelete(this)"
                            class="btn btn-sm btn-outline-danger h5">Remove</button>
                    </div>
                </h2>
            </div>

            <div id="collapseOne-${newTodo.todoId}" class="collapse" aria-labelledby="headingOne"
                data-parent="#todoContainer">
                <div class="card-body bg-dark text-white">
                    <h5>Todo Details : </h5>
                    ${newTodo.details}
                </div>
            </div>
        </div>
    `;

        todoContainer.prepend(newLi);
        todoForm.reset();
        snackBar(`New todo added with id : ${data.name}`, "success");
    } catch (err) {
        snackBar(err, 'error');
        console.log(err);
    }
    finally {
        toggleSpinner();
    }

}


//edit
function onEdit(ele) {
    const statusControl = document.getElementById("status");
    const todoInputControl = document.getElementById("todoInput");
    const descriptionControl = document.getElementById("description");
    const addTodoBtn = document.getElementById("addTodoBtn");
    const editId = ele.closest("li").id;
    localState.editId = editId;
    const editObj = localState.todoArray.find(t => t.id === editId);
    todoInputControl.value = editObj.todoItem;
    descriptionControl.value = editObj.details;
    statusControl.value = editObj.isCompleted ? "yes" : "no";
    updateTodoBtn.classList.remove("d-none");
    addTodoBtn.classList.add("d-none");
}


//update
async function onUpdate() {
    try {
        const statusControl = document.getElementById("status");
        const todoInputControl = document.getElementById("todoInput");
        const descriptionControl = document.getElementById("description");
        const updateId = localState.editId;
        const updateUrl = `${baseTodoUrl}/todowithcheckbox/${updateId}.json`;
        const addTodoBtn = document.getElementById("addTodoBtn");
        const existingObj = localState.todoArray.find(obj => obj.id === updateId);
        const updatedObj = {
            ...existingObj,
            todoItem: todoInputControl.value,
            isCompleted: statusControl.value === "yes" ? true : false,
            details: descriptionControl.value,
        }
        toggleSpinner("Updating Todo...")
        let response = await fetch(updateUrl, {
            method: "PATCH",
            body: JSON.stringify(updatedObj),
            headers: {
                "Content-Type": "application/json",
                "Security": "JWT Token",
            }
        });
        if (!response.ok) {
            throw new Error(`Error while fetching data : ${response.status}`);
        }
        let data = await response.json();
        let updateLi = document.getElementById(updateId);
        updateLi.innerHTML = `
        <div class="accordion" id="accordionExample-${updatedObj.todoId}">
        <div class="card">
            <div class="card-header" id="headingOne">
                <h2 class="mb-0 d-flex justify-content-between">

                    <input onchange="onStateChange(this)" type="checkbox" ${updatedObj.isCompleted ? "checked" : ""} class="mr-2"
                        style="width:30px; height: 30px; margin-top:12px;">
                    <button class="btn btn-block text-left text-dark">
                        <strong class="h3">${updatedObj.todoItem}</strong>
                    </button>

                    <button type="button" data-toggle="collapse" data-target="#collapseOne-${updatedObj.todoId}"
                        aria-expanded="true" aria-controls="collapseOne-${updatedObj.todoId}"
                        class="btn btn-sm btn-outline-dark h5 mr-2">Details</button>

                    <div class="d-flex justify-content-between">
                        <button onclick="onEdit(this)"
                            class="btn btn-sm btn-outline-primary h5 mr-2">Edit</button>
                        <button onclick="onDelete(this)"
                            class="btn btn-sm btn-outline-danger h5">Remove</button>
                    </div>
                </h2>
            </div>

            <div data-removeId="${updatedObj.id}" id="collapseOne-${updatedObj.todoId}" class="collapse" aria-labelledby="headingOne"
                data-parent="#todoContainer">
                <div class="card-body bg-dark text-white">
                    <h5>Todo Details : </h5>
                    ${updatedObj.details}
                </div>
            </div>
        </div>
    `;
        snackBar(`Tod with id : ${updateId} is Updated successfully...`, "success");
        todoForm.reset();
        updateTodoBtn.classList.add("d-none");
        addTodoBtn.classList.remove("d-none")
    } catch (err) {
        snackBar(err, "error");
        console.log(err);
    } finally {
        toggleSpinner()
    }
}


//delete
async function onDelete(ele) {
    try {
        const deleteId = ele.closest("li").id;
        let confirmation = await Swal.fire({
            title: "Are you sure?",
            text: `You want to delete todo with id : ${deleteId} ?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1de0ee",
            cancelButtonColor: "rgb(242, 82, 82)",
            confirmButtonText: "Yes, delete it!"
        });
        if (confirmation.isConfirmed) {
            const deleteUrl = `${baseTodoUrl}/todowithcheckbox/${deleteId}.json`;
            toggleSpinner("Deleting Todo...");
            let response = await fetch(deleteUrl, {
                method: "DELETE",
                body: null,
                headers: {
                    "Content-Type": "application/json",
                    "Security": "JWT Token",
                }

            })
            let data = await response.json();
            const deleteIndex = localState.todoArray.findIndex(t => t.id === deleteId);
            localState.todoArray.splice(deleteIndex, 1);
            ele.closest("li").remove();
            snackBar(`Todo with id : ${deleteId} is deleted successfylly...`, "success");
        }
        else {
            toggleSpinner()
        }

    } catch (err) {
        snackBar(err, "error");
        console.log(err);
    } finally {
        toggleSpinner();
    }
}

//Status update
async function onStateChange(ele) {
    try {
        const updateId = ele.closest("li").id;
        const updateUrl = `${baseTodoUrl}/todowithcheckbox/${updateId}.json`;
        const updatedObj = {
            isCompleted: ele.checked
        }
        toggleSpinner("Status updating...");
        let response = await fetch(updateUrl, {
            method : "PATCH",
            body : JSON.stringify(updatedObj)
        })
        let data = await response.json();
        let updateInLocal = localState.todoArray.find(e => e.id === updateId);
        updateInLocal.isCompleted = updatedObj.isCompleted;

    } catch(err){
        snackBar(`Error : ${err}`, "error");
        console.log(err);
    } finally{
        toggleSpinner()
    }
    
}


todoForm.addEventListener("submit", onSubmit);
updateTodoBtn.addEventListener("click", onUpdate)

