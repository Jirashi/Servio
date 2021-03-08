let measurements = {};
let currentMeasurement = "Length";

// Functions
function convert(unit, value, convert) {
    let measurement = measurements[currentMeasurement.toLowerCase()];
    let formula = measurement["formula"];
    let unitFactor = measurement["units"][unit];
    let convertFactor = measurement["units"][convert];

    document.getElementById('formula-tag').innerText = `${formula.charAt(0).toUpperCase() + formula.slice(1)} Formula`;

    if (formula === "smart") {
        if (unit === convert) {
            document.getElementById('formula').innerText = `${value} ${unit.charAt(0).toUpperCase() + unit.slice(1)} = ${value} ${convert.charAt(0).toUpperCase() + convert.slice(1)}`
            return value;
        } else {
            // The value divided by the convert factor will get us the converted value (kind of), then we need to multiply it by the unit factor to get the correct value.
            // Since all of the factors are based on one unit (the base unit) this works.
            let base = (value / convertFactor) * unitFactor;
    
            document.getElementById('formula').innerText = `(Value / ${convertFactor}) * ${unitFactor}`;
            document.getElementById('results').insertAdjacentHTML('beforeend', 
            `<div class="result">
                <p>${value} ${unit.charAt(0).toUpperCase() + unit.slice(1)}
                <i class="fa fa-refresh"></i> 
                ${base} ${convert.charAt(0).toUpperCase() + convert.slice(1)}</p></div>`);
    
            return parseFloat(base.toFixed(12));
        }
    } else {
        // This should work for every custom formula, I wouldn't know because it's only used for temperature.
        let base = eval(unitFactor[0].replace("x", value));

        // If converting from base to something then use formula 0, else use formula 1
        if (convertFactor[0] === "* 1") {
            base = eval(convertFactor[0].replace("x", base));
        } else {
            base = eval(convertFactor[1].replace("x", base));
        }

        document.getElementById('formula').innerText = convertFactor[1].replace("x", `(${unitFactor[0].replace("x", "Value")})`);
        document.getElementById('results').insertAdjacentHTML('beforeend', 
        `<div class="result">
                <p>${value} ${unit.charAt(0).toUpperCase() + unit.slice(1)}
                <i class="fa fa-refresh"></i> 
                ${base} ${convert.charAt(0).toUpperCase() + convert.slice(1)}</p></div>`);
        
        return parseFloat(base.toFixed(12));
    }
}

function populateUnits(units) {
    for (let select of document.getElementsByClassName('units')) {
        select.innerHTML = "";
        for (let unit in units) {
            let unitHTML = `<option id='${unit}'>${unit.charAt(0).toUpperCase() + unit.slice(1)}</option>`;
            select.insertAdjacentHTML('beforeend', unitHTML);
        }
    }
}

async function initialize() {
    await fetch(new Request("./measurements.json")).then(response => response.json()).then(function(data) {
        for (let measurement in data) {
            measurements[measurement] = data[measurement];
            let measurementHTML = `<option id='${measurement}'>${measurement.charAt(0).toUpperCase() + measurement.slice(1)}</option>`;

            document.getElementById('measurements').insertAdjacentHTML('beforeend', measurementHTML);
        }
    });
    populateUnits(measurements[currentMeasurement.toLowerCase()]["units"]);

    document.getElementById('unit1').value = 1;
    document.getElementById('units1').value = "Foot";
    document.getElementById('units2').value = "Inch";
    
    document.getElementById('measurements').value = currentMeasurement;
    document.getElementById('unit2').value = convert("foot", 1, "inch");
}

// Handlers
document.getElementById('measurements').addEventListener('change', function(e) {
    currentMeasurement = e.target.value;
    populateUnits(measurements[currentMeasurement.toLowerCase()]["units"]);

    document.getElementById('unit1').value = 1;
    document.getElementById('unit2').value = 1;
    document.getElementById('formula-tag').innerText = "Formula";
    document.getElementById('formula').innerText = "Select a unit to convert";
})

for (let select of document.getElementsByClassName('units')) {
    select.addEventListener('change', function(e) {
        let unit = e.target.value.toLowerCase();
        let value = document.getElementById(e.target.id.replace("s", "")).value;
        
        if (e.target.id.split("s")[1] == 1) {
            document.getElementById('unit2').value = convert(
                unit, 
                value, 
                document.getElementById('units2').value.toLowerCase()
            );
        } else if (e.target.id.split("s")[1] == 2) {
            document.getElementById('unit2').value = convert(
                document.getElementById('units1').value.toLowerCase(), 
                document.getElementById('unit1').value, 
                unit
            );
        }
    });
}

for (let textarea of document.getElementsByClassName('unit')) {
    textarea.addEventListener('keyup', function(e) {
        let unit = document.getElementById(e.target.id.replace("t", "ts")).value.toLowerCase();
        let value = e.target.value;

        // This does not really work well
        if (e.target.id.split("t")[1] == 1) {
            document.getElementById('unit2').value = convert(
                unit,
                value,
                document.getElementById('units2').value.toLowerCase()
            );
        } else if (e.target.id.split("t")[1] == 2) {
            document.getElementById('unit2').value = convert(
                document.getElementById('units1').value.toLowerCase(), 
                document.getElementById('unit1').value, 
                unit
            );
        }
    });
}



