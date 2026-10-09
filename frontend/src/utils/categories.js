export const CATEGORIES = [
    {
        id: "Programming",
        name: "Programming",
        icon: "💻",
        description: "Java, Python, C++, Web Development, Algorithms & Data Structures",
        color: "#2858dd"
    },
    {
        id: "Computer Science",
        name: "Computer Science",
        icon: "🖥️",
        description: "Operating Systems, DBMS, Computer Networks & Architecture",
        color: "#0ea5e9"
    },
    {
        id: "Engineering",
        name: "Engineering",
        icon: "⚙️",
        description: "Mechanical, Electrical, Civil, Electronics & Core Engineering",
        color: "#8b5cf6"
    },
    {
        id: "Medical",
        name: "Medical",
        icon: "🩺",
        description: "Biology, Anatomy, Pharmacology, NEET & Clinical Concepts",
        color: "#ec4899"
    },
    {
        id: "Mathematics",
        name: "Mathematics",
        icon: "📐",
        description: "Algebra, Calculus, Statistics, Geometry & Discrete Math",
        color: "#f59e0b"
    },
    {
        id: "Science",
        name: "Science",
        icon: "🔬",
        description: "Physics, Chemistry, Environmental Science & General Science",
        color: "#10b981"
    },
    {
        id: "Aptitude",
        name: "Aptitude",
        icon: "📊",
        description: "Quantitative Aptitude, Numerical Ability & Data Interpretation",
        color: "#3b82f6"
    },
    {
        id: "Reasoning",
        name: "Reasoning",
        icon: "🧩",
        description: "Logical Reasoning, Analytical Ability, Puzzles & Critical Thinking",
        color: "#6366f1"
    },
    {
        id: "Language",
        name: "Language",
        icon: "📚",
        description: "English Grammar, Vocabulary, Reading Comprehension & Foreign Languages",
        color: "#14b8a6"
    },
    {
        id: "General Knowledge",
        name: "General Knowledge",
        icon: "🌍",
        description: "Current Affairs, History, Geography, Politics & World Knowledge",
        color: "#f97316"
    },
    {
        id: "Government Exams",
        name: "Government Exams",
        icon: "🏛️",
        description: "UPSC, SSC, Banking, Railways & State Civil Services",
        color: "#ef4444"
    },
    {
        id: "Placement",
        name: "Placement",
        icon: "💼",
        description: "Campus Recruitment, Technical Interviews, Soft Skills & HR Preparation",
        color: "#84cc16"
    },
    {
        id: "School",
        name: "School",
        icon: "🎒",
        description: "K-12 Syllabus, Board Exams, Olympiads & Foundation Subjects",
        color: "#06b6d4"
    },
    {
        id: "College",
        name: "College",
        icon: "🎓",
        description: "University Semester Exams, Major Electives & Degree Foundations",
        color: "#a855f7"
    },
    {
        id: "Others",
        name: "Others",
        icon: "✨",
        description: "Miscellaneous Skills, Trivia, Hobbies & Specialized Topics",
        color: "#64748b"
    }
];

export const CATEGORY_NAMES = CATEGORIES.map(c => c.name);

export const getCategoryIcon = (categoryName) => {
    const found = CATEGORIES.find(
        c => c.name.toLowerCase() === (categoryName || "").toLowerCase()
    );
    return found ? found.icon : "📝";
};
