import {
    auth,
    db
} from "../firebase/firebase-config.js";

import {
    collection,
    getDocs,
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* ==========================
   ROLE PROTECTION
========================== */

const profileBtn =
document.getElementById("profileBtn");

onAuthStateChanged(auth, async(user)=>{

    if(!user){

        window.location.href =
        "../login.html";

        return;

    }

    const userDoc =
    await getDoc(
        doc(db,"users",user.uid)
    );

    if(!userDoc.exists()){

        window.location.href =
        "../login.html";

        return;

    }

    const data =
    userDoc.data();

    if(data.role !== "user"){

        window.location.href =
        "../admin/dashboard.html";

        return;

    }

    profileBtn.textContent =
    `${data.fullName} ▼`;

});

/* ==========================
   FORECAST DATA
========================== */

let forecastChart;
let distributionChart;

async function loadForecasts(){

    const snapshot =
    await getDocs(
        collection(db,"forecasts")
    );

    const forecasts = [];

    snapshot.forEach((docItem)=>{

        forecasts.push({
            id:docItem.id,
            ...docItem.data()
        });

    });

    populateForecastTable(
        forecasts
    );

    createCharts(
        forecasts
    );

    createInsights(
        forecasts
    );

    updateKPIs(
        forecasts
    );

}

/* ==========================
   KPI CARDS
========================== */

function updateKPIs(forecasts){

    document.getElementById(
        "totalForecasts"
    ).textContent =
    forecasts.length;

    const predictedDemand =
    forecasts.reduce(
        (sum,item)=>
        sum +
        Number(
            item.predictedDemand || 0
        ),
        0
    );

    document.getElementById(
        "predictedDemand"
    ).textContent =
    predictedDemand;

    const reorderCount =
    forecasts.filter(
        item =>
        Number(
            item.reorderQuantity || 0
        ) > 0
    ).length;

    document.getElementById(
        "reorderCount"
    ).textContent =
    reorderCount;

}

/* ==========================
   TABLE
========================== */

function populateForecastTable(
    forecasts
){

    const tableBody =
    document.getElementById(
        "forecastTableBody"
    );

    tableBody.innerHTML = "";

    forecasts.forEach((item)=>{

        let confidenceClass =
        "high";

        if(item.confidence < 90){

            confidenceClass =
            "medium";

        }

        if(item.confidence < 80){

            confidenceClass =
            "low";

        }

        tableBody.innerHTML += `

        <tr>

            <td>
                ${item.materialName || "-"}
            </td>

            <td>
                ${item.currentStock || 0}
            </td>

            <td>
                ${item.predictedDemand || 0}
            </td>

            <td>
                ${item.reorderQuantity || 0}
            </td>

            <td>
                ${item.reorderDate || "-"}
            </td>

            <td>

                <span class="confidence ${confidenceClass}">
                    ${item.confidence || 0}%
                </span>

            </td>

        </tr>

        `;

    });

}

/* ==========================
   CHARTS
========================== */

function createCharts(
    forecasts
){

    const labels =
    forecasts.map(
        item =>
        item.materialName
    );

    const demand =
    forecasts.map(
        item =>
        Number(
            item.predictedDemand || 0
        )
    );

    if(forecastChart){

        forecastChart.destroy();

    }

    if(distributionChart){

        distributionChart.destroy();

    }

    forecastChart =
    new Chart(

        document.getElementById(
            "forecastChart"
        ),

        {

            type:"bar",

            data:{

                labels,

                datasets:[{

                    label:
                    "Forecast Demand",

                    data:demand,

                    borderWidth:1

                }]

            }

        }

    );

    distributionChart =
    new Chart(

        document.getElementById(
            "distributionChart"
        ),

        {

            type:"doughnut",

            data:{

                labels,

                datasets:[{

                    data:demand

                }]

            }

        }

    );

}

/* ==========================
   INSIGHTS
========================== */

function createInsights(
    forecasts
){

    const insights =
    document.getElementById(
        "forecastInsights"
    );

    insights.innerHTML = "";

    const reorderItems =
    forecasts.filter(
        item =>
        Number(
            item.reorderQuantity || 0
        ) > 0
    );

    if(reorderItems.length === 0){

        insights.innerHTML = `
        <li>
            Current inventory levels
            appear sufficient based
            on forecast data.
        </li>
        `;

        return;

    }

    reorderItems.forEach((item)=>{

        insights.innerHTML += `

        <li>

            <strong>
            ${item.materialName}
            </strong>

            may require a reorder of

            <strong>
            ${item.reorderQuantity}
            </strong>

            units before

            <strong>
            ${item.reorderDate}
            </strong>.

        </li>

        `;

    });

}

/* ==========================
   SEARCH
========================== */

document
.getElementById("searchInput")
.addEventListener(
"keyup",
function(){

    const search =
    this.value.toLowerCase();

    const rows =
    document.querySelectorAll(
        "#forecastTableBody tr"
    );

    rows.forEach((row)=>{

        row.style.display =
        row.innerText
        .toLowerCase()
        .includes(search)
        ? ""
        : "none";

    });

});

/* ==========================
   INITIAL LOAD
========================== */

loadForecasts();