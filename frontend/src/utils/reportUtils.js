// Utility functions for export and print functionality

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  })}`;
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString();
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const exportToCSV = (filename, headers, rows) => {
  const csv = [headers.join(",")];

  rows.forEach((row) => {
    csv.push(
      headers
        .map((header) => {
          const value = row[header];
          return `"${value !== undefined && value !== null ? String(value).replace(/"/g, '""') : ""}"`;
        })
        .join(",")
    );
  });

  const blob = new Blob([csv.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportQuizzesToCSV = (quizzes, filename = "quiz-results.csv") => {
  const headers = [
    "Quiz Name",
    "Quiz Type",
    "Total Students",
    "Total Attempts",
    "Average Score",
    "Highest Score",
    "Lowest Score"
  ];

  const rows = quizzes.map((quiz) => ({
    "Quiz Name": quiz.title,
    "Quiz Type": quiz.isPrivate ? "Private" : "Public",
    "Total Students": quiz.totalStudents,
    "Total Attempts": quiz.totalAttempts,
    "Average Score": quiz.averageScore.toFixed(2),
    "Highest Score": quiz.highestScore,
    "Lowest Score": quiz.lowestScore
  }));

  exportToCSV(filename, headers, rows);
};

export const exportStudentsToCSV = (students, quizTitle, filename = "student-results.csv") => {
  const headers = [
    "Student Name",
    "Student Email",
    "Latest Score",
    "Highest Score",
    "Lowest Score",
    "Average Score",
    "Attempts",
    "Latest Attempt Date"
  ];

  const rows = students.map((student) => ({
    "Student Name": student.studentName,
    "Student Email": student.studentEmail,
    "Latest Score": student.latestScore,
    "Highest Score": student.highestScore,
    "Lowest Score": student.lowestScore,
    "Average Score": student.averageScore.toFixed(2),
    "Attempts": student.totalAttempts,
    "Latest Attempt Date": formatDateTime(student.latestAttemptDate)
  }));

  exportToCSV(filename, headers, rows);
};

export const exportReportToCSV = (report, filename = "student-report.csv") => {
  const { studentInfo, quizInfo, statistics, attempts } = report;

  const rows = [];

  // Student and Quiz Info
  rows.push(["Student Information"]);
  rows.push(["Name", studentInfo.name]);
  rows.push(["Email", studentInfo.email]);
  rows.push([]);

  rows.push(["Quiz Information"]);
  rows.push(["Quiz Name", quizInfo.title]);
  rows.push(["Examiner Name", quizInfo.examinerName]);
  rows.push(["Quiz Type", quizInfo.isPrivate ? "Private" : "Public"]);
  rows.push(["Quiz Code", quizInfo.quizCode]);
  rows.push(["Time Limit", `${quizInfo.timeLimit} minutes`]);
  rows.push([]);

  rows.push(["Statistics"]);
  rows.push(["Total Attempts", statistics.totalAttempts]);
  rows.push(["Highest Score", statistics.highestScore]);
  rows.push(["Lowest Score", statistics.lowestScore]);
  rows.push(["Latest Score", statistics.latestScore]);
  rows.push(["Average Score", statistics.averageScore.toFixed(2)]);
  rows.push(["Latest Percentage", `${statistics.latestPercentage.toFixed(2)}%`]);
  rows.push(["Pass Count", statistics.passCount]);
  rows.push(["Fail Count", statistics.failCount]);
  rows.push([]);

  rows.push(["Attempt History"]);
  rows.push(["Attempt #", "Score", "Percentage", "Date", "Time"]);

  attempts.forEach((attempt, index) => {
    rows.push([
      index + 1,
      attempt.score,
      `${attempt.percentage.toFixed(2)}%`,
      formatDate(attempt.createdAt),
      formatTime(attempt.createdAt)
    ]);
  });

  const blob = new Blob(
    [rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")],
    { type: "text/csv;charset=utf-8;" }
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generatePrintHTML = (title, content) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: Arial, sans-serif;
          padding: 20px;
          color: #333;
          background: white;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 2px solid #007bff;
          padding-bottom: 15px;
        }
        .header h1 {
          color: #007bff;
          font-size: 24px;
          margin-bottom: 5px;
        }
        .header p {
          font-size: 12px;
          color: #666;
        }
        .section {
          margin-bottom: 25px;
          page-break-inside: avoid;
        }
        .section-title {
          background: #f0f0f0;
          padding: 10px 15px;
          font-weight: bold;
          font-size: 14px;
          margin-bottom: 10px;
          border-left: 4px solid #007bff;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 10px;
          border-bottom: 1px solid #eee;
          font-size: 13px;
        }
        .info-row label {
          font-weight: bold;
          width: 40%;
        }
        .info-row value {
          width: 60%;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          font-size: 12px;
        }
        th {
          background: #007bff;
          color: white;
          padding: 10px;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 8px 10px;
          border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background: #f9f9f9;
        }
        .footer {
          margin-top: 40px;
          text-align: center;
          font-size: 11px;
          color: #999;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        .highlight {
          background: #fff3cd;
          padding: 2px 6px;
          border-radius: 3px;
        }
        @media print {
          body {
            margin: 0;
            padding: 10mm;
          }
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      ${content}
      <div class="footer">
        <p>Generated on ${new Date().toLocaleString()} | Online Quiz Management System</p>
      </div>
    </body>
    </html>
  `;
};

export const printContent = (title, htmlContent) => {
  const printWindow = window.open("", "PrintWindow", "width=1000,height=700");
  if (!printWindow) {
    alert("Please disable your popup blocker to print");
    return;
  }

  const fullHTML = generatePrintHTML(title, htmlContent);

  printWindow.document.write(fullHTML);
  printWindow.document.close();
  printWindow.focus();

  setTimeout(() => {
    printWindow.print();
  }, 250);
};

export const generateReportHTML = (report) => {
  const { studentInfo, quizInfo, statistics, attempts } = report;

  const attemptsHTML = attempts
    .map(
      (attempt, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${attempt.score}</td>
      <td>${attempt.percentage.toFixed(2)}%</td>
      <td>${formatDate(attempt.createdAt)}</td>
      <td>${formatTime(attempt.createdAt)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <div class="header">
      <h1>Student Detailed Report</h1>
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>

    <div class="section">
      <div class="section-title">Student Information</div>
      <div class="info-row"><label>Name:</label> <value>${studentInfo.name}</value></div>
      <div class="info-row"><label>Email:</label> <value>${studentInfo.email}</value></div>
    </div>

    <div class="section">
      <div class="section-title">Quiz Information</div>
      <div class="info-row"><label>Quiz Name:</label> <value>${quizInfo.title}</value></div>
      <div class="info-row"><label>Examiner Name:</label> <value>${quizInfo.examinerName}</value></div>
      <div class="info-row"><label>Quiz Type:</label> <value>${quizInfo.isPrivate ? "Private" : "Public"}</value></div>
      <div class="info-row"><label>Quiz Code:</label> <value>${quizInfo.quizCode || "N/A"}</value></div>
      <div class="info-row"><label>Time Limit:</label> <value>${quizInfo.timeLimit} minutes</value></div>
    </div>

    <div class="section">
      <div class="section-title">Statistics</div>
      <div class="info-row"><label>Total Attempts:</label> <value>${statistics.totalAttempts}</value></div>
      <div class="info-row"><label>Highest Score:</label> <value>${statistics.highestScore}</value></div>
      <div class="info-row"><label>Lowest Score:</label> <value>${statistics.lowestScore}</value></div>
      <div class="info-row"><label>Latest Score:</label> <value>${statistics.latestScore}</value></div>
      <div class="info-row"><label>Average Score:</label> <value>${statistics.averageScore.toFixed(2)}</value></div>
      <div class="info-row"><label>Latest Percentage:</label> <value><span class="highlight">${statistics.latestPercentage.toFixed(2)}%</span></value></div>
      <div class="info-row"><label>Status:</label> <value><span class="highlight">${statistics.isPass ? "PASS" : "FAIL"}</span></value></div>
      <div class="info-row"><label>Pass Count:</label> <value>${statistics.passCount}</value></div>
      <div class="info-row"><label>Fail Count:</label> <value>${statistics.failCount}</value></div>
    </div>

    <div class="section">
      <div class="section-title">Attempt History</div>
      <table>
        <thead>
          <tr>
            <th>Attempt #</th>
            <th>Score</th>
            <th>Percentage</th>
            <th>Date</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          ${attemptsHTML}
        </tbody>
      </table>
    </div>
  `;
};
