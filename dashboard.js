const apiBase = 'http://localhost:8080/api';
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('name');
const notesContainer = document.getElementById('notes-container');
const noteForm = document.getElementById('note-form');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

if (!userId) {
    alert('You are not logged in! Redirecting to login page...');
    window.location.href = 'index.html';
}

userNameSpan.textContent = userName || 'User';

// Format timestamp nicely
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Fetch and render notes
async function fetchNotes() {
    try {
        console.log(userId)
        const res = await fetch(`${apiBase}/users/${userId}/notes`);
        if (!res.ok) throw new Error('Failed to fetch notes');
        const notes = await res.json();
        renderNotes(notes);
    } catch (err) {
        alert('Error fetching notes: ' + err.message);
    }
}

// Render notes in the DOM
function renderNotes(notes) {
    notesContainer.innerHTML = '';
    if (notes.length === 0) {
        notesContainer.innerHTML = '<p>No notes yet. Add your first note!</p>';
        return;
    }

    notes.forEach(note => {
        const noteEl = document.createElement('div');
        noteEl.className = 'note';
 
        noteEl.innerHTML = `
      <h3>${escapeHtml(note.title)}</h3>
      <small>Last updated: ${formatDate(note.updatedAt || note.createdAt)}</small>
      <p>${escapeHtml(note.content)}</p>
      <div class="note-actions">
        <button onclick="editNote('${note.id}', '${escapeQuotes(note.title)}', \`${escapeBackticks(note.content)}\`)">Edit</button>
        <button onclick="deleteNote('${note.id}')">Delete</button>
      </div>
    `;

        notesContainer.appendChild(noteEl);
    });
}

// Escape helpers to prevent breaking JS when injecting content
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
function escapeQuotes(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}
function escapeBackticks(text) {
    return text.replace(/`/g, '\\`');
}

// Add new note
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title || !content) return alert('Please fill in both title and content.');

    try {
        const res = await fetch(`${apiBase}/addNotes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, userId }),
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Failed to add note');
        }

        alert('Note added successfully!');
        noteTitleInput.value = '';
        noteContentInput.value = '';
        fetchNotes();
    } catch (err) {
        alert('Error adding note: ' + err.message);
    }
});

let editingNoteId = null;

// Edit note function: populate form with existing data
window.editNote = (id, title, content) => {
    editingNoteId = id;
    noteTitleInput.value = title;
    noteContentInput.value = content;
    noteForm.querySelector('button[type="submit"]').textContent = 'Update Note';
};

// Update note on submit when editing
noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!editingNoteId) return; // Not editing, already handled above for new notes

    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title || !content) return alert('Please fill in both title and content.');

    try {
        const res = await fetch(`${apiBase}/${editingNoteId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content, userId }),
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Failed to update note');
        }

        alert('Note updated successfully!');
        editingNoteId = null;
        noteForm.querySelector('button[type="submit"]').textContent = 'Add Note';
        noteTitleInput.value = '';
        noteContentInput.value = '';
        fetchNotes();
    } catch (err) {
        alert('Error updating note: ' + err.message);
    }
});

// Delete note
window.deleteNote = async (id) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
        const res = await fetch(`${apiBase}/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
        });

        if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Failed to delete note');
        }

        alert('Note deleted successfully!');
        fetchNotes();
    } catch (err) {
        alert('Error deleting note: ' + err.message);
    }
};

// Logout
logoutBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to logout?')){
        localStorage.removeItem(userId);
        localStorage.removeItem('name');
        window.location.href = 'index.html';
    }
});

// On page load fetch notes
fetchNotes();
