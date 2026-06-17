import {
    auth,
    db
} from "../firebase/firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    doc,
    getDoc,
    serverTimestamp
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* ==========================
   PROFILE LOADING
========================== */

const profileBtn =
document.getElementById("profileBtn");

onAuthStateChanged(auth, async (user)=>{

    if(!user){
        window.location.href="../login.html";
        return;
    }

    const userDoc =
    await getDoc(
        doc(db,"users",user.uid)
    );

    if(userDoc.exists()){

        const data =
        userDoc.data();

        profileBtn.textContent =
        `${data.fullName} ▼`;

    }

});

/* ==========================
   CHART VARIABLES
========================== */

let forecastChart;
let distributionChart;

/* ==========================
   GENERATE FORECAST
========================== */

document
.getElementById("generateForecastBtn")
.addEventListener(
"click",
generateForecast
);

async function generateForecast(){

    const usageSnapshot =
    await getDocs(
        collection(db,"usageRecords")
    );

    const materialsSnapshot =
    await getDocs(
        collection(db,"materials")
    );

    const usageStats = {};

    usageSnapshot.forEach((record)=>{

        const data =
        record.data();

        if(!usageStats[data.materialName]){

            usageStats[data.materialName] = {
                total:0,
                count:0
            };

        }

        usageStats[data.materialName].total +=
        Number(data.usedQuantity);

        usageStats[data.materialName].count++;

    });

    const forecasts = [];

    for(const material of materialsSnapshot.docs){

        const materialData =
        material.data();

        const materialName =
        materialData.materialName;

        const currentStock =
        materialData.quantity;

        const usageData =
        usageStats[materialName];

        let predictedDemand = 0;

        if(usageData){

            predictedDemand =
            Math.round(
                usageData.total /
                usageData.count
            );

        }

        const reorderQuantity =
        Math.max(
            predictedDemand -
            currentStock,
            0
        );

        const confidence =
        predictedDemand > 0
        ? 95
        : 70;

        const reorderDate =
        getSuggestedDate(7);

        forecasts.push({

            materialName,

            currentStock,

            predictedDemand,

            reorderQuantity,

            reorderDate,

            confidence

        });

        await addDoc(
            collection(db,"forecasts"),
            {

                materialName,

                currentStock,

                predictedDemand,

                reorderQuantity,

                reorderDate,

                confidence,

                createdAt:
                serverTimestamp()

            }
        );

    }

    populateForecastTable(
        forecasts
    );

    createForecastCharts(
        forecasts
    );

    createForecastInsights(
        forecasts
    );

    document.getElementById(
        "totalForecasts"
    ).textContent =
    forecasts.length;

    document.getElementById(
        "predictedDemand"
    ).textContent =
    forecasts.reduce(
        (sum,item)=>
        sum + item.predictedDemand,
        0
    );

    document.getElementById(
        "reorderCount"
    ).textContent =
    forecasts.filter(
        item =>
        item.reorderQuantity > 0
    ).length;

    alert(
        "Forecast Generated Successfully"
    );

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

    tableBody.innerHTML="";

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
                ${item.materialName}
            </td>

            <td>
                ${item.currentStock}
            </td>

            <td>
                ${item.predictedDemand}
            </td>

            <td>
                ${item.reorderQuantity}
            </td>

            <td>
                ${item.reorderDate}
            </td>

            <td>

                <span class="confidence ${confidenceClass}">
                    ${item.confidence}%
                </span>

            </td>

        </tr>

        `;

    });

}

/* ==========================
   CHARTS
========================== */

function createForecastCharts(
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
        item.predictedDemand
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
                    data:demand
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

function createForecastInsights(
    forecasts
){

    const insights =
    document.getElementById(
        "forecastInsights"
    );

    insights.innerHTML = "";

    forecasts.forEach((item)=>{

        if(
            item.reorderQuantity > 0
        ){

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

        }

    });

    if(
        insights.innerHTML === ""
    ){

        insights.innerHTML =
        `
        <li>
            Current inventory levels
            are sufficient based on
            forecast demand.
        </li>
        `;

    }

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
   DATE HELPER
========================== */

function getSuggestedDate(days){

    const date =
    new Date();

    date.setDate(
        date.getDate() + days
    );

    return date
    .toISOString()
    .split("T")[0];

}