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
   ANALYTICS DATA
========================== */

let analyticsChart;
let distributionChart;

async function loadAnalytics(){

    const usageSnapshot =
    await getDocs(
        collection(db,"usageRecords")
    );

    const materialStats = {};

    let totalUsageRecords = 0;
    let totalConsumption = 0;

    usageSnapshot.forEach((record)=>{

        const data = record.data();

        totalUsageRecords++;

        totalConsumption +=
        Number(data.usedQuantity);

        if(!materialStats[data.materialName]){

            materialStats[data.materialName] = {
                total:0,
                frequency:0
            };

        }

        materialStats[data.materialName].total +=
        Number(data.usedQuantity);

        materialStats[data.materialName].frequency++;

    });

    document.getElementById(
        "totalUsageRecords"
    ).textContent =
    totalUsageRecords;

    document.getElementById(
        "totalConsumption"
    ).textContent =
    totalConsumption;

    buildAnalytics(
        materialStats
    );

}

/* ==========================
   BUILD ANALYTICS
========================== */

function buildAnalytics(stats){

    const materials =
    Object.keys(stats);

    if(materials.length === 0){
        return;
    }

    let mostUsed =
    materials[0];

    let leastUsed =
    materials[0];

    materials.forEach((material)=>{

        if(
            stats[material].total >
            stats[mostUsed].total
        ){
            mostUsed = material;
        }

        if(
            stats[material].total <
            stats[leastUsed].total
        ){
            leastUsed = material;
        }

    });

    document.getElementById(
        "mostUsedMaterial"
    ).textContent =
    mostUsed;

    document.getElementById(
        "leastUsedMaterial"
    ).textContent =
    leastUsed;

    populateTable(stats);

    createCharts(stats);

    createInsights(
        stats,
        mostUsed,
        leastUsed
    );

}

/* ==========================
   TABLE
========================== */

function populateTable(stats){

    const tableBody =
    document.getElementById(
        "analyticsTableBody"
    );

    tableBody.innerHTML = "";

    Object.keys(stats)
    .forEach((material)=>{

        const total =
        stats[material].total;

        const frequency =
        stats[material].frequency;

        let status =
        "Low";

        let statusClass =
        "low";

        if(total > 100){

            status =
            "High";

            statusClass =
            "high";

        }else if(total > 50){

            status =
            "Medium";

            statusClass =
            "medium";

        }

        tableBody.innerHTML += `

        <tr>

            <td>${material}</td>

            <td>${total}</td>

            <td>${frequency}</td>

            <td>

                <span class="status ${statusClass}">
                    ${status}
                </span>

            </td>

        </tr>

        `;

    });

}

/* ==========================
   CHARTS
========================== */

function createCharts(stats){

    const labels =
    Object.keys(stats);

    const values =
    labels.map(
        material =>
        stats[material].total
    );

    if(analyticsChart){
        analyticsChart.destroy();
    }

    if(distributionChart){
        distributionChart.destroy();
    }

    analyticsChart =
    new Chart(
        document.getElementById(
            "consumptionChart"
        ),
        {
            type:"bar",
            data:{
                labels,
                datasets:[{
                    label:
                    "Consumption",
                    data:values
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
                    data:values
                }]
            }
        }
    );

}

/* ==========================
   INSIGHTS
========================== */

function createInsights(
    stats,
    mostUsed,
    leastUsed
){

    const insights =
    document.getElementById(
        "insightsList"
    );

    insights.innerHTML = "";

    insights.innerHTML += `
    <li>
        Most consumed material:
        <strong>${mostUsed}</strong>
    </li>
    `;

    insights.innerHTML += `
    <li>
        Least consumed material:
        <strong>${leastUsed}</strong>
    </li>
    `;

    insights.innerHTML += `
    <li>
        Consumption analytics generated
        from historical usage records.
    </li>
    `;

    insights.innerHTML += `
    <li>
        High consumption materials may
        require earlier reordering.
    </li>
    `;

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
        "#analyticsTableBody tr"
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

loadAnalytics();