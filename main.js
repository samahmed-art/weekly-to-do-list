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
console.log(new Date() )
const DAYS_OF_WEEK = ["احد", "اثنين", "ثلاثاء", "اربعاء", "خميس", "جمعه", "سبت"];
let currentDayIndex = (new Date().getDay());

const orderedDays = [
    ...DAYS_OF_WEEK.slice(currentDayIndex),
    ...DAYS_OF_WEEK.slice(0, currentDayIndex)
];

// تعريف موحد ونظيف
var Tasks = [];
var finalSchedule = [];
var varTotalCompletedHours = 0; 
const simulatedDayIndex = 6;
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

// ==========================================
const myTable = document.querySelector("table");

// دوال التحكم في البوب أب كما هي...
function openPop() {
    const modal = document.getElementById("myModal");
    if (modal) modal.style.display = "flex";
}
function closePop() {
    const modal = document.getElementById("myModal");
    if (modal) modal.style.display = "none";
}

// 🔥 [مكان عام Global]: نقل الدالة إلى هنا خارج أي أقواس لكي يراها القراف وزر الحفظ معاً!
function calculateDailyScores() {
    return orderedDays.map((dayName, index) => {
        const dayData = finalSchedule[index];
        if (!dayData || !Array.isArray(dayData.task) || dayData.task.length === 0) return 0;

        let totalDayHours = 0;
        let completedDayHours = 0;

        dayData.task.forEach(task => {
            const hours = Number(task.hours_per_day) || 0;
            totalDayHours += hours;
            if (task.task_status === true) {
                completedDayHours += hours;
            }
        });

        if (totalDayHours === 0) return 0;
        return (completedDayHours / totalDayHours) * 100;
    });
}

if (myTable) {
    document.addEventListener("DOMContentLoaded", () => {
        
        // جلب البيانات أولاً وقبل أي شيء آخر لكي يجدها القراف عند التحميل
        var savedTasks = localStorage.getItem("myCreatedTasks");
        Tasks = savedTasks ? JSON.parse(savedTasks) : [];
        
        var savedScheduleText = localStorage.getItem("myCreatedSchedule");
        if (savedScheduleText) {
            finalSchedule = JSON.parse(savedScheduleText);
        }

        const weeklyTotalHours = Tasks.reduce((sum, task) => sum + Number(task.totalhours), 0);
        console.log("إجمالي ساعات الأسبوع المحسوبة للجدول الحالي:", weeklyTotalHours);

        // =========================================================
        // كود بناء وتشغيل القراف (Chart.js)
        // =========================================================
        const chartCtx = document.getElementById('weeklyProgressChart');

        if (chartCtx) {
            let dailyScores = calculateDailyScores(); 
            let rotatedScores = [...dailyScores]; 

            const weeklyChart = new Chart(chartCtx, {
                type: 'line', 
                data: {
                    labels: orderedDays, 
                    datasets: [{
                        label: 'مستوى الإنجاز اليومي',
                        data: rotatedScores, 
                        borderColor: '#ffffff', 
                        borderWidth: 4, 
                        tension: 0, 
                        pointBackgroundColor: '#000000', 
                        pointBorderColor: '#ffffff', 
                        pointBorderWidth: 3,
                        pointRadius: 7, 
                        pointHoverRadius: 9,
                        fill: false 
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false, 
                    scales: {
                        x: {
                            reverse: true, 
                            grid: { display: false },
                            ticks: {
                                color: '#ffffff', 
                                font: { size: 14, fontWeight: 'bold' },
                                padding: 12 
                            }
                        },
                        y: {
                            position: 'right', 
                            min: 0,
                            max: 100,
                            ticks: {
                                stepSize: 33.33, 
                                color: '#ffffff', 
                                font: { size: 14, fontWeight: 'bold' },
                                padding: 12,
                                callback: function(value) {
                                    if (value === 0) return 'سيء';
                                    if (value > 30 && value < 40) return 'عادي';
                                    if (value > 60 && value < 70) return 'جيد';
                                    if (value === 100) return 'مثالي';
                                    return '';
                                }
                            },
                            grid: {
                                display: true, 
                                color: 'rgba(255, 255, 255, 0.1)', 
                                drawBorder: false
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            rtl: true,
                            backgroundColor: '#2c3e50',
                            callbacks: {
                                label: function(context) {
                                    return ` نسبة الإنجاز: ${context.parsed.y.toFixed(0)}%`;
                                }
                            }
                        }
                    }
                }
            });

            myTable.addEventListener('change', function(event) {
                if (event.target.classList.contains('cell-class')) {
                    const updatedScores = calculateDailyScores();
                    weeklyChart.data.datasets[0].data = [...updatedScores]; 
                    weeklyChart.update();
                }
            });
        }

        // ==========================================
        // حساب وعرض تاريخ بداية ونهاية الأسبوع الحالي
        // ==========================================
        const weekRangeSpan = document.getElementById("week-range");

        if (weekRangeSpan) {
            const startDate = new Date(); 
            const endDate = new Date();
            endDate.setDate(startDate.getDate() + 6); 

            function formatDate(dateObj) {
                const day = String(dateObj.getDate()).padStart(2, '0');
                const month = String(dateObj.getMonth() + 1).padStart(2, '0'); 
                const year = dateObj.getFullYear();
                return `${day}-${month}-${year}`;
            }

            weekRangeSpan.textContent = `من ${formatDate(startDate)} إلى ${formatDate(endDate)}`;
        }

        // =========================================================
        // بناء وتحديث الجدول المظهري في الـ HTML
        // =========================================================
        if (savedScheduleText) {
            const headerRow = document.querySelector('table thead tr');
            const tbody = document.querySelector('table tbody'); 

            if (tbody) {
                tbody.innerHTML = ''; 
            }
            
            if (headerRow) {
                headerRow.innerHTML = `
                    <th class="diagonal-split">
                        <span class="top-right">Tasks</span>
                        <span class="bottom-left">Days</span>
                    </th>
                `;                 
                Tasks.forEach((item) => {
                    const newTh = document.createElement('th');
                    newTh.textContent = item.title;
                    headerRow.appendChild(newTh);
                });
            }

            orderedDays.forEach((dayName, index) => {
                const row = document.createElement('tr'); 

                const dayTd = document.createElement('td');
                dayTd.className = "day-column";
                dayTd.textContent = dayName; 
                row.appendChild(dayTd);

                const currentDayData = finalSchedule[index];
                if (currentDayData && Array.isArray(currentDayData.task)) {
                    currentDayData.task.forEach((taskData) => {
                        const cellsTd = document.createElement('td');
                        
                        if (Number(taskData.hours_per_day) === 0 || taskData.is_included === false) {
                            cellsTd.textContent = "--"; 
                            cellsTd.style.color = "#999"; 
                            cellsTd.style.fontWeight = "bold";
                        } else {
                            cellsTd.textContent = `${taskData.task_title} (${taskData.hours_per_day}h) `; 
                            
                            const checkbox = document.createElement("input");
                            checkbox.type = "checkbox";
                            checkbox.className = "cell-class";
                            checkbox.checked = taskData.task_status; 

                            cellsTd.appendChild(checkbox);
                        }
                        row.appendChild(cellsTd); 
                    });
                }
                if (tbody) tbody.appendChild(row); 
            });

            if (simulatedDayIndex > 6) {
                if (weeklyTotalHours > 0) {
                    let score = (varTotalCompletedHours / weeklyTotalHours) * 100;
                    if (score < 0) score = 0;
                    if (score > 100) score = 100;
                    
                    console.log("انجازك النهائي في هذا الاسبوع هو: " + score.toFixed(1) + "%");
                    openPop();

                    const scoreResultText = document.getElementById("score-result");
                    if (scoreResultText) {
                        scoreResultText.textContent = score.toFixed(1) + "%";
                    }
                }
            }
        }
    });

    // =========================================================
    // مستمعات الأحداث التفاعلية (خارج الـ DOMContentLoaded وآمنة)
    // =========================================================
    myTable.addEventListener('change', function(event) {
        if (event.target.classList.contains('cell-class')) {
            const checkbox = event.target;
            const cell = checkbox.closest('td');
            const row = checkbox.closest('tr');
            
            const columnIndex = cell.cellIndex; 
            const taskIndex = columnIndex - 1; 
            const rowIndex = row.rowIndex - 1;  

            if (finalSchedule[rowIndex] && finalSchedule[rowIndex].task && finalSchedule[rowIndex].task[taskIndex]) {
                finalSchedule[rowIndex].task[taskIndex].task_status = checkbox.checked;
                const currentTaskHours = Number(finalSchedule[rowIndex].task[taskIndex].hours_per_day);

                if (checkbox.checked === true) {
                    varTotalCompletedHours = varTotalCompletedHours + currentTaskHours;
                } else if (checkbox.checked === false) {
                    varTotalCompletedHours = varTotalCompletedHours - currentTaskHours;
                }
                
                const currentTasks = localStorage.getItem("myCreatedTasks") ? JSON.parse(localStorage.getItem("myCreatedTasks")) : [];
                const currentWeeklyHours = currentTasks.reduce((sum, t) => sum + Number(t.totalhours), 0);

                if (currentWeeklyHours > 0) {
                    let score = (varTotalCompletedHours / currentWeeklyHours) * 100;
                    if (score < 0) score = 0; 
                    console.log("انجازك في هذا الاسبوع هو: " + score.toFixed(1) + "%");
                }
                                     
                localStorage.setItem("myCreatedSchedule", JSON.stringify(finalSchedule));
            }
        }
    });

    const saveReviewBtn = document.getElementById("save-review-btn");
    if (saveReviewBtn) {
        saveReviewBtn.addEventListener("click", () => {
            const selectedStar = document.querySelector('input[name="user-rating"]:checked');
            const starValue = selectedStar ? Number(selectedStar.value) : 0;
            const userNotes = document.getElementById("week-notes").value.trim();

            if (starValue === 0) {
                alert("الرجاء اختيار تقييم بالنجوم أولاً!");
                return;
            }

            const weekRangeText = document.getElementById("week-range") ? document.getElementById("week-range").textContent : "أسبوع غير محدد";
            const finalDailyScores = calculateDailyScores(); // الدالة هنا أصبحت مرئية تماماً الآن ومكشوفة للزر!

            const currentWeekData = {
                id: crypto.randomUUID(),
                weekRange: weekRangeText,
                orderedDays: orderedDays,
                tasksHeaders: Tasks.map(t => t.title), 
                scheduleData: finalSchedule,           
                graphScores: finalDailyScores,         
                ratingStars: starValue,
                notes: userNotes,
                savedAt: new Date().toISOString()
            };

            let archive = localStorage.getItem("myArchive") ? JSON.parse(localStorage.getItem("myArchive")) : [];
            archive.push(currentWeekData);
            localStorage.setItem("myArchive", JSON.stringify(archive));

            localStorage.removeItem("myCreatedSchedule");
            localStorage.removeItem("myCreatedTasks");
            localStorage.removeItem("myWeeklyReview");

            alert("تم حفظ الجدول بالكامل وأرشفته بنجاح! 🎉");
            window.location.href = "index.html"; 
        });
    }

    const addMidWeekTaskBtn = document.getElementById("add-mid-week-task-btn");
    if (addMidWeekTaskBtn) {
        addMidWeekTaskBtn.addEventListener("click", () => {
            const taskTitle = prompt("أدخل اسم المهمة الجديدة:");
            if (!taskTitle || taskTitle.trim() === "") return;

            const totalHoursInput = prompt("أدخل إجمالي الساعات المطلوبة لهذه المهمة حتى نهاية الأسبوع:");
            const totalHours = Number(totalHoursInput);
            if (isNaN(totalHours) || totalHours <= 0) {
                alert("الرجاء إدخال عدد ساعات صحيح!");
                return;
            }

            let currentDayInSchedule = (simulatedDayIndex > 6) ? 0 : simulatedDayIndex; 
            if (simulatedDayIndex > 6) {
                alert("انتهى الأسبوع الحالي، لا يمكن إضافة مهام جديدة لهذا الجدول!");
                return;
            }

            const remainingDaysCount = 7 - currentDayInSchedule; 
            const hoursPerRemainingDay = (totalHours / remainingDaysCount).toFixed(1);

            const newMidWeekTask = {
                id: crypto.randomUUID(),
                title: taskTitle.trim(),
                type: "fixed", 
                totalhours: totalHours
            };
            Tasks.push(newMidWeekTask);
            localStorage.setItem("myCreatedTasks", JSON.stringify(Tasks));

            finalSchedule.forEach((dayObj, index) => {
                let taskDetails = {
                    task_title: newMidWeekTask.title,
                    task_status: false
                };

                if (index >= currentDayInSchedule) {
                    taskDetails.hours_per_day = hoursPerRemainingDay;
                    taskDetails.is_included = true; 
                } else {
                    taskDetails.hours_per_day = 0; 
                    taskDetails.is_included = false; 
                }

                dayObj.task.push(taskDetails);
            });

            localStorage.setItem("myCreatedSchedule", JSON.stringify(finalSchedule));
            alert(`تمت إضافة مهمة [${taskTitle}] وتوزيعها بنجاح! 🎉`);
            window.location.reload(); 
        });
    }
}
    // doesnt work
        //    if(simulatedDayIndex >6){
                       
        //                 console.log("tolat is "+total)

        //  window.location.href = "archive.html";
    


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
