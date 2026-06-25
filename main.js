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
// ==========================================
// التجهيز الأساسي وأيام الأسبوع
// ==========================================
const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let currentDayIndex = (new Date().getDay() );
// تدوير الأيام ليبدأ الجدول دائماً من يوم جهاز المستخدم الحالي
const orderedDays = [
    ...DAYS_OF_WEEK.slice(currentDayIndex),
    ...DAYS_OF_WEEK.slice(0, currentDayIndex)
];

// مصفوفات عالمية لتداول البيانات بداخل الصفحة النشطة
var Tasks = [];
var finalSchedule = [];

// ==========================================
// 1️⃣ محرك صفحة إنشاء المهام (الصفحة الأولى)
// ==========================================
const addTaskBtn = document.getElementById("add-new-task");
const createTableBtn = document.getElementById("create-table");

if (addTaskBtn && createTableBtn) {
    // تصفير الذاكرة المؤقتة فور دخول الصفحة لتبدأ نظيفة تماماً
    Tasks = [];

    // حدث إضافة مهمة جديدة للمصفوفة
    addTaskBtn.addEventListener("click", () => {
        var task_title = document.getElementById("task-title").value.trim(); 
        var task_total_hours = document.getElementById("task-total-hours").value.trim();
        var task_type = document.getElementById("task-type").value;

        if (task_title === "" || task_total_hours === "") {
            alert("الرجاء إدخال قيم صحيحة للمهمة والساعات!");
            return;
        }

        var task = {
            id: crypto.randomUUID(),
            title: task_title,
            type: task_type,
            totalhours: Number(task_total_hours)
        };
        
        Tasks.push(task);
        console.log("المهمة المضافة حالياً:", Tasks);
        
        // مسح خانات المدخلات لتسهيل كتابة المهمة التالية
        document.getElementById("task-title").value = "";
        document.getElementById("task-total-hours").value = "";
    });

    // حدث إنشاء الجدول والانتقال
    createTableBtn.addEventListener("click", () => {
        if (Tasks.length === 0) {
            alert("الرجاء إضافة مهام أولاً قبل الضغط على إنشاء!");
            return;
        }

        // الحذف المسبق لمنع تكدس الذاكرة القديمة
        localStorage.removeItem("myCreatedSchedule");
        localStorage.removeItem("myCreatedTasks");

        var schedual = []; 

        orderedDays.forEach(day => {
            var dayObj = {
                dayName: day,
                task: Tasks.map(task => ({
                    task_title: task.title, 
                    hours_per_day: (task.totalhours / 7).toFixed(1),   
                    task_status: false // تولد دائماً فارغة في الجدول الجديد
                })),
            };
            schedual.push(dayObj);
        });

        // حفظ البيانات النظيفة الجديدة في الـ LocalStorage
        localStorage.setItem("myCreatedSchedule", JSON.stringify(schedual));
        localStorage.setItem("myCreatedTasks", JSON.stringify(Tasks));
        
        Tasks = []; // تصفير المصفوفة في الذاكرة الحالية
        window.location.href = "dashboard.html"; // تأكد من اسم ملف صفحة الجدول عندك
    });
}

// ==========================================
// 2️⃣ محرك صفحة الـ Dashboard والجدول (الصفحة الثانية)
// ==========================================
const myTable = document.querySelector("table");

if (myTable) {
    document.addEventListener("DOMContentLoaded", () => {
        var savedScheduleText = localStorage.getItem("myCreatedSchedule");
        var savedTasks = localStorage.getItem("myCreatedTasks");

        // نتحقق من وجود بيانات مخزنة قبل محاولة الرسم
        if (savedScheduleText && savedTasks) {
            finalSchedule = JSON.parse(savedScheduleText);
            const currentTasks = JSON.parse(savedTasks);

            const headerRow = document.querySelector('table thead tr');
            const tbodyRows = document.querySelectorAll('table tbody tr');

            // أ) تنظيف رأس الجدول ورسم العناوين الجديدة
            if (headerRow) {
                headerRow.innerHTML = '<th>Day</th>'; 
                currentTasks.forEach((item) => {
                    const newTh = document.createElement('th');
                    newTh.textContent = item.title;
                    headerRow.appendChild(newTh);
                });
            }

            // ب) تنظيف الصفوف ورسم الأيام والـ Checkboxes
            tbodyRows.forEach((row, index) => {
                row.innerHTML = ''; // تنظيف التراكمات القديمة فوراً من الواجهة

                // خلية اليوم في العمود الأول بالطول
                const dayTd = document.createElement('td');
                dayTd.className = "day-column";
                dayTd.textContent = orderedDays[index % 7]; 
                row.appendChild(dayTd);

                // خلايا المهام والـ Checkboxes بناءً على اليوم الحالي
                const currentDayData = finalSchedule[index];
                if (currentDayData && Array.isArray(currentDayData.task)) {
                    currentDayData.task.forEach((taskData) => {
                        const cellsTd = document.createElement('td');
                        cellsTd.textContent = `${taskData.task_title} (${taskData.hours_per_day}h) `; 
                        
                        const checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        checkbox.className = "cell-class";
                        checkbox.checked = taskData.task_status; // استرجاع الحالة المحفوظة
                        //for testing
                                        //for testing
const simulatedDayIndex = 7;
                       if (index !== simulatedDayIndex) {
            checkbox.disabled = true;
            cellsTd.style.opacity = "0.5"; // يعتم الصفوف المقفلة
        } else {
            cellsTd.style.opacity = "1";   // يضيء الصف المفتوح حالياً
        }

    if(simulatedDayIndex >6){
let total = 0; 

currentDayData.task.forEach((singleTask) => {
        total+= singleTask.hours_per_day 

    });    
                            console.log(total)

         window.location.href = "archive.html";
    }
                        cellsTd.appendChild(checkbox);
                        row.appendChild(cellsTd); 
                    });
                }
            });

            console.log("تم تحديث وبناء واجهة الجدول بنجاح دون تكدس!");
        }
    });

    // جـ) مراقبة التغييرات (Event Listener) بداخل الجدول وتعديل البيانات بدقة
    myTable.addEventListener('change', function(event) {
        if (event.target.classList.contains('cell-class')) {
            const checkbox = event.target;
            const cell = checkbox.closest('td');
            const row = checkbox.closest('tr');
            
            const columnIndex = cell.cellIndex; 
            const taskIndex = columnIndex - 1; // إزاحة عمود الأيام
            const rowIndex = row.rowIndex - 1;  // إزاحة صف الـ thead

            if (finalSchedule[rowIndex] && finalSchedule[rowIndex].task && finalSchedule[rowIndex].task[taskIndex]) {
                // تحديث الـ Object الداخلي لليوم والمهمة المحددة بدقة
                finalSchedule[rowIndex].task[taskIndex].task_status = checkbox.checked;

                console.log(`تحديث: يوم [${finalSchedule[rowIndex].dayName}] | مهمة [${finalSchedule[rowIndex].task[taskIndex].task_title}] -> ${checkbox.checked}`);
                
                // حفظ التحديث الجديد فوراً في اللوكال ستوريج
                localStorage.setItem("myCreatedSchedule", JSON.stringify(finalSchedule));
            }
        }
    });
}

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
