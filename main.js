
// التحكم في ظهور واختفاء الحقول بناءً على نوع المهمة
// =========================================================
document.addEventListener("DOMContentLoaded", () => {
    const taskTypeSelect = document.getElementById("task-type");
    const fixedFields = document.getElementById("fixedFields");
    const eventFields = document.getElementById("eventFields");

    if (taskTypeSelect && fixedFields && eventFields) {
        
        // دالة تحديث الحقول بناءً على القيمة المختارة
        function toggleFields() {
            const selectedValue = taskTypeSelect.value;

            // إخفاء الحقول الافتراضية أولاً
            fixedFields.style.display = "none";
            eventFields.style.display = "none";

            // إظهار الحقل المناسب بناءً على الخيار
            if (selectedValue === "fixed") {
                fixedFields.style.display = "block"; // إظهار اختيار الأيام
            } else if (selectedValue === "event") {
                eventFields.style.display = "block"; // إظهار اختيار يوم الحدث
            }
        }

        // تشغيل الدالة فوراً عند تحميل الصفحة للتأكد من الحالة الافتراضية
        toggleFields();

        // مراقبة التغيير عندما يختار المستخدم بنفسه
        taskTypeSelect.addEventListener("change", toggleFields);
    }
});
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

// =========================================================
// حساب الـ Index تلقائياً بناءً على تاريخ إنشاء الجدول
// =========================================================
let simulatedDayIndex = 0; 
const creationTimeText = localStorage.getItem("scheduleCreationDate");

if (creationTimeText) {
    const creationDate = new Date(creationTimeText);
    creationDate.setHours(0, 0, 0, 0); // تصفير الوقت للمقارنة بالأيام فقط

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // حساب فرق الأيام
    const timeDiff = todayDate.getTime() - creationDate.getTime();
    const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

    simulatedDayIndex = daysPassed >= 0 ? daysPassed : 0;
    //to test the final score and pop up, you can change the DEBUG_DAYS to any number of days you want to simulate
// const DEBUG_DAYS = 7; // غيّره إلى أي عدد أيام تريد
// const timeDiff = todayDate.getTime() - creationDate.getTime();
// const daysPassed = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

// simulatedDayIndex = daysPassed + DEBUG_DAYS;
}// ==========================================
// 1️⃣ محرك صفحة إنشاء المهام (الصفحة الأولى)
// ==========================================
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

        // 📦 تجميع الخيارات المخصصة بناءً على نوع المهمة
        let selectedDays = [];
        
        if (task_type === "fixed") {
            // جلب الأيام التي وضع المستخدم عليها علامة صح (Thursday, Friday, etc.)
            const checkedBoxes = document.querySelectorAll("#fixedFields input[type='checkbox']:checked");
            checkedBoxes.forEach(box => {
                // تحويل القيمة إلى صيغة الأيام المستخدمة عندك في الـ Array (خميس، جمعه..)
                if (box.value === "Sunday") selectedDays.push("احد");
                if (box.value === "Monday") selectedDays.push("اثنين");
                if (box.value === "Tuesday") selectedDays.push("ثلاثاء");
                if (box.value === "Wednesday") selectedDays.push("اربعاء");
                if (box.value === "Thursday") selectedDays.push("خميس");
                if (box.value === "Friday") selectedDays.push("جمعه");
                if (box.value === "Saturday") selectedDays.push("سبت");
            });

            if (selectedDays.length === 0) {
                alert("الرجاء اختيار يوم واحد على الأقل لهذه المهمة!");
                return;
            }
        } else if (task_type === "event") {
            // جلب اليوم المختار من قائمة الموعد الفردي وتحويله للصيغة المختصرة المتوافقة مع DAYS_OF_WEEK
            const eventDaySelect = document.getElementById("eventDay").value;
            let mappedDay = eventDaySelect.replace("الأحد", "احد")
                                          .replace("الاثنين", "اثنين")
                                          .replace("الثلاثاء", "ثلاثاء")
                                          .replace("الأربعاء", "اربعاء")
                                          .replace("الخميس", "خميس")
                                          .replace("الجمعة", "جمعه")
                                          .replace("السبت", "سبت");
            selectedDays.push(mappedDay);
        }

        var task = {
            id: crypto.randomUUID(),
            title: task_title,
            type: task_type,
            totalhours: Number(task_total_hours),
            targetDays: selectedDays // حفظ الأيام المستهدفة داخل كائن المهمة
        };
        
        Tasks.push(task);
        console.log("المهمة المضافة حالياً:", Tasks);
        
        // مسح خانات المدخلات وتصفير الـ Checkboxes لتسهيل كتابة المهمة التالية
        document.getElementById("task-title").value = "";
        document.getElementById("task-total-hours").value = "";
        document.getElementById("task-type").value = "flexible";
        document.querySelectorAll("#fixedFields input[type='checkbox']").forEach(b => b.checked = false);
        
        // إخفاء الحقول الإضافية لتعود للحالة الافتراضية
        document.getElementById("fixedFields").style.display = "none";
        document.getElementById("eventFields").style.display = "none";
        
        alert(`تمت إضافة المهمة [${task_title}] بنجاح!`);
    });

    // حدث إنشاء الجدول والانتقال وتحويل المنطق البرمجي ذكياً
    createTableBtn.addEventListener("click", () => {
        // إذا ضغط المستخدم إنشاء مباشرة والمصفوفة فارغة، نحاول أخذ البيانات المكتوبة حالياً في الحقول تلقائياً كآخر مهمة
        var task_title = document.getElementById("task-title").value.trim();
        var task_total_hours = document.getElementById("task-total-hours").value.trim();
        
        if (Tasks.length === 0 && task_title !== "" && task_total_hours !== "") {
            document.getElementById("add-new-task").click();
        }

        if (Tasks.length === 0) {
            alert("الرجاء إضافة مهام أولاً قبل الضغط على إنشاء!");
            return;
        }

        localStorage.removeItem("myCreatedSchedule");
        localStorage.removeItem("myCreatedTasks");

        var schedual = []; 

        // بناء الجدول اليومي بناءً على نوع وبنية كل مهمة بشكل مستقل
        orderedDays.forEach(day => {
            var dayObj = {
                dayName: day,
                task: []
            };

            Tasks.forEach(task => {
                let hoursForThisDay = 0;
                let isIncluded = false;

                if (task.type === "flexible") {
                    // التوزيع التلقائي: تقسيم الساعات بالتساوي على الـ 7 أيام
                    hoursForThisDay = (task.totalhours / 7).toFixed(1);
                    isIncluded = true;
                } else {
                    // إذا كان الخيار (اختيار الأيام) أو (حدث): نتحقق هل اليوم الحالي من ضمن الأيام المستهدفة؟
                    if (task.targetDays.includes(day)) {
                        hoursForThisDay = (task.totalhours / task.targetDays.length).toFixed(1);
                        isIncluded = true;
                    } else {
                        hoursForThisDay = 0;
                        isIncluded = false;
                    }
                }

                dayObj.task.push({
                    task_title: task.title,
                    hours_per_day: hoursForThisDay,
                    is_included: isIncluded, // خاصية لتحديد إذا كانت المهمة تظهر في هذا اليوم أم يوضع مكانها '--'
                    task_status: false
                });
            });

            schedual.push(dayObj);
        });

        // حفظ البيانات النظيفة الجديدة في الـ LocalStorage
        localStorage.setItem("myCreatedSchedule", JSON.stringify(schedual));
        localStorage.setItem("myCreatedTasks", JSON.stringify(Tasks));
        
        Tasks = [];
        // حفظ تاريخ البداية الفعلي للأسبوع
localStorage.setItem("scheduleCreationDate", new Date().toISOString()); // تصفير المصفوفة في الذاكرة الحالية
        window.location.href = "dashboard.html"; 
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

                            
            if (simulatedDayIndex > 6) {

                checkbox.disabled = true;

                cellsTd.style.opacity = "0.5";

            } else if (index !== simulatedDayIndex) {

                checkbox.disabled = true;

                cellsTd.style.opacity = "0.5";

            } else {

                cellsTd.style.opacity = "1";  

            }
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
            const finalDailyScores = calculateDailyScores(); 

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

            alert("تم حفظ الجدول بالكامل وأرشفته بنجاح");
            window.location.href = "index.html"; 
        });
    }


    const addMidWeekTaskBtn = document.getElementById("add-mid-week-task-btn");
    if (addMidWeekTaskBtn) {
        addMidWeekTaskBtn.addEventListener("click", () => {
            let currentDayInSchedule = (simulatedDayIndex > 6) ? 0 : simulatedDayIndex; 
            if (simulatedDayIndex > 6) {
                alert("انتهى الأسبوع الحالي، لا يمكن إضافة مهام جديدة لهذا الجدول!");
                return;
            }

            // 1. طلب اسم المهمة
            const taskTitle = prompt("أدخل اسم المهمة الجديدة:");
            if (!taskTitle || taskTitle.trim() === "") return;

            // 2. طلب إجمالي الساعات
            const totalHoursInput = prompt("أدخل إجمالي الساعات المطلوبة لهذه المهمة:");
            const totalHours = Number(totalHoursInput);
            if (isNaN(totalHours) || totalHours <= 0) {
                alert("الرجاء إدخال عدد ساعات صحيح!");
                return;
            }

            // 3. طلب نوع المهمة 
            const typeInput = prompt("أدخل نوع المهمة (اكتب 1 أو 2 أو 3):\n1 - توزيع تلقائي\n2 - اختيار أيام معينة\n3 - حدث / موعد فردي");
            if (typeInput !== "1" && typeInput !== "2" && typeInput !== "3") {
                alert(" خطأ: خيار غير صحيح! يجب عليك كتابة رقم من الخيارات المتاحة (1 أو 2 أو 3) فقط.");
                return; // إيقاف العملية بالكامل
            }
            let taskType = "flexible";
            let targetDays = [];

            if (typeInput === "2") {
                taskType = "fixed";
                const daysPrompt = prompt(`أدخل الأيام المحددة مفصولة بفاصلة (مثال: احد, ثلاثاء, خميس)\nالأيام المتاحة حالياً: (${orderedDays.join(" - ")})`);
                
                if (daysPrompt) {
                    // تنظيف النص وتحويله لمصفوفة أيام
                    const enteredDays = daysPrompt.split(",").map(d => d.trim());
                    
                    //  فحص الأيام للتأكد من مطابقتها للنظام
                    let invalidDays = [];
                    enteredDays.forEach(day => {
                        if (orderedDays.includes(day)) {
                            targetDays.push(day);
                        } else {
                            invalidDays.push(day);
                        }
                    });

                    //  إذا كتب المستخدم نصاً عشوائياً أو يوم غير صحيح
                    if (invalidDays.length > 0) {
                        alert(`خطأ: هذه الكلمات ليست أياماً صحيحة في هذا الأسبوع:\n[ ${invalidDays.join(" , ")} ]\nالرجاء المحاولة مجدداً وكتابة أيام صحيحة.`);
                        return; // إيقاف العملية لمنع حفظ بيانات تالفة
                    }
                }
                
                if (targetDays.length === 0) {
                    alert("لم يتم تحديد أي أيام! تم إلغاء العملية.");
                    return;
                }

            } else if (typeInput === "3") {
                taskType = "event";
                const dayPrompt = prompt(`أدخل يوم الموعد الفردي تماماً كما هو مكتوب:\n(${orderedDays.join(" - ")})`);
                
                if (dayPrompt && orderedDays.includes(dayPrompt.trim())) {
                    targetDays.push(dayPrompt.trim());
                } else {
                    alert(" خطأ: اليوم المدخل غير صحيح أو لم يتم كتابته بشكل مطابق للأيام !");
                    return; // إيقاف العملية
                }
            }

            // تجهيز كائن المهمة الجديدة بعد تخطي الفحوصات بنجاح
            const newMidWeekTask = {
                id: crypto.randomUUID(),
                title: taskTitle.trim(),
                type: taskType, 
                totalhours: totalHours,
                targetDays: targetDays
            };
            
            // جلب المصفوفة القديمة أولاً لعدم تصفير المهام الأخرى
            var savedTasks = localStorage.getItem("myCreatedTasks");
            Tasks = savedTasks ? JSON.parse(savedTasks) : [];
            
            Tasks.push(newMidWeekTask);
            localStorage.setItem("myCreatedTasks", JSON.stringify(Tasks));

            // 4. تحديث الجدول اليومي (finalSchedule) بناءً على المدخلات السليمة
            finalSchedule.forEach((dayObj, index) => {
                let hoursForThisDay = 0;
                let isIncluded = false;

                // التحقق من الأيام المتاحة زمنياً (من الحاضر للمستقبل)
                if (index >= currentDayInSchedule) {
                    if (taskType === "flexible") {
                        const remainingDaysCount = 7 - currentDayInSchedule; 
                        hoursForThisDay = (totalHours / remainingDaysCount).toFixed(1);
                        isIncluded = true;
                    } else {
                        if (targetDays.includes(dayObj.dayName)) {
                            hoursForThisDay = (totalHours / targetDays.length).toFixed(1);
                            isIncluded = true;
                        }
                    }
                }

                // إضافة المهمة للجدول
                dayObj.task.push({
                    task_title: newMidWeekTask.title,
                    hours_per_day: hoursForThisDay,
                    is_included: isIncluded,
                    task_status: false
                });
            });

            // حفظ وإعادة التحميل
            localStorage.setItem("myCreatedSchedule", JSON.stringify(finalSchedule));
                                      alert(`تمت إضافة مهمة منتصف الأسبوع [${taskTitle}] بنجاح وتوزيع ساعاتها! `);
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
