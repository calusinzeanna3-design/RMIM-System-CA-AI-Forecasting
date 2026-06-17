import {
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
auth,
db
}
from "./firebase-config.js";

export async function loginUser(email,password){

    const userCredential =
    await signInWithEmailAndPassword(
        auth,
        email,
        password
    );

    const uid =
    userCredential.user.uid;

    const userDoc =
    await getDoc(
        doc(db,"users",uid)
    );

    const role =
    userDoc.data().role;

    if(role==="admin"){

        window.location.href=
        "/admin/dashboard.html";

    }else{

        window.location.href=
        "/user/dashboard.html";

    }

}