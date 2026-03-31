// Check if already authenticated via session storage token dummy
document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('adminToken');
    if (token) {
        showDashboard();
    }
});

async function login() {
    const pwd = document.getElementById('adminPassword').value;
    const btn = document.querySelector('#loginSection button');
    
    if(!pwd) return;
    
    btn.innerHTML = '<span>Verifying...</span>';
    document.getElementById('loginError').style.display = 'none';

    try {
        // Attempt Serverless Backend Login Check
        const res = await fetch('/.netlify/functions/login', {
            method: 'POST',
            body: JSON.stringify({ password: pwd })
        });

        if (res.ok) {
            const data = await res.json();
            sessionStorage.setItem('adminToken', data.token); // Store secure token
            showDashboard();
        } else {
            document.getElementById('loginError').style.display = 'block';
            document.getElementById('adminPassword').value = '';
        }
    } catch (e) {
        console.error('Login backend not reachable. Fallback to offline mode for testing.');
        // Fallback for local testing without Netlify dev
        if (pwd === 'admin123') {
            sessionStorage.setItem('adminToken', 'offline-test-token');
            showDashboard();
        } else {
            document.getElementById('loginError').style.display = 'block';
        }
    }
    btn.innerHTML = '<span>Authenticate Securely</span>';
}

function logout() {
    sessionStorage.removeItem('adminToken');
    document.getElementById('loginSection').style.display = 'block';
    document.getElementById('dashboardSection').style.display = 'none';
    document.getElementById('adminPassword').value = '';
}

function showDashboard() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    renderAdminList();
}

function renderAdminList() {
    const list = document.getElementById('adminProjectsList');
    const projects = JSON.parse(localStorage.getItem('portfolioProjects')) || [];
    
    list.innerHTML = `<h3>Current Projects (${projects.length})</h3>`;
    
    projects.forEach(p => {
        list.innerHTML += `
            <div class="project-item">
                <div>
                    <div style="font-weight:bold; color:#fff;">${p.title}</div>
                    <div style="font-size:0.75rem; color:var(--muted);">${p.tag}</div>
                </div>
                <div class="project-item actions">
                    <button class="btn-danger" onclick="deleteProject(${p.id})">Delete</button>
                </div>
            </div>
        `;
    });
}

function addProject() {
    const title = document.getElementById('pTitle').value;
    const desc = document.getElementById('pDesc').value;
    const tag = document.getElementById('pTag').value;
    const img = document.getElementById('pImg').value;
    const url = document.getElementById('pUrl').value;
    
    if(!title || !desc || !img) {
        alert("Please fill in Title, Description, and Image URL");
        return;
    }
    
    let projects = JSON.parse(localStorage.getItem('portfolioProjects')) || [];
    const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
    
    projects.push({
        id: newId,
        title, desc, tag, img, url
    });
    
    localStorage.setItem('portfolioProjects', JSON.stringify(projects));
    
    // Clear inputs
    document.getElementById('pTitle').value = '';
    document.getElementById('pDesc').value = '';
    document.getElementById('pImg').value = '';
    document.getElementById('pUrl').value = '';
    
    renderAdminList();
}

function deleteProject(id) {
    if(confirm('Are you sure you want to delete this project?')) {
        let projects = JSON.parse(localStorage.getItem('portfolioProjects')) || [];
        projects = projects.filter(p => p.id !== id);
        localStorage.setItem('portfolioProjects', JSON.stringify(projects));
        renderAdminList();
    }
}
