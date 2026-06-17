import {
auth,
db
} from "../firebase/firebase-config.js";

import {
collection,
getDocs,
doc,
getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* ==========================
PROFILE
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

if(userDoc.exists()){

    const data =
    userDoc.data();

    profileBtn.textContent =
    `${data.fullName} ▼`;

}


});

/* ==========================
DASHBOARD DATA
========================== */

async function loadDashboard(){


const materialsSnapshot =
await getDocs(
    collection(db,"materials")
);

const usageSnapshot =
await getDocs(
    collection(db,"usageRecords")
);

let totalMaterials = 0;
let totalStock = 0;
let lowStock = 0;

materialsSnapshot.forEach((item)=>{

    const data =
    item.data();

    totalMaterials++;

    totalStock +=
    Number(data.quantity || 0);

    if(
        data.status === "Low" ||
        data.status === "Critical"
    ){
        lowStock++;
    }

});

document.getElementById(
    "totalMaterials"
).textContent =
totalMaterials;

document.getElementById(
    "totalStock"
).textContent =
totalStock;

document.getElementById(
    "lowStock"
).textContent =
lowStock;

let health = 100;

if(totalMaterials > 0){

    health =
    Math.round(
        (
            (totalMaterials - lowStock)
            /
            totalMaterials
        ) * 100
    );

}

document.getElementById(
    "inventoryHealth"
).textContent =
health + "%";

createCharts(
    usageSnapshot
);

loadLowStockAlerts(
    materialsSnapshot
);

loadTopConsumed(
    usageSnapshot
);

loadInsights(
    totalMaterials,
    lowStock
);


}

loadDashboard();

/* ==========================
CHARTS
========================== */

function createCharts(snapshot){


const materialUsage = {};

snapshot.forEach((record)=>{

    const data =
    record.data();

    if(
        !materialUsage[
            data.materialName
        ]
    ){

        materialUsage[
            data.materialName
        ] = 0;

    }

    materialUsage[
        data.materialName
    ] += Number(
        data.usedQuantity || 0
    );

});

const labels =
Object.keys(
    materialUsage
);

const values =
Object.values(
    materialUsage
);

new Chart(

    document.getElementById(
        "consumptionChart"
    ),

    {

        type:"bar",

        data:{

            labels:labels,

            datasets:[{

                label:
                "Consumption",

                data:values,

                borderWidth:1

            }]

        }

    }

);

new Chart(

    document.getElementById(
        "forecastChart"
    ),

    {

        type:"doughnut",

        data:{

            labels:labels,

            datasets:[{

                data:values

            }]

        }

    }

);


}

/* ==========================
LOW STOCK ALERTS
========================== */

function loadLowStockAlerts(snapshot){


const tableBody =
document.getElementById(
    "lowStockTableBody"
);

if(!tableBody) return;

tableBody.innerHTML = "";

snapshot.forEach((item)=>{

    const data =
    item.data();

    if(
        data.status === "Low" ||
        data.status === "Critical"
    ){

        const row =
        document.createElement("tr");

        row.innerHTML =
        "<td>" + data.materialName + "</td>" +
        "<td>" + data.quantity + " " + data.unit + "</td>" +
        "<td>" + data.status + "</td>";

        tableBody.appendChild(row);

    }

});


}

/* ==========================
TOP CONSUMED MATERIALS
========================== */

function loadTopConsumed(snapshot){


const tableBody =
document.getElementById(
    "topConsumedTableBody"
);

if(!tableBody) return;

const usageMap = {};

snapshot.forEach((record)=>{

    const data =
    record.data();

    if(
        !usageMap[
            data.materialName
        ]
    ){

        usageMap[
            data.materialName
        ] = 0;

    }

    usageMap[
        data.materialName
    ] += Number(
        data.usedQuantity || 0
    );

});

tableBody.innerHTML = "";

Object.entries(
    usageMap
)

.sort(
    (a,b)=>b[1]-a[1]
)

.slice(0,5)

.forEach((item)=>{

    const row =
    document.createElement("tr");

    row.innerHTML =
    "<td>" + item[0] + "</td>" +
    "<td>" + item[1] + "</td>";

    tableBody.appendChild(row);

});


}

/* ==========================
QUICK INSIGHTS
========================== */

function loadInsights(
totalMaterials,
lowStock
){


const insights =
document.getElementById(
    "insightsList"
);

if(!insights) return;

insights.innerHTML = "";

const insightItems = [

    "Total materials monitored: " +
    totalMaterials,

    "Materials below threshold: " +
    lowStock,

    "Inventory health is actively monitored.",

    "Consumption analytics updated successfully."

];

insightItems.forEach((text)=>{

    const li =
    document.createElement("li");

    li.textContent =
    text;

    insights.appendChild(li);

});


}
