const resumeForm = document.getElementById("resumeForm");
const resumeInput = document.getElementById("resumeFile");
const browseBtn = document.getElementById("browseBtn");
const uploadArea = document.getElementById("uploadArea");
const fileInfo = document.getElementById("fileInfo");
const errorMessage = document.getElementById("errorMessage");
const analyzeBtn = document.getElementById("analyzeBtn");

let selectedFile = null;
let latestReport = null;

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const jobSkills = {

    "Python Developer": [
        "python", "flask", "django", "sql",
        "git", "oops", "api", "problem solving"
    ],

    "Java Developer": [
        "java", "oops", "spring", "sql",
        "dsa", "git", "problem solving"
    ],

    "Frontend Developer": [
        "html", "css", "javascript", "react",
        "responsive design", "git", "ui"
    ],

    "Full Stack Developer": [
        "html", "css", "javascript", "react",
        "node.js", "sql", "mongodb", "api", "git"
    ],

    "Data Analyst": [
        "python", "sql", "excel", "data analysis",
        "statistics", "power bi", "visualization"
    ],

    "AI/ML Engineer": [
        "python", "machine learning",
        "deep learning", "artificial intelligence",
        "data science", "tensorflow", "pandas", "numpy"
    ]

};

const allSkills = [
    "python", "java", "javascript", "html", "css",
    "c++", "c", "react", "node.js", "sql", "mysql",
    "mongodb", "flask", "django", "machine learning",
    "deep learning", "artificial intelligence",
    "data science", "data analysis", "excel",
    "git", "github", "communication", "leadership",
    "problem solving", "teamwork", "oops", "dsa",
    "computer networks", "operating systems", "dbms",
    "aws", "tensorflow", "pandas", "numpy",
    "power bi", "statistics", "spring",
    "responsive design", "api", "ui"
];

const sections = {
    "Education": ["education", "qualification", "academic"],
    "Experience": ["experience", "internship", "employment"],
    "Projects": ["projects", "project"],
    "Skills": ["skills", "technical skills"],
    "Certifications": ["certification", "certifications", "courses"]
};

// Select PDF

browseBtn.addEventListener("click", () => {
    resumeInput.click();
});

resumeInput.addEventListener("change", () => {
    const file = resumeInput.files[0];

    if (file) {
        validateFile(file);
    }
});

// Drag and drop

uploadArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    uploadArea.classList.add("drag-over");
});

uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over");
});

uploadArea.addEventListener("drop", (event) => {
    event.preventDefault();
    uploadArea.classList.remove("drag-over");

    const file = event.dataTransfer.files[0];

    if (file) {
        validateFile(file);
    }
});

function validateFile(file) {

    errorMessage.textContent = "";
    selectedFile = null;
    resumeInput.value = "";

    if (!file.name.toLowerCase().endsWith(".pdf")) {
        showError("Please upload a PDF resume only.");
        fileInfo.textContent = "PDF only · Maximum 5 MB";
        return;
    }

    if (file.size > MAX_FILE_SIZE) {
        showError("File size must be less than 5 MB.");
        return;
    }

    if (file.size === 0) {
        showError("The selected file is empty.");
        return;
    }

    selectedFile = file;
    fileInfo.textContent = "✓ Selected: " + file.name;
}

// Error

function showError(message) {
    errorMessage.textContent = message;
}

// Extract PDF Text

async function extractPDFText(file) {

    if (typeof pdfjsLib === "undefined") {
        throw new Error("PDF library failed to load. Check your internet connection.");
    }

    const buffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data: new Uint8Array(buffer)
    }).promise;

    let fullText = "";

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

        const page = await pdf.getPage(pageNumber);

        const content = await page.getTextContent();

        const pageText = content.items
            .map(item => item.str)
            .join(" ");

        fullText += pageText + " ";
    }

    return fullText.trim();
}

// Safe word matching

function containsKeyword(text, keyword) {

    const escaped = keyword.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    const pattern = new RegExp(
        "(^|[^a-z0-9])" + escaped + "(?=$|[^a-z0-9])",
        "i"
    );

    return pattern.test(text);
}

// Main Analysis

function analyzeResume(text, jobRole) {

    const resume = text.toLowerCase();

    // Detect skills

    const detectedSkills = allSkills.filter(skill =>
        containsKeyword(resume, skill)
    );

    // Match skills

    const requiredSkills = jobSkills[jobRole];

    const matchedSkills = requiredSkills.filter(skill =>
        detectedSkills.includes(skill)
    );

    const missingSkills = requiredSkills.filter(skill =>
        !detectedSkills.includes(skill)
    );

    // Detect sections

    const foundSections = [];

    Object.entries(sections).forEach(([section, keywords]) => {

        const found = keywords.some(keyword =>
            containsKeyword(resume, keyword)
        );

        if (found) {
            foundSections.push(section);
        }

    });

    const missingSections = Object.keys(sections).filter(
        section => !foundSections.includes(section)
    );

    // ATS Score

    const skillScore = Math.round(
        (matchedSkills.length / requiredSkills.length) * 60
    );

    const sectionScore = Math.round(
        (foundSections.length / Object.keys(sections).length) * 25
    );

    const wordCount = resume.split(/\s+/).filter(Boolean).length;

    let lengthScore = 5;

    if (wordCount >= 80) {
        lengthScore = 10;
    }

    if (wordCount >= 150) {
        lengthScore = 15;
    }

    const atsScore = Math.min(
        100,
        skillScore + sectionScore + lengthScore
    );

    // Suggestions

    const suggestions = [];

    if (missingSkills.length > 0) {
        suggestions.push(
            "Consider developing these job-related skills: " +
            missingSkills.join(", ")
        );
    }

    if (missingSections.length > 0) {
        suggestions.push(
            "Add these sections if relevant: " +
            missingSections.join(", ")
        );
    }

    if (wordCount < 150) {
        suggestions.push(
            "Your resume contains limited text. Add relevant projects, achievements and experience."
        );
    }

    if (!containsKeyword(resume, "project")) {
        suggestions.push(
            "Add practical projects to demonstrate your technical abilities."
        );
    }

    if (!containsKeyword(resume, "email")) {
        suggestions.push(
            "Make sure your contact information is clearly mentioned."
        );
    }

    if (suggestions.length === 0) {
        suggestions.push(
            "Good job! Continue improving your experience and project descriptions."
        );
    }

    return {
        atsScore,
        detectedSkills,
        matchedSkills,
        missingSkills,
        foundSections,
        missingSections,
        suggestions,
        wordCount,
        jobRole
    };

}

// Display skills safely

function displaySkills(containerId, skills, missing = false) {

    const container = document.getElementById(containerId);

    container.replaceChildren();

    if (skills.length === 0) {

        const message = document.createElement("p");
        message.className = "empty-text";
        message.textContent = "No skills found.";

        container.appendChild(message);
        return;
    }

    skills.forEach(skill => {

        const span = document.createElement("span");

        span.className = missing
            ? "skill missing"
            : "skill";

        span.textContent = skill;

        container.appendChild(span);

    });

}

// Display Results

function displayResults(result, name) {

    document.getElementById("resultSection").hidden = false;

    document.getElementById("resultGreeting").textContent =
        "Hello " + name + "! Here is your resume analysis.";

    document.getElementById("atsScore").textContent =
        result.atsScore;

    document.getElementById("scoreBar").style.width =
        result.atsScore + "%";

    let scoreLabel = "Needs Improvement";

    if (result.atsScore >= 80) {
        scoreLabel = "Excellent Match";
    } else if (result.atsScore >= 60) {
        scoreLabel = "Good Progress";
    } else if (result.atsScore >= 40) {
        scoreLabel = "Average Match";
    }

    document.getElementById("scoreLabel").textContent =
        scoreLabel;

    displaySkills("detectedSkills", result.detectedSkills);
    displaySkills("matchedSkills", result.matchedSkills);
    displaySkills("missingSkills", result.missingSkills, true);

    // Sections

    const sectionContainer =
        document.getElementById("sectionResults");

    sectionContainer.replaceChildren();

    Object.keys(sections).forEach(section => {

        const div = document.createElement("div");

        const found = result.foundSections.includes(section);

        div.className = found
            ? "section-item found"
            : "section-item missing";

        div.textContent =
            (found ? "✓ " : "✕ ") + section;

        sectionContainer.appendChild(div);

    });

    // Suggestions

    const suggestionList =
        document.getElementById("suggestions");

    suggestionList.replaceChildren();

    result.suggestions.forEach(suggestion => {

        const li = document.createElement("li");
        li.textContent = suggestion;

        suggestionList.appendChild(li);

    });

    document.getElementById("resultSection").scrollIntoView({
        behavior: "smooth"
    });

}

// Save History

function saveHistory(result, name, filename) {

    const oldHistory = JSON.parse(
        localStorage.getItem("smartHireHistory") || "[]"
    );

    const record = {
        id: Date.now(),
        name,
        filename,
        jobRole: result.jobRole,
        score: result.atsScore,
        date: new Date().toLocaleString(),
        detectedSkills: result.detectedSkills,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        foundSections: result.foundSections,
        missingSections: result.missingSections,
        suggestions: result.suggestions,
        wordCount: result.wordCount
    };

    oldHistory.unshift(record);

    localStorage.setItem(
        "smartHireHistory",
        JSON.stringify(oldHistory.slice(0, 50))
    );

    latestReport = {
        ...record
    };
}

// Submit Form

resumeForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    errorMessage.textContent = "";

    const name = document.getElementById("candidateName").value.trim();

    const jobRole = document.getElementById("jobRole").value;

    if (!name || !jobRole) {
        showError("Please fill all required fields.");
        return;
    }

    if (!selectedFile) {
        showError("Please select your PDF resume.");
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing Resume...";

    try {

        const text = await extractPDFText(selectedFile);

        if (!text || text.trim().length < 30) {
            throw new Error(
                "No readable text found. Please upload a text-based PDF."
            );
        }

        const result = analyzeResume(text, jobRole);

        displayResults(result, name);

        saveHistory(result, name, selectedFile.name);

    } catch (error) {

        showError(error.message || "Something went wrong.");

    } finally {

        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze Resume →";

    }

});

// Download report

document.getElementById("downloadBtn").addEventListener("click", () => {

    if (!latestReport) return;

    const report = `
SMARTHIRE AI - RESUME ANALYSIS REPORT

Candidate: ${latestReport.name}
File: ${latestReport.filename}
Job Role: ${latestReport.jobRole}
Date: ${latestReport.date}

ATS SCORE: ${latestReport.score}/100

WORD COUNT: ${latestReport.wordCount}

DETECTED SKILLS:
${latestReport.detectedSkills.join(", ") || "None"}

MATCHED SKILLS:
${latestReport.matchedSkills.join(", ") || "None"}

MISSING SKILLS:
${latestReport.missingSkills.join(", ") || "None"}

FOUND SECTIONS:
${latestReport.foundSections.join(", ") || "None"}

MISSING SECTIONS:
${latestReport.missingSections.join(", ") || "None"}

IMPROVEMENT SUGGESTIONS:

${latestReport.suggestions.map(item => "- " + item).join("\n")}

Note: This is an estimated rule-based score, not an official ATS score.
    `;

    const blob = new Blob([report], {
        type: "text/plain"
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "SmartHire_Resume_Report.txt";

    link.click();

    URL.revokeObjectURL(url);

});

// New Analysis

document.getElementById("newAnalysisBtn").addEventListener("click", () => {

    resumeForm.reset();

    selectedFile = null;
    latestReport = null;

    fileInfo.textContent = "PDF only · Maximum 5 MB";

    errorMessage.textContent = "";

    document.getElementById("resultSection").hidden = true;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

});