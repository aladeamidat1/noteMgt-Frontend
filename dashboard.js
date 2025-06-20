const apiBase = 'http://localhost:8080/api';
const userId = localStorage.getItem('userId');
const userName = localStorage.getItem('name');
const notesContainer = document.getElementById('notes-container');
const noteForm = document.getElementById('note-form');
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');
const submitBtn = noteForm.querySelector('button[type="submit"]');

let editingNoteId = null;


if (!userId) {
    alert('You are not logged in! Redirecting to login page...');
    window.location.href = 'index.html';
}

userNameSpan.textContent = userName;


function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}


async function fetchNotes() {
    try {
        const res = await fetch(`${apiBase}/users/${userId}/notes`);
        if (!res.ok) throw new Error('Failed to fetch notes');
        const notes = await res.json();
        renderNotes(notes);
    } catch (err) {
        alert('Error fetching notes: ' + err.message);
    }
}


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


noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();

    if (!title || !content) return alert('Please fill in both title and content.');

    try {
        if (editingNoteId) {
        
            const res = await fetch(`${apiBase}/${editingNoteId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, userId }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to update note');
            }
            alert('Note updated successfully!');
        } else {
            
            const res = await fetch(`${apiBase}/addNotes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content, userId }),
            });
            console.log(res)
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Failed to add note');
            }
            alert('Note added successfully!');
        }

        
        editingNoteId = null;
        noteTitleInput.value = '';
        noteContentInput.value = '';
        submitBtn.textContent = 'Add Note';
        fetchNotes();
    } catch (err) {
        alert('Error: ' + err.message);
    }
});


window.editNote = (id, title, content) => {
    editingNoteId = id;
    noteTitleInput.value = title;
    noteContentInput.value = content;
    submitBtn.textContent = 'Update Note';
};


window.deleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
        const res = await fetch(`${apiBase}/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'userId': userId
            },

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


logoutBtn.addEventListener('click', () => {
    if(confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userId');
        localStorage.removeItem('name');
        window.location.href = 'index.html';
    }
});


fetchNotes();