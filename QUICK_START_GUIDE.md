# 🚀 Quick Setup & Testing Guide

## Prerequisites

✅ Backend running on port 5000
✅ Frontend running on port 5173 (Vite)
✅ MongoDB connected
✅ User logged in as Examiner

---

## 🔧 Installation Steps

### 1. Verify Backend Setup

The following files have been created/modified:

```
backend/
├── controllers/
│   └── resultController.js ✅ CREATED
├── routes/
│   └── resultRoutes.js ✅ CREATED
└── server.js ✅ MODIFIED (added result routes)
```

### 2. Verify Frontend Setup

The following files have been created/modified:

```
frontend/src/
├── utils/
│   └── reportUtils.js ✅ CREATED
├── pages/examiner/
│   ├── QuizResultsDashboard.jsx ✅ CREATED
│   ├── QuizResultsDashboard.css ✅ CREATED
│   ├── StudentResults.jsx ✅ CREATED
│   ├── StudentResults.css ✅ CREATED
│   ├── StudentDetailedReport.jsx ✅ CREATED
│   ├── StudentDetailedReport.css ✅ CREATED
│   └── ViewResults.jsx ✅ MODIFIED (now uses QuizResultsDashboard)
```

---

## 🧪 Testing Workflow

### Step 1: Start the Application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Step 2: Login as Examiner

1. Open http://localhost:5173
2. Login with examiner credentials
3. Navigate to "View Results" or "Results Dashboard"

### Step 3: Test Level 1 - Quiz Results Dashboard

**Expected Behavior:**
- ✅ See all quizzes created by current examiner
- ✅ Display quiz statistics (students, attempts, scores)
- ✅ Search by quiz name
- ✅ Filter by quiz type (Public/Private)
- ✅ Sort by multiple options
- ✅ Export to CSV works
- ✅ Print displays formatted output
- ✅ "View Results" button navigates to Level 2

**Test Data Check:**
```
Summary Cards should show:
- Total Quizzes: [number of your quizzes]
- Total Students: [sum of all students]
- Total Attempts: [sum of all attempts]
- Avg Score: [calculated average]
```

### Step 4: Test Level 2 - Student Results

1. Click "View Results" on any quiz

**Expected Behavior:**
- ✅ See all students who attempted this quiz
- ✅ Shows: Name, Email, Scores, Attempts, Date
- ✅ Search by name or email works
- ✅ Sort options work correctly
- ✅ Export to CSV includes all student data
- ✅ "Details" button navigates to Level 3

### Step 5: Test Level 3 - Student Detailed Report

1. Click "Details" on any student

**Expected Behavior:**
- ✅ Shows complete student information
- ✅ Displays quiz details
- ✅ Shows performance statistics
- ✅ Lists all attempts (or just latest if oneAttemptOnly is true)
- ✅ Expandable attempt details
- ✅ Question responses with correct/incorrect indicators
- ✅ Export and Print buttons work
- ✅ Back button returns to Level 2

---

## 📋 Test Scenarios

### Scenario 1: Quiz with One Attempt Only

1. Create a quiz with "One Attempt Only" enabled
2. Have a student attempt it once
3. View results → Should show only 1 attempt
4. Export should include only that attempt

### Scenario 2: Quiz with Multiple Attempts

1. Create a regular quiz
2. Have a student attempt it 3-4 times
3. View results → Should show all attempts in history
4. Each attempt should have different scores

### Scenario 3: Public vs Private Quizzes

1. Create one public and one private quiz
2. Filter by "Private" → only private quiz shows
3. Filter by "Public" → only public quiz shows
4. "All Types" → both show

### Scenario 4: Export Functionality

1. At Level 1: Export all quizzes → CSV file downloads
2. At Level 2: Export student results → CSV with all students
3. At Level 3: Export report → CSV with detailed attempt data

### Scenario 5: Search & Sort

1. Search for partial quiz name → filters correctly
2. Sort by "Quiz Name" → alphabetical order
3. Sort by "Average Score" → highest/lowest first
4. Sort direction toggle works

---

## 🐛 Debugging Tips

### API Calls Not Working?

Check browser console (F12):
```
1. Look for error messages
2. Check Network tab for failed requests
3. Verify token is in Authorization header
4. Check backend logs for errors
```

### No Data Showing?

```
1. Ensure user is logged in as examiner
2. Verify quizzes exist and have the current user as examinerId
3. Check if students have attempted any quizzes
4. Look at browser console for API errors
```

### Styling Issues?

```
1. Check if CSS files are imported correctly
2. Verify CSS classes match in JSX
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check responsive design on mobile
```

### CSV Export Not Working?

```
1. Check popup blocker is disabled
2. Verify browser allows downloads
3. Check browser console for errors
4. Try different browser if issue persists
```

---

## 📊 Sample Data Verification

After creating test data, you should see:

**Level 1 Dashboard:**
```
Quiz 1: 45 students, 120 attempts, 75.5% avg score
Quiz 2: 30 students, 60 attempts, 82.3% avg score
```

**Level 2 Student List:**
```
John Doe | john@email.com | 85 (latest) | 95 (highest) | 3 (attempts)
Jane Smith | jane@email.com | 78 (latest) | 90 (highest) | 2 (attempts)
```

**Level 3 Report:**
```
Student: John Doe
Quiz: Quiz 1
Statistics:
  - Total Attempts: 3
  - Highest: 95
  - Average: 85.67
  - Status: PASS ✓

Attempt History:
  #1: 85 (85%) - Jan 15, 2024 10:30 AM
  #2: 90 (90%) - Jan 16, 2024 02:15 PM
  #3: 82 (82%) - Jan 17, 2024 03:45 PM
```

---

## ✅ Final Verification Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads without console errors
- [ ] Can login as examiner
- [ ] Level 1 dashboard displays quizzes
- [ ] Can search and filter quizzes
- [ ] Can export to CSV from Level 1
- [ ] Can print Level 1 dashboard
- [ ] Level 2 shows correct students
- [ ] Can search students by name/email
- [ ] Can export student results to CSV
- [ ] Can print Level 2 table
- [ ] Level 3 displays complete report
- [ ] Can expand attempt details
- [ ] Can export and print Level 3 report
- [ ] Navigation between levels works smoothly
- [ ] Responsive design works on mobile
- [ ] All buttons are functional

---

## 🎯 What to Test Next

1. **Integration with other modules**
   - Verify results update when new attempts are submitted
   - Check if quiz creation affects statistics
   - Test student deletion (if implemented)

2. **Edge cases**
   - Quiz with 0 attempts
   - Student with all failed attempts
   - Very large result sets (performance)

3. **Performance**
   - Load time with 1000+ students
   - Export performance with large datasets
   - Print performance

4. **Cross-browser testing**
   - Chrome, Firefox, Safari, Edge
   - Mobile browsers (iOS Safari, Android Chrome)

---

## 📞 Common Test Errors & Solutions

**Error: "Cannot GET /api/results/quizzes"**
- Solution: Make sure result routes are added to server.js ✅ Done

**Error: "Quiz not found or not owned by you"**
- Solution: Verify you're viewing quizzes you created

**Error: "Access Denied"**
- Solution: Make sure you're logged in as examiner

**Error: CSV file not downloading**
- Solution: Check popup blocker and browser download settings

---

## 🎉 You're All Set!

The three-level dashboard is fully implemented and ready to test. Start with the testing workflow above and verify each level works correctly.

Good luck! 🚀
