// Global variables
let scoresData = null;
let ctdtData = null;
let currentSemester = null;
let originalScores = null;
let originalCtdt = null;
let isPredictionMode = false;
let currentEditingSubject = null;
let currentScoresFileName = null;
let currentCtdtFileName = null;
let currentViewMode = 'studied'; // 'studied' or 'future'

// Load scores data from default file
async function loadScoresData() {
    try {
        const response = await fetch('./Scores.json');
        const data = await response.json();
        scoresData = data;
        originalScores = JSON.parse(JSON.stringify(data)); // Deep copy
        currentScoresFileName = 'Scores.json (mặc định)';
        updateFileInfo();
        initializeApp();

        // Show success message for default file
        showMessage('✅ Đã tải file điểm mặc định', 'success');
    } catch (error) {
        console.error('Error loading default scores data:', error);
        // Try to continue with empty data and show import option
        showEmptyState();
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
            throw new Error('Cấu trúc dữ liệu điểm không hợp lệ');
        }

        scoresData = parsedData;
        originalScores = JSON.parse(JSON.stringify(parsedData)); // Deep copy
        currentScoresFileName = fileName;
        updateFileInfo();
        initializeApp();

        // Show success message
        showMessage('✅ Import file điểm thành công!', 'success');

    } catch (error) {
        console.error('Error parsing imported scores file:', error);
        showMessage('❌ Lỗi: ' + error.message, 'error');
    }
}

// Load CTDT data from imported file
function loadCtdtFromFile(fileContent, fileName) {
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

        // Validate CTDT data structure
        if (!parsedData.data || !parsedData.data.ds_CTDT_hocky) {
            throw new Error('Cấu trúc dữ liệu CTĐT không hợp lệ');
        }

        ctdtData = parsedData;
        originalCtdt = JSON.parse(JSON.stringify(parsedData)); // Deep copy
        currentCtdtFileName = fileName;
        updateFileInfo();

        // Show view mode tabs
        document.getElementById('view-mode-tabs').style.display = 'flex';

        // Show success message
        showMessage('✅ Import CTĐT thành công! Bây giờ có thể dự kiến điểm cho môn chưa học.', 'success');

        // Refresh current view
        if (currentSemester) {
            showSemester(currentSemester);
        }

    } catch (error) {
        console.error('Error parsing imported CTDT file:', error);
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
    const currentScoresFileSpan = document.getElementById('current-scores-file');
    const currentCtdtFileSpan = document.getElementById('current-ctdt-file');
    const ctdtFileItem = document.getElementById('ctdt-file-item');
    const importCtdtBtn = document.getElementById('import-ctdt-btn');

    // Update scores file info
    if (currentScoresFileName) {
        currentScoresFileSpan.textContent = currentScoresFileName;
        fileInfo.style.display = 'flex';

        // Show CTDT import button after scores are imported
        importCtdtBtn.style.display = 'inline-flex';
    } else {
        currentScoresFileSpan.textContent = 'Chưa có file';
        fileInfo.style.display = 'none';
        importCtdtBtn.style.display = 'none';
    }

    // Update CTDT file info
    if (currentCtdtFileName) {
        currentCtdtFileSpan.textContent = currentCtdtFileName;
        ctdtFileItem.style.display = 'flex';
    } else {
        currentCtdtFileSpan.textContent = 'Chưa có file';
        ctdtFileItem.style.display = 'none';
    }
}

// Show empty state with main interface
function showEmptyState() {
    // Initialize with empty data structure
    scoresData = {
        data: {
            ds_diem_hocky: []
        }
    };
    originalScores = JSON.parse(JSON.stringify(scoresData));
    currentScoresFileName = null;

    // Initialize the app with empty data
    initializeApp();

    // Show message about missing default file
    showMessage('⚠️ File điểm mặc định không tồn tại. Vui lòng import file điểm của bạn.', 'info');

    // Show empty table with import instruction
    const tbody = document.getElementById('scores-tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" style="text-align: center; padding: 40px;">
                    <div style="color: #666; font-size: 1.1em;">
                        <p style="margin-bottom: 15px;">📁 Chưa có dữ liệu điểm</p>
                        <p style="margin-bottom: 20px;">Click nút <strong>"📊 Import file điểm"</strong> ở trên để bắt đầu</p>
                        <p style="font-size: 0.9em; color: #999;">
                            Xem <a href="https://github.com/tain03/DuKienDiem/blob/main/HUONG-DAN-LAY-DU-LIEU.md" target="_blank" style="color: #667eea;">hướng dẫn chi tiết</a>
                            để lấy dữ liệu từ hệ thống QLDT
                        </p>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Initialize the application
function initializeApp() {
    if (!scoresData || !scoresData.data) {
        console.error('Invalid data structure');
        return;
    }

    createSemesterTabs();
    updateOverallGPA();

    // Show first semester by default if data exists
    if (scoresData.data.ds_diem_hocky && scoresData.data.ds_diem_hocky.length > 0) {
        showSemester(scoresData.data.ds_diem_hocky[0].hoc_ky);
    } else {
        // Show empty table if no data
        const tbody = document.getElementById('scores-tbody');
        if (tbody && tbody.children.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="11" style="text-align: center; padding: 40px;">
                        <div style="color: #666; font-size: 1.1em;">
                            <p style="margin-bottom: 15px;">📁 Chưa có dữ liệu điểm</p>
                            <p style="margin-bottom: 20px;">Click nút <strong>"📊 Import file điểm"</strong> ở trên để bắt đầu</p>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    setupEventListeners();
}

// Create semester tabs
function createSemesterTabs() {
    const buttonsContainer = document.getElementById('semester-buttons');
    buttonsContainer.innerHTML = '';

    if (!scoresData.data.ds_diem_hocky || scoresData.data.ds_diem_hocky.length === 0) {
        buttonsContainer.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">Chưa có dữ liệu học kỳ</p>';
        return;
    }

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

    if (currentViewMode === 'studied') {
        const semester = scoresData.data.ds_diem_hocky.find(s => s.hoc_ky === semesterCode);
        if (!semester) return;
        displayScoresTable(semester);
        updateSemesterStats(semester);
    } else if (currentViewMode === 'future' && ctdtData) {
        // For future subjects, ignore semester selection and show all
        displayFutureSubjectsTable();
        updateFutureSubjectsStats();
    }
}

// Switch view mode
function switchViewMode(mode) {
    currentViewMode = mode;

    // Update active tab
    document.querySelectorAll('.view-mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    const semesterTabs = document.querySelector('.semester-tabs');

    if (mode === 'studied') {
        document.getElementById('studied-subjects-btn').classList.add('active');
        semesterTabs.style.display = 'block'; // Show semester tabs

        // Refresh current semester display
        if (currentSemester) {
            showSemester(currentSemester);
        }
    } else {
        document.getElementById('future-subjects-btn').classList.add('active');
        semesterTabs.style.display = 'none'; // Hide semester tabs

        // Show all future subjects
        displayFutureSubjectsTable();
        updateFutureSubjectsStats();
    }
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

// Display future subjects table (all future subjects from all semesters)
function displayFutureSubjectsTable() {
    const tbody = document.getElementById('scores-tbody');
    tbody.innerHTML = '';

    if (!ctdtData || !ctdtData.data || !ctdtData.data.ds_CTDT_hocky) {
        tbody.innerHTML = '<tr><td colspan="11">Không có dữ liệu CTĐT</td></tr>';
        return;
    }

    // Collect all future subjects from all semesters
    let allFutureSubjects = [];

    ctdtData.data.ds_CTDT_hocky.forEach(semester => {
        if (semester.ds_CTDT_mon_hoc) {
            const futureSubjects = semester.ds_CTDT_mon_hoc.filter(subject => {
                return !subject.mon_da_hoc || subject.mon_da_hoc === '';
            });

            // Add semester info to each subject
            futureSubjects.forEach(subject => {
                subject.hoc_ky_ctdt = semester.hoc_ky;
                subject.ten_hoc_ky_ctdt = semester.ten_hoc_ky;
            });

            allFutureSubjects = allFutureSubjects.concat(futureSubjects);
        }
    });

    if (allFutureSubjects.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11">Không có môn học chưa học</td></tr>';
        return;
    }

    // Sort by semester and subject code
    allFutureSubjects.sort((a, b) => {
        if (a.hoc_ky_ctdt !== b.hoc_ky_ctdt) {
            return a.hoc_ky_ctdt.localeCompare(b.hoc_ky_ctdt);
        }
        return a.ma_mon.localeCompare(b.ma_mon);
    });

    allFutureSubjects.forEach((subject, index) => {
        const row = createFutureSubjectRow(subject, index + 1);
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

// Create future subject row
function createFutureSubjectRow(subject, stt) {
    const row = document.createElement('tr');

    const scoreClass = isPredictionMode ? 'editable-score' : '';
    const isPredicted = subject.isPredicted ? 'predicted-score' : '';

    // Display predicted score or placeholder
    const displayScore = subject.diem_tk || (isPredictionMode ? 'Dự kiến' : '-');
    const displayScore4 = subject.diem_tk_so || (isPredictionMode && !subject.diem_tk ? 'Dự kiến' : '-');
    const displayScoreC = subject.diem_tk_chu || (isPredictionMode && !subject.diem_tk ? 'Dự kiến' : '-');

    // Result based on prediction
    let resultText = 'Chưa học';
    let resultClass = 'result-pending';

    if (subject.isPredicted && subject.diem_tk) {
        const score = parseFloat(subject.diem_tk);
        if (score >= 4.0) {
            resultText = 'Dự kiến đạt';
            resultClass = 'result-pass';
        } else {
            resultText = 'Dự kiến không đạt';
            resultClass = 'result-fail';
        }
    }

    row.innerHTML = `
        <td>${stt}</td>
        <td>${subject.ma_mon}</td>
        <td>${subject.ten_hoc_ky_ctdt || 'N/A'}</td>
        <td style="text-align: left; max-width: 200px;">${subject.ten_mon}</td>
        <td>${subject.so_tin_chi}</td>
        <td>-</td>
        <td class="${scoreClass} ${isPredicted}" data-subject-id="${subject.ma_mon}">${displayScore}</td>
        <td>${displayScore4}</td>
        <td>${displayScoreC}</td>
        <td class="${resultClass}">${resultText}</td>
        <td>-</td>
    `;

    // Add click event for prediction mode
    if (isPredictionMode) {
        const scoreCell = row.querySelector('.editable-score');
        if (scoreCell) {
            scoreCell.onclick = () => openPredictionModal(subject);
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

    if (scoresData && scoresData.data && scoresData.data.ds_diem_hocky) {
        scoresData.data.ds_diem_hocky.forEach(semester => {
            if (semester.ds_diem_mon_hoc) {
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
            }
        });
    }

    // Add predicted future subjects to GPA calculation
    if (ctdtData && ctdtData.data && ctdtData.data.ds_CTDT_hocky) {
        ctdtData.data.ds_CTDT_hocky.forEach(semester => {
            if (semester.ds_CTDT_mon_hoc) {
                semester.ds_CTDT_mon_hoc.forEach(subject => {
                    // Only count future subjects that have been predicted
                    if ((!subject.mon_da_hoc || subject.mon_da_hoc === '') &&
                        subject.isPredicted && subject.diem_tk) {
                        const credits = parseInt(subject.so_tin_chi || 0);
                        const score10 = parseFloat(subject.diem_tk);
                        const score4 = convertTo4Scale(score10);

                        totalCreditsForGPA += credits;
                        totalPoints10 += score10 * credits;
                        totalPoints4 += score4 * credits;

                        // Count as passed if >= 4.0
                        if (score10 >= 4.0) {
                            passedCredits += credits;
                        }
                    }
                });
            }
        });
    }

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

// Update future subjects statistics (all future subjects)
function updateFutureSubjectsStats() {
    const statsContainer = document.getElementById('semester-stats');

    if (!ctdtData || !ctdtData.data || !ctdtData.data.ds_CTDT_hocky) {
        statsContainer.innerHTML = '<div class="stat-item"><div class="stat-label">Không có dữ liệu CTĐT</div></div>';
        return;
    }

    // Collect all future subjects from all semesters
    let allFutureSubjects = [];

    ctdtData.data.ds_CTDT_hocky.forEach(semester => {
        if (semester.ds_CTDT_mon_hoc) {
            const futureSubjects = semester.ds_CTDT_mon_hoc.filter(subject => {
                return !subject.mon_da_hoc || subject.mon_da_hoc === '';
            });
            allFutureSubjects = allFutureSubjects.concat(futureSubjects);
        }
    });

    const predictedSubjects = allFutureSubjects.filter(subject => subject.isPredicted);
    const totalCredits = allFutureSubjects.reduce((sum, subject) => sum + parseInt(subject.so_tin_chi || 0), 0);

    // Calculate predicted GPA for future subjects only
    let futureGPA = 'N/A';
    if (predictedSubjects.length > 0) {
        let totalPoints = 0;
        let totalCreditsWithScores = 0;

        predictedSubjects.forEach(subject => {
            if (subject.diem_tk) {
                const credits = parseInt(subject.so_tin_chi || 0);
                const score = parseFloat(subject.diem_tk);
                totalPoints += score * credits;
                totalCreditsWithScores += credits;
            }
        });

        if (totalCreditsWithScores > 0) {
            futureGPA = (totalPoints / totalCreditsWithScores).toFixed(2);
        }
    }

    // Calculate combined GPA (studied + predicted future)
    let combinedGPA = calculateCombinedGPA();

    const stats = [
        { label: 'Tổng môn chưa học', value: allFutureSubjects.length },
        { label: 'Tổng tín chỉ chưa học', value: totalCredits },
        { label: 'Môn đã dự kiến', value: predictedSubjects.length },
        { label: 'GPA môn chưa học', value: futureGPA },
        { label: 'GPA tổng dự kiến', value: combinedGPA }
    ];

    statsContainer.innerHTML = stats.map(stat => `
        <div class="stat-item">
            <div class="stat-label">${stat.label}</div>
            <div class="stat-value">${stat.value}</div>
        </div>
    `).join('');
}

// Calculate combined GPA (studied subjects + predicted future subjects)
function calculateCombinedGPA() {
    let totalCreditsForGPA = 0;
    let totalPoints10 = 0;

    // Add points from studied subjects
    if (scoresData && scoresData.data && scoresData.data.ds_diem_hocky) {
        scoresData.data.ds_diem_hocky.forEach(semester => {
            if (semester.ds_diem_mon_hoc) {
                semester.ds_diem_mon_hoc.forEach(subject => {
                    if (subject.diem_tk && subject.khong_tinh_diem_tbtl === 0) {
                        const credits = parseInt(subject.so_tin_chi);
                        const score10 = parseFloat(subject.diem_tk);

                        totalCreditsForGPA += credits;
                        totalPoints10 += score10 * credits;
                    }
                });
            }
        });
    }

    // Add points from predicted future subjects
    if (ctdtData && ctdtData.data && ctdtData.data.ds_CTDT_hocky) {
        ctdtData.data.ds_CTDT_hocky.forEach(semester => {
            if (semester.ds_CTDT_mon_hoc) {
                semester.ds_CTDT_mon_hoc.forEach(subject => {
                    // Only count future subjects that have been predicted
                    if ((!subject.mon_da_hoc || subject.mon_da_hoc === '') &&
                        subject.isPredicted && subject.diem_tk) {
                        const credits = parseInt(subject.so_tin_chi || 0);
                        const score10 = parseFloat(subject.diem_tk);

                        totalCreditsForGPA += credits;
                        totalPoints10 += score10 * credits;
                    }
                });
            }
        });
    }

    return totalCreditsForGPA > 0 ? (totalPoints10 / totalCreditsForGPA).toFixed(2) : 'N/A';
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

    // Help guide button
    const helpBtn = document.getElementById('help-guide-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', () => {
            window.open('https://github.com/tain03/DuKienDiem/blob/main/HUONG-DAN-LAY-DU-LIEU.md', '_blank');
        });
    }

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
    // Scores import
    const importScoresBtn = document.getElementById('import-scores-btn');
    const scoresFileInput = document.getElementById('scores-file-input');
    const clearScoresBtn = document.getElementById('clear-scores-file');

    if (importScoresBtn && scoresFileInput) {
        importScoresBtn.addEventListener('click', () => {
            scoresFileInput.click();
        });

        scoresFileInput.addEventListener('change', (event) => handleFileImport(event, 'scores'));
    }

    if (clearScoresBtn) {
        clearScoresBtn.addEventListener('click', clearScoresFile);
    }

    // CTDT import
    const importCtdtBtn = document.getElementById('import-ctdt-btn');
    const ctdtFileInput = document.getElementById('ctdt-file-input');
    const clearCtdtBtn = document.getElementById('clear-ctdt-file');

    if (importCtdtBtn && ctdtFileInput) {
        importCtdtBtn.addEventListener('click', () => {
            ctdtFileInput.click();
        });

        ctdtFileInput.addEventListener('change', (event) => handleFileImport(event, 'ctdt'));
    }

    if (clearCtdtBtn) {
        clearCtdtBtn.addEventListener('click', clearCtdtFile);
    }

    // View mode buttons
    const studiedBtn = document.getElementById('studied-subjects-btn');
    const futureBtn = document.getElementById('future-subjects-btn');

    if (studiedBtn) {
        studiedBtn.addEventListener('click', () => switchViewMode('studied'));
    }

    if (futureBtn) {
        futureBtn.addEventListener('click', () => switchViewMode('future'));
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

        fileInput.addEventListener('change', (event) => handleFileImport(event, 'scores'));
    }
}

// Handle file import
function handleFileImport(event, type) {
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
        if (type === 'scores') {
            loadScoresFromFile(content, file.name);
        } else if (type === 'ctdt') {
            loadCtdtFromFile(content, file.name);
        }
    };

    reader.onerror = function() {
        showMessage('❌ Lỗi đọc file', 'error');
    };

    reader.readAsText(file);

    // Reset input
    event.target.value = '';
}

// Clear scores file
function clearScoresFile() {
    if (currentScoresFileName && currentScoresFileName.includes('mặc định')) {
        showMessage('⚠️ Đang sử dụng file mặc định', 'info');
        return;
    }

    if (confirm('Bạn có chắc muốn xóa file điểm hiện tại và quay về file mặc định?')) {
        currentScoresFileName = null;
        scoresData = null;
        originalScores = null;
        updateFileInfo();
        loadScoresData(); // Load default file
    }
}

// Clear CTDT file
function clearCtdtFile() {
    if (confirm('Bạn có chắc muốn xóa file CTĐT hiện tại?')) {
        currentCtdtFileName = null;
        ctdtData = null;
        originalCtdt = null;
        document.getElementById('view-mode-tabs').style.display = 'none';
        currentViewMode = 'studied';
        updateFileInfo();

        // Refresh current view
        if (currentSemester) {
            showSemester(currentSemester);
        }

        showMessage('✅ Đã xóa file CTĐT', 'success');
    }
}

// Initialize app when page loads
document.addEventListener('DOMContentLoaded', loadScoresData);
