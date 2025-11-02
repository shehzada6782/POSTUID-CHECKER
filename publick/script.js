async function extractUID() {
    const postUrl = document.getElementById('postUrl').value.trim();
    const extractBtn = document.getElementById('extractBtn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const successResult = document.getElementById('successResult');
    const errorResult = document.getElementById('errorResult');

    // Reset previous results
    successResult.classList.add('hidden');
    errorResult.classList.add('hidden');
    result.classList.add('hidden');
    loading.classList.remove('hidden');
    
    // Disable button during processing
    extractBtn.disabled = true;
    extractBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    if (!postUrl) {
        showError('Kripya Facebook post ka URL daalein');
        return;
    }

    if (!isValidFacebookUrl(postUrl)) {
        showError('Kripya valid Facebook URL daalein (facebook.com ya fb.com)');
        return;
    }

    try {
        const response = await fetch('/extract-uid', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ postUrl: postUrl })
        });

        const data = await response.json();

        if (data.success) {
            showSuccess(data.postId, data.fullUrl);
        } else {
            showError(data.error || 'UID extract nahi ho paya');
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Network error: Server se connect nahi ho paya');
    } finally {
        loading.classList.add('hidden');
        extractBtn.disabled = false;
        extractBtn.innerHTML = '<i class="fas fa-magic"></i> UID Extract Karein';
    }
}

function isValidFacebookUrl(url) {
    const facebookPattern = /^(https?:\/\/)?(www\.)?(facebook|fb)\.com\/.+/i;
    return facebookPattern.test(url);
}

function showSuccess(postId, fullUrl) {
    const successResult = document.getElementById('successResult');
    const errorResult = document.getElementById('errorResult');
    const result = document.getElementById('result');
    const postIdElement = document.getElementById('postId');
    const fullUrlElement = document.getElementById('fullUrl');

    postIdElement.textContent = postId;
    fullUrlElement.href = fullUrl;
    fullUrlElement.textContent = fullUrl;

    errorResult.classList.add('hidden');
    successResult.classList.remove('hidden');
    result.classList.remove('hidden');

    // Scroll to result
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function showError(message) {
    const successResult = document.getElementById('successResult');
    const errorResult = document.getElementById('errorResult');
    const result = document.getElementById('result');
    const errorMessage = document.getElementById('errorMessage');

    errorMessage.textContent = message;
    
    successResult.classList.add('hidden');
    errorResult.classList.remove('hidden');
    result.classList.remove('hidden');

    // Scroll to result
    result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function copyToClipboard() {
    const postId = document.getElementById('postId').textContent;
    
    navigator.clipboard.writeText(postId).then(() => {
        // Show temporary success message on button
        const copyBtn = document.querySelector('.copy-btn');
        const originalHtml = copyBtn.innerHTML;
        
        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalHtml;
            copyBtn.style.background = '';
        }, 2000);
    }).catch(err => {
        console.error('Copy failed:', err);
        alert('Copy karne mein error aaya. Manual copy karein.');
    });
}

// Enter key support
document.getElementById('postUrl').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        extractUID();
    }
});

// Input validation on paste
document.getElementById('postUrl').addEventListener('paste', function(e) {
    setTimeout(() => {
        const url = e.target.value;
        if (url && !isValidFacebookUrl(url)) {
            e.target.style.borderColor = '#dc3545';
        } else {
            e.target.style.borderColor = '#e1e8ed';
        }
    }, 100);
});
