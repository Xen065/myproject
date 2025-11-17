// Global Variables
let currentDate = new Date();
let currentTab = 'dashboard';
let timerInterval = null;
let timerSeconds = 1500; // 25 minutes
let cards = [];
let currentCardIndex = 0;
let studySessions = [];

// Sample flashcards data
const sampleCards = [
    {
        id: 1,
        question: "What is the process by which plants make their own food using sunlight?",
        answer: "Photosynthesis - The process where plants convert light energy into chemical energy, using CO₂ and water to produce glucose and oxygen.",
        hint: "It involves chlorophyll and produces oxygen",
        category: "science",
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date()
    },
    {
        id: 2,
        question: "What is the capital of France?",
        answer: "Paris - The capital and most populous city of France, known as the 'City of Light'",
        hint: "City of Light",
        category: "geography",
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date()
    },
    {
        id: 3,
        question: "Who wrote 'Romeo and Juliet'?",
        answer: "William Shakespeare - Famous English playwright and poet who wrote the tragic love story in the 1590s",
        hint: "Famous English playwright",
        category: "literature",
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date()
    },
    {
        id: 4,
        question: "What is the chemical symbol for gold?",
        answer: "Au - Derived from the Latin word 'aurum' meaning gold",
        hint: "Think of the Latin word for gold",
        category: "science",
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date()
    },
    {
        id: 5,
        question: "What is the largest planet in our solar system?",
        answer: "Jupiter - A gas giant that is more than twice as massive as all the other planets combined",
        hint: "It's a gas giant",
        category: "science",
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date()
    }
];

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderCalendar();
    updateStats();
    if (cards.length === 0) {
        cards = [...sampleCards];
        saveData();
    }
    updateTimerDisplay();
});

// Tab switching
function switchTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

    event.target.classList.add('active');
    document.getElementById(tab).classList.add('active');
}

// Bottom navigation
function switchSection(section) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.currentTarget.classList.add('active');

    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.getElementById(section).classList.add('active');

    // Update tab navigation to match
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    const sectionMap = {
        'dashboard': 0,
        'study': 1,
        'calendar': 2,
        'store': 3,
        'profile': 4
    };
    const tabIndex = sectionMap[section];
    document.querySelectorAll('.nav-tab')[tabIndex]?.classList.add('active');
}

// Calendar Functions
function renderCalendar() {
    const grid = document.getElementById('calendarGrid');
    if (!grid) return;

    grid.innerHTML = '';

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;

    // Add day headers
    const dayHeaders = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    // Calculate days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Empty cells for alignment
    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement('div');
        grid.appendChild(empty);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;

        // Check if today
        if (year === today.getFullYear() &&
            month === today.getMonth() &&
            day === today.getDate()) {
            dayElement.classList.add('today');
        }

        // Check if has study session
        if (hasStudySession(year, month, day)) {
            dayElement.classList.add('study-day');
        }

        // Random events for demo
        if (Math.random() > 0.8) {
            dayElement.classList.add('has-event');
        }

        dayElement.onclick = () => showDayDetails(year, month, day);
        grid.appendChild(dayElement);
    }

    // Update schedule display after calendar renders
    updateScheduleDisplay();
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

function hasStudySession(year, month, day) {
    return studySessions.some(session => {
        const sessionDate = new Date(session.date);
        return sessionDate.getFullYear() === year &&
               sessionDate.getMonth() === month &&
               sessionDate.getDate() === day;
    });
}

function showDayDetails(year, month, day) {
    showToast(`Selected: ${month + 1}/${day}/${year}`);
}

// Study Functions
function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
}

function rateCard(rating) {
    // Spaced repetition algorithm (simplified SM-2)
    const card = cards[currentCardIndex];

    if (rating < 3) {
        card.interval = 1;
        card.easeFactor = Math.max(1.3, card.easeFactor - 0.2);
    } else {
        if (card.interval === 1) {
            card.interval = 6;
        } else {
            card.interval = Math.round(card.interval * card.easeFactor);
        }
        card.easeFactor = Math.min(2.5, card.easeFactor + (rating - 3) * 0.1);
    }

    // Set next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + card.interval);
    card.nextReview = nextReview;

    // Save progress
    saveData();

    // Move to next card
    currentCardIndex = (currentCardIndex + 1) % cards.length;
    loadCard(currentCardIndex);

    // Update stats
    updateStats();

    const ratingText = ['', 'Again', 'Hard', 'Good', 'Easy'][rating];
    showToast(`${ratingText} - Next review in ${card.interval} days`);
}

function loadCard(index) {
    const card = cards[index];
    const flashcard = document.getElementById('flashcard');
    flashcard.classList.remove('flipped');

    // Update card content
    setTimeout(() => {
        flashcard.querySelector('.flashcard-front .card-content').innerHTML =
            `<strong>Question:</strong><br><br>${card.question}`;
        flashcard.querySelector('.card-hint').innerHTML =
            `💡 Hint: ${card.hint}`;
        flashcard.querySelector('.flashcard-back .card-content').innerHTML =
            `<strong>Answer:</strong><br><br>${card.answer}`;
    }, 300);
}

// Timer Functions
function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();

            if (timerSeconds <= 0) {
                pauseTimer();
                showToast('Study session completed! 🎉');
                timerSeconds = 1500;
                updateTimerDisplay();
            }
        }, 1000);
    }
}

function pauseTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    pauseTimer();
    timerSeconds = 1500;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const display = document.getElementById('timerDisplay');
    if (display) {
        display.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Modal Functions
function addStudySession() {
    document.getElementById('addSessionModal').classList.add('show');
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('sessionDate').value = today;
}

function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('show');
    });
}

function saveStudySession(event) {
    event.preventDefault();

    const session = {
        id: Date.now(),
        course: document.getElementById('sessionCourse').value,
        date: document.getElementById('sessionDate').value,
        time: document.getElementById('sessionTime').value,
        duration: document.getElementById('sessionDuration').value
    };

    studySessions.push(session);
    saveData();
    renderCalendar();
    closeModal();
    showToast('Study session added!');
}

function updateScheduleDisplay() {
    const schedule = document.getElementById('studySchedule');
    if (!schedule) return;

    schedule.innerHTML = '';

    const upcomingSessions = studySessions
        .filter(s => new Date(s.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 3);

    if (upcomingSessions.length === 0) {
        schedule.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 15px;">No upcoming sessions. Click + to add one!</p>';
        return;
    }

    upcomingSessions.forEach(session => {
        const item = document.createElement('div');
        item.className = 'course-item';
        item.innerHTML = `
            <div class="course-icon">📚</div>
            <div class="course-info">
                <div class="course-name">${session.course}</div>
                <div class="course-progress">${new Date(session.date).toLocaleDateString()} at ${session.time}</div>
            </div>
        `;
        schedule.appendChild(item);
    });
}

// Quick Add Card
function quickAddCard() {
    const question = prompt('Enter question:');
    if (!question) return;

    const answer = prompt('Enter answer:');
    if (!answer) return;

    const hint = prompt('Enter hint (optional):') || 'No hint available';

    const newCard = {
        id: Date.now(),
        question: question,
        answer: answer,
        hint: hint,
        category: 'custom',
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date()
    };

    cards.push(newCard);
    saveData();
    updateStats();
    showToast('Card added successfully!');
}

// Settings Functions
function toggleSwitch(element) {
    element.classList.toggle('active');
}

function toggleNotifications() {
    showToast('Notifications panel coming soon!');
}

function showSettings() {
    showToast('Additional settings coming soon!');
}

function showAbout() {
    showToast('EduMaster v1.0 - Spaced Repetition Learning App');
}

// Stats Functions
function updateStats() {
    // Calculate total cards
    const totalCards = cards.length;

    // Update header stats
    document.getElementById('streakCount').textContent = '7';
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('todayGoal').textContent = '85%';
    document.getElementById('userLevel').textContent = '12';

    // Update other stats throughout the app
    updateScheduleDisplay();
}

// Data Management
function saveData() {
    try {
        localStorage.setItem('edumaster_cards', JSON.stringify(cards));
        localStorage.setItem('edumaster_sessions', JSON.stringify(studySessions));
    } catch (e) {
        console.error('Error saving data:', e);
        showToast('Error saving data. Please check browser settings.');
    }
}

function loadData() {
    try {
        const savedCards = localStorage.getItem('edumaster_cards');
        const savedSessions = localStorage.getItem('edumaster_sessions');

        if (savedCards) {
            cards = JSON.parse(savedCards);
        }

        if (savedSessions) {
            studySessions = JSON.parse(savedSessions);
        }
    } catch (e) {
        console.error('Error loading data:', e);
        showToast('Error loading saved data.');
    }
}

// Start Study
function startStudy(course) {
    switchSection('study');
    showToast(`Starting ${course} study session`);
    if (cards.length > 0) {
        loadCard(0);
    }
}

// Toast Notification
function showToast(message) {
    // Remove any existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(t => t.remove());

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Export functions for global access
window.switchTab = switchTab;
window.switchSection = switchSection;
window.renderCalendar = renderCalendar;
window.previousMonth = previousMonth;
window.nextMonth = nextMonth;
window.flipCard = flipCard;
window.rateCard = rateCard;
window.startTimer = startTimer;
window.pauseTimer = pauseTimer;
window.resetTimer = resetTimer;
window.addStudySession = addStudySession;
window.closeModal = closeModal;
window.saveStudySession = saveStudySession;
window.quickAddCard = quickAddCard;
window.toggleSwitch = toggleSwitch;
window.toggleNotifications = toggleNotifications;
window.showSettings = showSettings;
window.showAbout = showAbout;
window.startStudy = startStudy;
