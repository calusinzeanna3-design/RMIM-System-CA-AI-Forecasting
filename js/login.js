import { loginUser } from "../firebase/auth-service.js";

const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;

    try {

        await loginUser(email,password);

    } catch(error){

        alert(error.message);

    }

});