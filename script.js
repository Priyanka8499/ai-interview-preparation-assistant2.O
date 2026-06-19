/**
 * AI Interview Preparation Assistant - Core JavaScript
 * Handles form validation, UI state, dark/light theme, API communication,
 * safety parsing, custom toasts, and dynamic responsive card generation.
 */

// Core state configuration
const state = {
    selectedExperience: 'Intermediate', // Default selection
    darkMode: localStorage.getItem('theme') === 'dark' || 
               (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches),
    isLoading: false,
    generatedData: null
};

// System loading messages rotated while AI is generating content
const loadingMessages = [
    "Analyzing target job role capabilities...",
    "Drafting technical and scenario-based interview questions...",
    "Formulating optimal problem-solving response structures...",
    "Generating model answers using professional-grade rubrics...",
    "Tailoring essential preparation tips for your experience profile...",
    "Synthesizing the personalized interview prep kit...",
    "Polishing details for a successful interview experience..."
];

// Initialize application on DOM load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initExperienceSelection();
    initSuggestedRoles();
    initApiKeyModal();
    initFormHandlers();
    
    // Check if key is already stored and update status displays
    updateApiKeyStatus();
});

/* ==========================================
   1. Theme Management (Dark & Light Mode)
   ========================================== */
function initTheme() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-toggle-icon');
    
    // Set initial class on html element
    applyTheme(state.darkMode);

    themeToggleBtn.addEventListener('click', () => {
        state.darkMode = !state.darkMode;
        applyTheme(state.darkMode);
        localStorage.setItem('theme', state.darkMode ? 'dark' : 'theme-light');
    });
}

function applyTheme(isDark) {
    const html = document.documentElement;
    const icon = document.getElementById('theme-toggle-icon');
    
    if (isDark) {
        html.classList.add('dark');
        if (icon) {
            icon.setAttribute('data-lucide', 'sun');
            icon.className = 'w-5 h-5 text-amber-400 text-amber-300';
        }
    } else {
        html.classList.remove('dark');
        if (icon) {
            icon.setAttribute('data-lucide', 'moon');
            icon.className = 'w-5 h-5 text-slate-600 dark:text-slate-400';
        }
    }
    
    // Refresh icons via Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/* ==========================================
   2. Experience Level Selector Styling
   ========================================== */
function initExperienceSelection() {
    const expCards = document.querySelectorAll('.experience-card');
    
    expCards.forEach(card => {
        card.addEventListener('click', () => {
            // Remove selection class from all experience cards
            expCards.forEach(c => {
                c.classList.remove('border-blue-500', 'bg-blue-50/40', 'dark:border-blue-400', 'dark:bg-blue-950/20');
                c.classList.add('border-slate-200', 'dark:border-slate-700/60');
                
                const check = c.querySelector('.exp-check');
                if (check) check.classList.add('hidden');
            });
            
            // Add selection styling to active card
            card.classList.remove('border-slate-200', 'dark:border-slate-700/60');
            card.classList.add('border-blue-500', 'bg-blue-50/40', 'dark:border-blue-400', 'dark:bg-blue-950/20');
            
            const check = card.querySelector('.exp-check');
            if (check) check.classList.remove('hidden');
            
            // Store selected value in state
            state.selectedExperience = card.getAttribute('data-experience');
        });
    });
}

/* ==========================================
   3. Job Suggestions Badge Helper
   ========================================== */
function initSuggestedRoles() {
    const badges = document.querySelectorAll('.role-badge');
    const jobInput = document.getElementById('job-role-input');
    
    badges.forEach(badge => {
        badge.addEventListener('click', () => {
            const role = badge.getAttribute('data-role');
            jobInput.value = role;
            
            // Add clean selection highlight effect on click
            badge.classList.add('scale-95', 'opacity-80');
            setTimeout(() => {
                badge.classList.remove('scale-95', 'opacity-80');
            }, 150);
            
            showToast(`Selected role: ${role}`, 'success');
        });
    });
}

/* ==========================================
   4. API Key Configuration & Intercept
   ========================================== */
function initApiKeyModal() {
    const configBtn = document.getElementById('config-api-btn');
    const modal = document.getElementById('api-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const saveKeyBtn = document.getElementById('save-key-btn');
    const deleteKeyBtn = document.getElementById('delete-key-btn');
    const apiKeyInput = document.getElementById('api-key-input');
    
    // Open Modal
    configBtn.addEventListener('click', () => {
        const currentKey = localStorage.getItem('GEMINI_API_KEY') || '';
        apiKeyInput.value = currentKey;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    });
    
    // Close Modal
    const closeModal = () => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };
    
    closeModalBtn.addEventListener('click', closeModal);
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    // Save Key to local storage
    saveKeyBtn.addEventListener('click', () => {
        const key = apiKeyInput.value.trim();
        if (key === '') {
            showToast('Please enter a valid API key string', 'error');
            return;
        }
        
        localStorage.setItem('GEMINI_API_KEY', key);
        updateApiKeyStatus();
        closeModal();
        showToast('API Key saved successfully!', 'success');
    });
    
    // Delete Key from local storage
    deleteKeyBtn.addEventListener('click', () => {
        localStorage.removeItem('GEMINI_API_KEY');
        apiKeyInput.value = '';
        updateApiKeyStatus();
        closeModal();
        showToast('API Key removed. LocalStorage cleared.', 'success');
    });
}

// Retrieve API key with secure order of precedence:
// 1. User's manually entered key (saved in localStorage)
// 2. Pre-configured environment key from build system (window.GEMINI_API_KEY_ENV)
const getApiKey = () => {
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey && localKey.trim() !== '') {
        return localKey.trim();
    }
    
    // Fallback checks for Vite environment config define replacement
    try {
        if (typeof window.GEMINI_API_KEY_ENV !== 'undefined' && window.GEMINI_API_KEY_ENV !== '') {
            return window.GEMINI_API_KEY_ENV;
        }
    } catch (e) {
        // Safe catch
    }
    
    return '';
};

// Check key availability and update navigation pill colors
function updateApiKeyStatus() {
    const statusDot = document.getElementById('api-status-dot');
    const statusText = document.getElementById('api-status-text');
    const key = getApiKey();
    
    if (key && key.trim() !== '') {
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse';
        statusText.textContent = 'API Connected';
        statusText.className = 'text-xs text-slate-600 dark:text-slate-300 font-medium ml-1.5';
    } else {
        statusDot.className = 'w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse';
        statusText.textContent = 'Configure Key';
        statusText.className = 'text-xs text-amber-600 dark:text-amber-400 font-semibold ml-1.5 animate-pulse';
    }
}

/* ==========================================
   5. Custom Toasts & Notification Drawer
   ========================================== */
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `animate-slide-up bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${type === 'success' ? 'border-emerald-500/30 dark:border-emerald-500/20' : 'border-rose-500/30 dark:border-rose-500/20'} max-w-sm z-50 transition-all duration-300`;
    
    const iconName = type === 'success' ? 'check-circle' : 'alert-circle';
    const iconColor = type === 'success' ? 'text-emerald-500 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400';
    
    toast.innerHTML = `
        <i data-lucide="${iconName}" class="w-5 h-5 ${iconColor} flex-shrink-0"></i>
        <p class="text-sm font-medium pr-1 leading-snug">${message}</p>
    `;
    
    container.appendChild(toast);
    
    // Initialize standard lucide icons on dynamically inserted node
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Auto-remove after delay
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-12px)';
        setTimeout(() => toast.remove(), 350);
    }, 4000);
}

/* ==========================================
   6. Form Validation & AI Generation Logic
   ========================================== */
function initFormHandlers() {
    const nameInput = document.getElementById('name-input');
    const jobRoleInput = document.getElementById('job-role-input');
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    // Main submit generate action
    generateBtn.addEventListener('click', async () => {
        // Inputs Validation
        const nameVal = nameInput.value.trim();
        const roleVal = jobRoleInput.value.trim();
        const experienceVal = state.selectedExperience;
        
        if (nameVal === '') {
            showToast('Please enter your candidate name', 'error');
            nameInput.focus();
            return;
        }
        
        if (roleVal === '') {
            showToast('Please enter the target job role', 'error');
            jobRoleInput.focus();
            return;
        }
        
        const apiKey = getApiKey();
        if (!apiKey || apiKey.trim() === '') {
            // Trigger API key configuration modal if credentials are empty
            showToast('A Gemini API key is required to proceed.', 'error');
            document.getElementById('api-modal').classList.remove('hidden');
            document.getElementById('api-modal').classList.add('flex');
            return;
        }
        
        // Block consecutive interactions during loader lifecycle
        setLoadingState(true);
        
        try {
            const result = await generateInterviewPrepKit(apiKey, nameVal, roleVal, experienceVal);
            state.generatedData = result;
            
            // Populate output display panels
            renderPrepKitDashboard(result, nameVal, roleVal, experienceVal);
            
            setLoadingState(false);
            showToast('Prep Kit generated successfully!', 'success');
            
            // Scroll smoothly down onto results panel
            const resultsSection = document.getElementById('results-section');
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            
        } catch (error) {
            console.error(error);
            setLoadingState(false);
            showToast(error.message || 'An error occurred during content generation.', 'error');
        }
    });

    // Reset controls
    clearBtn.addEventListener('click', () => {
        nameInput.value = '';
        jobRoleInput.value = '';
        state.generatedData = null;
        
        // Restore default selected experience card
        const expCards = document.querySelectorAll('.experience-card');
        expCards.forEach(card => {
            if (card.getAttribute('data-experience') === 'Intermediate') {
                card.click();
            }
        });
        
        // Soft reset results section
        const resultsSection = document.getElementById('results-section');
        resultsSection.classList.add('hidden');
        
        showToast('Fields and results cleared.', 'success');
    });
}

// Controls loading animation overlay & interval loops
let loadingTextInterval = null;
function setLoadingState(isLoading) {
    state.isLoading = isLoading;
    const loaderOverlay = document.getElementById('loader-overlay');
    const loadingMessageElement = document.getElementById('loading-message-text');
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    
    if (isLoading) {
        // Freeze triggers
        generateBtn.disabled = true;
        clearBtn.disabled = true;
        generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        
        // Show loaders
        loaderOverlay.classList.remove('hidden');
        loaderOverlay.classList.add('flex');
        
        // Start text message cyclers
        let messageIndex = 0;
        loadingMessageElement.textContent = loadingMessages[0];
        
        loadingTextInterval = setInterval(() => {
            messageIndex = (messageIndex + 1) % loadingMessages.length;
            loadingMessageElement.style.opacity = '0';
            
            setTimeout(() => {
                loadingMessageElement.textContent = loadingMessages[messageIndex];
                loadingMessageElement.style.opacity = '1';
            }, 300);
            
        }, 3200);
    } else {
        // Restore buttons
        generateBtn.disabled = false;
        clearBtn.disabled = false;
        generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        
        // Remove loader and clear intervals
        loaderOverlay.classList.remove('flex');
        loaderOverlay.classList.add('hidden');
        
        if (loadingTextInterval) {
            clearInterval(loadingTextInterval);
            loadingTextInterval = null;
        }
    }
}

/* ==========================================
   7. AI API Communication (Direct Gemini)
   ========================================== */
async function generateInterviewPrepKit(apiKey, name, role, experience) {
    // Elegant, instruction-dense prompt to ensure perfect structural output
    const prompt = `
Generate a highly detailed and role-specific candidate Interview Preparation Kit using the following information:
- Candidate Name: ${name}
- Job Target Role: ${role}
- Target Range of Experience: ${experience}

You MUST follow these strict formatting guidelines:
1. Come up with 10 actual, customized technical and behavioral interview questions tailored precisely for a candidate seeking a ${role} position at the ${experience} level. 
2. Write a highly realistic, expert sample answer for EVERY single question. Each answer should be detailed and follow standard methodologies (like STAR framework for situational queries).
3. Draft 5 personalized, structural interview strategic preparation tips for ${name} at the ${experience} experience depth. Avoid genetic filler advice, and use specific recommendations for preparing for a ${role} position.

Return ONLY valid JSON.

Generate exactly 10 questions.
Each question must include id, question, sampleAnswer, and category.
Return only the JSON object. Do not include any text before or after it.
`;

    // Fetch utilizing Gemini Beta API endpoint directly
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                   parts: [{
                     text: prompt
        }]
    }],
    generationConfig: {
        temperature: 0.7
    }
})
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData?.error?.message || `HTTP error ${response.status}`;
            throw new Error(`Gemini API connection error: ${errorMessage}`);
        }
        
        const data = await response.json();
        
        // Extract output safely using direct properties based on SDK guidelines
        const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText || responseText.trim() === '') {
            throw new Error("Received an empty response from Gemini model.");
        }
        
        console.log("Gemini Response:");
        console.log(responseText);

        return cleanAndParseJson(responseText);
        
    } catch (err) {
        console.error("API Call failed:", err);
        throw new Error(`AI System failed to respond: ${err.message}`);
    }
}

// Bulletproof parser that safely extracts JSON strings around markdown blocks or formatting noise
function cleanAndParseJson(rawText) {
    try {
        // Try direct parse first
        return JSON.parse(rawText.trim());
    } catch (e) {
        // Try cleaning standard Markdown wrapping blocks (```json ... ```)
        const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
        const match = rawText.match(jsonBlockRegex);
        
        if (match && match[1]) {
            try {
                return JSON.parse(match[1].trim());
            } catch (innerError) {
                // Keep falling back
            }
        }
        
        // Alternative fallback: capture indices of first opening bracket and last closing bracket
        const firstBracket = rawText.indexOf('{');
        const lastBracket = rawText.lastIndexOf('}');
        
        if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            try {
                const cleanedText = rawText.substring(firstBracket, lastBracket + 1);
                return JSON.parse(cleanedText);
            } catch (fallbackError) {
                // Fallback fails
            }
        }
        
        throw new Error("AI returned invalid JSON formatting. Please try re-generating.");
    }
}

/* ==========================================
   8. UI Dashboard Rendering & Event Listeners
   ========================================== */
function renderPrepKitDashboard(data, name, role, experience) {
    const resultsSection = document.getElementById('results-section');
    
    // Core details rendering
    document.getElementById('result-role-badge').textContent = role;
    document.getElementById('result-exp-badge').textContent = experience;
    document.getElementById('result-greeting-text').textContent = data.personalGreeting || `Welcome, ${name}. Here is your tailored preparation plan.`;
    
    // Render Questions (Interactive accordions)
    const questionsContainer = document.getElementById('questions-accordions-container');
    questionsContainer.innerHTML = '';
    
    const questionsList = data.questions || [];
    
    questionsList.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/55 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300';
        
        // Determine category badge colors dynamically
        const category = q.category || 'General';
        const badgeColors = getCategoryBadgeColors(category);
        
        questionCard.innerHTML = `
            <!-- Accordion Header Trigger -->
            <button class="w-full text-left px-5 py-4 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-700/20 active:scale-[0.99] transition-all-custom select-none" onclick="toggleAccordion(this)">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span class="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">Q-${q.id || (index+1)}</span>
                        <span class="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${badgeColors}">${category}</span>
                    </div>
                    <h4 class="text-slate-800 dark:text-slate-100 font-semibold text-base leading-snug">${q.question}</h4>
                </div>
                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700/60 flex items-center justify-center border border-slate-100 dark:border-slate-600/40 text-slate-500 dark:text-slate-300 transition-transform duration-300 transform accordion-chevron">
                    <i data-lucide="chevron-down" class="w-4 h-4"></i>
                </div>
            </button>
            
            <!-- Accordion Expandable Answer Body -->
            <div class="accordion-content bg-slate-50/40 dark:bg-slate-900/10 border-t border-transparent transition-all">
                <div class="p-5">
                    <div class="mb-2 flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                        <i data-lucide="sparkles" class="w-3.5 h-3.5 text-blue-500"></i>
                        <span>SUGGESTED MODEL ANSWER</span>
                    </div>
                    <div class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line prose dark:prose-invert max-w-none">
                        ${q.sampleAnswer}
                    </div>
                </div>
            </div>
        `;
        
        questionsContainer.appendChild(questionCard);
    });
    
    // Render Tips (Interactive checking items)
    const tipsContainer = document.getElementById('tips-list-container');
    tipsContainer.innerHTML = '';
    
    const tipsList = data.tips || [];
    tipsList.forEach((tip, index) => {
        const tipLi = document.createElement('div');
        tipLi.className = 'flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all duration-200 cursor-pointer select-none group';
        
        // Let the whole row trigger the check box toggle
        tipLi.innerHTML = `
            <div class="flex-shrink-0 mt-0.5">
                <div class="w-5 h-5 rounded-md border border-slate-300 dark:border-slate-600 flex items-center justify-center transition-all duration-200 group-hover:border-blue-500 bg-white dark:bg-slate-800 check-box-bullet">
                    <i data-lucide="check" class="w-3.5 h-3.5 text-white hidden"></i>
                </div>
            </div>
            <p class="text-slate-600 dark:text-slate-300 text-sm leading-relaxed transition-all duration-200 tip-text">${tip}</p>
        `;
        
        tipLi.addEventListener('click', () => {
            const checkIcon = tipLi.querySelector('i');
            const checkBox = tipLi.querySelector('.check-box-bullet');
            const textPara = tipLi.querySelector('.tip-text');
            
            if (checkIcon.classList.contains('hidden')) {
                checkIcon.classList.remove('hidden');
                checkBox.classList.remove('border-slate-300', 'dark:border-slate-600');
                checkBox.classList.add('border-emerald-500', 'bg-emerald-500');
                textPara.classList.add('line-through', 'text-slate-400', 'dark:text-slate-500');
            } else {
                checkIcon.classList.add('hidden');
                checkBox.classList.add('border-slate-300', 'dark:border-slate-600');
                checkBox.classList.remove('border-emerald-500', 'bg-emerald-500');
                textPara.classList.remove('line-through', 'text-slate-400', 'dark:text-slate-500');
            }
        });
        
        tipsContainer.appendChild(tipLi);
    });
    
    // Setup Download & Copy Action Bindings
    setupDashboardActions(data, name, role, experience);
    
    // Refresh icons inside response block
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Reveal results block
    resultsSection.classList.remove('hidden');
}

// Toggles accordion body height and button transitions
window.toggleAccordion = function(button) {
    const card = button.parentElement;
    const content = card.querySelector('.accordion-content');
    const chevron = button.querySelector('.accordion-chevron');
    
    // Toggle active state
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        content.style.borderTopColor = 'transparent';
        chevron.style.transform = 'rotate(0deg)';
        button.classList.remove('bg-slate-100/40', 'dark:bg-slate-700/10');
    } else {
        // Expand and highlight
        content.classList.add('expanded');
        content.style.borderTopColor = 'rgba(226, 232, 240, 0.4)';
        chevron.style.transform = 'rotate(180deg)';
        button.classList.add('bg-slate-100/40', 'dark:bg-slate-700/10');
    }
};

// Map generated categories to delightful, complementary theme pill colors
function getCategoryBadgeColors(category) {
    const c = category.toLowerCase();
    if (c.includes('tech') || c.includes('code') || c.includes('program')) {
        return 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100/30 dark:border-blue-500/10';
    } else if (c.includes('behavior') || c.includes('situation') || c.includes('star')) {
        return 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-100/30 dark:border-violet-500/10';
    } else if (c.includes('system') || c.includes('design') || c.includes('architect')) {
        return 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-500/10';
    } else if (c.includes('lead') || c.includes('manage') || c.includes('people')) {
        return 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/30 dark:border-emerald-500/10';
    } else {
        return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700/10';
    }
}

/* ==========================================
   9. Document Compilation & Exporters
   ========================================== */
function setupDashboardActions(data, name, role, experience) {
    const copyBtn = document.getElementById('copy-results-btn');
    const downloadBtn = document.getElementById('download-results-btn');
    
    // Clear dynamic bindings if already assigned (prevents double handlers)
    const clearBindings = (btn) => {
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        return clone;
    };
    
    const freshCopyBtn = clearBindings(copyBtn);
    const freshDownloadBtn = clearBindings(downloadBtn);
    
    // Compilation Markdown text helper
    const compileMarkdown = () => {
        let md = `# AI Interview Preparation Kit\n`;
        md += `**Candidate:** ${name}\n`;
        md += `**Target Role:** ${role}\n`;
        md += `**Experience Profile:** ${experience}\n`;
        md += `**Date Instantiated:** ${new Date().toLocaleDateString()}\n\n`;
        md += `## Candidate Greeting & Context Context\n`;
        md += `${data.personalGreeting}\n\n`;
        
        md += `## Tailored Interview Questions & Model Answers\n\n`;
        data.questions.forEach((q, i) => {
            md += `### Q${i+1}: [${q.category || 'General'}] ${q.question}\n`;
            md += `**Suggested Professional Response:**\n${q.sampleAnswer}\n\n`;
            md += `---\n\n`;
        });
        
        md += `## Highlight Strategic Preparation Advice\n\n`;
        data.tips.forEach((tip, i) => {
            md += `- [ ] Tips ${i+1}: ${tip}\n`;
        });
        
        md += `\n*Formatted utilizing AI Prep Assistant.*`;
        return md;
    };
    
    // Trigger System Clipboard write
    freshCopyBtn.addEventListener('click', async () => {
        const markdownContent = compileMarkdown();
        try {
            await navigator.clipboard.writeText(markdownContent);
            showToast('Markdown Prep Kit copied to clipboard!', 'success');
        } catch (e) {
            console.error(e);
            
            // Fallback for security contexts (like iframes) where clipboard API might be denied
            const tempText = document.createElement('textarea');
            tempText.value = markdownContent;
            tempText.setAttribute('readonly', '');
            tempText.style.position = 'absolute';
            tempText.style.left = '-9999px';
            document.body.appendChild(tempText);
            tempText.select();
            
            try {
                document.execCommand('copy');
                showToast('Copied to clipboard (fallback used)!', 'success');
            } catch (_) {
                showToast('Clipboard operation denied by browser sandbox settings.', 'error');
            }
            
            document.body.removeChild(tempText);
        }
    });
    
    // Trigger Client-side file compiler & downloader
    freshDownloadBtn.addEventListener('click', () => {
        const markdownContent = compileMarkdown();
        const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
        
        const link = document.createElement('a');
        const strippedRole = role.toLowerCase().replace(/[^a-z0-9]/gi, '_');
        
        link.href = URL.createObjectURL(blob);
        link.download = `Interview_Prep_Kit_${strippedRole}.md`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Markdown file download initiated!', 'success');
    });
}
