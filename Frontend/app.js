// API base endpoint
const API_URL = 'http://localhost:3000/api/resume/analyze';

// Document Elements
const form = document.getElementById('analyzer-form');
const resumeInput = document.getElementById('resume-file');
const jobDescInput = document.getElementById('job-desc');
const dropzone = document.getElementById('dropzone');
const dropzoneContent = document.getElementById('dropzone-content');
const fileIndicator = document.getElementById('file-indicator');
const selectedFileName = document.getElementById('selected-file-name');
const selectedFileSize = document.getElementById('selected-file-size');
const removeFileBtn = document.getElementById('remove-file-btn');
const submitBtn = document.getElementById('submit-btn');

const loadingState = document.getElementById('loading-state');
const errorState = document.getElementById('error-state');
const errorMessage = document.getElementById('error-message');
const retryBtn = document.getElementById('retry-btn');
const resultsState = document.getElementById('results-state');

// Dashboard Info Elements
const scoreValue = document.getElementById('score-value');
const scoreRatingText = document.getElementById('score-rating-text');
const scoreFillCircle = document.getElementById('score-fill-circle');
const matchSummary = document.getElementById('match-summary');
const strengthsList = document.getElementById('strengths-list');
const weaknessesList = document.getElementById('weaknesses-list');
const matchingKeywordsList = document.getElementById('matching-keywords-list');
const missingKeywordsList = document.getElementById('missing-keywords-list');
const suggestionsList = document.getElementById('suggestions-list');

// State Variables
let selectedFile = null;

// Sticky navigation shadow effect on scroll
window.addEventListener('scroll', () => {
  const nav = document.getElementById('top-nav');
  if (window.scrollY > 10) {
    nav.classList.add('shadow-md', 'border-surface-variant/20');
    nav.classList.remove('shadow-sm', 'border-surface-variant/10');
  } else {
    nav.classList.remove('shadow-md', 'border-surface-variant/20');
    nav.classList.add('shadow-sm', 'border-surface-variant/10');
  }
});

/* --- Drag & Drop Handlers --- */
['dragenter', 'dragover'].forEach(eventName => {
  dropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropzone.classList.add('border-primary-fixed/50');
  }, false);
});

['dragleave', 'drop'].forEach(eventName => {
  dropzone.addEventListener(eventName, (e) => {
    e.preventDefault();
    dropzone.classList.remove('border-primary-fixed/50');
  }, false);
});

dropzone.addEventListener('drop', (e) => {
  const dt = e.dataTransfer;
  const files = dt.files;
  if (files.length > 0) {
    handleFileSelection(files[0]);
  }
});

resumeInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handleFileSelection(e.target.files[0]);
  }
});

removeFileBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  e.preventDefault();
  resetFileSelection();
});

function handleFileSelection(file) {
  if (file.type !== 'application/pdf') {
    alert('Please select a valid PDF file.');
    return;
  }
  selectedFile = file;
  selectedFileName.textContent = file.name;
  selectedFileSize.textContent = formatBytes(file.size);
  
  dropzoneContent.classList.add('hidden');
  fileIndicator.classList.remove('hidden');
  fileIndicator.classList.add('flex');
}

function resetFileSelection() {
  selectedFile = null;
  resumeInput.value = '';
  dropzoneContent.classList.remove('hidden');
  fileIndicator.classList.add('hidden');
  fileIndicator.classList.remove('flex');
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/* --- Form Submit / API Call --- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (!selectedFile) {
    alert('Please upload a PDF resume file.');
    return;
  }

  showState(loadingState);
  
  const formData = new FormData();
  formData.append('resume', selectedFile);
  formData.append('jobDescription', jobDescInput.value);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 90000); // 90s timeout

  const finishWithError = (msg) => {
    clearTimeout(timeoutId);
    console.error('[ResuBoost] Error:', msg);
    errorMessage.textContent = msg;
    showState(errorState);
  };

  try {
    console.log('[ResuBoost] Sending request to', API_URL);
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    console.log('[ResuBoost] Response status:', response.status);

    if (!response.ok) {
      let errMsg = `Server error (${response.status})`;
      try {
        const errData = await response.json();
        errMsg = errData.message || errMsg;
      } catch (_) {}
      finishWithError(errMsg);
      return;
    }

    let data;
    try {
      data = await response.json();
      console.log('[ResuBoost] Response data:', data);
    } catch (parseErr) {
      finishWithError('Failed to parse server response. Please try again.');
      return;
    }

    renderDashboard(data);
  } catch (error) {
    if (error.name === 'AbortError') {
      finishWithError('The request timed out after 90 seconds. Please try again.');
    } else {
      finishWithError(error.message || 'An unexpected network error occurred.');
    }
  }
});

retryBtn.addEventListener('click', () => {
  resetAnalysis();
});

function showState(activeState) {
  form.classList.add('hidden');
  loadingState.classList.add('hidden');
  errorState.classList.add('hidden');
  resultsState.classList.add('hidden');
  
  loadingState.classList.remove('flex');
  errorState.classList.remove('flex');
  resultsState.classList.remove('flex');
  
  if (activeState === form) {
    activeState.classList.remove('hidden');
  } else if (activeState) {
    activeState.classList.remove('hidden');
    activeState.classList.add('flex');
  }
}

/* --- Render Dashboard Metrics --- */
function renderDashboard(data) {
  showState(resultsState);
  
  // 1. Render & Animate Score Ring
  const score = data.score || 0;
  animateScore(score);
  
  // Update Score Text Rating
  if (score >= 85) {
    scoreRatingText.textContent = "Excellent Match";
    scoreRatingText.className = "font-label-md text-primary-fixed text-lg font-bold";
  } else if (score >= 70) {
    scoreRatingText.textContent = "Solid Match";
    scoreRatingText.className = "font-label-md text-secondary-fixed-dim text-lg font-bold";
  } else if (score >= 50) {
    scoreRatingText.textContent = "Partial Match";
    scoreRatingText.className = "font-label-md text-tertiary-container text-lg font-bold";
  } else {
    scoreRatingText.textContent = "Poor Match";
    scoreRatingText.className = "font-label-md text-error text-lg font-bold";
  }
  
  // 2. Render Text Content
  matchSummary.textContent = data.summary || 'No summary details returned.';
  
  // 3. Keywords
  renderBadges(matchingKeywordsList, data.matchingKeywords, true);
  renderBadges(missingKeywordsList, data.missingKeywords, false);
  
  // 4. Strengths & Gaps
  renderList(strengthsList, data.strengths);
  renderList(weaknessesList, data.weaknesses);
  
  // 5. Action Plan suggestions steps
  renderSuggestions(data.suggestions);
}

function animateScore(targetScore) {
  let currentScore = 0;
  const duration = 1200; // ms
  const interval = 20; // ms
  const step = targetScore / (duration / interval);
  
  const timer = setInterval(() => {
    currentScore += step;
    if (currentScore >= targetScore) {
      currentScore = targetScore;
      clearInterval(timer);
    }
    
    const displayVal = Math.round(currentScore);
    scoreValue.textContent = displayVal;
    
    // Circle offset math: 263.89 is total perimeter
    const offset = 263.89 - (263.89 * displayVal) / 100;
    scoreFillCircle.style.strokeDashoffset = offset;
    
    // Change score colors based on score rating
    if (displayVal >= 85) {
      scoreFillCircle.style.stroke = '#6ffbbe'; // Green (primary-fixed)
    } else if (displayVal >= 70) {
      scoreFillCircle.style.stroke = '#adc6ff'; // Blue (secondary-fixed-dim)
    } else if (displayVal >= 50) {
      scoreFillCircle.style.stroke = '#b090ff'; // Purple (tertiary-container)
    } else {
      scoreFillCircle.style.stroke = '#ba1a1a'; // Red (error)
    }
  }, interval);
}

function renderBadges(container, list, isMatching) {
  container.innerHTML = '';
  if (!list || list.length === 0) {
    container.innerHTML = `<span class="px-2.5 py-1 bg-surface-variant/5 text-surface-variant/50 text-xs font-medium rounded border border-surface-variant/10">None identified</span>`;
    return;
  }
  list.forEach(item => {
    const badge = document.createElement('span');
    if (isMatching) {
      badge.className = 'px-2.5 py-1 bg-primary-container/10 text-primary-fixed text-xs font-medium rounded border border-primary-container/30 flex items-center gap-1 shadow-sm';
      badge.innerHTML = `<span class="material-symbols-outlined text-[14px]">check_circle</span> ${item}`;
    } else {
      badge.className = 'px-2.5 py-1 bg-error/10 text-error-container text-xs font-medium rounded border border-error/30 flex items-center gap-1 shadow-sm';
      badge.innerHTML = `<span class="material-symbols-outlined text-[14px]">cancel</span> ${item}`;
    }
    container.appendChild(badge);
  });
}

function renderList(container, list) {
  container.innerHTML = '';
  if (!list || list.length === 0) {
    container.innerHTML = `<li>No details provided</li>`;
    return;
  }
  list.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    container.appendChild(li);
  });
}

function renderSuggestions(list) {
  suggestionsList.innerHTML = '';
  
  if (!list || list.length === 0) {
    suggestionsList.innerHTML = `<p class="text-xs text-surface-variant">No suggestions provided.</p>`;
    return;
  }

  // Draw connector line
  const connector = document.createElement('div');
  connector.className = 'absolute left-[19px] top-4 bottom-4 w-px bg-surface-variant/20 z-0 hidden sm:block';
  suggestionsList.appendChild(connector);

  list.forEach((step, index) => {
    const stepDiv = document.createElement('div');
    stepDiv.className = 'flex gap-5 items-start relative z-10 group';

    // Parse step text into title and details if colon exists
    let title = `Recommendation ${index + 1}`;
    let desc = step;
    const colonIndex = step.indexOf(':');
    if (colonIndex > 0 && colonIndex < 40) {
      title = step.substring(0, colonIndex).trim();
      desc = step.substring(colonIndex + 1).trim();
    }

    stepDiv.innerHTML = `
      <div class="w-10 h-10 rounded-full bg-tertiary-container/20 text-tertiary-fixed font-bold flex items-center justify-center shrink-0 border border-tertiary-container/30 shadow-[0_0_15px_rgba(176,144,255,0.2)] group-hover:scale-110 group-hover:bg-tertiary-fixed group-hover:text-black transition-all duration-300">${index + 1}</div>
      <div class="bg-[#0b0f19]/90 p-5 rounded-lg border border-surface-variant/20 w-full group-hover:border-tertiary-fixed/40 transition-colors">
        <h4 class="font-label-md text-white text-base font-semibold">${title}</h4>
        <p class="text-sm text-surface-variant mt-2 leading-relaxed">${desc}</p>
      </div>
    `;
    suggestionsList.appendChild(stepDiv);
  });
}

function resetAnalysis() {
  resetFileSelection();
  showState(form);
}
window.resetAnalysis = resetAnalysis;
