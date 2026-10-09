# 📚 Results Dashboard API Reference

## Base URL
```
http://localhost:5000/api/results
```

## Authentication
All endpoints require:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

Token is automatically added from localStorage by the `apiFetch` utility.

---

## API Endpoints

### 1️⃣ GET /quizzes
**Level 1 - Fetch all quizzes for examiner**

#### Request
```
GET /api/results/quizzes
```

#### Headers
```
Authorization: Bearer {token}
```

#### Response (200 OK)
```json
{
  "message": "Quizzes fetched successfully",
  "quizzes": [
    {
      "_id": "60d5ec49c1234567890abcde",
      "title": "JavaScript Fundamentals",
      "isPrivate": false,
      "totalStudents": 45,
      "totalAttempts": 120,
      "averageScore": 75.50,
      "highestScore": 95,
      "lowestScore": 30,
      "timeLimit": 60,
      "quizCode": "JS001",
      "oneAttemptOnly": false,
      "isPublished": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-20T15:45:00.000Z",
      "attempts": [...]  // Full attempt array for internal calculation
    }
  ]
}
```

#### Error Responses

**401 Unauthorized**
```json
{
  "message": "Access Denied"
}
```

**403 Forbidden**
```json
{
  "message": "Forbidden"
}
```

#### Query Parameters
None

#### Notes
- Only returns quizzes where `examinerId` matches authenticated user
- Automatically calculates statistics from attempts
- Sorted by creation date (newest first)

---

### 2️⃣ GET /quiz/:quizId/students
**Level 2 - Fetch all students who attempted a specific quiz**

#### Request
```
GET /api/results/quiz/60d5ec49c1234567890abcde/students
```

#### Path Parameters
- `quizId` (required): MongoDB ObjectId of the quiz

#### Headers
```
Authorization: Bearer {token}
```

#### Response (200 OK)
```json
{
  "message": "Students fetched successfully",
  "students": [
    {
      "_id": "60d5ec49c1234567890xyz01",
      "studentName": "John Doe",
      "studentEmail": "john.doe@example.com",
      "totalAttempts": 3,
      "highestScore": 85,
      "lowestScore": 60,
      "averageScore": 75.67,
      "latestScore": 82,
      "latestAttemptDate": "2024-01-20T14:30:00.000Z",
      "attempts": [
        {
          "_id": "attempt_id_1",
          "score": 80,
          "percentage": 80,
          "createdAt": "2024-01-15T10:00:00.000Z"
        },
        {
          "_id": "attempt_id_2",
          "score": 82,
          "percentage": 82,
          "createdAt": "2024-01-18T14:30:00.000Z"
        },
        {
          "_id": "attempt_id_3",
          "score": 85,
          "percentage": 85,
          "createdAt": "2024-01-20T14:30:00.000Z"
        }
      ]
    }
  ]
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "message": "Unauthorized: Quiz not found or not owned by you"
}
```

**404 Not Found**
```json
{
  "message": "Error fetching students",
  "error": "Cast to ObjectId failed for value..."
}
```

#### Notes
- Verifies quiz ownership before returning data
- Groups attempts by student
- Sorted by latest attempt date (newest first)
- Includes all attempts for each student

---

### 3️⃣ GET /quiz/:quizId/student/:studentId/attempts
**Level 3 - Fetch attempt history for a student on a specific quiz**

#### Request
```
GET /api/results/quiz/60d5ec49c1234567890abcde/student/60d5ec49c1234567890xyz01/attempts
```

#### Path Parameters
- `quizId` (required): MongoDB ObjectId of the quiz
- `studentId` (required): MongoDB ObjectId of the student

#### Headers
```
Authorization: Bearer {token}
```

#### Response (200 OK)
```json
{
  "message": "Attempt history fetched successfully",
  "quiz": {
    "id": "60d5ec49c1234567890abcde",
    "title": "JavaScript Fundamentals",
    "examinerName": "Dr. Smith",
    "timeLimit": 60,
    "quizCode": "JS001",
    "isPrivate": false,
    "oneAttemptOnly": false
  },
  "student": {
    "id": "60d5ec49c1234567890xyz01",
    "name": "John Doe",
    "email": "john.doe@example.com"
  },
  "statistics": {
    "totalAttempts": 3,
    "highestScore": 85,
    "lowestScore": 60,
    "latestScore": 82,
    "averageScore": 75.67,
    "latestPercentage": 82.00,
    "passCount": 2,
    "failCount": 1
  },
  "attempts": [
    {
      "_id": "attempt_id_3",
      "score": 82,
      "percentage": 82,
      "totalMarks": 100,
      "createdAt": "2024-01-20T14:30:00.000Z"
    },
    {
      "_id": "attempt_id_2",
      "score": 80,
      "percentage": 80,
      "totalMarks": 100,
      "createdAt": "2024-01-18T09:15:00.000Z"
    },
    {
      "_id": "attempt_id_1",
      "score": 60,
      "percentage": 60,
      "totalMarks": 100,
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "message": "Unauthorized: Quiz not found or not owned by you"
}
```

**404 Not Found**
```json
{
  "message": "Student not found"
}
```

#### Notes
- Respects `oneAttemptOnly` setting
- If enabled: returns only latest attempt
- If disabled: returns complete history
- Sorted by date (newest first)
- Pass defined as percentage >= 50

---

### 4️⃣ GET /quiz/:quizId/student/:studentId/report
**Level 3 - Fetch complete detailed report for a student**

#### Request
```
GET /api/results/quiz/60d5ec49c1234567890abcde/student/60d5ec49c1234567890xyz01/report
```

#### Path Parameters
- `quizId` (required): MongoDB ObjectId of the quiz
- `studentId` (required): MongoDB ObjectId of the student

#### Headers
```
Authorization: Bearer {token}
```

#### Response (200 OK)
```json
{
  "message": "Detailed report fetched successfully",
  "report": {
    "studentInfo": {
      "name": "John Doe",
      "email": "john.doe@example.com"
    },
    "quizInfo": {
      "title": "JavaScript Fundamentals",
      "examinerName": "Dr. Smith",
      "isPrivate": false,
      "timeLimit": 60,
      "quizCode": "JS001"
    },
    "statistics": {
      "totalAttempts": 3,
      "highestScore": 85,
      "lowestScore": 60,
      "latestScore": 82,
      "averageScore": 75.67,
      "latestPercentage": 82.00,
      "isPass": true,
      "passCount": 2,
      "failCount": 1
    },
    "attempts": [
      {
        "_id": "attempt_id_1",
        "score": 82,
        "percentage": 82,
        "totalMarks": 100,
        "createdAt": "2024-01-20T14:30:00.000Z",
        "answers": [
          {
            "questionId": {
              "_id": "q_id_1",
              "question": "What is a closure?",
              "correctAnswer": "A function that returns another function",
              "marks": 1
            },
            "selectedAnswer": "A function that returns another function",
            "isCorrect": true
          },
          {
            "questionId": {
              "_id": "q_id_2",
              "question": "What is the purpose of async/await?",
              "correctAnswer": "To handle asynchronous operations",
              "marks": 1
            },
            "selectedAnswer": "To handle synchronous operations",
            "isCorrect": false
          }
        ]
      }
    ]
  }
}
```

#### Error Responses

**403 Forbidden**
```json
{
  "message": "Unauthorized"
}
```

**404 Not Found**
```json
{
  "message": "Student not found"
}
```

#### Notes
- Includes full question details with attempts
- Respects `oneAttemptOnly` setting
- Contains answer details for each question
- Used for detailed report generation
- Includes pass/fail determination logic

---

## Response Format

### Success Response
```json
{
  "message": "Action completed successfully",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error description",
  "error": "Detailed error (if available)"
}
```

---

## Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK - Request successful | Data returned successfully |
| 400 | Bad Request | Invalid query parameters |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | User lacks permission |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Database connection failed |

---

## Data Types

### Quiz Object
```javascript
{
  _id: ObjectId,           // MongoDB document ID
  title: String,           // Quiz name
  examinerId: ObjectId,    // Reference to examiner
  examinerName: String,    // Name of examiner
  timeLimit: Number,       // Minutes
  quizCode: String,        // Unique code for private quizzes
  isPrivate: Boolean,      // Public/Private flag
  isPublished: Boolean,    // Published status
  oneAttemptOnly: Boolean, // Attempt restriction
  createdAt: Date,         // Creation timestamp
  updatedAt: Date          // Last update timestamp
}
```

### Student Object
```javascript
{
  _id: ObjectId,           // MongoDB document ID
  studentName: String,     // Student full name
  studentEmail: String,    // Student email
  totalAttempts: Number,   // Count of attempts
  highestScore: Number,    // Maximum score
  lowestScore: Number,     // Minimum score
  averageScore: Number,    // Mean score
  latestScore: Number,     // Most recent score
  latestAttemptDate: Date  // Date of last attempt
}
```

### Attempt Object
```javascript
{
  _id: ObjectId,       // MongoDB document ID
  score: Number,       // Points earned
  percentage: Number,  // Percentage (0-100)
  totalMarks: Number,  // Total possible marks
  createdAt: Date,     // Attempt timestamp
  answers: [
    {
      questionId: Object,      // Question details
      selectedAnswer: String,  // Student's choice
      isCorrect: Boolean       // Correctness
    }
  ]
}
```

### Statistics Object
```javascript
{
  totalAttempts: Number,    // Count
  highestScore: Number,     // Max
  lowestScore: Number,      // Min
  latestScore: Number,      // Most recent
  averageScore: Number,     // Mean
  latestPercentage: Number, // Latest as percentage
  passCount: Number,        // Attempts with >= 50%
  failCount: Number         // Attempts with < 50%
}
```

---

## Example Workflows

### Workflow 1: View All Results
```bash
GET /api/results/quizzes
→ Shows all examiner's quizzes with statistics
```

### Workflow 2: Drill into Specific Quiz
```bash
GET /api/results/quiz/{quizId}/students
→ Shows all students for that quiz
```

### Workflow 3: View Student Report
```bash
GET /api/results/quiz/{quizId}/student/{studentId}/report
→ Shows complete detailed report
```

---

## Pagination
Currently NOT implemented. All data is returned in one response.

**Future Enhancement**: Add pagination support with `limit` and `skip` parameters.

---

## Sorting
Sorting is handled by the aggregation pipeline in MongoDB:
- Quizzes: sorted by `createdAt` (newest first)
- Students: sorted by `latestAttemptDate` (newest first)
- Attempts: sorted by `createdAt` (newest first)

Client-side sorting options available in UI for additional flexibility.

---

## Filtering
Currently NOT implemented in API. Filtering happens on the frontend using React state.

**Future Enhancement**: Add backend filtering for:
- Quiz type (public/private)
- Date range filters
- Score range filters
- Pass/fail status

---

## Performance Notes

- **Quiz aggregation**: O(n) where n = number of attempts for that quiz
- **Student grouping**: O(n log n) with sort
- **No pagination**: May slow down with 10,000+ records

**Optimization Tips**:
- Add indexes on `quizId` and `aspirantId` in Attempt collection
- Implement pagination for large datasets
- Consider caching quiz statistics

---

## Rate Limiting
Not implemented. Consider adding in production:
- 100 requests per minute per user
- 1000 requests per hour per IP

---

## CORS
Configured in backend to allow frontend requests.

---

## Webhook Support
Not implemented. Consider for future:
- New attempt notifications
- Quota exceeded warnings
- System health checks

---

## Versioning
Current version: **v1** (implicit)

No API versioning headers currently implemented.

---

## Documentation Generated
Date: 2024
Framework: Express.js + MongoDB Aggregation
Frontend: React with Vite
