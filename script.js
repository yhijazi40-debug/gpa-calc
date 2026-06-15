let tg = window.Telegram.WebApp;
tg.expand(); // Expand to full height

// Elements
const prevHoursInput = document.getElementById('prev-hours');
const prevGpaInput = document.getElementById('prev-gpa');
const coursesContainer = document.getElementById('courses-container');
const addCourseBtn = document.getElementById('add-course-btn');
const saveBtn = document.getElementById('save-btn');

const targetToggle = document.getElementById('target-toggle');
const targetContent = document.getElementById('target-content');
const targetGpaInput = document.getElementById('target-gpa');
const targetHoursInput = document.getElementById('target-hours');
const targetResult = document.getElementById('target-result');

const resSemesterGpa = document.getElementById('res-semester-gpa');
const resCumulativeGpa = document.getElementById('res-cumulative-gpa');
const resRating = document.getElementById('res-rating');

// State
let courses = []; 

function getRatingByPoints(points) {
    if (points >= 3.75) return 'امتياز';
    if (points >= 3.50) return 'ممتاز';
    if (points >= 3.00) return 'جيد جداً';
    if (points >= 2.50) return 'جيد';
    if (points >= 2.00) return 'ناجح';
    return 'إنذار';
}

// Add empty course row
function addCourseRow() {
    const id = Date.now();
    const row = document.createElement('div');
    row.className = 'course-row';
    row.id = `course-${id}`;
    
    row.innerHTML = `
        <input type="text" class="course-input-name" placeholder="اسم المادة" style="flex: 1.5; min-width:80px;">
        <select class="course-input-hours" onchange="calculate()" style="flex: 1; padding: 5px;">
            <option value="0" disabled selected>ساعات</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
        </select>
        <select class="course-input-grade" onchange="calculate()" style="flex: 1; padding: 5px;">
            <option value="" disabled selected>الرمز</option>
            <option value="4.2">A+</option>
            <option value="4.0">A</option>
            <option value="3.75">A-</option>
            <option value="3.5">B+</option>
            <option value="3.25">B</option>
            <option value="3.0">B-</option>
            <option value="2.75">C+</option>
            <option value="2.5">C</option>
            <option value="2.25">C-</option>
            <option value="2.0">D+</option>
            <option value="1.75">D</option>
            <option value="1.5">D-</option>
            <option value="0.5">F</option>
        </select>
        <button class="btn-remove" onclick="removeCourse(${id})" style="width:30px;">✖</button>
    `;
    
    coursesContainer.appendChild(row);
    courses.push({ id });
}

function removeCourse(id) {
    document.getElementById(`course-${id}`).remove();
    courses = courses.filter(c => c.id !== id);
    calculate();
}

// Target toggle
targetToggle.addEventListener('change', (e) => {
    if (e.target.checked) {
        targetContent.classList.remove('hidden');
    } else {
        targetContent.classList.add('hidden');
    }
});

let currentSemesterTotalHours = 0;

// Main Calculation
function calculate() {
    let prevHours = parseFloat(prevHoursInput.value) || 0;
    let prevGpa = parseFloat(prevGpaInput.value) || 0;
    
    let totalSemesterHours = 0;
    let totalSemesterPoints = 0;
    
    const hourInputs = document.querySelectorAll('.course-input-hours');
    const gradeInputs = document.querySelectorAll('.course-input-grade');
    
    for (let i = 0; i < courses.length; i++) {
        let h = parseFloat(hourInputs[i].value) || 0;
        let p = parseFloat(gradeInputs[i].value); // Points from dropdown
        
        if (h > 0 && !isNaN(p)) {
            totalSemesterHours += h;
            totalSemesterPoints += (p * h);
        }
    }
    currentSemesterTotalHours = totalSemesterHours;
    
    let semesterGpa = 0;
    if (totalSemesterHours > 0) {
        semesterGpa = totalSemesterPoints / totalSemesterHours;
    }
    
    let cumulativeGpa = prevGpa;
    if (prevHours + totalSemesterHours > 0) {
        let totalOldPoints = prevHours * prevGpa;
        cumulativeGpa = (totalOldPoints + totalSemesterPoints) / (prevHours + totalSemesterHours);
    }
    
    // Update UI
    resSemesterGpa.textContent = semesterGpa.toFixed(2);
    resCumulativeGpa.textContent = cumulativeGpa.toFixed(2);
    
    let finalRating = getRatingByPoints(cumulativeGpa);
    resRating.textContent = finalRating;

    calculateTarget(prevHours, prevGpa);
}

function calculateTarget(prevHours, prevGpa) {
    if (!targetToggle.checked) return;
    
    let target = parseFloat(targetGpaInput.value) || 0;
    let semHours = parseFloat(targetHoursInput.value) || 0;
    
    if (target === 0 || semHours === 0) {
        targetResult.className = 'target-message';
        targetResult.textContent = 'أدخل الساعات وهدفك التراكمي لنخبرك بالمعدل الفصلي المطلوب!';
        return;
    }
    
    let totalTargetPoints = target * (prevHours + semHours);
    let neededSemesterPoints = totalTargetPoints - (prevHours * prevGpa);
    let neededSemesterGpa = neededSemesterPoints / semHours;
    
    if (neededSemesterGpa > 4.2) {
        targetResult.className = 'target-message danger';
        targetResult.textContent = `مستحيل! للوصول إلى تراكمي ${target.toFixed(2)} تحتاج معدل فصلي ${neededSemesterGpa.toFixed(2)} وهذا يتجاوز 4.20 ❌`;
    } else if (neededSemesterGpa < 0) {
        targetResult.className = 'target-message success';
        targetResult.textContent = `وضعك ممتاز! حتى لو كان معدلك الفصلي صفر ستبقى فوق هدفك.`;
    } else {
        targetResult.className = 'target-message success';
        targetResult.textContent = `للوصول إلى تراكمي ${target.toFixed(2)}، يجب أن تجلب معدل فصلي لا يقل عن ${neededSemesterGpa.toFixed(2)} هذا الفصل 🚀`;
    }
}

// Event Listeners
addCourseBtn.addEventListener('click', addCourseRow);
prevHoursInput.addEventListener('input', calculate);
prevGpaInput.addEventListener('input', calculate);
targetGpaInput.addEventListener('input', () => calculateTarget(parseFloat(prevHoursInput.value) || 0, parseFloat(prevGpaInput.value) || 0));
targetHoursInput.addEventListener('input', () => calculateTarget(parseFloat(prevHoursInput.value) || 0, parseFloat(prevGpaInput.value) || 0));

// Save and Export to Bot
saveBtn.addEventListener('click', () => {
    let semPercentage = ((parseFloat(resSemesterGpa.textContent) / 4.2) * 100).toFixed(2);
    let cumPercentage = ((parseFloat(resCumulativeGpa.textContent) / 4.2) * 100).toFixed(2);
    
    let data = {
        semesterGpa: resSemesterGpa.textContent,
        semesterPercentage: semPercentage,
        semesterHours: currentSemesterTotalHours,
        cumulativeGpa: resCumulativeGpa.textContent,
        cumulativePercentage: cumPercentage,
        cumulativeTotalHours: (parseFloat(prevHoursInput.value) || 0) + currentSemesterTotalHours,
        rating: resRating.textContent
    };
    
    // Send data to Bot
    tg.sendData(JSON.stringify(data));
});

// Initialize with one empty course
addCourseRow();
