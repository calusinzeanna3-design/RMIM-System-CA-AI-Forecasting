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
   LOAD REPORTS
========================== */

async function loadReports(){

    await loadInventoryReport();

    await loadForecastReport();

    await generateRecommendations();

}

/* ==========================
   INVENTORY REPORT
========================== */

async function loadInventoryReport(){

    const snapshot =
    await getDocs(
        collection(db,"materials")
    );

    const inventoryBody =
    document.getElementById(
        "inventoryReportBody"
    );

    const lowStockBody =
    document.getElementById(
        "lowStockReportBody"
    );

    inventoryBody.innerHTML = "";
    lowStockBody.innerHTML = "";

    let totalMaterials = 0;
    let lowStockItems = 0;

    snapshot.forEach((item)=>{

        const data =
        item.data();

        totalMaterials++;

        let statusClass =
        "available";

        if(data.status==="Low"){
            statusClass="low";
            lowStockItems++;
        }

        if(data.status==="Critical"){
            statusClass="critical";
            lowStockItems++;
        }

        inventoryBody.innerHTML += `

        <tr>

            <td>${data.materialName}</td>

            <td>${data.quantity}</td>

            <td>${data.unit}</td>

            <td>

                <span class="status ${statusClass}">
                    ${data.status}
                </span>

            </td>

        </tr>

        `;

        if(
            data.status==="Low" ||
            data.status==="Critical"
        ){

            const suggestedReorder =
            data.minimumThreshold * 2;

            lowStockBody.innerHTML += `

            <tr>

                <td>${data.materialName}</td>

                <td>${data.quantity}</td>

                <td>${data.minimumThreshold}</td>

                <td>${suggestedReorder}</td>

            </tr>

            `;

        }

    });

    document.getElementById(
        "totalMaterials"
    ).textContent =
    totalMaterials;

    document.getElementById(
        "lowStockItems"
    ).textContent =
    lowStockItems;

}

/* ==========================
   FORECAST REPORT
========================== */

async function loadForecastReport(){

    const forecastBody =
    document.getElementById(
        "forecastReportBody"
    );

    forecastBody.innerHTML = "";

    const snapshot =
    await getDocs(
        collection(db,"forecasts")
    );

    let forecastCount = 0;

    snapshot.forEach((item)=>{

        const data =
        item.data();

        forecastCount++;

        forecastBody.innerHTML += `

        <tr>

            <td>
                ${data.materialName}
            </td>

            <td>
                ${data.predictedDemand}
            </td>

            <td>
                ${data.reorderQuantity}
            </td>

            <td>
                ${data.confidence}%
            </td>

        </tr>

        `;

    });

    document.getElementById(
        "forecastRecommendations"
    ).textContent =
    forecastCount;

}

/* ==========================
   USAGE RECORDS COUNT
========================== */

async function loadUsageCount(){

    const snapshot =
    await getDocs(
        collection(db,"usageRecords")
    );

    document.getElementById(
        "totalUsageRecords"
    ).textContent =
    snapshot.size;

}

/* ==========================
   DECISION SUPPORT
========================== */

async function generateRecommendations(){

    const recommendationList =
    document.getElementById(
        "decisionSupportList"
    );

    recommendationList.innerHTML = "";

    const materials =
    await getDocs(
        collection(db,"materials")
    );

    materials.forEach((item)=>{

        const data =
        item.data();

        if(data.status==="Critical"){

            recommendationList.innerHTML += `

            <li>

                <strong>
                ${data.materialName}
                </strong>

                is critically low.
                Immediate reorder is recommended.

            </li>

            `;

        }

        else if(data.status==="Low"){

            recommendationList.innerHTML += `

            <li>

                <strong>
                ${data.materialName}
                </strong>

                is below threshold.
                Reordering is recommended.

            </li>

            `;

        }

    });

    if(
        recommendationList.innerHTML === ""
    ){

        recommendationList.innerHTML = `

        <li>

            Current inventory levels
            are sufficient.

        </li>

        `;

    }

}

/* ==========================
   PRINT REPORT
========================== */

document
.getElementById("printBtn")
.addEventListener(
"click",
()=>{

    window.print();

}
);

/* ==========================
   INITIAL LOAD
========================== */

loadReports();
loadUsageCount();
document
.getElementById("exportPdfBtn")
.addEventListener(
"click",
()=>{

    const element =
    document.getElementById(
        "printArea"
    );

    const options = {

        margin:10,

        filename:
        "RMIMS_Report.pdf",

        html2canvas:{
            scale:2
        },

        jsPDF:{
            unit:"mm",
            format:"a4",
            orientation:"portrait"
        }

    };

    html2pdf()
    .set(options)
    .from(element)
    .save();

});
document
.getElementById("exportExcelBtn")
.addEventListener(
"click",
()=>{

    const table =
    document.getElementById(
        "inventoryReportTable"
    );

    const workbook =
    XLSX.utils.table_to_book(
        table,
        {
            sheet:
            "Inventory Report"
        }
    );

    XLSX.writeFile(
        workbook,
        "RMIMS_Report.xlsx"
    );

});