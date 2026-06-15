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
const targetResult = document.getElementById('target-result');

const resSemesterGpa = document.getElementById('res-semester-gpa');
const resCumulativeGpa = document.getElementById('res-cumulative-gpa');
const resRating = document.getElementById('res-rating');

// State
let courses = []; // { id, hours, grade }

// Grading Scale (4.2 System)
function getGradeInfo(grade) {
    if (grade >= 90) return { points: 4.20, letter: 'A+', rating: 'ممتاز مرتفع', color: '#32d74b' };
    if (grade >= 85) return { points: 4.00, letter: 'A', rating: 'ممتاز', color: '#32d74b' };
    if (grade >= 80) return { points: 3.75, letter: 'A-', rating: 'ممتاز', color: '#32d74b' };
    if (grade >= 76) return { points: 3.50, letter: 'B+', rating: 'جيد جداً مرتفع', color: '#64d2ff' };
    if (grade >= 72) return { points: 3.25, letter: 'B', rating: 'جيد جداً', color: '#64d2ff' };
    if (grade >= 68) return { points: 3.00, letter: 'B-', rating: 'جيد جداً', color: '#64d2ff' };
    if (grade >= 64) return { points: 2.75, letter: 'C+', rating: 'جيد مرتفع', color: '#ffd60a' };
    if (grade >= 60) return { points: 2.50, letter: 'C', rating: 'جيد', color: '#ffd60a' };
    if (grade >= 56) return { points: 2.25, letter: 'C-', rating: 'جيد', color: '#ffd60a' };
    if (grade >= 52) return { points: 2.00, letter: 'D+', rating: 'مقبول مرتفع', color: '#ff9f0a' };
    if (grade >= 50) return { points: 1.75, letter: 'D', rating: 'مقبول', color: '#ff9f0a' };
    return { points: 0.00, letter: 'F', rating: 'راسب', color: '#ff453a' };
}

function getRatingByPoints(points) {
    if (points >= 3.75) return 'ممتاز';
    if (points >= 2.75) return 'جيد جداً';
    if (points >= 2.00) return 'جيد';
    if (points >= 1.75) return 'مقبول';
    return 'ضعيف';
}

// Add empty course row
function addCourseRow() {
    const id = Date.now();
    const row = document.createElement('div');
    row.className = 'course-row';
    row.id = `course-${id}`;
    
    row.innerHTML = `
        <input type="number" class="course-input-hours" placeholder="ساعات" min="1" max="6" data-id="${id}" oninput="calculate()">
        <input type="number" class="course-input-grade" placeholder="العلامة (%) مثلاً 85" min="0" max="100" data-id="${id}" oninput="calculate()">
        <span class="live-badge" id="badge-${id}">-</span>
        <button class="btn-remove" onclick="removeCourse(${id})">✖</button>
    `;
    
    coursesContainer.appendChild(row);
    courses.push({ id, hours: 0, grade: 0 });
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

// Main Calculation
function calculate() {
    let prevHours = parseFloat(prevHoursInput.value) || 0;
    let prevGpa = parseFloat(prevGpaInput.value) || 0;
    
    let totalSemesterHours = 0;
    let totalSemesterPoints = 0;
    
    // Update individual courses and calculate semester totals
    const hourInputs = document.querySelectorAll('.course-input-hours');
    const gradeInputs = document.querySelectorAll('.course-input-grade');
    
    for (let i = 0; i < courses.length; i++) {
        let h = parseFloat(hourInputs[i].value) || 0;
        let g = parseFloat(gradeInputs[i].value) || 0;
        
        let info = getGradeInfo(g);
        
        const badge = document.getElementById(`badge-${courses[i].id}`);
        if (g > 0) {
            badge.textContent = info.letter;
            badge.style.color = info.color;
            badge.style.border = `1px solid ${info.color}`;
        } else {
            badge.textContent = '-';
            badge.style.color = 'inherit';
            badge.style.border = 'none';
        }
        
        if (h > 0 && g > 0) {
            totalSemesterHours += h;
            totalSemesterPoints += (info.points * h);
        }
    }
    
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

    calculateTarget(prevHours, prevGpa, totalSemesterHours);
}

function calculateTarget(prevHours, prevGpa, totalSemesterHours) {
    if (!targetToggle.checked) return;
    
    let target = parseFloat(targetGpaInput.value) || 0;
    if (target === 0 || totalSemesterHours === 0) {
        targetResult.className = 'target-message';
        targetResult.textContent = 'أدخل الساعات الحالية وهدفك لنحسب لك!';
        return;
    }
    
    let totalTargetPoints = target * (prevHours + totalSemesterHours);
    let neededSemesterPoints = totalTargetPoints - (prevHours * prevGpa);
    let neededSemesterGpa = neededSemesterPoints / totalSemesterHours;
    
    if (neededSemesterGpa > 4.2) {
        targetResult.className = 'target-message danger';
        targetResult.textContent = `مستحيل! تحتاج معدل فصلي ${neededSemesterGpa.toFixed(2)} وهذا يتجاوز 4.20`;
    } else if (neededSemesterGpa < 0) {
        targetResult.className = 'target-message success';
        targetResult.textContent = `وضعك ممتاز، حتى لو رسبت ستبقى فوق هدفك!`;
    } else {
        targetResult.className = 'target-message success';
        targetResult.textContent = `تحتاج معدل فصلي ${neededSemesterGpa.toFixed(2)} هذا الفصل لتحقيق هدفك 🚀`;
    }
}

// Event Listeners
addCourseBtn.addEventListener('click', addCourseRow);
prevHoursInput.addEventListener('input', calculate);
prevGpaInput.addEventListener('input', calculate);
targetGpaInput.addEventListener('input', calculate);

// Save and Export to Bot
saveBtn.addEventListener('click', () => {
    let data = {
        semesterGpa: resSemesterGpa.textContent,
        cumulativeGpa: resCumulativeGpa.textContent,
        rating: resRating.textContent,
        prevGpa: prevGpaInput.value,
        prevHours: prevHoursInput.value
    };
    
    // Send data to Bot
    tg.sendData(JSON.stringify(data));
});

// Initialize with one empty course
addCourseRow();
