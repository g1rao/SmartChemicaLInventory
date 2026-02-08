document.addEventListener("DOMContentLoaded", function () {
    loadChemicals();
    const form = document.getElementById("chemicalForm");
    const searchInput = document.getElementById("search");

    // Handle Form Submission
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();

            if (!form.checkValidity()) {
                e.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            let name = document.getElementById("name").value;
            let quantity = document.getElementById("quantity").value;
            let expiry = document.getElementById("expiry").value;
            let lab = document.getElementById("lab").value;
            let hazard = document.getElementById("hazard").value;

            // Extra Logic Check
            if (parseInt(quantity) <= 0) {
                alert("Quantity must be positive!");
                return;
            }

            let chemical = { name, quantity, expiry, lab, hazard };

            fetch('/api/chemicals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(chemical)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Validation Failed on Server");
                    }
                    return response.json();
                })
                .then(data => {
                    // Close the modal
                    const modalElement = document.getElementById('addChemicalModal');
                    const modalInstance = bootstrap.Modal.getInstance(modalElement);
                    modalInstance.hide();

                    // Reset form and reload table
                    form.reset();
                    form.classList.remove('was-validated'); // Reset validation state
                    loadChemicals();

                    // Show success message (optional, could use a toast)
                    // alert("Chemical Added Successfully!"); 
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("Failed to add chemical. Please check input.");
                });
        });
    }

    // Handle Search
    if (searchInput) {
        searchInput.addEventListener("input", function () {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll("#chemicalTable tr");

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? "" : "none";
            });
        });
    }

    function loadChemicals() {
        let table = document.getElementById("chemicalTable");
        if (!table) return;

        table.innerHTML = ""; // Clear existing rows

        fetch('/api/chemicals')
            .then(response => response.json())
            .then(chemicals => {
                let today = new Date().toISOString().split("T")[0];

                chemicals.forEach((c) => {
                    let statusBadge = '<span class="badge bg-success">Active</span>';

                    if (c.expiry < today) {
                        statusBadge = '<span class="badge bg-danger">Expired</span>';
                    } else if (c.quantity < 5) {
                        statusBadge = '<span class="badge bg-warning text-dark">Low Stock</span>';
                    }

                    // Hazard Badge Logic
                    let hazardClass = 'bg-secondary';
                    if (c.hazard === 'High') hazardClass = 'bg-danger';
                    else if (c.hazard === 'Medium') hazardClass = 'bg-warning text-dark';
                    else hazardClass = 'bg-success';

                    let row = `
                        <tr>
                            <td class="fw-bold ps-4 text-dark">${c.name}</td>
                            <td>${c.quantity}</td>
                            <td>${c.expiry}</td>
                            <td>${c.lab}</td>
                            <td><span class="badge ${hazardClass}">${c.hazard}</span></td>
                            <td>${statusBadge}</td>
                            <td class="text-end pe-4">
                                <button class="btn btn-outline-danger btn-sm" onclick="deleteChemical(${c.id})">
                                    🗑 Delete
                                </button>
                            </td>
                        </tr>
                      `;
                    table.innerHTML += row;
                });
            })
            .catch(error => console.error('Error:', error));
    }

    window.deleteChemical = function (id) {
        if (confirm("Are you sure you want to delete this chemical?")) {
            fetch(`/api/chemicals/${id}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (response.ok) {
                        loadChemicals();
                    } else {
                        alert("Failed to delete chemical");
                    }
                })
                .catch(error => console.error('Error:', error));
        }
    };
});