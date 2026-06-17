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
   LOAD INVENTORY
========================== */

async function loadInventory(){

    const tableBody =
    document.getElementById(
        "inventoryTableBody"
    );

    tableBody.innerHTML = "";

    const snapshot =
    await getDocs(
        collection(db,"materials")
    );

    snapshot.forEach((item)=>{

        const data =
        item.data();

        let statusClass =
        "available";

        if(data.status === "Low"){
            statusClass = "low";
        }

        if(data.status === "Critical"){
            statusClass = "critical";
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

                <span class="status ${statusClass}">
                    ${data.status}
                </span>

            </td>

        </tr>

        `;

    });

}

/* ==========================
   SEARCH INVENTORY
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

loadInventory();