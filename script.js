document.addEventListener("DOMContentLoaded", function () {
    console.log("Smart Inventory Script Loaded");
    loadChemicals();
    applySettings();

    const form = document.getElementById("chemicalForm");
    const searchInput = document.getElementById("search");

    // Navigation
    const navLinks = {
        dashboard: document.getElementById('nav-dashboard'),
        reports: document.getElementById('nav-reports'),
        settings: document.getElementById('nav-settings')
    };

    const sections = {
        dashboard: document.getElementById('dashboard-section'),
        reports: document.getElementById('reports-section'),
        settings: document.getElementById('settings-section')
    };

    function setActiveSection(sectionName) {
        // Update Nav Links
        Object.values(navLinks).forEach(link => link.classList.remove('active'));
        if (navLinks[sectionName]) navLinks[sectionName].classList.add('active');

        // Update Sections
        Object.values(sections).forEach(section => section.classList.add('d-none'));
        if (sections[sectionName]) sections[sectionName].classList.remove('d-none');
    }

    if (navLinks.dashboard) navLinks.dashboard.addEventListener('click', (e) => { e.preventDefault(); setActiveSection('dashboard'); });
    if (navLinks.reports) navLinks.reports.addEventListener('click', (e) => { e.preventDefault(); setActiveSection('reports'); });
    if (navLinks.settings) navLinks.settings.addEventListener('click', (e) => { e.preventDefault(); setActiveSection('settings'); });

    // Handle Settings
    const settingsForm = document.getElementById('settings-form');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const defaultLabInput = document.getElementById('defaultLab');

    if (settingsForm) {
        settingsForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const settings = {
                darkMode: darkModeToggle.checked,
                defaultLab: defaultLabInput.value
            };
            localStorage.setItem('inventorySettings', JSON.stringify(settings));
            applySettings();
            alert('Settings Saved!');
        });
    }

    function applySettings() {
        const settings = JSON.parse(localStorage.getItem('inventorySettings')) || {};

        // Dark Mode
        if (settings.darkMode) {
            document.body.classList.add('dark-mode');
            if (darkModeToggle) darkModeToggle.checked = true;
        } else {
            document.body.classList.remove('dark-mode');
            if (darkModeToggle) darkModeToggle.checked = false;
        }

        // Default Lab (Pre-fill in Add Modal)
        if (defaultLabInput) defaultLabInput.value = settings.defaultLab || '';
    }

    // Pre-fill Lab on Modal Open
    const addChemicalModal = document.getElementById('addChemicalModal');
    if (addChemicalModal) {
        addChemicalModal.addEventListener('show.bs.modal', function () {
            const settings = JSON.parse(localStorage.getItem('inventorySettings')) || {};
            const labInput = document.getElementById('lab');
            if (labInput && settings.defaultLab) {
                labInput.value = settings.defaultLab;
            }
        });
    }

    // Handle Form Submission
    if (form) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            console.log("Form submission started");

            if (!form.checkValidity()) {
                console.log("Form validation failed");
                e.stopPropagation();
                form.classList.add('was-validated');
                return;
            }

            let name = document.getElementById("name").value;
            let quantity = document.getElementById("quantity").value;
            let expiry = document.getElementById("expiry").value;
            let lab = document.getElementById("lab").value;
            let hazard = document.getElementById("hazard").value;

            console.log("Form Data:", { name, quantity, expiry, lab, hazard });

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
                    console.log("Server response status:", response.status);
                    if (!response.ok) {
                        return response.json().then(err => { throw new Error(err.error || "Server validation failed") });
                    }
                    return response.json();
                })
                .then(data => {
                    console.log("Chemical added successfully:", data);
                    // Close the modal
                    const modalElement = document.getElementById('addChemicalModal');
                    if (modalElement && typeof bootstrap !== 'undefined') {
                        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                        modalInstance.hide();
                    }

                    // Reset form and reload table
                    form.reset();
                    form.classList.remove('was-validated'); // Reset validation state
                    loadChemicals();
                    alert("Chemical Added Successfully!");
                })
                .catch(error => {
                    console.error('Error adding chemical:', error);
                    alert("Failed to add chemical: " + error.message);
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

    window.loadChemicals = function () {
        let table = document.getElementById("chemicalTable");
        if (!table) return;

        // Clear existing rows but NOT the table header if it was inside tbody (it's not)
        table.innerHTML = "";

        // Add timestamp to prevent caching
        fetch('/api/chemicals?t=' + new Date().getTime())
            .then(response => response.json())
            .then(chemicals => {
                console.log("Loaded chemicals:", chemicals); // Debug log
                let today = new Date().toISOString().split("T")[0];

                // Dashboard Statistics
                let total = chemicals.length;
                let expired = 0;
                let lowStock = 0;

                chemicals.forEach((c) => {
                    let statusBadge = '<span class="badge bg-success">Active</span>';

                    if (c.expiry < today) {
                        statusBadge = '<span class="badge bg-danger">Expired</span>';
                        expired++;
                    } else if (c.quantity < 5) {
                        statusBadge = '<span class="badge bg-warning text-dark">Low Stock</span>';
                        lowStock++;
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

                // Update Dashboard Counters
                const totalCountEl = document.getElementById('total-count');
                const expiredCountEl = document.getElementById('expired-count');
                const lowStockCountEl = document.getElementById('low-stock-count');

                if (totalCountEl) totalCountEl.innerText = total;
                if (expiredCountEl) expiredCountEl.innerText = expired;
                if (lowStockCountEl) lowStockCountEl.innerText = lowStock;

                // Bind Report Export
                const exportBtn = document.getElementById('export-csv-btn');
                if (exportBtn) {
                    // Remove old listener to prevent duplicates if loadChemicals called multiple times
                    const newBtn = exportBtn.cloneNode(true);
                    exportBtn.parentNode.replaceChild(newBtn, exportBtn);

                    newBtn.addEventListener('click', function () {
                        exportToCSV(chemicals);
                    });
                }
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

    function exportToCSV(data) {
        const headers = ["ID", "Name", "Quantity", "Expiry", "Lab", "Hazard"];
        const csvRows = [];
        csvRows.push(headers.join(","));

        data.forEach(row => {
            const values = [
                row.id,
                `"${row.name}"`, // Quote strings to handle commas
                row.quantity,
                row.expiry,
                `"${row.lab}"`,
                row.hazard
            ];
            csvRows.push(values.join(","));
        });

        const csvString = csvRows.join("\n");
        const blob = new Blob([csvString], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("hidden", "");
        a.setAttribute("href", url);
        a.setAttribute("download", "inventory_report.csv");
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
});