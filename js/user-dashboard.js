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
        Number(data.quantity);

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
            ((totalMaterials - lowStock)
            /
            totalMaterials) * 100
        );

    }

    document.getElementById(
        "inventoryHealth"
    ).textContent =
    health + "%";

    createCharts(
        usageSnapshot
    );

}

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
            data.usedQuantity
        );

    });

    const labels =
    Object.keys(materialUsage);

    const values =
    Object.values(materialUsage);

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

                labels,

                datasets:[{

                    data:values

                }]

            }

        }

    );

    generateInsights(
        labels,
        values
    );

}

/* ==========================
   INSIGHTS
========================== */

function generateInsights(
    labels,
    values
){

    const insights =
    document.getElementById(
        "insightsList"
    );

    insights.innerHTML = "";

    if(labels.length === 0){

        insights.innerHTML = `
        <li>
            No consumption records available.
        </li>
        `;

        return;

    }

    let highestIndex = 0;

    for(
        let i = 1;
        i < values.length;
        i++
    ){

        if(
            values[i] >
            values[highestIndex]
        ){

            highestIndex = i;

        }

    }

    insights.innerHTML += `
    <li>
        Most consumed material:
        <strong>
        ${labels[highestIndex]}
        </strong>
    </li>
    `;

    insights.innerHTML += `
    <li>
        Inventory monitoring data
        is updated from Firebase.
    </li>
    `;

    insights.innerHTML += `
    <li>
        Consumption analytics are
        based on usage records.
    </li>
    `;

}

/* ==========================
   INITIAL LOAD
========================== */

loadDashboard();