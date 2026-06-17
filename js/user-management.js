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
   LOAD USERS
========================== */

async function loadUsers(){

    const snapshot =
    await getDocs(
        collection(db,"users")
    );

    const tableBody =
    document.getElementById(
        "userTableBody"
    );

    tableBody.innerHTML = "";

    let totalUsers = 0;
    let totalAdmins = 0;
    let totalSystemUsers = 0;
    let activeUsers = 0;

    snapshot.forEach((userDoc)=>{

        const data =
        userDoc.data();

        totalUsers++;

        if(data.role === "admin"){
            totalAdmins++;
        }

        if(data.role === "user"){
            totalSystemUsers++;
        }

        if(data.status === "active"){
            activeUsers++;
        }

        const roleClass =
        data.role === "admin"
        ? "admin"
        : "user";

        const statusClass =
        data.status === "active"
        ? "active"
        : "inactive";

        tableBody.innerHTML += `

        <tr>

            <td>
                ${data.fullName}
            </td>

            <td>
                ${data.email}
            </td>

            <td>

                <span class="role ${roleClass}">
                    ${data.role}
                </span>

            </td>

            <td>

                <span class="status ${statusClass}">
                    ${data.status}
                </span>

            </td>

        </tr>

        `;

    });

    document.getElementById(
        "totalUsers"
    ).textContent =
    totalUsers;

    document.getElementById(
        "totalAdmins"
    ).textContent =
    totalAdmins;

    document.getElementById(
        "totalSystemUsers"
    ).textContent =
    totalSystemUsers;

    document.getElementById(
        "activeUsers"
    ).textContent =
    activeUsers;

}

/* ==========================
   SEARCH USERS
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
        "#userTableBody tr"
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

loadUsers();