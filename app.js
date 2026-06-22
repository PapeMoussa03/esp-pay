import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Remplacez par vos vraies clés Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCbsEUQ9YRb87wFu196TZnNrTZntgiGZE8",
    authDomain: "esp-pay.firebaseapp.com",
    projectId: "esp-pay",
    storageBucket: "esp-pay.firebasestorage.app",
    messagingSenderId: "629871793149",
    appId: "1:629871793149:web:7522b73742d4d15187bf94"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Variables Globales d'Affichage du Solde
let montantReelGlobal = 0;
let soldeMasque = false;

// Sélections DOM
const tabsContainer = document.getElementById('tabs-container');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const loggedArea = document.getElementById('logged-area');

const secHome = document.getElementById('section-nav-home');
const secHistory = document.getElementById('section-nav-history');
const secSettings = document.getElementById('section-nav-settings');

const navHome = document.getElementById('nav-home');
const navHistory = document.getElementById('nav-history');
const navSettings = document.getElementById('nav-settings');

// =========================================================
// GESTION DES ONGLETS INITIAUX (CONNEXION / INSCRIPTION)
// =========================================================
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');

tabLogin.addEventListener('click', () => {
    tabLogin.className = "w-1/2 pb-3 font-bold text-esp-blue border-b-2 border-esp-blue text-center cursor-pointer";
    tabRegister.className = "w-1/2 pb-3 font-medium text-gray-400 text-center hover:text-gray-600 cursor-pointer";
    loginSection.classList.remove('hidden'); 
    registerSection.classList.add('hidden');
});

tabRegister.addEventListener('click', () => {
    tabRegister.className = "w-1/2 pb-3 font-bold text-esp-blue border-b-2 border-esp-blue text-center cursor-pointer";
    tabLogin.className = "w-1/2 pb-3 font-medium text-gray-400 text-center hover:text-gray-600 cursor-pointer";
    registerSection.classList.remove('hidden'); 
    loginSection.classList.add('hidden');
});

// =========================================================
// GESTION MULTI-ONGLETS BAS DE PAGE (DASHBOARD)
// =========================================================
function SwitchNavTab(activeSection, activeBtn) {
    [secHome, secHistory, secSettings].forEach(s => s.classList.add('hidden'));
    [navHome, navHistory, navSettings].forEach(b => b.className = "flex flex-col items-center gap-1 font-medium text-gray-400 cursor-pointer");
    
    activeSection.classList.remove('hidden');
    activeBtn.className = "flex flex-col items-center gap-1 font-bold text-esp-blue cursor-pointer";
}
navHome.addEventListener('click', () => SwitchNavTab(secHome, navHome));
navHistory.addEventListener('click', () => SwitchNavTab(secHistory, navHistory));
navSettings.addEventListener('click', () => SwitchNavTab(secSettings, navSettings));

// =========================================================
// SYSTÈME D'AFFICHAGE MASQUÉ / VISIBLE DU SOLDE
// =========================================================
const btnToggleEye = document.getElementById('btn-toggle-eye');
const eyeIcon = document.getElementById('eye-icon');
const soldeAffiche = document.getElementById('solde-affiche');

if(btnToggleEye) {
    btnToggleEye.addEventListener('click', () => {
        soldeMasque = !soldeMasque;
        if (soldeMasque) {
            soldeAffiche.innerText = "••••••• FCFA";
            eyeIcon.className = "fa-solid fa-eye-slash";
        } else {
            soldeAffiche.innerHTML = `${montantReelGlobal.toLocaleString()} <span class="text-sm font-bold">FCFA</span>`;
            eyeIcon.className = "fa-solid fa-eye";
        }
    });
}

// Toggle Mode Sombre manuellement
const toggleDark = document.getElementById('toggle-dark-mode');
if(toggleDark) {
    toggleDark.addEventListener('change', () => {
        document.getElementById('app-body').classList.toggle('dark-mode');
    });
}

// =========================================================
// FONCTIONS UTILES (TOAST & MODAL)
// =========================================================
function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900';
    toast.className = `flex items-center gap-3 p-4 rounded-xl border ${bgClass} shadow-lg text-sm font-medium`;
    toast.innerHTML = `<div class="flex-grow">${message}</div>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function showCustomModal(title, message, type = 'success') {
    const modal = document.getElementById('custom-modal');
    modal.classList.remove('hidden'); modal.classList.add('flex');
    modal.classList.remove('opacity-0');
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerText = message;
    const btnClose = document.getElementById('modal-btn-close');
    btnClose.className = "w-full bg-esp-blue py-2.5 rounded-xl text-sm text-white font-bold";
    btnClose.onclick = () => { modal.classList.add('hidden'); };
}

// =========================================================
// LOGIQUE DYNAMIQUE DES CLASSES ET OPTIONS (ESP)
// =========================================================
const regCycle = document.getElementById('reg-cycle');
const regNiveau = document.getElementById('reg-niveau');
const regOption = document.getElementById('reg-option');

const regDocument = document.getElementById('reg-document');
const regPhoto = document.getElementById('reg-photo');
const labelDocument = document.getElementById('label-document');
const labelPhoto = document.getElementById('label-photo');
const helpDocument = document.getElementById('help-document');
const btnRegister = document.getElementById('btn-register');

const structuresESP = {
    "DUT": { niveaux: ["DUT 1", "DUT 2"], options: { "DUT 1": ["Génie Logiciel (GL)", "Systèmes Réseaux Télécoms (SRT)"], "DUT 2": ["Génie Logiciel (GL)", "Systèmes Réseaux Télécoms (SRT)"] } },
    "DIC": { niveaux: ["DIC 1", "DIC 2", "DIC 3"], options: { "DIC 1": ["Tronc Commun"], "DIC 2": ["Génie Logiciel (GL)", "Réseaux et Télécoms (RT)"], "DIC 3": ["Génie Logiciel (GL)", "Réseaux et Télécoms (RT)"] } },
    "Licence Pro": { niveaux: ["Licence 1", "Licence 2", "Licence 3"], options: { "Licence 1": ["GLSI", "SRT"], "Licence 2": ["GLSI", "SRT"], "Licence 3": ["GLSI", "SRT"] } },
    "Master": { niveaux: ["Master 1", "Master 2"], options: { "Master 1": ["Sécurité Informatique & Cloud", "Data Science / IA", "Génie Logiciel Avancé"], "Master 2": ["Cloud Security / DevSecOps", "Intelligence Artificielle", "Management des SI"] } }
};

if(regCycle) {
    regCycle.addEventListener('change', () => {
        const cycleSelectionne = regCycle.value;
        regNiveau.innerHTML = '<option value="">-- Choisir la classe --</option>';
        regOption.innerHTML = '<option value="">Sélectionnez d\'abord le niveau</option>';
        regOption.disabled = true;

        if (cycleSelectionne && structuresESP[cycleSelectionne]) {
            regNiveau.disabled = false;
            structuresESP[cycleSelectionne].niveaux.forEach(niv => {
                const opt = document.createElement('option'); opt.value = niv; opt.textContent = niv; regNiveau.appendChild(opt);
            });
        } else { regNiveau.disabled = true; }
    });
}

if(regNiveau) {
    regNiveau.addEventListener('change', () => {
        const cycleSelectionne = regCycle.value;
        const niveauSelectionne = regNiveau.value;
        regOption.innerHTML = '<option value="">-- Choisir l\'option --</option>';

        if (cycleSelectionne && niveauSelectionne && structuresESP[cycleSelectionne].options[niveauSelectionne]) {
            regOption.disabled = false;
            structuresESP[cycleSelectionne].options[niveauSelectionne].forEach(optText => {
                const opt = document.createElement('option'); opt.value = optText; opt.textContent = optText; regOption.appendChild(opt);
            });
        } else { regOption.disabled = true; }

        if (niveauSelectionne === "DUT 1" || niveauSelectionne === "Licence 1" || niveauSelectionne === "DIC 1") {
            labelDocument.innerText = "Numéro de Carte d'Identité (CNI)"; labelPhoto.innerText = "Photo de la CNI (Recto/Verso)"; regDocument.placeholder = "Ex: 1755XXXXXXXXX"; helpDocument.innerText = "Utilisez votre CNI en attendant la délivrance de votre carte étudiant.";
        } else {
            labelDocument.innerText = "Numéro de Carte Étudiant"; labelPhoto.innerText = "Photo de la Carte Étudiant"; regDocument.placeholder = "Ex: 2026ESP9999"; helpDocument.innerText = "Champs requis pour la vérification administrative.";
        }
    });
}

// =========================================================
// INSCRIPTION SÉCURISÉE
// =========================================================
if(btnRegister) {
    btnRegister.addEventListener('click', async () => {
        const prenom = document.getElementById('reg-prenom').value.trim();
        const nom = document.getElementById('reg-nom').value.trim();
        const cycle = regCycle.value; const niveau = regNiveau.value; const option = regOption.value;
        const docValue = regDocument.value.trim().toUpperCase(); const photoFichier = regPhoto.files[0];
        const email = document.getElementById('reg-email').value.trim().toLowerCase();
        const password = document.getElementById('reg-password').value; const passwordConfirm = document.getElementById('reg-password-confirm').value;

        if (!prenom || !nom || !cycle || !niveau || !option || !docValue || !photoFichier || !email || !password) {
            showToast("Veuillez remplir tous les champs.", "error"); return;
        }
        if (!email.endsWith('@esp.sn') && !email.endsWith('@ucad.edu.sn')) {
            showToast("Seuls les e-mails @esp.sn et @ucad.edu.sn sont autorisés.", "error"); return;
        }
        if (password !== passwordConfirm) {
            showToast("Les deux mots de passe ne correspondent pas.", "error"); return;
        }

        btnRegister.disabled = true; btnRegister.innerText = "Envoi en cours...";

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendEmailVerification(user);

            const estPremiereAnnee = (niveau === "DUT 1" || niveau === "Licence 1" || niveau === "DIC 1");
            const labelType = estPremiereAnnee ? "CNI" : "Carte_Etudiant";
            const extension = photoFichier.name.split('.').pop();
            const storageRef = ref(storage, `justificatifs/${user.uid}_${labelType}.${extension}`);
            
            const snapshot = await uploadBytes(storageRef, photoFichier);
            const downloadURL = await getDownloadURL(snapshot.ref);

            await setDoc(doc(db, "etudiants", user.uid), {
                prenom: prenom, nom: nom, cycle: cycle, niveau: niveau, option: option, email: email,
                montant_deja_paye: 0, identifiant_type: estPremiereAnnee ? "CNI" : "Carte Étudiant",
                identifiant_valeur: docValue, identifiant_url_photo: downloadURL, transactions: []
            });

            showCustomModal("Validation requise", `Un mail de confirmation a été envoyé à : ${email}`, "success");
            tabLogin.click();
        } catch (error) { showToast(error.message, "error"); } finally {
            btnRegister.disabled = false; btnRegister.innerText = "Créer mon compte";
        }
    });
}

// =========================================================
// CONNEXION & DASHBOARD & PAIEMENT
// =========================================================
function genererHistoriqueVue(transactions) {
    const container = document.getElementById('transactions-list');
    if(!transactions || transactions.length === 0) {
        container.innerHTML = `<p class="text-xs text-gray-400 text-center py-4">Aucune transaction effectuée.</p>`;
        return;
    }
    container.innerHTML = "";
    transactions.reverse().forEach(t => {
        const item = document.createElement('div');
        item.className = "flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs";
        item.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <i class="fa-solid fa-arrow-down"></i>
                </div>
                <div>
                    <p class="font-bold text-gray-900">Scolarité via ${t.operateur.toUpperCase()}</p>
                    <p class="text-[10px] text-gray-400">${t.date}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="font-black text-emerald-700">+ ${t.montant.toLocaleString()} F</p>
                <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Réussi</span>
            </div>
        `;
        container.appendChild(item);
    });
}

function chargerDashboardEtudiant(data) {
    montantReelGlobal = data.montant_deja_paye || 0;
    document.getElementById('student-name').innerText = `${data.prenom} ${data.nom}`;
    document.getElementById('student-info').innerText = `${data.identifiant_type} : ${data.identifiant_valeur} | ${data.niveau} (${data.option})`;
    
    tabsContainer.classList.add('hidden'); loginSection.classList.add('hidden'); loggedArea.classList.remove('hidden');

    const formPaiementBox = document.getElementById('form-paiement-box');
    const carteSolde = document.querySelector('#section-nav-home .bg-emerald-50');

    if (data.cycle === "DUT" || data.cycle === "DIC") {
        carteSolde.classList.add('hidden'); formPaiementBox.classList.add('hidden');
        let msg = document.getElementById('msg-public-scolarite');
        if (!msg) {
            msg = document.createElement('div'); msg.id = 'msg-public-scolarite';
            msg.className = "bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center space-y-2";
            msg.innerHTML = `<h4 class="font-bold text-esp-blue text-sm">Régime Public Exonéré</h4><p class="text-gray-500 text-xs">Aucun frais de scolarité requis.</p>`;
            document.getElementById('section-nav-home').appendChild(msg);
        }
    } else {
        carteSolde.classList.remove('hidden'); formPaiementBox.classList.remove('hidden');
        if (!soldeMasque) soldeAffiche.innerHTML = `${montantReelGlobal.toLocaleString()} <span class="text-sm font-bold">FCFA</span>`;
        genererHistoriqueVue(data.transactions || []);
    }
}

const btnLogin = document.getElementById('btn-login');
if(btnLogin) {
    btnLogin.addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (!user.emailVerified) { showToast("Veuillez vérifier votre boîte e-mail.", "error"); await signOut(auth); return; }
            const docSnap = await getDoc(doc(db, "etudiants", user.uid));
            if (docSnap.exists()) chargerDashboardEtudiant(docSnap.data());
        } catch (error) { showToast("Identifiants de connexion invalides.", "error"); }
    });
}

const btnPayer = document.getElementById('btn-payer');
if(btnPayer) {
    btnPayer.addEventListener('click', async () => {
        const montant = parseInt(document.getElementById('amount-input').value);
        const op = document.querySelector('input[name="operator"]:checked');
        if (!montant || montant < 5000 || !op) { showToast("Sélectionnez un opérateur et un montant valide (min 5000).", "error"); return; }

        try {
            const refDoc = doc(db, "etudiants", auth.currentUser.uid);
            const nouvelleTransaction = { montant: montant, operateur: op.value, date: new Date().toLocaleString('fr-FR'), id_transaction: "TXN-" + Math.floor(Math.random() * 1000000) };
            montantReelGlobal += montant;
            await updateDoc(refDoc, { montant_deja_paye: montantReelGlobal, transactions: arrayUnion(nouvelleTransaction) });

            if(!soldeMasque) soldeAffiche.innerHTML = `${montantReelGlobal.toLocaleString()} <span class="text-sm font-bold">FCFA</span>`;
            
            const snap = await getDoc(refDoc);
            if(snap.exists()) genererHistoriqueVue(snap.data().transactions || []);

            showCustomModal("Paiement Réussi", `Votre versement de ${montant.toLocaleString()} FCFA via ${op.value.toUpperCase()} a été enregistré.`, "success");
            document.getElementById('amount-input').value = "";
        } catch (e) { showToast("Erreur lors de la transaction.", "error"); }
    });
}

const btnLogout = document.getElementById('btn-logout');
if(btnLogout) {
    btnLogout.addEventListener('click', async () => { await signOut(auth); location.reload(); });
}

document.getElementById('btn-update-pwd')?.addEventListener('click', async () => {
    const newPwd = document.getElementById('settings-new-password').value;
    if (!newPwd || newPwd.length < 6) { showToast("Le mot de passe doit faire au moins 6 caractères.", "error"); return; }
    try {
        await updatePassword(auth.currentUser, newPwd);
        showCustomModal("Succès", "Votre mot de passe a bien été mis à jour.", "success");
        document.getElementById('settings-new-password').value = "";
    } catch (e) { showToast("Erreur. Veuillez vous reconnecter avant de modifier.", "error"); }
});