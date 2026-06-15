let tg = window.Telegram.WebApp;
tg.expand();

// DOM Elements
const prevHoursInput = document.getElementById('prev-hours');
const prevGpaInput = document.getElementById('prev-gpa');
const coursesContainer = document.getElementById('courses-container');
const addCourseBtn = document.getElementById('add-course-btn');
const saveBtn = document.getElementById('save-btn');

const resCumulativeGpa = document.getElementById('res-cumulative-gpa');
const resSemesterGpa = document.getElementById('res-semester-gpa');
const resTotalHours = document.getElementById('res-total-hours');

// Advanced Section Elements
const totalPlanHoursInput = document.getElementById('total-plan-hours');
const targetGpaInput = document.getElementById('target-gpa');
const globalTargetResult = document.getElementById('global-target-result');
const semesterPlannerBox = document.getElementById('semester-planner');
const plannerHoursInput = document.getElementById('planner-hours');
const plannerResult = document.getElementById('planner-result');

let courses = [];
let currentSemesterTotalHours = 0;
let computedSemesterGpa = 0.0;
let computedCumulativeGpa = 0.0;
let ratingString = "";

function getRatingByPoints(points) {
    if (points >= 3.75) return 'امتياز';
    if (points >= 3.50) return 'ممتاز';
    if (points >= 3.00) return 'جيد جداً';
    if (points >= 2.50) return 'جيد';
    if (points >= 2.00) return 'ناجح';
    return 'إنذار';
}

function addCourseRow() {
    const id = Date.now();
    const row = document.createElement('div');
    row.className = 'course-row';
    row.id = `course-${id}`;
    
    row.innerHTML = `
        <input type="text" class="flex-2" placeholder="اسم المادة">
        <select class="course-input-hours flex-1" onchange="calculate()">
            <option value="0" disabled selected>الساعات</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
        </select>
        <select class="course-input-grade flex-1" onchange="calculate()">
            <option value="" disabled selected>العلامة</option>
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
        <button class="btn-icon remove-btn" onclick="removeCourse(${id})"><i class="fas fa-minus"></i></button>
    `;
    
    coursesContainer.appendChild(row);
    courses.push({ id });
}

function removeCourse(id) {
    document.getElementById(`course-${id}`).remove();
    courses = courses.filter(c => c.id !== id);
    calculate();
}

function calculate() {
    let prevHours = parseFloat(prevHoursInput.value) || 0;
    let prevGpa = parseFloat(prevGpaInput.value) || 0;
    
    let totalSemesterHours = 0;
    let totalSemesterPoints = 0;
    
    const hourInputs = document.querySelectorAll('.course-input-hours');
    const gradeInputs = document.querySelectorAll('.course-input-grade');
    
    for (let i = 0; i < courses.length; i++) {
        let h = parseFloat(hourInputs[i].value) || 0;
        let p = parseFloat(gradeInputs[i].value);
        
        if (h > 0 && !isNaN(p)) {
            totalSemesterHours += h;
            totalSemesterPoints += (p * h);
        }
    }
    
    currentSemesterTotalHours = totalSemesterHours;
    
    let semesterGpa = 0.0;
    if (totalSemesterHours > 0) {
        semesterGpa = totalSemesterPoints / totalSemesterHours;
    }
    
    let cumulativeGpa = prevGpa;
    let totalHoursNow = prevHours + totalSemesterHours;
    
    if (totalHoursNow > 0) {
        let totalOldPoints = prevHours * prevGpa;
        cumulativeGpa = (totalOldPoints + totalSemesterPoints) / totalHoursNow;
    }
    
    computedSemesterGpa = semesterGpa;
    computedCumulativeGpa = cumulativeGpa;
    ratingString = getRatingByPoints(cumulativeGpa);
    
    // Update Circles
    resSemesterGpa.textContent = semesterGpa > 0 ? semesterGpa.toFixed(3) : "0.000";
    resCumulativeGpa.textContent = cumulativeGpa > 0 ? cumulativeGpa.toFixed(3) : "0.000";
    resTotalHours.textContent = totalHoursNow;
    
    calculateAdvancedTarget(totalHoursNow, cumulativeGpa);
}

// Advanced Target Logic
let requiredAverageRemaining = 0; // Global required average

function calculateAdvancedTarget(currentHours, currentGpa) {
    let totalPlanHours = parseFloat(totalPlanHoursInput.value) || 0;
    let targetGpa = parseFloat(targetGpaInput.value) || 0;
    
    if (totalPlanHours === 0 || targetGpa === 0 || currentHours === 0) {
        globalTargetResult.classList.add('hidden');
        semesterPlannerBox.classList.add('hidden');
        return;
    }
    
    globalTargetResult.classList.remove('hidden');
    
    let remainingHours = totalPlanHours - currentHours;
    if (remainingHours <= 0) {
        globalTargetResult.className = 'target-message info';
        globalTargetResult.innerHTML = "لقد أنهيت ساعات خطتك! لا يوجد ساعات متبقية للتوقع.";
        semesterPlannerBox.classList.add('hidden');
        return;
    }
    
    let currentPoints = currentHours * currentGpa;
    let targetTotalPoints = totalPlanHours * targetGpa;
    let requiredPointsRemaining = targetTotalPoints - currentPoints;
    requiredAverageRemaining = requiredPointsRemaining / remainingHours;
    
    if (requiredAverageRemaining > 4.2) {
        let maxPossibleGpa = ((remainingHours * 4.2) + currentPoints) / totalPlanHours;
        globalTargetResult.className = 'target-message danger';
        globalTargetResult.innerHTML = `عذراً يا زميلي، للوصول لمعدل ${targetGpa.toFixed(2)} تحتاج لمتوسط ${requiredAverageRemaining.toFixed(3)} في الساعات المتبقية (${remainingHours} ساعة)، وهو يتجاوز الحد الأقصى (4.2).<br>أقصى معدل تراكمي يمكنك الوصول إليه إذا حصلت على A+ في جميع موادك القادمة هو: <strong>${maxPossibleGpa.toFixed(3)}</strong>!`;
        semesterPlannerBox.classList.add('hidden');
    } else if (requiredAverageRemaining <= 0.5) {
        globalTargetResult.className = 'target-message success';
        globalTargetResult.innerHTML = `وضعك مريح جداً! متوسطك المطلوب للـ ${remainingHours} ساعة المتبقية هو ${requiredAverageRemaining.toFixed(3)} فقط للوصول لهدفك.`;
        semesterPlannerBox.classList.remove('hidden');
    } else {
        globalTargetResult.className = 'target-message info';
        globalTargetResult.innerHTML = `عشان توصل لهدفك (${targetGpa.toFixed(2)})، لازم يكون متوسط معدلك بالـ ${remainingHours} ساعة الجايات هو: <strong>${requiredAverageRemaining.toFixed(3)}</strong>.`;
        semesterPlannerBox.classList.remove('hidden');
    }
    
    calculateSemesterPlanner();
}

function calculateSemesterPlanner() {
    let plannerHours = parseFloat(plannerHoursInput.value) || 0;
    if (plannerHours === 0) {
        plannerResult.classList.add('hidden');
        return;
    }
    
    plannerResult.classList.remove('hidden');
    
    // If they score exactly the required average
    let exactGpa = requiredAverageRemaining.toFixed(3);
    
    // If they score slightly higher (e.g. A = 4.0 if required is 3.8)
    // We calculate how it relieves pressure
    let currentHours = parseFloat(resTotalHours.textContent) || 0;
    let currentGpa = parseFloat(resCumulativeGpa.textContent) || 0;
    let totalPlanHours = parseFloat(totalPlanHoursInput.value) || 0;
    let targetGpa = parseFloat(targetGpaInput.value) || 0;
    
    let remainingAfterThis = (totalPlanHours - currentHours) - plannerHours;
    
    if (remainingAfterThis <= 0) {
        plannerResult.className = 'target-message success';
        plannerResult.innerHTML = `هذا فصلك الأخير! تحتاج ${exactGpa} بالضبط للوصول لهدفك.`;
        return;
    }
    
    // Scenario 1: They score 0.2 higher than required
    let highScenario = Math.min(4.2, requiredAverageRemaining + 0.2);
    let pointsAfterHigh = (currentHours * currentGpa) + (plannerHours * highScenario);
    let reqAfterHigh = ((totalPlanHours * targetGpa) - pointsAfterHigh) / remainingAfterThis;
    
    // Scenario 2: They score 0.2 lower
    let lowScenario = Math.max(0.5, requiredAverageRemaining - 0.2);
    let pointsAfterLow = (currentHours * currentGpa) + (plannerHours * lowScenario);
    let reqAfterLow = ((totalPlanHours * targetGpa) - pointsAfterLow) / remainingAfterThis;
    
    let msg = `المطلوب كمتوسط هذا الفصل هو <strong>${exactGpa}</strong>.<br><br>`;
    msg += `📉 <strong>إذا جبت ${highScenario.toFixed(2)}</strong>: سيقل الضغط عليك ويصبح المطلوب في الفصول القادمة ${reqAfterHigh.toFixed(2)}.<br>`;
    msg += `📈 <strong>إذا جبت ${lowScenario.toFixed(2)}</strong>: سيزيد الضغط عليك ويصبح المطلوب ${reqAfterLow.toFixed(2)}.`;
    
    plannerResult.className = 'target-message info';
    plannerResult.innerHTML = msg;
}

// Listeners
addCourseBtn.addEventListener('click', addCourseRow);
prevHoursInput.addEventListener('input', calculate);
prevGpaInput.addEventListener('input', calculate);
totalPlanHoursInput.addEventListener('input', calculate);
targetGpaInput.addEventListener('input', calculate);
plannerHoursInput.addEventListener('input', calculateSemesterPlanner);

// Initialization
addCourseRow();

// Save functionality
saveBtn.addEventListener('click', () => {
    let semPercentage = ((computedSemesterGpa / 4.2) * 100).toFixed(2);
    let cumPercentage = ((computedCumulativeGpa / 4.2) * 100).toFixed(2);
    
    let data = {
        semesterGpa: computedSemesterGpa > 0 ? computedSemesterGpa.toFixed(3) : "0.000",
        semesterPercentage: semPercentage,
        semesterHours: currentSemesterTotalHours,
        cumulativeGpa: computedCumulativeGpa > 0 ? computedCumulativeGpa.toFixed(3) : "0.000",
        cumulativePercentage: cumPercentage,
        cumulativeTotalHours: resTotalHours.textContent,
        rating: ratingString
    };
    
    tg.sendData(JSON.stringify(data));
});
