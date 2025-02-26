import React, { useState, useEffect } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import "./styles.css";

const TASKS_API = "https://67bd6c9c321b883e790c61d3.mockapi.io/tasks";

const statuses = ["Жоспар", "Орындау", "Дайын"];

const Task = ({ task, moveTask, deleteTask }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "TASK",
    item: { id: task.id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div ref={drag} className="task" style={{ opacity: isDragging ? 0.5 : 1 }}>
      {task.title}
      <button onClick={() => deleteTask(task.id)}>❌</button>
    </div>
  );
};

const Column = ({ status, tasks, moveTask, deleteTask }) => {
  const [, drop] = useDrop(() => ({
    accept: "TASK",
    drop: (item) => moveTask(item.id, status),
  }));

  return (
    <div ref={drop} className="column">
      <h3>{status}</h3>
      {tasks.map((task) => (
        <Task
          key={task.id}
          task={task}
          moveTask={moveTask}
          deleteTask={deleteTask}
        />
      ))}
    </div>
  );
};

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    fetch(`${TASKS_API}?_limit=10`)
      .then((res) => res.json())
      .then((data) => {
        const formattedTasks = data.map((task) => ({
          id: task.id,
          title: task.title,
          status: statuses[0], // Әдепкі "Жоспар"
        }));
        setTasks(formattedTasks);
      });
  }, []);

  const moveTask = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const addTask = () => {
    if (!newTaskTitle) return;
    const newTask = {
      title: newTaskTitle,
      status: "Жоспар",
    };
    fetch(TASKS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then((data) => {
        setTasks([...tasks, { ...data, id: tasks.length + 1 }]);
        setNewTaskTitle("");
      });
  };

  const deleteTask = (taskId) => {
    fetch(`${TASKS_API}/${taskId}`, {
      method: "DELETE",
    }).then(() => {
      setTasks(tasks.filter((task) => task.id !== taskId));
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="task-manager">
        <div className="add-task">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Тапсырма атауын енгізіңіз"
          />
          <button onClick={addTask}>Қосу</button>
        </div>
        {statuses.map((status) => (
          <Column
            key={status}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
            moveTask={moveTask}
            deleteTask={deleteTask}
          />
        ))}
      </div>
    </DndProvider>
  );
};

export default TaskManager;
