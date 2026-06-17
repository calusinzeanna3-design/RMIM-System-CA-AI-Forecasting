import {
    auth,
    db
} from "../firebase/firebase-config.js";

import {
    doc,
    getDoc
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

/* ==========================
   LOAD USER INFORMATION
========================== */

const profileBtn =
document.getElementById("profileBtn");

onAuthStateChanged(auth, async (user)=>{

    if(!user){

        window.location.href =
        "../login.html";

        return;

    }

    try{

        const userDoc =
        await getDoc(
            doc(db,"users",user.uid)
        );

        if(userDoc.exists()){

            const data =
            userDoc.data();

            profileBtn.textContent =
            `${data.fullName} ▼`;

            document.getElementById(
                "fullName"
            ).value =
            data.fullName || "";

            document.getElementById(
                "email"
            ).value =
            data.email || "";

            document.getElementById(
                "role"
            ).value =
            data.role || "";

        }

    }catch(error){

        console.error(
            "Error loading user:",
            error
        );

    }

});

/* ==========================
   LOGOUT
========================== */

document
.getElementById("logoutBtn")
.addEventListener(
"click",
async ()=>{

    const confirmLogout =
    confirm(
        "Are you sure you want to logout?"
    );

    if(!confirmLogout){
        return;
    }

    try{

        await signOut(auth);

        alert(
            "Logged out successfully."
        );

        window.location.href =
        "../login.html";

    }catch(error){

        console.error(
            "Logout Error:",
            error
        );

        alert(
            "Failed to logout."
        );

    }

});