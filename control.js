document.addEventListener("DOMContentLoaded", () => {
    const searchForm = document.getElementById('searchPatient');
    const infoDiv = document.getElementById('patientInfo');
    const infoText = document.getElementById('infoText');
    const toggleBtn = document.getElementById('toggleLight');

    let currentPatient = null;

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('searchName').value.trim();
        const age = document.getElementById('searchAge').value.trim();
        const gender = document.querySelector('input[name="searchGender"]:checked')?.value;

        if (!name) return alert("Nhập tên bệnh nhân");

        const query = new URLSearchParams({ name, age, gender }).toString();
        fetch(`/api/find-patient?${query}`)
            .then(res => res.json())
            .then(data => {
                if (!data.found) {
                    alert("Không tìm thấy bệnh nhân");
                    infoDiv.style.display = 'none';
                    return;
                }
                currentPatient = data.patient;
                infoText.textContent = `Bệnh nhân: ${currentPatient.name}, Tuổi: ${currentPatient.age}, Giới tính: ${currentPatient.gender}, 
                Tòa: ${currentPatient.building}, Tầng: ${currentPatient.floor}, Phòng: ${currentPatient.room}, Giường: ${currentPatient.bed}`;
                infoDiv.style.display = 'block';
            })
            .catch(err => {
                console.error(err);
                alert("Có lỗi xảy ra khi tìm bệnh nhân");
            });
    });

    toggleBtn.addEventListener('click', () => {
        if (!currentPatient) return alert("Chưa có bệnh nhân nào được chọn");

        fetch('/api/toggle-light', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                building: currentPatient.building,
                floor: currentPatient.floor,
                room: currentPatient.room,
                bed: currentPatient.bed
            })
        })
        .then(res => res.json())
        .then(data => alert(data.message))
        .catch(err => console.error(err));
    });
});
