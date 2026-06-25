//show hidden fields (fiexd ,event options )
// const task_type = document.getElementById("task-type");

// const fixedFields = document.getElementById("fixedFields");
// const eventFields = document.getElementById("eventFields");

// task_type.addEventListener("change", () => {

//   fixedFields.style.display = "none";
//   eventFields.style.display = "none";

//   if (task_type.value === "fixed") {
//     fixedFields.style.display = "block";
//   }

//   if (task_type.value === "event") {
//     eventFields.style.display = "block";
//   }

// });
// -------------------------------------------------------------------

 // ==========================================
// GLOBALS & DATE UTILITIES
// ==========================================
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const currentDayIndex = new Date().getDay();

// Rotate days array so the current calendar day always starts at index 0
const orderedDays = [
    ...DAYS_OF_WEEK.slice(currentDayIndex),
    ...DAYS_OF_WEEK.slice(0, currentDayIndex)
];

// ==========================================
// TASK CREATION PAGE ENGINE
// ==========================================
var Tasks = [];
const addTaskBtn = document.getElementById("add-new-task");
const createTableBtn = document.getElementById("create-table");

if (addTaskBtn && createTableBtn) {
    // Collect individual inputs and append to collection array
    addTaskBtn.addEventListener("click", () => {
        var task_title = document.getElementById("task-title").value; 
        var task_total_hours = document.getElementById("task-total-hours").value;
        var task_type = document.getElementById("task-type").value;

        if (task_title === "" || task_total_hours === "") {
            alert("enter values");
        } else {
            var task = {
                id: crypto.randomUUID(),
                title: task_title,
                type: task_type,
                totalhours: Number(task_total_hours)
            };
            Tasks.push(task);
        }
    });

    // Map data arrays across calendar matrix and transition to dashboard view
    createTableBtn.addEventListener("click", () => {
        // Instantiate fresh collection locally on click to avoid array pooling on repetitions
        var schedual = []; 

        orderedDays.forEach(day => {
            var dayObj = {
                dayName: day,
                // Map out custom key names uniformly to pass structural constraints cleanly
                task: Tasks.map(task => ({
                    task_title: task.title, // Fixed: Syncs with task input 'title' object property keys
                    hours_per_day: (task.totalhours / 7).toFixed(1),   
                    task_status: false
                })),
            };
            schedual.push(dayObj);
        });

        // Stage stringified payloads into client side disk buffers
        localStorage.setItem("myCreatedSchedule", JSON.stringify(schedual));
        localStorage.setItem("myCreatedTasks", JSON.stringify(Tasks));
        window.location.href = "dashboard.html";
    });
}

// ==========================================
// DASHBOARD LAYOUT & RENDERING ENGINE
// ==========================================
var savedScheduleText = localStorage.getItem("myCreatedSchedule");
var savedTasks = localStorage.getItem("myCreatedTasks");
var finalSchedule = []; 
var Tasks = [];

// Hydrate memory states from stored cache lines if payloads exist
if (savedScheduleText) {
    finalSchedule = JSON.parse(savedScheduleText);
    Tasks = JSON.parse(savedTasks);
}

console.log("البيانات جاهزة للاستخدام في أي مكان بالملف:", Tasks);

// Synchronize all layout building operations with browser document availability
document.addEventListener("DOMContentLoaded", () => {
    
    // Select existing structural containers out of DOM trees safely
    const myTable = document.querySelector("table");
    const headerRow = document.querySelector('table thead tr');
    const tbodyRows = document.querySelectorAll('table tbody tr');

    if (myTable && savedScheduleText) {

        // Wipe obsolete table headers to prepare for incoming state transformations
        if (headerRow) {
            headerRow.innerHTML = '<th>Day</th>'; 
        }

        // Generate dynamic table columns matching created tasks profiles
        Tasks.forEach((item) => {
            if (headerRow) {
                const newTh = document.createElement('th');
                newTh.textContent = item.title;
                headerRow.appendChild(newTh);
            }
        }); 

        // Assemble rows in sequential parallel layout with data mapping indices
        tbodyRows.forEach((row, index) => {
            
            // Clear out legacy td coordinates from prior state loads to halt screen stacking
            row.innerHTML = ''; 

            // Initialize row label column using computed day keys
            const dayTd = document.createElement('td');
            dayTd.className = "day-column";
            dayTd.textContent = orderedDays[index % 7]; 
            row.appendChild(dayTd);

            // Isolate individual data maps corresponding directly to this structural line placement index
            const currentDayData = finalSchedule[index];

            // Render tasks nodes explicitly inside their isolated day containers
            if (currentDayData && Array.isArray(currentDayData.task)) {
                currentDayData.task.forEach((taskData) => {
                    const cellsTd = document.createElement('td');
                    cellsTd.textContent = `${taskData.task_title} (${taskData.hours_per_day}h) `; // Fixed: Syncs property call
                    
                    const checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.className = "cell-class";
                    checkbox.checked = taskData.task_status; // Retains checked history state across reloads
                    
                    cellsTd.appendChild(checkbox);
                    row.appendChild(cellsTd); 
                });
            }
        });

        // ==========================================
        // DYNAMIC STATE EVENT LISTENERS
        // ==========================================

        // Capture checkbox click states to emit console telemetry pipelines
        myTable.addEventListener('change', function(event) {
            if (event.target.classList.contains('cell-class')) {
                const checkbox = event.target;
                const cell = checkbox.closest('td');
                const cellText = cell.textContent.trim(); 
                const row = checkbox.closest('tr');
                const dayText = row.cells[0].textContent.trim(); 
                
                console.log(dayText);
                if (checkbox.checked) {
                    console.log(`تم التشييك على الخلية: ${cellText}`);
                } else {
                    console.log(`تم إلغاء التشييك عن الخلية: ${cellText}`);
                }
            }
        });

        // Track user interactions to write updated state data back down to localStorage
        myTable.addEventListener('change', function(event) {
            if (event.target.classList.contains('cell-class')) {
                const checkbox = event.target;
                const cell = checkbox.closest('td');
                const row = checkbox.closest('tr');
                
                // Translate layout coordinates into raw array addresses
                const columnIndex = cell.cellIndex; 
                const taskIndex = columnIndex - 1; // Extract day index column tracking offset
                const rowIndex = row.rowIndex - 1;  // Extract table header label row tracking offset

                // Commit true/false toggles back to precise nested array addresses
                if (finalSchedule[rowIndex] && finalSchedule[rowIndex].task && finalSchedule[rowIndex].task[taskIndex]) {
                    
                    finalSchedule[rowIndex].task[taskIndex].task_status = checkbox.checked;

                    console.log(`تم تحديث المهمة: ${finalSchedule[rowIndex].task[taskIndex].task_title}`);
                    console.log(`الحالة الجديدة (task_status):`, finalSchedule[rowIndex].task[taskIndex].task_status);
                    
                    // Flush updated schedule state structure into storage
                    localStorage.setItem("myCreatedSchedule", JSON.stringify(finalSchedule));
                }
            }
            console.log(finalSchedule);
        });
    }
});


//   myTable.addEventListener('change', function(event) {
//     // Ensure the changed element is a row checkbox
//     if (event.target.classList.contains('row-select')) {
//       const checkbox = event.target;
      
//       // Find the parent row of the clicked checkbox
//       const row = checkbox.closest('tr');
      
  
//       if (checkbox.checked) {
//         console.log(`Checked: ${productName} (ID: ${itemId})`);
//         row.style.backgroundColor = '#f0f0f0'; // Visual cue
//       } else {
//         console.log(`Unchecked: ${productName}`);
//         row.style.backgroundColor = ''; // Reset color
//       }
//     }
//   });























//  const DAYS_OF_WEEK = ["Thursday", "Friday", "Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];

// function getOrderedDays(startDay) {
//   const startIndex = DAYS_OF_WEEK.indexOf(startDay);
//   return [...DAYS_OF_WEEK.slice(startIndex), ...DAYS_OF_WEEK.slice(0, startIndex)];
// }

// console.log(getOrderedDays("Sunday"))
