const tableContent = document.getElementById("table").getElementsByTagName('tbody')[0];
const tableButtons = document.getElementById("table").querySelectorAll("th button");
const tableSearch = document.getElementById("table").querySelectorAll("th input[type=text]");

const tableData = [];

const backgroundColor = [
    '#5a94e5',
    '#68c3b9',
    '#f4a257',
    '#e16461',
    '#a265d4'
]

let chartdata = {
    labels: [],
    datasets: [{
        data: [],
        backgroundColor: backgroundColor,
        barThickness: [50],
        maxBarThickness: [100]
    }]
};

const ctx = document.getElementById('myChart');
const ctx2 = document.getElementById('myChart2');

const bgcolorPlugin = {
    id: 'customCanvasBackgroundColor',
    beforeDraw: (chart, args, options) => {
        const { ctx } = chart;
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = options.color || '#99ffff';
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    }
};

const chartOptions = {
    layout: {
        padding: {
            top: 40,
            bottom: 20,
            left: 15,
            right: 15
        }
    },
    plugins: {
        customCanvasBackgroundColor: {
            color: '#fff',
        },
        legend: {
            display: false
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            steps: 20,
        },
        x: {
            grid: {
                display: false
            }
        }
    }
};

let barChart = new Chart(ctx, {
    type: 'bar',
    data: chartdata,
    options: chartOptions,
    plugins: [bgcolorPlugin],
});

let barChart2 = new Chart(ctx2, {
    type: 'bar',
    data: chartdata,
    options: chartOptions,
    plugins: [bgcolorPlugin],
});

async function getJsonDatafromAPI(path = '') {
    if (!path) {
        return 'API path not provided';
    }
    const response = await fetch(path);

    if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
    }

    const data = await response.json();
    return data || 'Technical error';
}

const createRow = (obj) => {
    const row = document.createElement("tr");
    const objKeys = Object.keys(obj);
    objKeys.map((key) => {
        const cell = document.createElement("td");
        cell.setAttribute("data-attr", key);
        cell.innerHTML = obj[key];
        row.appendChild(cell);
    });
    return row;
};

const getTableContent = (data) => {
    data.map((obj) => {
        const row = createRow(obj);
        tableContent.appendChild(row);
    });

    userTyping = document.getElementsByClassName('typing')[0] ?? false;
    userTyping.value = '';

    barChart.data.labels = getDataFromTable('label');
    barChart.data.datasets[0].data = getDataFromTable('installs');
    barChart.update();

    barChart2.data.labels = getDataFromTable('label');
    barChart2.data.datasets[0].data = getDataFromTable('roi');
    barChart2.update();

};

const sortData = (data, param, direction = "asc") => {
    tableContent.innerHTML = '';
    const sortedData =
        direction == "asc"
            ? [...data].sort(function (a, b) {
                if (a[param] < b[param]) {
                    return -1;
                }
                if (a[param] > b[param]) {
                    return 1;
                }
                return 0;
            })
            : [...data].sort(function (a, b) {
                if (b[param] < a[param]) {
                    return -1;
                }
                if (b[param] > a[param]) {
                    return 1;
                }
                return 0;
            });

    getTableContent(sortedData);
};

const resetButtons = (event) => {
    [...tableButtons].map((button) => {
        if (button !== event.target) {
            button.removeAttribute("data-dir");
        }
    });
};

window.addEventListener("load", () => {
    (async function () {
        const companiesJSON = await getJsonDatafromAPI(location.href + 'js/companies.js').then(data => {

            data.map((company, index) => {

                getJsonDatafromAPI(location.href + 'js/performance/countries/company_' + company.id + '.js').then(companydata => {

                    companydata.map((companyInsightsObj) => {

                        tableData.push({
                            'company': company.display_name,
                            'country': companyInsightsObj.country,
                            'installs': companyInsightsObj.installs,
                            'roi': parseFloat(companyInsightsObj.revenue / companyInsightsObj.cost).toFixed(2),
                            'industryroi': ''
                        });

                    });

                    if ((index + 1) === data.length) {
                        getTableContent(tableData);
                    }

                });

            });

            return tableData;

        });

        [...tableButtons].map((button) => {
            button.addEventListener("click", (e) => {
                resetButtons(e);
                if (e.target.getAttribute("data-dir") == "desc") {
                    sortData(companiesJSON, e.target.id, "desc");
                    e.target.setAttribute("data-dir", "asc");
                } else {
                    sortData(companiesJSON, e.target.id, "asc");
                    e.target.setAttribute("data-dir", "desc");
                }
            });
        });

        let tabelCellData;

        function liveSearch(name = 'company') {
            let search_query = document.querySelector('input[name="' + name + '"]').value;

            for (var i = 0; i < tabelCellData.length; i++) {
                if (tabelCellData[i].innerText.toLowerCase()
                    .includes(search_query.toLowerCase())) {
                    tabelCellData[i].parentNode.classList.remove("is-hidden");
                } else {
                    tabelCellData[i].parentNode.classList.add("is-hidden");
                }
            }

            barChart.data.labels = getDataFromTable('label');
            barChart.data.datasets[0].data = getDataFromTable('installs');
            barChart.update();

            barChart2.data.labels = getDataFromTable('label');
            barChart2.data.datasets[0].data = getDataFromTable('roi');
            barChart2.update();
        }

        let typingTimer;
        let typeInterval = 300;

        [...tableSearch].map((searchbox) => {
            searchbox.addEventListener("keyup", (e) => {
                clearTimeout(typingTimer);
                userTyping = document.getElementsByClassName('typing')[0] ?? false;

                if (!userTyping) {
                    e.target.classList.add('typing');
                }

                if (userTyping && !e.target.classList.contains('typing')) {
                    userTyping.value = '';
                    userTyping.classList.remove('typing');
                    e.target.classList.add('typing');
                }

                tabelCellData = tableContent.querySelectorAll('td[data-attr="' + e.target.name + '"]');
                typingTimer = setTimeout(liveSearch(e.target.name), typeInterval);
            });
        });

    })();
});

function getDataFromTable(dataType = 'label') {
    const tableData = [];
    const rows = tableContent.querySelectorAll('tr:not(.is-hidden)');
    let cols, ctr = 0;

    if (!rows) {
        return;
    }

    for (let row of rows) {
        ctr++;

        if (dataType == 'label') {
            cols = `${row.querySelector('[data-attr="company"]').textContent} - ${row.querySelector('[data-attr="country"]').textContent}`;
        }

        if (dataType == 'installs') {
            cols = row.querySelector('[data-attr="installs"]').textContent;
        }

        if (dataType == 'roi') {
            cols = row.querySelector('[data-attr="roi"]').textContent;
        }

        tableData.push(cols);

        if (ctr == 5) {
            break;
        }
    };

    return tableData;
}