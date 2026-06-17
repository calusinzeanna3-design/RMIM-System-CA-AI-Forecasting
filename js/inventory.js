import {
    auth,
    db
} from "../firebase/firebase-config.js";

import {
    collection,
    addDoc,
    getDocs,
    deleteDoc,
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
   ADD MATERIAL
========================== */

const addMaterialBtn =
document.getElementById("addMaterialBtn");

addMaterialBtn.addEventListener(
"click",
async ()=>{

    const materialName =
    document.getElementById("materialName")
    .value.trim();

    const category =
    document.getElementById("category")
    .value.trim();

    const supplier =
    document.getElementById("supplier")
    .value.trim();

    const quantity =
    document.getElementById("quantity")
    .value;

    const unit =
    document.getElementById("unit")
    .value;

    const minimumThreshold =
    document.getElementById("minimumThreshold")
    .value;

    if(
        !materialName ||
        !category ||
        !supplier ||
        !quantity ||
        !unit ||
        !minimumThreshold
    ){

        alert(
            "Please complete all fields."
        );

        return;

    }

    /* CHECK DUPLICATE MATERIAL */

    const existingMaterials =
    await getDocs(
        collection(db,"materials")
    );

    let duplicate = false;

    existingMaterials.forEach((item)=>{

        const existingName =
        item.data().materialName;

        if(
            existingName &&
            existingName.toLowerCase() ===
            materialName.toLowerCase()
        ){

            duplicate = true;

        }

    });

    if(duplicate){

        alert(
            "Material already exists."
        );

        return;

    }

    /* STATUS */

    let status = "Available";

    if(
        Number(quantity)
        <=
        Number(minimumThreshold)
    ){

        status = "Low";

    }

    if(
        Number(quantity)
        <=
        Number(minimumThreshold) / 2
    ){

        status = "Critical";

    }

    /* SAVE */

    await addDoc(
        collection(db,"materials"),
        {
            materialName,
            category,
            supplier,
            quantity:Number(quantity),
            unit,
            minimumThreshold:Number(minimumThreshold),
            status,
            createdAt:serverTimestamp()
        }
    );

    alert(
        "Material Added Successfully"
    );

    clearForm();

    loadMaterials();

}
);

/* ==========================
   LOAD MATERIALS
========================== */

async function loadMaterials(){

    const tableBody =
    document.getElementById(
        "inventoryTableBody"
    );

    tableBody.innerHTML = "";

    const querySnapshot =
    await getDocs(
        collection(db,"materials")
    );

    querySnapshot.forEach((docItem)=>{

        const data =
        docItem.data();

        let statusClass =
        "available";

        if(data.status === "Low"){

            statusClass =
            "low";

        }

        if(data.status === "Critical"){

            statusClass =
            "critical";

        }

        tableBody.innerHTML += `

        <tr>

            <td>
                ${data.materialName}
            </td>

            <td>
                ${data.category}
            </td>

            <td>
                ${data.supplier}
            </td>

            <td>
                ${data.quantity}
            </td>

            <td>
                ${data.unit}
            </td>

            <td>
                ${data.minimumThreshold}
            </td>

            <td>

                <span class="status ${statusClass}">
                    ${data.status}
                </span>

            </td>

            <td>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteMaterial('${docItem.id}')">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}

/* ==========================
   DELETE MATERIAL
========================== */

window.deleteMaterial =
async function(id){

    const confirmDelete =
    confirm(
        "Delete this material?"
    );

    if(!confirmDelete){

        return;

    }

    await deleteDoc(
        doc(db,"materials",id)
    );

    loadMaterials();

};

/* ==========================
   CLEAR FORM
========================== */

function clearForm(){

    document.getElementById(
        "materialName"
    ).value = "";

    document.getElementById(
        "category"
    ).value = "";

    document.getElementById(
        "supplier"
    ).value = "";

    document.getElementById(
        "quantity"
    ).value = "";

    document.getElementById(
        "unit"
    ).value = "";

    document.getElementById(
        "minimumThreshold"
    ).value = "";

}

document
.getElementById("clearBtn")
.addEventListener(
"click",
clearForm
);

/* ==========================
   SEARCH MATERIAL
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
        "#inventoryTableBody tr"
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

loadMaterials();