
//DOM
document.addEventListener('DOMContentLoaded', () => {

    const signInForm = document.getElementById("sign-in-form");
    const signUpForm = document.getElementById("sign-up-form");
    const signUpLink = document.getElementById("sign-up-link");
    const signInLink = document.getElementById("sign-in-link");
    const signInBtn = document.getElementById("sign-in-btn");
    const registerBtn = document.getElementById("register-btn");


    signUpLink.addEventListener("click", () => {
        signInForm.style.display = "none";
        signUpForm.style.display = "flex";
    });

    signInLink.addEventListener("click", () => {
        signInForm.style.display = "flex";
        signUpForm.style.display = "none";
    });

    signInBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const response = await fetch("http://localhost:8000/sign-in", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email:email, password:password })
        });

        if (response.ok) {
            const data = await response.json();

            if (data.error=="") {
                localStorage.setItem('userId', data.message.id);
                localStorage.setItem('userName', data.message.full_name);
                localStorage.setItem('userIdType', data.message.id_type)
                localStorage.setItem('userLatitude', data.message.latitude);
                localStorage.setItem('userLongitude', data.message.longitude);
                Swal.fire({
                    icon: 'success',
                    title: 'Sesión iniciada',
                    showConfirmButton: false,
                    timer: 1500
                });

                if (data.message.id_type==1){
                    window.location.href = 'products.html';
                }else{
                    window.location.href = 'buscar_restaurantes.html';
                }
                
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Correo electrónico o Contraseña incorrectos',
                    showConfirmButton: false,
                    timer: 1500
                });  
            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Correo electrónico o Contraseña incorrectos',
                showConfirmButton: false,
                timer: 1500
            });
        }
    });

    registerBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        const fullName = document.getElementById("full-name").value;
        const email = document.getElementById("sign-up-email").value;
        const password = document.getElementById("sign-up-password").value;
        const userTypeEls = document.getElementsByName("user-type");
        let idType;
        
        userTypeEls.forEach(el => {
            if (el.checked) {
                idType = el.value;
            }
        });

        const response = await fetch("http://localhost:8000/sign-up", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ full_name: fullName, email:email, password:password, id_type: idType })
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data.message)
        } else {
            console.log("ERROR AL REGISTRO")
        }

    });
})