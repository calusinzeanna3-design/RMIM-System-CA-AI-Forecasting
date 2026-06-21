import { loginUser } from "../firebase/auth-service.js";

import { db }
from "../firebase/firebase-config.js";

import {
collection,
getDocs
}
from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

/* ==========================
LOGIN
========================== */

const loginForm =
document.getElementById("loginForm");

loginForm.addEventListener(
"submit",
async (e)=>{


e.preventDefault();

const email =
document.getElementById(
    "email"
).value;

const password =
document.getElementById(
    "password"
).value;

try{

    await loginUser(
        email,
        password
    );

}catch(error){

    alert(
        error.message
    );

}


});

/* ==========================
SYSTEM OVERVIEW
========================== */

async function loadSystemOverview(){


try{

    const materialsSnapshot =
    await getDocs(
        collection(
            db,
            "materials"
        )
    );

    const usageSnapshot =
    await getDocs(
        collection(
            db,
            "usageRecords"
        )
    );

    let totalStock = 0;
    let totalConsumption = 0;

    materialsSnapshot.forEach((doc)=>{

        const data =
        doc.data();

        totalStock +=
        Number(
            data.quantity || 0
        );

    });

    usageSnapshot.forEach((doc)=>{

        const data =
        doc.data();

        totalConsumption +=
        Number(
            data.usedQuantity || 0
        );

    });

    const forecastDemand =

    usageSnapshot.size > 0

    ?

    Math.round(
        totalConsumption /
        usageSnapshot.size
    )

    :

    0;

    document.getElementById(
        "totalMaterials"
    ).textContent =
    materialsSnapshot.size;

    document.getElementById(
        "availableStock"
    ).textContent =
    totalStock + " KG";

    document.getElementById(
        "monthlyConsumption"
    ).textContent =
    totalConsumption + " KG";

    document.getElementById(
        "forecastDemand"
    ).textContent =
    forecastDemand + " KG";

}catch(error){

    console.error(
        "Overview Error:",
        error
    );

}


}

loadSystemOverview();

/* ==========================
PASSWORD VISIBILITY TOGGLE
========================== */

const togglePwBtn =
document.getElementById("togglePw");

if(togglePwBtn){

    togglePwBtn.addEventListener(
    "click",
    ()=>{

        const passwordInput =
        document.getElementById("password");

        const isHidden =
        passwordInput.type === "password";

        passwordInput.type =
        isHidden ? "text" : "password";

        togglePwBtn.setAttribute(
            "aria-label",
            isHidden ? "Hide password" : "Show password"
        );

    });

}