document.addEventListener('DOMContentLoaded', () => {
    let osColors = {};

    function getRandomColor(os) {
        if (osColors[os]) {
            return osColors[os];
        }
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        osColors[os] = color;
        return color;
    }

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const osData = data;
            const osKeys = Object.keys(osData[0]).filter(key => key !== 'Date');

            // Populate OS Checkboxes
            const osCheckboxesDiv = document.getElementById('os-checkboxes');
            osKeys.forEach(os => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = os;
                checkbox.checked = ['Windows', 'Android', 'iOS', 'OS X'].includes(os);
                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(os));
                osCheckboxesDiv.appendChild(label);
            });

            // Initialize Date Inputs
            const startDateInput = document.getElementById('start-date');
            const endDateInput = document.getElementById('end-date');
            startDateInput.value = '2009-01-01';
            endDateInput.value = '2025-01-01';

            // Initialize Chart
            const chartCanvas = document.getElementById('osChart').getContext('2d');
            let osChart = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: []
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { x: { display: true, title: { display: true, text: 'Date' } }, y: { display: true, title: { display: true, text: 'Market Share (%)' } } },
                    plugins: { title: { display: true, text: 'Operating System Market Share Over Time' }, tooltip: { mode: 'index', intersect: false } }
                }
            });

            // Function to update chart and table
            function updateChartAndTable() {
                const selectedOses = Array.from(osCheckboxesDiv.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(endDateInput.value);

                const filteredData = osData.filter(item => new Date(item.Date) >= startDate && new Date(item.Date) <= endDate);

                const chartLabels = filteredData.map(item => item.Date);
                const chartDatasets = selectedOses.map(os => ({
                    label: os,
                    data: filteredData.map(item => item[os]),
                    borderColor: getRandomColor(os),
                    fill: false,
                    tension: 0.4
                }));

                osChart.data.labels = chartLabels;
                osChart.data.datasets = chartDatasets;
                osChart.update();

                // Update Table
                const tableBody = document.getElementById('osTable').querySelector('tbody');
                tableBody.innerHTML = '';

                const headerRow = document.createElement('tr');
                const dateHeader = document.createElement('th');
                dateHeader.textContent = 'Date';
                headerRow.appendChild(dateHeader);

                selectedOses.forEach(os => {
                    const th = document.createElement('th');
                    th.textContent = os;
                    headerRow.appendChild(th);
                });
                tableBody.appendChild(headerRow);

                filteredData.forEach(item => {
                    const row = document.createElement('tr');
                    const dateCell = document.createElement('td');
                    dateCell.textContent = item.Date;
                    row.appendChild(dateCell);

                    selectedOses.forEach(os => {
                        const dataCell = document.createElement('td');
                        dataCell.textContent = item[os];
                        row.appendChild(dataCell);
                    });
                    tableBody.appendChild(row);
                });
            }

            // Event listeners for checkboxes and date inputs
            osCheckboxesDiv.addEventListener('change', updateChartAndTable);
            startDateInput.addEventListener('change', updateChartAndTable);
            endDateInput.addEventListener('change', updateChartAndTable);

            // Initial chart and table rendering
            updateChartAndTable();

            // Function to generate a random color for each OS line
            function getRandomColor() {
                const letters = '0123456789ABCDEF';
                let color = '#';
                for (let i = 0; i < 6; i++) {
                    color += letters[Math.floor(Math.random() * 16)];
                }
                return color;
            }

            // CSV Download Function
            document.getElementById('downloadCsv').addEventListener('click', () => {
                const selectedOses = Array.from(osCheckboxesDiv.querySelectorAll('input[type="checkbox"]:checked')).map(checkbox => checkbox.value);
                const startDate = new Date(startDateInput.value);
                const endDate = new Date(endDateInput.value);

                const filteredData = osData.filter(item => new Date(item.Date) >= startDate && new Date(item.Date) <= endDate);

                let csvContent = "data:text/csv;charset=utf-8,";
                const headerArray = ['Date', ...selectedOses];
                csvContent += headerArray.join(',') + '\r\n';

                filteredData.forEach(item => {
                    const rowData = [item.Date, ...selectedOses.map(os => item[os])];
                    csvContent += rowData.join(',') + '\r\n';
                });

                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "os-market-share.csv");
                document.body.appendChild(link);
                link.click();
            });

            // Theme Toggle Functionality
            const themeToggle = document.getElementById('theme-toggle');
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('dark-theme');
                document.body.classList.toggle('light-theme');

                const tableHeaders = document.querySelectorAll('#osTable th');
                const tableDataCells = document.querySelectorAll('#osTable td');

                if (document.body.classList.contains('dark-theme')) {
                    tableHeaders.forEach(header => header.style.backgroundColor = '#444');
                    tableDataCells.forEach(cell => cell.style.color = '#eee');
                } else {
                    tableHeaders.forEach(header => header.style.backgroundColor = '#f2f2f2');
                    tableDataCells.forEach(cell => cell.style.color = '#000');
                }
            });
        })
        .catch(error => console.error('Error loading data:', error));
});
