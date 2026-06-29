if (!Auth.requireRole('student')) {
  throw new Error('Unauthorized');
}

const headerUser = document.getElementById('headerUser');
const user = Auth.getUser();
headerUser.textContent = '学生：' + user.username;

document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());

const loadingBox = document.getElementById('loadingBox');
const profileCard = document.getElementById('profileCard');
const infoGrid = document.getElementById('infoGrid');

const fields = [
  { key: 'student_no', label: '学号' },
  { key: 'name', label: '姓名' },
  { key: 'gender', label: '性别' },
  { key: 'age', label: '年龄' },
  { key: 'class_name', label: '班级' },
  { key: 'major', label: '专业' },
];

function displayField(value) {
  if (value != null && value !== '') {
    return { text: String(value), empty: false };
  }
  return { text: '暂未填写', empty: true };
}

async function loadProfile() {
  try {
    const res = await api.get('/api/students/me');
    const student = res.data;

    document.getElementById('profileName').textContent = student.name || user.username;
    document.getElementById('profileUsername').textContent = '用户名：' + student.username;

    infoGrid.innerHTML = '';
    fields.forEach(f => {
      const display = displayField(student[f.key]);
      const item = document.createElement('div');
      item.className = 'info-item';
      item.innerHTML = `
        <span class="info-label">${f.label}</span>
        <span class="info-value${display.empty ? ' empty' : ''}">${display.text}</span>
      `;
      infoGrid.appendChild(item);
    });

    loadingBox.classList.add('hidden');
    profileCard.classList.remove('hidden');
  } catch (err) {
    loadingBox.innerHTML = '<p style="color: var(--danger);">' + (err.message || '加载失败') + '</p>';
  }
}

loadProfile();
