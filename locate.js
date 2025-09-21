let allPatients = [];
document.addEventListener("DOMContentLoaded", () => {
    const patientContainer = document.getElementById('patientContainer');
    const form = document.getElementById('searchPatient');
    async function loadPatients() {
        try {
            const response = await fetch('/api/patients');
            allPatients = await response.json();
            displayPatients(allPatients);
        } catch (err) {
            console.error('Lỗi khi load danh sách bệnh nhân:', err);
        }
    }
    loadPatients();
    function displayPatients(patients) {
    patientContainer.innerHTML = '';
    patients.forEach(patient => {
        const card = document.createElement('div');
        card.className = 'patient-card';
        card.innerHTML = `
            <p><strong>Tên:</strong> ${patient.Tên}</p>
            <p><strong>Tuổi:</strong> ${patient.Tuổi}</p>
            <p><strong>Giới tính:</strong> ${patient.GiớiTính}</p>
            <p><strong>Tòa:</strong> ${patient.TòaNhà}</p>
            <p><strong>Tầng:</strong> ${patient.Tầng}</p>
            <p><strong>Phòng:</strong> ${patient.Phòng}</p>
            <p><strong>Giường:</strong> ${patient.Giường}</p>
            <button class="toggleLightBtn">Bật/Tắt đèn</button>
        `;
        card.querySelector('.toggleLightBtn').addEventListener('click', () => toggleLight(patient));
        patientContainer.appendChild(card);
    });
    }
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('searchName').value.trim().toLowerCase();
        const age = document.getElementById('searchAge').value.trim();
        const genderEl = document.querySelector('input[name="searchGender"]:checked');
        const gender = genderEl ? genderEl.value : '';
        const filtered = allPatients.filter(p => {
        return (!name || p.Tên.toLowerCase().includes(name)) &&
               (!age || p.Tuổi == age) &&
               (!gender || p.GiớiTính === gender);
        });
        displayPatients(filtered);
    });
});
async function toggleLight(patient) {
    try {
        const response = await fetch('/api/toggle-light', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                building: patient.TòaNhà,
                floor: patient.Tầng,
                room: patient.Phòng,
                bed: patient.Giường
            })
        });
        const data = await response.json();
        alert(data.message);
    } catch (err) {
        console.error(err);
        alert('Lỗi khi bật/tắt đèn');
    }
}


