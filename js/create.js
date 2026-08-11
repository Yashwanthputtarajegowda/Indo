const createForm = document.querySelector('#create-form');
const videoFile = document.querySelector('#video-file');
const createStatus = document.querySelector('#create-status');
const uploadZone = document.querySelector('.upload-zone');

function setStatus(message) {
    if (createStatus) {
        createStatus.textContent = message;
    }
}

videoFile?.addEventListener('change', () => {
    const file = videoFile.files?.[0];

    if (!file) {
        setStatus('No video selected.');
        return;
    }

    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];

    if (!allowedTypes.includes(file.type)) {
        videoFile.value = '';
        setStatus('Please choose an MP4, WebM or MOV video.');
        return;
    }

    uploadZone?.classList.add('selected');
    setStatus(`${file.name} selected.`);
});

createForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    const file = videoFile?.files?.[0];
    const title = document.querySelector('#video-title')?.value.trim();

    if (!file) {
        setStatus('Choose a video first.');
        return;
    }

    if (!title) {
        setStatus('Add a title before continuing.');
        return;
    }

    setStatus('Ready to upload. Firebase Storage will be connected next.');
});

document.querySelectorAll('[data-page]').forEach((button) => {
    button.addEventListener('click', () => {
        document.dispatchEvent(
            new CustomEvent('indo:navigate', {
                detail: { page: button.dataset.page }
            })
        );
    });
});
