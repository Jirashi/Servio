let measurements = {};
let currentMeasurement = "Length";

let unit1 = document.getElementById('unit1');
let unit2 = document.getElementById('unit2');
let units1 = document.getElementById('units1');
let units2 = document.getElementById('units2');

// Functions
function convert(unit, value, convert) {
    value = parseFloat(value);
    if (value && unit && convert) {
        let measurement = measurements[currentMeasurement.toLowerCase()];
        let formula = measurement["formula"];
        let unitFactor = measurement["units"][unit];
        let convertFactor = measurement["units"][convert];

        let results = document.getElementById('results');

        document.getElementById('formula-tag').innerText = `${formula.charAt(0).toUpperCase() + formula.slice(1)} Formula`;

        if (formula === "smart") {
            if (unit === convert) {
                document.getElementById('formula').innerText = `${value} ${unit.charAt(0).toUpperCase() + unit.slice(1)} = ${value} ${convert.charAt(0).toUpperCase() + convert.slice(1)}`
                return value;
            } else {
                // The value divided by the convert factor will get us the converted value (kind of), then we need to multiply it by the unit factor to get the correct value.
                // Since all of the factors are based on one unit (the base unit) this works.
                let base = (value / convertFactor) * unitFactor;
        
                document.getElementById('formula').innerText = 
                `(Value / ${convertFactor}) * ${unitFactor}`;

                if (results.childNodes.length === 13) 
                { results.removeChild(results.childNodes[3]); }

                results.insertAdjacentHTML('beforeend',
                `<div class="result" onclick="copyResult(${base}, this)">
                    <p>${parseFloat(Number(value).toFixed(12))} ${unit.charAt(0).toUpperCase() + unit.slice(1)}
                    <i class="fa fa-exchange"></i> 
                    ${base} ${convert.charAt(0).toUpperCase() + convert.slice(1)}</p></div>`
                );
        
                return parseFloat(base.toFixed(12));
            }
        } else {
            // This should work for every custom formula, I wouldn't know because it's only used for temperature.
            let base = eval(unitFactor[0].replace("x", value));

            // If converting from base to something then use formula 0, else use formula 1
            if (convertFactor[0] === "* 1") { base = eval(convertFactor[0].replace("x", base)); } 
            else { base = eval(convertFactor[1].replace("x", base)); }

            document.getElementById('formula').innerText = 
            convertFactor[1].replace("x", `(${unitFactor[0].replace("x", "Value")})`);

            if (results.childNodes.length === 13) 
            { results.removeChild(results.childNodes[3]); }

            results.insertAdjacentHTML('beforeend', 
            `<div class="result" onclick="copyResult(${base}, this)">
                    <p>${value} ${unit.charAt(0).toUpperCase() + unit.slice(1)}
                    <i class="fa fa-refresh"></i> 
                    ${base} ${convert.charAt(0).toUpperCase() + convert.slice(1)}</p></div>`
            );
            
            return parseFloat(base.toFixed(12));
        }
    } else {
        return 0;
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

    unit1.value = 1;
    units1.value = "Foot";
    units2.value = "Inch";
    
    document.getElementById('measurements').value = currentMeasurement;
    unit2.value = convert("foot", 1, "inch");
}

function copyResult(result, target) {
    let dummyInput = document.createElement("input");
    let resultText = target.innerHTML;

    document.body.appendChild(dummyInput);
    dummyInput.setAttribute("id", "dummyInput"); document.getElementById("dummyInput").value = result;
    dummyInput.select(); document.execCommand("copy");
    document.body.removeChild(dummyInput);

    target.style.backgroundColor = "#ff7805";
    target.style.border = "1px solid #ff7805"
    target.innerHTML = `<p><i class="fa fa-copy"></i> Copied to Clipboard</p>`;

    if (document.body.classList[0] === "dark") 
    {target.style.color = "#222222"; } 
    else { target.style.color = "#ffffff"; }

    target.addEventListener('mouseleave', function() {
        target.innerHTML = resultText;
        target.setAttribute('style', "");
        
        target.removeEventListener("mouseleave", function(){}); 
    });
}

function search() {
    let searchFrom = document.getElementById('search-from').value.toLowerCase();
    let searchTo = document.getElementById('search-to').value.toLowerCase();
    
    let measurement = "";
    for (let m in measurements) {
        let keys = Object.keys(measurements[m]["units"]);
        if (keys.includes(searchFrom) && keys.includes(searchTo)) {
            measurement = m;
        }
    }

    if (measurement) {
        currentMeasurement = measurement.charAt(0).toUpperCase() + measurement.slice(1);
        document.getElementById('measurements').value = measurement.charAt(0).toUpperCase() + measurement.slice(1);
        populateUnits(measurements[currentMeasurement.toLowerCase()]["units"]);

        units1.value = searchFrom.charAt(0).toUpperCase() + searchFrom.slice(1);
        units2.value = searchTo.charAt(0).toUpperCase() + searchTo.slice(1);

        unit2.value = convert(searchFrom, unit1.value, searchTo);
        
    } else {
        return;
    }
}

// Handlers
document.getElementById('measurements').addEventListener('change', function(e) {
    currentMeasurement = e.target.value;
    populateUnits(measurements[currentMeasurement.toLowerCase()]["units"]);

    unit1.value = 1;
    unit2.value = 1;
    document.getElementById('formula-tag').innerText = "Formula";
    document.getElementById('formula').innerText = "Select a unit to convert";
})

for (let select of document.getElementsByClassName('units')) {
    select.addEventListener('change', function(e) {
        let unit = e.target.value.toLowerCase();
        let value = document.getElementById(e.target.id.replace("s", "")).value;
        
        if (e.target.id.split("s")[1] == 1) {
            unit2.value = convert(
                unit, 
                value, 
                units2.value.toLowerCase()
            );
        } else if (e.target.id.split("s")[1] == 2) {
            unit2.value = convert(
                units1.value.toLowerCase(), 
                unit1.value, 
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
            unit2.value = convert(
                unit, 
                value, 
                units2.value.toLowerCase()
            );
        } else if (e.target.id.split("t")[1] == 2) {
            unit2.value = convert(
                units1.value.toLowerCase(), 
                unit1.value, 
                unit
            );
        }
    });
}

document.getElementById('theme').addEventListener('click', function(e) {
    if (e.target.classList[1] === "fa-sun-o") 
    { e.target.className = "fa fa-moon-o"; document.body.className = "dark"; } 
    else { e.target.className = "fa fa-sun-o"; document.body.className = "light"; }
})

document.getElementById('convert-symbol').addEventListener('click', function() {
    let value1 = unit1.value; let value2 = unit2.value;
    let side1 = units1.value; let side2 = units2.value;

    unit1.value = value2; unit2.value = value1;
    units1.value = side2; units2.value = side1;
});
