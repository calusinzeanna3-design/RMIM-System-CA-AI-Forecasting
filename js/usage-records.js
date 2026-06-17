import {
    auth,
    db
} from "../firebase/firebase-config.js";

import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    getDoc,
    updateDoc,
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
   LOAD MATERIALS
========================== */

async function loadMaterials(){

    const materialSelect =
    document.getElementById(
        "materialSelect"
    );

    materialSelect.innerHTML =
    `<option value="">
        Select Material
    </option>`;

    const snapshot =
    await getDocs(
        collection(db,"materials")
    );

    snapshot.forEach((material)=>{

        const data =
        material.data();

        materialSelect.innerHTML += `
        <option value="${material.id}">
            ${data.materialName}
        </option>
        `;

    });

}

/* ==========================
   RECORD USAGE
========================== */

document
.getElementById("saveUsageBtn")
.addEventListener(
"click",
async ()=>{

    const materialId =
    document.getElementById(
        "materialSelect"
    ).value;

    const usedQuantity =
    Number(
        document.getElementById(
            "usedQuantity"
        ).value
    );

    const usageDate =
    document.getElementById(
        "usageDate"
    ).value;

    const remarks =
    document.getElementById(
        "remarks"
    ).value;

    if(
        !materialId ||
        !usedQuantity ||
        !usageDate
    ){
        alert(
            "Please complete all fields."
        );
        return;
    }

    const materialRef =
    doc(
        db,
        "materials",
        materialId
    );

    const materialSnap =
    await getDoc(materialRef);

    if(!materialSnap.exists()){
        alert("Material not found.");
        return;
    }

    const materialData =
    materialSnap.data();

    const newQuantity =
    materialData.quantity -
    usedQuantity;

    if(newQuantity < 0){
        alert(
            "Insufficient inventory."
        );
        return;
    }

    let status =
    "Available";

    if(
        newQuantity <=
        materialData.minimumThreshold
    ){
        status="Low";
    }

    if(
        newQuantity <=
        materialData.minimumThreshold/2
    ){
        status="Critical";
    }

    /* SAVE USAGE RECORD */

    await addDoc(
        collection(
            db,
            "usageRecords"
        ),
        {
            materialId,
            materialName:
            materialData.materialName,
            usedQuantity,
            unit:
            materialData.unit,
            usageDate,
            remarks,
            createdAt:
            serverTimestamp()
        }
    );

    /* UPDATE INVENTORY */

    await updateDoc(
        materialRef,
        {
            quantity:newQuantity,
            status
        }
    );

    alert(
        "Usage Recorded Successfully"
    );

    clearForm();

    loadUsageRecords();

}
);

/* ==========================
   LOAD USAGE RECORDS
========================== */

async function loadUsageRecords(){

    const tableBody =
    document.getElementById(
        "usageTableBody"
    );

    tableBody.innerHTML="";

    const snapshot =
    await getDocs(
        collection(
            db,
            "usageRecords"
        )
    );

    snapshot.forEach((record)=>{

        const data =
        record.data();

        tableBody.innerHTML += `

        <tr>

            <td>
                ${data.materialName}
            </td>

            <td>
                ${data.usedQuantity}
            </td>

            <td>
                ${data.unit}
            </td>

            <td>
                ${data.usageDate}
            </td>

            <td>
                ${data.remarks || "-"}
            </td>

            <td>

                <button
                class="action-btn delete-btn"
                onclick="deleteUsageRecord('${record.id}')">

                Delete

                </button>

            </td>

        </tr>

        `;

    });

}

/* ==========================
   DELETE RECORD
========================== */

window.deleteUsageRecord =
async function(id){

    const confirmDelete =
    confirm(
        "Delete this usage record?"
    );

    if(!confirmDelete) return;

    await deleteDoc(
        doc(
            db,
            "usageRecords",
            id
        )
    );

    loadUsageRecords();

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
        "#usageTableBody tr"
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
   CLEAR FORM
========================== */

function clearForm(){

    document.getElementById(
        "materialSelect"
    ).value="";

    document.getElementById(
        "usedQuantity"
    ).value="";

    document.getElementById(
        "usageDate"
    ).value="";

    document.getElementById(
        "remarks"
    ).value="";

}

document
.getElementById("clearBtn")
.addEventListener(
"click",
clearForm
);

/* ==========================
   INITIAL LOAD
========================== */

loadMaterials();
loadUsageRecords();