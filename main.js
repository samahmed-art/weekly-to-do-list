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

  const startDay = new Date().toLocaleDateString('en-US', { weekday: 'long' }); 

//add task
var Tasks =[]
const addTaskBtn = document.getElementById("add-new-task");
const createTableBtn = document.getElementById("create-table");
if (addTaskBtn && createTableBtn) {
addTaskBtn.addEventListener("click",()=>{
    var task_title = document.getElementById("task-title").value 
    var  task_total_hours =document.getElementById("task-total-hours").value
    var task_type =document.getElementById("task-type").value
if (task_title === "" || task_total_hours === "")
    alert("nter values")
else{
var task ={
    id:crypto.randomUUID(),
    title:task_title,
    type:task_type,
    totalhours:Number(task_total_hours)
}

}
Tasks.push(task)
console.log(Tasks)

})
//create-table
var schedual= []
createTableBtn.addEventListener("click",()=>{

    for (task of Tasks){
        let hoursPerDay = (task.totalhours/ 7).toFixed(1); 
  //البيانات الي تجي من هنا تكرر نفس المهمه في كل صف  وهناك في الاستماع يستمع لهم كانهم مهمه واحده 
        var day ={
     task_title:task.title,
    task_hours :hoursPerDay,
    task_status:false 
}
 schedual.push(day)
}
console.log(schedual)
console.log (schedual[0].task_hours)
localStorage.setItem("myCreatedSchedule", JSON.stringify(schedual));

    window.location.href = "dashboard.html";
})
}

//dashboard page
//call data from tasks page
var savedScheduleText = localStorage.getItem("myCreatedSchedule");
var finalSchedule = []; // مصفوفة فارغة افتراضية

// إذا كانت هناك بيانات مخزنة فعلاً، نقوم بتحليلها هنا
if (savedScheduleText) {
    finalSchedule = JSON.parse(savedScheduleText);
}

// الآن مصفوفة finalSchedule مكشوفة وجاهزة للاستخدام في أي مكان بالأسفل!
console.log("البيانات جاهزة للاستخدام في أي مكان بالملف:", finalSchedule);
// 1. استخدام querySelector لضمان إرجاع عنصر واحد أو null
const myTable = document.querySelector("table");

if (myTable) {
    document.addEventListener("DOMContentLoaded", () => {

        if (savedScheduleText) {
            var finalSchedule = JSON.parse(savedScheduleText);
            const tbodyRows = document.querySelectorAll('table tbody tr');
            const headerRow = document.querySelector('table thead tr');

            const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const currentDayIndex = new Date().getDay();

            const orderedDays = [
                ...DAYS_OF_WEEK.slice(currentDayIndex),
                ...DAYS_OF_WEEK.slice(0, currentDayIndex)
            ];
            //for tasks row
            finalSchedule.forEach((item) => {
                if (headerRow) {
                    const newTh = document.createElement('th');
                    newTh.textContent = item.task_title;
                    headerRow.appendChild(newTh);
                }
            }); 
//for days cloumn
            tbodyRows.forEach((row, index) => {
                const dayTd = document.createElement('td');
                dayTd.className = "day-column";
                
                dayTd.textContent = orderedDays[index % 7]; 
                
                row.appendChild(dayTd);
//for tasks cells
finalSchedule.forEach((day) => {
    const cellsTd = document.createElement('td');
    cellsTd.textContent = `${day.task_title} (${day.task_hours}h) `; 
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
        checkbox.className="cell-class"

    cellsTd.appendChild(checkbox);
    row.appendChild(cellsTd);
});

            })

        }
    });
}

  // Listen for changes inside the table
  myTable.addEventListener('change', function(event) {
        // التأكد من أن العنصر الذي تم الضغط عليه هو الـ Checkbox
       if (event.target.classList.contains('cell-class')) {
      const checkbox = event.target;
      
      const cell = checkbox.closest('td');
      // 2. جلب النص الموجود داخل الخلية وتنظيف الفراغات
      const cellText = cell.textContent.trim(); 
     const index= cell.cellIndex
       // 2. الوصول إلى الصف بأكمله (tr) الذي يحتوي على هذه الخلية
        const row = checkbox.closest('tr');
        
        // 3. جلب أول خلية داخل هذا الصف (والتي تمثل عمود اليوم) وقراءة النص بداخلها
        const dayText = row.cells[0].textContent.trim(); 
    
    console.log(dayText)
      // 3. التحقق إذا كان التشيك بوكس مفعل أم لا وطباعته في الكونسول
      if (checkbox.checked) {
        console.log(`تم التشييك على الخلية: ${cellText}`);
      } else {
        console.log(`تم إلغاء التشييك عن الخلية: ${cellText}`);
      }
          if(finalSchedule[0].task_status== true)
            console.log("dfdfhd")
    }
});
myTable.addEventListener('change', function(event) {
    if (event.target.classList.contains('cell-class')) {
        const checkbox = event.target;
        const cell = checkbox.closest('td');
        
        // 1. جلب رقم العمود الحالي (Column Index)
        const columnIndex = cell.cellIndex; 
        
        // 2. بما أن العمود الأول (index 0) هو لأسماء الأيام، 
        // فإن ترتيب المهمة في مصفوفة finalSchedule يساوي (رقم العمود ناقص 1)
        const taskIndex = columnIndex - 1;

        // 3. التأكد أن الترتيب صحيح وضمن نطاق المصفوفة
        if (taskIndex >= 0 && finalSchedule[taskIndex]) {
            
            // 4. تحديث حالة المهمة داخل الأوبجكت مباشرة بناءً على الزر (true أو false)
            finalSchedule[taskIndex].task_status = checkbox.checked;

            // 5. طباعة الأوبجكت المحدث في الـ Console للتأكد
            console.log(`تم تحديث المهمة: ${finalSchedule[taskIndex].task_title}`);
            console.log(`الحالة الجديدة (task_status):`, finalSchedule[taskIndex].task_status);
            
            // 6. [خطوة مهمة]: حفظ التعديل الجديد في الـ LocalStorage 
            // حتى إذا أنعشت الصفحة أو انتقلت لا تضيع حالة الـ true
            localStorage.setItem("myCreatedSchedule", JSON.stringify(finalSchedule));
        }
    }
    console.log(finalSchedule)
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
