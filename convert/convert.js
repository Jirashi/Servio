let measurements = {};
let container = document.getElementById('container');

async function convertFromParams() {
    await fetch(new Request("../measurements.json")).then(response => response.json()).then(function(data) {
        for (let measurement in data) { measurements[measurement] = data[measurement]; }
    });

    let urlParams = new URLSearchParams(window.location.search);
    let request = [urlParams.get("amount"), urlParams.get("from"), urlParams.get("to")];

    if (request[0] && request[1] && request[2]) {
        let conversion = convert(request[1], request[0], request[2]);
        if (conversion === "err") {
            container.innerHTML = `<h1>Could not convert</h1>`;
        } else {
            container.innerHTML = 
            `<h1>${request[0]} ${request[1].charAt(0).toUpperCase() + request[1].slice(1)} 
            <i class="fa fa-exchange"></i> 
            ${conversion} ${request[2].charAt(0).toUpperCase() + request[2].slice(1)}`
        }
    } else {
        container.innerHTML = `<h1>Could not find URL params</h1>`;
    }
}

function convert(unit, value, convert) {
    value = parseInt(value);
    if (value && unit && convert) {
        let measurement = "";
        for (let m in measurements) {
            let keys = Object.keys(measurements[m]["units"]);
            if (keys.includes(unit) && keys.includes(convert)) {
                measurement = measurements[m];
            }
        }

        if (measurement) {
            let formula = measurement["formula"];
            let unitFactor = measurement["units"][unit];
            let convertFactor = measurement["units"][convert];
            
            if (formula === "smart") {
                if (unit === convert) {
                    return value;
                } else {
                    let base = (value / convertFactor) * unitFactor;

                    return parseFloat(base.toFixed(12));
                }
            } else {
                let base = eval(unitFactor[0].replace("x", value));
                if (convertFactor[0] === "* 1") { base = eval(convertFactor[0].replace("x", base)); } 
                else { base = eval(convertFactor[1].replace("x", base)); }

                return parseFloat(base.toFixed(12));
            }
        } else { return "err"; }
    } else { return "err"; }
}