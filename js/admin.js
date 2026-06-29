if (!Auth.requireRole('admin')) {
  throw new Error('Unauthorized');
}

const headerUser = document.getElementById('headerUser');
const user = Auth.getUser();
headerUser.textContent = '管理员：' + user.username;

document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());

const loadingBox = document.getElementById('loadingBox');
const tableWrapper = document.getElementById('tableWrapper');
const tableBody = document.getElementById('studentTableBody');
const emptyState = document.getElementById('emptyState');
const modalOverlay = document.getElementById('modalOverlay');
const studentForm = document.getElementById('studentForm');
const searchInput = document.getElementById('searchInput');

let students = [];

function displayValue(val) {
  return val != null && val !== '' ? val : '-';
}

function renderTable() {
  tableBody.innerHTML = '';

  if (students.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    students.forEach(s => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${displayValue(s.student_no)}</td>
        <td>${displayValue(s.name)}</td>
        <td>${displayValue(s.gender)}</td>
        <td>${displayValue(s.age)}</td>
        <td>${displayValue(s.class_name)}</td>
        <td>${displayValue(s.major)}</td>
        <td>${displayValue(s.username)}</td>
        <td>
          <div class="btn-group">
            <button type="button" class="btn btn-secondary btn-sm" data-edit="${s.id}">编辑</button>
            <button type="button" class="btn btn-danger btn-sm" data-delete="${s.id}">删除</button>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  loadingBox.classList.add('hidden');
  tableWrapper.classList.remove('hidden');
}

async function loadStudents(keyword) {
  loadingBox.classList.remove('hidden');
  tableWrapper.classList.add('hidden');

  try {
    const url = keyword
      ? '/api/students?keyword=' + encodeURIComponent(keyword)
      : '/api/students';
    const res = await api.get(url);
    students = res.data;
    renderTable();
  } catch (err) {
    loadingBox.classList.add('hidden');
    alert(err.message || '加载失败');
  }
}

function openModal(mode, student) {
  document.getElementById('modalTitle').textContent = mode === 'add' ? '新增学生' : '编辑学生';
  document.getElementById('editId').value = student ? student.id : '';
  document.getElementById('formUsername').value = student ? student.username : '';
  document.getElementById('formPassword').value = '';
  document.getElementById('formStudentNo').value = student ? (student.student_no || '') : '';
  document.getElementById('formName').value = student ? (student.name || '') : '';
  document.getElementById('formGender').value = student ? (student.gender || '') : '';
  document.getElementById('formAge').value = student && student.age != null ? student.age : '';
  document.getElementById('formClass').value = student ? (student.class_name || '') : '';
  document.getElementById('formMajor').value = student ? (student.major || '') : '';

  const isEdit = mode === 'edit';
  document.getElementById('formPassword').required = !isEdit;
  document.getElementById('pwdHint').classList.toggle('hidden', isEdit);
  document.getElementById('pwdEditHint').classList.toggle('hidden', !isEdit);

  modalOverlay.classList.add('active');
}

function closeModal() {
  modalOverlay.classList.remove('active');
  studentForm.reset();
}

document.getElementById('addBtn').addEventListener('click', () => openModal('add'));
document.getElementById('modalClose').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.getElementById('searchBtn').addEventListener('click', () => {
  loadStudents(searchInput.value.trim());
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    loadStudents(searchInput.value.trim());
  }
});

tableBody.addEventListener('click', async (e) => {
  const editId = e.target.dataset.edit;
  const deleteId = e.target.dataset.delete;

  if (editId) {
    const student = students.find(s => s.id === parseInt(editId, 10));
    if (student) openModal('edit', student);
  }

  if (deleteId) {
    const student = students.find(s => s.id === parseInt(deleteId, 10));
    const name = student ? (student.name || student.username) : '';
    if (!confirm('确定要删除学生「' + name + '」吗？此操作不可恢复。')) return;

    try {
      await api.delete('/api/students/' + deleteId + '?id=' + deleteId);
      await loadStudents(searchInput.value.trim());
    } catch (err) {
      alert(err.message || '删除失败');
    }
  }
});

studentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const saveBtn = document.getElementById('saveBtn');
  const editId = document.getElementById('editId').value;

  const payload = {
    username: document.getElementById('formUsername').value.trim(),
    student_no: document.getElementById('formStudentNo').value.trim(),
    name: document.getElementById('formName').value.trim(),
    gender: document.getElementById('formGender').value,
    age: document.getElementById('formAge').value,
    class_name: document.getElementById('formClass').value.trim(),
    major: document.getElementById('formMajor').value.trim(),
  };

  const password = document.getElementById('formPassword').value;
  if (password) payload.password = password;

  saveBtn.disabled = true;
  saveBtn.textContent = '保存中...';

  try {
    if (editId) {
      await api.put('/api/students/' + editId + '?id=' + editId, payload);
    } else {
      if (!password) {
        alert('新增学生时密码不能为空');
        return;
      }
      payload.password = password;
      await api.post('/api/students', payload);
    }
    closeModal();
    await loadStudents(searchInput.value.trim());
  } catch (err) {
    alert(err.message || '保存失败');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = '保存';
  }
});

loadStudents();
