// Global variables
let scoresData = null;
let currentSemester = null;
let originalScores = null;
let isPredictionMode = false;
let currentEditingSubject = null;
let currentFileName = null;

// Load scores data from default file
async function loadScoresData() {
    try {
        const response = await fetch('./Scores.json');
        const data = await response.json();
        scoresData = data;
        originalScores = JSON.parse(JSON.stringify(data)); // Deep copy
        currentFileName = 'Scores.json';
        updateFileInfo();
        initializeApp();
    } catch (error) {
        console.error('Error loading scores data:', error);
        showNoDataMessage();
    }
}

// Load scores data from imported file
function loadScoresFromFile(fileContent, fileName) {
    try {
        // Try to parse as JSON first
        let parsedData;
        try {
            parsedData = JSON.parse(fileContent);
        } catch (jsonError) {
            // If JSON parsing fails, try to extract JSON from JS file
            const jsonMatch = fileContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Không thể tìm thấy dữ liệu JSON trong file');
            }
        }

        // Validate data structure
        if (!parsedData.data || !parsedData.data.ds_diem_hocky) {
            throw new Error('Cấu trúc dữ liệu không hợp lệ');
        }

        scoresData = parsedData;
        originalScores = JSON.parse(JSON.stringify(parsedData)); // Deep copy
        currentFileName = fileName;
        updateFileInfo();
        initializeApp();

        // Show success message
        showMessage('✅ Import file thành công!', 'success');

    } catch (error) {
        console.error('Error parsing imported file:', error);
        showMessage('❌ Lỗi: ' + error.message, 'error');
    }
}

// Show message to user
function showMessage(message, type = 'info') {
    // Remove existing message
    const existingMessage = document.querySelector('.message-toast');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create new message
    const messageDiv = document.createElement('div');
    messageDiv.className = `message-toast ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.remove();
        }
    }, 3000);
}

// Update file info display
function updateFileInfo() {
    const fileInfo = document.getElementById('file-info');
    const currentFileSpan = document.getElementById('current-file');

    if (currentFileName) {
        currentFileSpan.textContent = currentFileName;
        fileInfo.style.display = 'flex';
    } else {
        fileInfo.style.display = 'none';
    }
}

// Show no data message
function showNoDataMessage() {
    const container = document.querySelector('.container');
    container.innerHTML = `
        <div class="no-data-message">
            <h2>📁 Chưa có dữ liệu điểm</h2>
            <p>Vui lòng import file điểm để bắt đầu sử dụng.</p>
            <button id="import-btn-main" class="import-button">
                📁 Import file điểm
            </button>
            <input type="file" id="file-input-main" accept=".js,.json" style="display: none;">
            <div class="file-format-info">
                <h3>Định dạng file hỗ trợ:</h3>
                <ul>
                    <li>File .json (JSON) - như file Scores.json mẫu</li>
                    <li>File .js (JavaScript) - dữ liệu JS với cấu trúc JSON</li>
                </ul>
            </div>
        </div>
    `;

    // Setup event listeners for main import button
    setupMainImportListeners();
}

// Initialize the application
function initializeApp() {
    if (!scoresData || !scoresData.data || !scoresData.data.ds_diem_hocky) {
        console.error('Invalid data structure');
        return;
    }

    createSemesterTabs();
    updateOverallGPA();
    
    // Show first semester by default
    if (scoresData.data.ds_diem_hocky.length > 0) {
        showSemester(scoresData.data.ds_diem_hocky[0].hoc_ky);
    }

    setupEventListeners();
}

// Create semester tabs
function createSemesterTabs() {
    const buttonsContainer = document.getElementById('semester-buttons');
    buttonsContainer.innerHTML = '';

    scoresData.data.ds_diem_hocky.forEach(semester => {
        const button = document.createElement('button');
        button.className = 'semester-btn';
        button.textContent = semester.ten_hoc_ky;
        button.onclick = () => showSemester(semester.hoc_ky);
        buttonsContainer.appendChild(button);
    });
}

// Show semester data
function showSemester(semesterCode) {
    currentSemester = semesterCode;
    
    // Update active tab
    document.querySelectorAll('.semester-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent === getSemesterName(semesterCode)) {
            btn.classList.add('active');
        }
    });

    const semester = scoresData.data.ds_diem_hocky.find(s => s.hoc_ky === semesterCode);
    if (!semester) return;

    displayScoresTable(semester);
    updateSemesterStats(semester);
}

// Get semester name by code
function getSemesterName(code) {
    const semester = scoresData.data.ds_diem_hocky.find(s => s.hoc_ky === code);
    return semester ? semester.ten_hoc_ky : '';
}

// Display scores table
function displayScoresTable(semester) {
    const tbody = document.getElementById('scores-tbody');
    tbody.innerHTML = '';

    if (!semester.ds_diem_mon_hoc || semester.ds_diem_mon_hoc.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11">Không có dữ liệu môn học</td></tr>';
        return;
    }

    semester.ds_diem_mon_hoc.forEach((subject, index) => {
        const row = createSubjectRow(subject, index + 1);
        tbody.appendChild(row);
    });
}

// Create subject row
function createSubjectRow(subject, stt) {
    const row = document.createElement('tr');

    const resultText = getResultText(subject.ket_qua);
    const resultClass = getResultClass(subject.ket_qua);

    const scoreClass = isPredictionMode ? 'editable-score' : '';
    const isPredicted = subject.isPredicted ? 'predicted-score' : '';

    // Display score or placeholder for prediction
    const displayScore = subject.diem_tk || (isPredictionMode ? 'Dự kiến' : '-');

    row.innerHTML = `
        <td>${stt}</td>
        <td>${subject.ma_mon}</td>
        <td>${subject.nhom_to}</td>
        <td style="text-align: left; max-width: 200px;">${subject.ten_mon}</td>
        <td>${subject.so_tin_chi}</td>
        <td>${subject.diem_thi || '-'}</td>
        <td class="${scoreClass} ${isPredicted}" data-subject-id="${subject.ma_mon}">${displayScore}</td>
        <td>${subject.diem_tk_so || (isPredictionMode && !subject.diem_tk ? 'Dự kiến' : '-')}</td>
        <td>${subject.diem_tk_chu || (isPredictionMode && !subject.diem_tk ? 'Dự kiến' : '-')}</td>
        <td class="${resultClass}">${resultText}</td>
        <td>
            ${subject.ds_diem_thanh_phan && subject.ds_diem_thanh_phan.length > 0
                ? `<button class="detail-btn" onclick="showSubjectDetail('${subject.ma_mon}')">Chi tiết</button>`
                : '-'
            }
        </td>
    `;

    // Add click event for prediction mode - now works for all subjects
    if (isPredictionMode) {
        const scoreCell = row.querySelector('.editable-score');
        if (scoreCell) {
            scoreCell.onclick = () => openPredictionModal(subject);
            // Add visual indicator for clickable cells
            scoreCell.style.cursor = 'pointer';
            if (!subject.diem_tk) {
                scoreCell.style.fontStyle = 'italic';
                scoreCell.style.color = '#6c757d';
            }
        }
    }

    return row;
}

// Get result text
function getResultText(result) {
    switch (result) {
        case 1: return 'Đạt';
        case 0: return 'Chưa có điểm';
        case -1: return 'Không đạt';
        default: return 'Không xác định';
    }
}

// Get result CSS class
function getResultClass(result) {
    switch (result) {
        case 1: return 'result-pass';
        case 0: return 'result-pending';
        case -1: return 'result-fail';
        default: return '';
    }
}

// Show subject detail modal
function showSubjectDetail(subjectCode) {
    const semester = scoresData.data.ds_diem_hocky.find(s => s.hoc_ky === currentSemester);
    const subject = semester.ds_diem_mon_hoc.find(s => s.ma_mon === subjectCode);
    
    if (!subject || !subject.ds_diem_thanh_phan) return;

    const modal = document.getElementById('detail-modal');
    const content = document.getElementById('detail-content');
    
    content.innerHTML = `
        <h4>${subject.ten_mon} (${subject.ma_mon})</h4>
        <table class="detail-table">
            <thead>
                <tr>
                    <th>Thành phần</th>
                    <th>Trọng số (%)</th>
                    <th>Điểm</th>
                </tr>
            </thead>
            <tbody>
                ${subject.ds_diem_thanh_phan.map(component => `
                    <tr>
                        <td>${component.ten_thanh_phan}</td>
                        <td>${component.trong_so}%</td>
                        <td>${component.diem_thanh_phan}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div style="margin-top: 15px;">
            <strong>Điểm tổng kết: ${subject.diem_tk || 'Chưa có'}</strong>
        </div>
    `;
    
    modal.style.display = 'block';
}

// Open prediction modal
function openPredictionModal(subject) {
    currentEditingSubject = subject;
    const modal = document.getElementById('prediction-modal');
    const scoreInput = document.getElementById('new-score');

    // Set current score or empty for new prediction
    scoreInput.value = subject.diem_tk || '';

    // Update modal title to show subject info
    const modalTitle = modal.querySelector('h3');
    modalTitle.textContent = `Dự kiến điểm - ${subject.ten_mon} (${subject.ma_mon})`;

    modal.style.display = 'block';
    scoreInput.focus();
}

// Apply prediction
function applyPrediction() {
    const newScoreInput = document.getElementById('new-score').value.trim();

    // Store original state to check if this was a new prediction
    const originalSubject = findOriginalSubject(currentEditingSubject.ma_mon);
    const wasOriginallyEmpty = !originalSubject || !originalSubject.diem_tk;

    // Allow clearing the prediction by leaving input empty
    if (newScoreInput === '') {
        // Reset to original state
        if (originalSubject) {
            currentEditingSubject.diem_tk = originalSubject.diem_tk;
            currentEditingSubject.diem_tk_so = originalSubject.diem_tk_so;
            currentEditingSubject.diem_tk_chu = originalSubject.diem_tk_chu;
            currentEditingSubject.ket_qua = originalSubject.ket_qua;
            currentEditingSubject.isPredicted = false;
        } else {
            // If original was empty, clear everything
            currentEditingSubject.diem_tk = '';
            currentEditingSubject.diem_tk_so = '';
            currentEditingSubject.diem_tk_chu = '';
            currentEditingSubject.ket_qua = 0;
            currentEditingSubject.isPredicted = false;
        }
    } else {
        const newScore = parseFloat(newScoreInput);

        if (isNaN(newScore) || newScore < 0 || newScore > 10) {
            alert('Vui lòng nhập điểm hợp lệ (0-10) hoặc để trống để xóa dự kiến');
            return;
        }

        // Update the subject score
        currentEditingSubject.diem_tk = newScore.toFixed(1);
        currentEditingSubject.diem_tk_so = convertTo4Scale(newScore).toFixed(1);
        currentEditingSubject.diem_tk_chu = convertToLetterGrade(newScore);
        currentEditingSubject.isPredicted = true;

        // Update result based on new score (pass if >= 4.0)
        if (newScore >= 4.0) {
            currentEditingSubject.ket_qua = 1;
        } else {
            currentEditingSubject.ket_qua = -1;
        }

        // If this was originally a subject without score, mark it as countable for GPA
        if (wasOriginallyEmpty) {
            currentEditingSubject.khong_tinh_diem_tbtl = 0;
        }
    }

    // Refresh display
    showSemester(currentSemester);
    updateOverallGPA();

    // Close modal
    document.getElementById('prediction-modal').style.display = 'none';
}

// Find original subject data
function findOriginalSubject(subjectCode) {
    for (const semester of originalScores.data.ds_diem_hocky) {
        if (semester.hoc_ky === currentSemester) {
            return semester.ds_diem_mon_hoc.find(s => s.ma_mon === subjectCode);
        }
    }
    return null;
}

// Convert score to 4-point scale
function convertTo4Scale(score) {
    if (score >= 9.0) return 4.0;  // A+
    if (score >= 8.5) return 3.7;  // A
    if (score >= 8.0) return 3.5;  // B+
    if (score >= 7.0) return 3.0;  // B
    if (score >= 6.5) return 2.5;  // C+
    if (score >= 5.5) return 2.0;  // C
    if (score >= 5.0) return 1.5;  // D+
    if (score >= 4.0) return 1.0;  // D
    return 0.0;                     // F
}

// Convert score to letter grade
function convertToLetterGrade(score) {
    if (score >= 9.0) return 'A+';  // 9.0-10.0
    if (score >= 8.5) return 'A';   // 8.5-8.9
    if (score >= 8.0) return 'B+';  // 8.0-8.4
    if (score >= 7.0) return 'B';   // 7.0-7.9
    if (score >= 6.5) return 'C+';  // 6.5-6.9
    if (score >= 5.5) return 'C';   // 5.5-6.4
    if (score >= 5.0) return 'D+';  // 5.0-5.4
    if (score >= 4.0) return 'D';   // 4.0-4.9
    return 'F';                      // < 4.0
}

// Update overall GPA
function updateOverallGPA() {
    let totalCreditsForGPA = 0;  // Tín chỉ để tính GPA (có điểm)
    let totalPoints10 = 0;
    let totalPoints4 = 0;
    let passedCredits = 0;       // Tín chỉ đạt (điểm >= 4.0)

    scoresData.data.ds_diem_hocky.forEach(semester => {
        semester.ds_diem_mon_hoc.forEach(subject => {
            // Chỉ tính GPA cho môn có điểm và không bị loại trừ
            if (subject.diem_tk && subject.khong_tinh_diem_tbtl === 0) {
                const credits = parseInt(subject.so_tin_chi);
                const score10 = parseFloat(subject.diem_tk);
                const score4 = parseFloat(subject.diem_tk_so);

                // Tín chỉ để tính GPA
                totalCreditsForGPA += credits;
                totalPoints10 += score10 * credits;
                totalPoints4 += score4 * credits;

                // Tín chỉ đạt (điểm >= 4.0)
                if (score10 >= 4.0) {
                    passedCredits += credits;
                }
            }
        });
    });

    const gpa10 = totalCreditsForGPA > 0 ? (totalPoints10 / totalCreditsForGPA).toFixed(2) : '0.00';
    const gpa4 = totalCreditsForGPA > 0 ? (totalPoints4 / totalCreditsForGPA).toFixed(2) : '0.00';

    document.getElementById('current-gpa-10').textContent = gpa10;
    document.getElementById('current-gpa-4').textContent = gpa4;
    document.getElementById('total-credits').textContent = passedCredits;
}

// Update semester statistics
function updateSemesterStats(semester) {
    const statsContainer = document.getElementById('semester-stats');
    
    const stats = [
        { label: 'Điểm TB học kỳ (10)', value: semester.dtb_hk_he10 || 'N/A' },
        { label: 'Điểm TB học kỳ (4)', value: semester.dtb_hk_he4 || 'N/A' },
        { label: 'Tín chỉ đạt học kỳ', value: semester.so_tin_chi_dat_hk || 'N/A' },
        { label: 'Xếp loại học kỳ', value: semester.xep_loai_tkb_hk || 'N/A' }
    ];

    statsContainer.innerHTML = stats.map(stat => `
        <div class="stat-item">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
        </div>
    `).join('');
}

// Toggle prediction mode
function togglePredictionMode() {
    isPredictionMode = document.getElementById('prediction-toggle').checked;
    const resetBtn = document.getElementById('reset-prediction');
    const helpText = document.getElementById('prediction-help');
    const body = document.body;

    if (isPredictionMode) {
        body.classList.add('prediction-mode-active');
        resetBtn.style.display = 'inline-block';
        if (helpText) helpText.style.display = 'block';
    } else {
        body.classList.remove('prediction-mode-active');
        resetBtn.style.display = 'none';
        if (helpText) helpText.style.display = 'none';
    }

    // Refresh current semester display
    if (currentSemester) {
        showSemester(currentSemester);
    }
}

// Reset predictions
function resetPredictions() {
    if (confirm('Bạn có chắc muốn khôi phục tất cả điểm về trạng thái ban đầu?')) {
        scoresData = JSON.parse(JSON.stringify(originalScores));
        showSemester(currentSemester);
        updateOverallGPA();
    }
}

// Setup event listeners
function setupEventListeners() {
    // Import file functionality
    setupImportListeners();

    // Prediction mode toggle
    const predictionToggle = document.getElementById('prediction-toggle');
    if (predictionToggle) {
        predictionToggle.addEventListener('change', togglePredictionMode);
    }

    // Reset predictions button
    const resetBtn = document.getElementById('reset-prediction');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetPredictions);
    }

    // Apply prediction button
    const applyBtn = document.getElementById('apply-prediction');
    if (applyBtn) {
        applyBtn.addEventListener('click', applyPrediction);
    }

    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // Enter key in prediction input
    const scoreInput = document.getElementById('new-score');
    if (scoreInput) {
        scoreInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                applyPrediction();
            }
        });
    }
}

// Setup import file listeners
function setupImportListeners() {
    const importBtn = document.getElementById('import-btn');
    const fileInput = document.getElementById('file-input');
    const clearBtn = document.getElementById('clear-file');

    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', handleFileImport);
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', clearCurrentFile);
    }
}

// Setup main import listeners (for no-data page)
function setupMainImportListeners() {
    const importBtn = document.getElementById('import-btn-main');
    const fileInput = document.getElementById('file-input-main');

    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', handleFileImport);
    }
}

// Handle file import
function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Check file type
    const validTypes = ['.js', '.json'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

    if (!validTypes.includes(fileExtension)) {
        showMessage('❌ Chỉ hỗ trợ file .js và .json', 'error');
        return;
    }

    // Read file content
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        loadScoresFromFile(content, file.name);
    };

    reader.onerror = function() {
        showMessage('❌ Lỗi đọc file', 'error');
    };

    reader.readAsText(file);

    // Reset input
    event.target.value = '';
}

// Clear current file
function clearCurrentFile() {
    if (confirm('Bạn có chắc muốn xóa file hiện tại và quay về file mặc định?')) {
        currentFileName = null;
        updateFileInfo();
        loadScoresData(); // Load default file
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', loadScoresData);
