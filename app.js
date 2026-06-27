import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    sendEmailVerification, 
    signOut,
    updatePassword,
    onAuthStateChanged,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ============================================================
// CONFIGURATION FIREBASE
// ============================================================
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

// ============================================================
// STRUCTURES ESP
// ============================================================
const structuresESP = {
    "DUT": { 
        niveaux: ["DUT 1", "DUT 2"], 
        options: { 
            "DUT 1": ["Génie Logiciel (GL)", "Systèmes Réseaux Télécoms (SRT)"], 
            "DUT 2": ["Génie Logiciel (GL)", "Systèmes Réseaux Télécoms (SRT)"] 
        } 
    },
    "DIC": { 
        niveaux: ["DIC 1", "DIC 2", "DIC 3"], 
        options: { 
            "DIC 1": ["Tronc Commun"], 
            "DIC 2": ["Génie Logiciel (GL)", "Réseaux et Télécoms (RT)"], 
            "DIC 3": ["Génie Logiciel (GL)", "Réseaux et Télécoms (RT)"] 
        } 
    },
    "Licence Pro": { 
        niveaux: ["Licence 1", "Licence 2", "Licence 3"], 
        options: { 
            "Licence 1": ["GLSI", "SRT"], 
            "Licence 2": ["GLSI", "SRT"], 
            "Licence 3": ["GLSI", "SRT"] 
        } 
    },
    "Master": { 
        niveaux: ["Master 1", "Master 2"], 
        options: { 
            "Master 1": ["Sécurité Informatique & Cloud", "Data Science / IA", "Génie Logiciel Avancé"], 
            "Master 2": ["Cloud Security / DevSecOps", "Intelligence Artificielle", "Management des SI"] 
        } 
    }
};

// ============================================================
// RÉFÉRENCES DOM
// ============================================================
const tabsContainer = document.getElementById('tabs-container');
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const dashboardSection = document.getElementById('dashboard-section');

const sectionHome = document.getElementById('section-home');
const sectionHistory = document.getElementById('section-history');
const sectionSettings = document.getElementById('section-settings');

const navHome = document.getElementById('nav-home');
const navHistory = document.getElementById('nav-history');
const navSettings = document.getElementById('nav-settings');

// ============================================================
// ONGLETS
// ============================================================
const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');

function showLogin() {
    tabLogin.className = "w-1/2 pb-3 font-bold text-esp-blue border-b-2 border-esp-blue text-center cursor-pointer transition";
    tabRegister.className = "w-1/2 pb-3 font-medium text-gray-400 text-center cursor-pointer transition hover:text-gray-600";
    loginSection.classList.remove('hidden');
    registerSection.classList.add('hidden');
    dashboardSection.classList.add('hidden');
}

function showRegister() {
    tabRegister.className = "w-1/2 pb-3 font-bold text-esp-blue border-b-2 border-esp-blue text-center cursor-pointer transition";
    tabLogin.className = "w-1/2 pb-3 font-medium text-gray-400 text-center cursor-pointer transition hover:text-gray-600";
    registerSection.classList.remove('hidden');
    loginSection.classList.add('hidden');
    dashboardSection.classList.add('hidden');
}

function showDashboard() {
    tabsContainer.classList.add('hidden');
    loginSection.classList.add('hidden');
    registerSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
}

tabLogin.addEventListener('click', showLogin);
tabRegister.addEventListener('click', showRegister);

// ============================================================
// NAVIGATION DASHBOARD (3 onglets)
// ============================================================
function switchTab(activeSection, activeBtn) {
    [sectionHome, sectionHistory, sectionSettings].forEach(s => s.classList.add('hidden'));
    [navHome, navHistory, navSettings].forEach(b => {
        b.className = "flex flex-col items-center gap-1 font-medium text-gray-400 cursor-pointer hover:text-gray-600";
    });
    activeSection.classList.remove('hidden');
    activeBtn.className = "flex flex-col items-center gap-1 font-bold text-esp-blue cursor-pointer";
}

navHome.addEventListener('click', () => switchTab(sectionHome, navHome));
navHistory.addEventListener('click', () => switchTab(sectionHistory, navHistory));
navSettings.addEventListener('click', () => switchTab(sectionSettings, navSettings));

// ============================================================
// DYNAMIQUE DES OPTIONS
// ============================================================
const regCycle = document.getElementById('reg-cycle');
const regNiveau = document.getElementById('reg-niveau');
const regOption = document.getElementById('reg-option');
const labelDocument = document.getElementById('label-document');
const helpDocument = document.getElementById('help-document');

regCycle.addEventListener('change', () => {
    const cycle = regCycle.value;
    regNiveau.innerHTML = '<option value="">-- Choisir la classe --</option>';
    regOption.innerHTML = '<option value="">Sélectionnez d\'abord le niveau</option>';
    regOption.disabled = true;

    if (cycle && structuresESP[cycle]) {
        regNiveau.disabled = false;
        structuresESP[cycle].niveaux.forEach(niv => {
            const opt = document.createElement('option');
            opt.value = niv;
            opt.textContent = niv;
            regNiveau.appendChild(opt);
        });
    } else {
        regNiveau.disabled = true;
    }
});

regNiveau.addEventListener('change', () => {
    const cycle = regCycle.value;
    const niveau = regNiveau.value;
    regOption.innerHTML = '<option value="">-- Choisir l\'option --</option>';

    if (cycle && niveau && structuresESP[cycle].options[niveau]) {
        regOption.disabled = false;
        structuresESP[cycle].options[niveau].forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            regOption.appendChild(option);
        });
    } else {
        regOption.disabled = true;
    }

    const estPremiereAnnee = (niveau === "DUT 1" || niveau === "Licence 1" || niveau === "DIC 1");
    if (estPremiereAnnee) {
        labelDocument.innerText = "Numéro de Carte d'Identité (CNI)";
        helpDocument.innerText = "Utilisez votre CNI en attendant la délivrance de votre carte étudiant.";
    } else {
        labelDocument.innerText = "Numéro de Carte Étudiant";
        helpDocument.innerText = "Champs requis pour la vérification administrative.";
    }
});

// ============================================================
// TOASTS PERSONNALISÉS
// ============================================================
function showToast(message, type = 'success', duration = 4000) {
    const container = document.getElementById('toast-container');
    
    const types = {
        success: {
            icon: 'fa-check',
            title: 'Succès',
            class: 'toast-success'
        },
        error: {
            icon: 'fa-xmark',
            title: 'Erreur',
            class: 'toast-error'
        },
        info: {
            icon: 'fa-circle-info',
            title: 'Information',
            class: 'toast-info'
        },
        warning: {
            icon: 'fa-triangle-exclamation',
            title: 'Attention',
            class: 'toast-warning'
        }
    };

    const typeConfig = types[type] || types.info;

    const toast = document.createElement('div');
    toast.className = `toast-item ${typeConfig.class}`;
    
    toast.innerHTML = `
        <div class="toast-icon">
            <i class="fa-solid ${typeConfig.icon}"></i>
        </div>
        <div class="toast-content">
            <div class="toast-title">${typeConfig.title}</div>
            <div class="toast-message">${message}</div>
        </div>
        <button class="toast-close" aria-label="Fermer">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="toast-progress"></div>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => {
        removeToast(toast);
    });

    let timeoutId = setTimeout(() => {
        removeToast(toast);
    }, duration);

    toast.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
        const progress = toast.querySelector('.toast-progress');
        if (progress) {
            progress.style.animationPlayState = 'paused';
        }
    });

    toast.addEventListener('mouseleave', () => {
        const progress = toast.querySelector('.toast-progress');
        if (progress) {
            progress.style.animationPlayState = 'running';
        }
        timeoutId = setTimeout(() => {
            removeToast(toast);
        }, 1500);
    });

    return toast;
}

function removeToast(toast) {
    if (toast.classList.contains('hide')) return;
    toast.classList.remove('show');
    toast.classList.add('hide');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 400);
}

// ============================================================
// MODAL
// ============================================================
function showModal(title, message, type = 'success') {
    const modal = document.getElementById('custom-modal');
    const iconContainer = document.getElementById('modal-icon');
    const btnClose = document.getElementById('modal-btn-close');
    
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-message').innerHTML = message;
    
    if (type === 'success') {
        iconContainer.className = "mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 bg-emerald-100 text-emerald-600 text-xl";
        iconContainer.innerHTML = '<i class="fa-solid fa-check"></i>';
        btnClose.className = "w-full bg-esp-blue hover:bg-blue-800 py-2.5 rounded-xl text-sm font-bold text-white transition cursor-pointer";
    } else {
        iconContainer.className = "mx-auto flex items-center justify-center h-14 w-14 rounded-full mb-4 bg-rose-100 text-rose-600 text-xl";
        iconContainer.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        btnClose.className = "w-full bg-rose-600 hover:bg-rose-700 py-2.5 rounded-xl text-sm font-bold text-white transition cursor-pointer";
    }
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('div').classList.remove('scale-95');
    }, 10);
    
    btnClose.onclick = () => {
        modal.classList.add('opacity-0');
        modal.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }, 300);
    };
}

// ============================================================
// VALIDATION EN DIRECT
// ============================================================
function setFieldError(inputId, errorId, condition) {
    const input = document.getElementById(inputId);
    const error = document.getElementById(errorId);
    
    if (!input || !error) return;

    const check = () => {
        const value = input.value.trim();
        if (condition(value)) {
            input.classList.add('border-red-500', 'ring-red-500');
            input.classList.remove('border-gray-300');
            error.classList.remove('hidden');
        } else {
            input.classList.remove('border-red-500', 'ring-red-500');
            input.classList.add('border-gray-300');
            error.classList.add('hidden');
        }
    };

    input.addEventListener('input', check);
    return check;
}

// ============================================================
// VALIDATIONS EN DIRECT - FORMULAIRE DE CONNEXION
// ============================================================
setFieldError('login-email', 'login-email-error', (v) => v.length > 0 && !v.endsWith('@esp.sn') && !v.endsWith('@ucad.edu.sn'));
setFieldError('login-password', 'login-password-error', (v) => v.length > 0 && v.length < 6);

// ============================================================
// VALIDATIONS EN DIRECT - FORMULAIRE D'INSCRIPTION
// ============================================================
setFieldError('reg-prenom', 'reg-prenom-error', (v) => v.length === 0);
setFieldError('reg-nom', 'reg-nom-error', (v) => v.length === 0);
setFieldError('reg-document', 'reg-document-error', (v) => v.length === 0);
setFieldError('reg-email', 'reg-email-error', (v) => v.length > 0 && !v.endsWith('@esp.sn') && !v.endsWith('@ucad.edu.sn'));
setFieldError('reg-password', 'reg-password-error', (v) => v.length > 0 && v.length < 6);

// Confirmation mot de passe (spécial)
const regPassword = document.getElementById('reg-password');
const regPasswordConfirm = document.getElementById('reg-password-confirm');
const regPasswordConfirmError = document.getElementById('reg-password-confirm-error');

function checkPasswordConfirm() {
    const pwd = regPassword.value;
    const confirm = regPasswordConfirm.value;
    if (confirm.length > 0 && pwd !== confirm) {
        regPasswordConfirm.classList.add('border-red-500', 'ring-red-500');
        regPasswordConfirm.classList.remove('border-gray-300');
        regPasswordConfirmError.classList.remove('hidden');
    } else {
        regPasswordConfirm.classList.remove('border-red-500', 'ring-red-500');
        regPasswordConfirm.classList.add('border-gray-300');
        regPasswordConfirmError.classList.add('hidden');
    }
}

regPassword.addEventListener('input', checkPasswordConfirm);
regPasswordConfirm.addEventListener('input', checkPasswordConfirm);

// ============================================================
// VARIABLES GLOBALES
// ============================================================
let montantReelGlobal = 0;
let soldeMasque = false;
let dashboardCharge = false;

// ============================================================
// DATE DE DERNIÈRE CONNEXION
// ============================================================
function mettreAJourDateConnexion() {
    const now = new Date();
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    const dateFormatee = now.toLocaleDateString('fr-FR', options);
    localStorage.setItem('esp_pay_last_login', dateFormatee);
    return dateFormatee;
}

function getDateDerniereConnexion() {
    return localStorage.getItem('esp_pay_last_login') || 'Première connexion';
}

// ============================================================
// ÉTAT DE VÉRIFICATION EMAIL
// ============================================================
function afficherStatutEmail(user) {
    const emailStatusElement = document.getElementById('email-status');
    if (!emailStatusElement) return;
    
    if (user.emailVerified) {
        emailStatusElement.innerHTML = '✅ <span class="text-emerald-600">Email vérifié</span>';
    } else {
        emailStatusElement.innerHTML = '❌ <span class="text-red-600">Email non vérifié</span>';
    }
}

// ============================================================
// GÉNÉRATION DE REÇU PDF
// ============================================================
function genererReçu(transaction) {
    if (typeof html2pdf === 'undefined') {
        showToast("❌ La librairie PDF n'est pas chargée. Veuillez rafraîchir la page.", "error");
        return;
    }

    const etudiantStr = localStorage.getItem('esp_pay_user');
    if (!etudiantStr) {
        showToast("❌ Profil introuvable.", "error");
        return;
    }
    
    const etudiant = JSON.parse(etudiantStr);
    
    const contenu = `
        <div id="recu-content" style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 30px; background: white; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 3px solid #004b93; padding-bottom: 20px;">
                <h1 style="color: #004b93; font-size: 24px; margin: 0;">ESP PAY</h1>
                <p style="color: #55b748; font-size: 14px; margin: 5px 0 0;">École Supérieure Polytechnique de Dakar</p>
            </div>
            
            <div style="text-align: center; margin: 25px 0;">
                <h2 style="color: #1e293b; font-size: 20px; margin: 0;">📄 REÇU DE PAIEMENT</h2>
            </div>
            
            <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 5px 0;"><strong>Étudiant :</strong> ${etudiant.prenom} ${etudiant.nom}</p>
                <p style="margin: 5px 0;"><strong>Email :</strong> ${etudiant.email}</p>
                <p style="margin: 5px 0;"><strong>Cycle :</strong> ${etudiant.cycle} - ${etudiant.niveau}</p>
                <p style="margin: 5px 0;"><strong>Option :</strong> ${etudiant.option}</p>
            </div>
            
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
                <table style="width: 100%; font-size: 14px;">
                    <tr>
                        <td style="padding: 8px 0; color: #475569;"><strong>Montant</strong></td>
                        <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #004b93; font-size: 18px;">
                            ${transaction.montant.toLocaleString()} FCFA
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #475569; border-top: 1px solid #e2e8f0;"><strong>Opérateur</strong></td>
                        <td style="padding: 8px 0; text-align: right; border-top: 1px solid #e2e8f0;">${transaction.operateur}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #475569; border-top: 1px solid #e2e8f0;"><strong>Date</strong></td>
                        <td style="padding: 8px 0; text-align: right; border-top: 1px solid #e2e8f0;">${transaction.date}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #475569; border-top: 1px solid #e2e8f0;"><strong>Transaction ID</strong></td>
                        <td style="padding: 8px 0; text-align: right; border-top: 1px solid #e2e8f0; font-size: 12px;">${transaction.id_transaction}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px 0; color: #475569; border-top: 1px solid #e2e8f0;"><strong>Statut</strong></td>
                        <td style="padding: 8px 0; text-align: right; border-top: 1px solid #e2e8f0; color: #22c55e; font-weight: bold;">✅ Payé</td>
                    </tr>
                </table>
            </div>
            
            <div style="text-align: center; border-top: 2px solid #e2e8f0; padding-top: 15px; font-size: 12px; color: #94a3b8;">
                <p>Ce reçu est généré automatiquement par ESP PAY.</p>
                <p>© 2026 École Supérieure Polytechnique de Dakar</p>
            </div>
        </div>
    `;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contenu;
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.zIndex = '9999';
    document.body.appendChild(tempDiv);

    const element = tempDiv.querySelector('#recu-content');

    const opt = {
        margin:        [10, 10, 10, 10],
        filename:     `Recu_${etudiant.prenom}_${etudiant.nom}_${transaction.id_transaction}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        document.body.removeChild(tempDiv);
        showToast("✅ Reçu téléchargé avec succès !", "success");
    }).catch((error) => {
        document.body.removeChild(tempDiv);
        console.error("❌ Erreur génération PDF:", error);
        showToast("❌ Erreur lors du téléchargement du reçu.", "error");
    });
}

window.genererReçu = genererReçu;

// ============================================================
// HISTORIQUE
// ============================================================
function genererHistorique(transactions) {
    const container = document.getElementById('transactions-list');
    if (!transactions || transactions.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8">
                <i class="fa-solid fa-receipt text-gray-300 text-4xl mb-3"></i>
                <p class="text-xs text-gray-400">Aucune transaction effectuée.</p>
            </div>
        `;
        return;
    }
    container.innerHTML = "";
    [...transactions].reverse().forEach(t => {
        const item = document.createElement('div');
        item.className = "flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs";
        item.innerHTML = `
            <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="h-8 w-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">
                    <i class="fa-solid fa-arrow-down"></i>
                </div>
                <div class="min-w-0 flex-1">
                    <p class="font-bold text-gray-900">Scolarité via ${t.operateur}</p>
                    <p class="text-[10px] text-gray-400">${t.date}</p>
                    <p class="text-[9px] text-gray-400 font-mono">${t.id_transaction}</p>
                </div>
            </div>
            <div class="text-right flex flex-col items-end gap-1">
                <p class="font-black text-emerald-700">+ ${t.montant.toLocaleString()} F</p>
                <span class="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Réussi</span>
                <button onclick="genererReçu(${JSON.stringify(t).replace(/"/g, '&quot;')})" 
                        class="text-[10px] bg-esp-blue hover:bg-blue-800 text-white px-2 py-0.5 rounded font-medium transition cursor-pointer">
                    <i class="fa-solid fa-download mr-1"></i>Reçu
                </button>
            </div>
        `;
        container.appendChild(item);
    });
}

// ============================================================
// CHARGEMENT DU DASHBOARD
// ============================================================
function chargerDashboard(etudiant) {
    if (dashboardCharge) {
        console.log("🔄 Dashboard déjà chargé, ignore.");
        return;
    }
    
    dashboardCharge = true;
    montantReelGlobal = etudiant.montant_deja_paye || 0;
    
    // Mettre à jour la date de dernière connexion
    const derniereConnexion = mettreAJourDateConnexion();
    
    document.getElementById('student-name').innerText = `${etudiant.prenom} ${etudiant.nom}`;
    document.getElementById('student-info').innerText = `${etudiant.identifiant_type} : ${etudiant.identifiant_valeur}`;
    
    // Afficher la date de dernière connexion
    const lastLoginElement = document.getElementById('last-login');
    if (lastLoginElement) {
        lastLoginElement.innerText = `🕐 Dernière connexion : ${derniereConnexion}`;
    }
    
    // Afficher le statut de vérification email
    const user = auth.currentUser;
    if (user) {
        afficherStatutEmail(user);
    }
    
    const soldeCard = document.getElementById('solde-card');
    const formPaiement = document.getElementById('form-paiement-box');
    const msgPublic = document.getElementById('msg-public-scolarite');

    if (etudiant.cycle === "DUT" || etudiant.cycle === "DIC") {
        soldeCard.classList.add('hidden');
        formPaiement.classList.add('hidden');
        msgPublic.classList.remove('hidden');
    } else {
        soldeCard.classList.remove('hidden');
        formPaiement.classList.remove('hidden');
        msgPublic.classList.add('hidden');
        if (!soldeMasque) {
            document.getElementById('solde-affiche').innerHTML = `${montantReelGlobal.toLocaleString()} <span class="text-sm font-bold">FCFA</span>`;
        }
        genererHistorique(etudiant.transactions || []);
    }
    
    showDashboard();
    showToast(`👋 Bienvenue ${etudiant.prenom} !`, 'success');
}

// ============================================================
// THÈME (Clair / Sombre)
// ============================================================
const themeLight = document.getElementById('theme-light');
const themeDark = document.getElementById('theme-dark');

if (localStorage.getItem('esp_pay_theme') === 'dark') {
    document.getElementById('app-body').classList.add('dark-mode');
    themeDark.className = "flex-1 py-2 px-4 rounded-xl border-2 border-esp-blue bg-esp-blue text-white text-sm font-bold transition cursor-pointer";
    themeLight.className = "flex-1 py-2 px-4 rounded-xl border-2 border-gray-300 bg-white text-gray-700 text-sm font-medium transition cursor-pointer hover:border-gray-400";
} else {
    themeLight.className = "flex-1 py-2 px-4 rounded-xl border-2 border-esp-blue bg-esp-blue text-white text-sm font-bold transition cursor-pointer";
    themeDark.className = "flex-1 py-2 px-4 rounded-xl border-2 border-gray-300 bg-white text-gray-700 text-sm font-medium transition cursor-pointer hover:border-gray-400";
}

themeLight.addEventListener('click', () => {
    document.getElementById('app-body').classList.remove('dark-mode');
    localStorage.setItem('esp_pay_theme', 'light');
    themeLight.className = "flex-1 py-2 px-4 rounded-xl border-2 border-esp-blue bg-esp-blue text-white text-sm font-bold transition cursor-pointer";
    themeDark.className = "flex-1 py-2 px-4 rounded-xl border-2 border-gray-300 bg-white text-gray-700 text-sm font-medium transition cursor-pointer hover:border-gray-400";
});

themeDark.addEventListener('click', () => {
    document.getElementById('app-body').classList.add('dark-mode');
    localStorage.setItem('esp_pay_theme', 'dark');
    themeDark.className = "flex-1 py-2 px-4 rounded-xl border-2 border-esp-blue bg-esp-blue text-white text-sm font-bold transition cursor-pointer";
    themeLight.className = "flex-1 py-2 px-4 rounded-xl border-2 border-gray-300 bg-white text-gray-700 text-sm font-medium transition cursor-pointer hover:border-gray-400";
});

// ============================================================
// INSCRIPTION
// ============================================================
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const prenom = document.getElementById('reg-prenom').value.trim();
    const nom = document.getElementById('reg-nom').value.trim();
    const cycle = regCycle.value;
    const niveau = regNiveau.value;
    const option = regOption.value;
    const docValue = document.getElementById('reg-document').value.trim().toUpperCase();
    const photo = document.getElementById('reg-photo').files[0];
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-password-confirm').value;

    let hasError = false;

    if (!prenom) {
        document.getElementById('reg-prenom').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-prenom').classList.remove('border-gray-300');
        document.getElementById('reg-prenom-error').classList.remove('hidden');
        hasError = true;
    }

    if (!nom) {
        document.getElementById('reg-nom').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-nom').classList.remove('border-gray-300');
        document.getElementById('reg-nom-error').classList.remove('hidden');
        hasError = true;
    }

    if (!cycle) {
        document.getElementById('reg-cycle').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-cycle').classList.remove('border-gray-300');
        document.getElementById('reg-cycle-error').classList.remove('hidden');
        hasError = true;
    }

    if (!niveau) {
        document.getElementById('reg-niveau').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-niveau').classList.remove('border-gray-300');
        document.getElementById('reg-niveau-error').classList.remove('hidden');
        hasError = true;
    }

    if (!option) {
        document.getElementById('reg-option').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-option').classList.remove('border-gray-300');
        document.getElementById('reg-option-error').classList.remove('hidden');
        hasError = true;
    }

    if (!docValue) {
        document.getElementById('reg-document').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-document').classList.remove('border-gray-300');
        document.getElementById('reg-document-error').classList.remove('hidden');
        hasError = true;
    }

    if (!photo) {
        document.getElementById('reg-photo').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-photo').classList.remove('border-gray-300');
        document.getElementById('reg-photo-error').classList.remove('hidden');
        hasError = true;
    }

    if (!email) {
        document.getElementById('reg-email').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-email').classList.remove('border-gray-300');
        document.getElementById('reg-email-error').classList.remove('hidden');
        hasError = true;
    } else if (!email.endsWith('@esp.sn') && !email.endsWith('@ucad.edu.sn')) {
        document.getElementById('reg-email').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-email').classList.remove('border-gray-300');
        document.getElementById('reg-email-error').classList.remove('hidden');
        hasError = true;
    }

    if (!password) {
        document.getElementById('reg-password').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-password').classList.remove('border-gray-300');
        document.getElementById('reg-password-error').classList.remove('hidden');
        hasError = true;
    } else if (password.length < 6) {
        document.getElementById('reg-password').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-password').classList.remove('border-gray-300');
        document.getElementById('reg-password-error').classList.remove('hidden');
        hasError = true;
    }

    if (!confirm) {
        document.getElementById('reg-password-confirm').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-password-confirm').classList.remove('border-gray-300');
        document.getElementById('reg-password-confirm-error').classList.remove('hidden');
        hasError = true;
    } else if (password !== confirm) {
        document.getElementById('reg-password-confirm').classList.add('border-red-500', 'ring-red-500');
        document.getElementById('reg-password-confirm').classList.remove('border-gray-300');
        document.getElementById('reg-password-confirm-error').classList.remove('hidden');
        hasError = true;
    }

    if (hasError) {
        showToast("Veuillez corriger les champs en rouge.", "error");
        return;
    }

    const btn = document.getElementById('btn-register');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Inscription...';

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await sendEmailVerification(user);

        const estPremiereAnnee = (niveau === "DUT 1" || niveau === "Licence 1" || niveau === "DIC 1");
        const etudiantData = {
            prenom, nom, cycle, niveau, option, email,
            identifiant_type: estPremiereAnnee ? "CNI" : "Carte Étudiant",
            identifiant_valeur: docValue,
            photo_url: photo ? URL.createObjectURL(photo) : "",
            date_inscription: new Date().toISOString(),
            montant_deja_paye: 0,
            transactions: []
        };

        localStorage.setItem('esp_pay_user', JSON.stringify(etudiantData));

        showModal(
            "📧 Vérification email requise",
            `Un email de confirmation a été envoyé à :<br><strong>${email}</strong><br><br>
            📬 Vérifiez votre boîte de réception (et vos spams).<br><br>
            🔐 Une fois votre email confirmé, vous pourrez vous connecter.`,
            "success"
        );

        document.getElementById('reg-prenom').value = "";
        document.getElementById('reg-nom').value = "";
        document.getElementById('reg-email').value = "";
        document.getElementById('reg-password').value = "";
        document.getElementById('reg-password-confirm').value = "";
        document.getElementById('reg-document').value = "";
        document.getElementById('reg-photo').value = "";
        regCycle.value = "";
        regNiveau.innerHTML = '<option value="">Sélectionnez d\'abord le cycle</option>';
        regNiveau.disabled = true;
        regOption.innerHTML = '<option value="">Sélectionnez d\'abord la classe</option>';
        regOption.disabled = true;

        document.querySelectorAll('#register-form input, #register-form select').forEach(el => {
            el.classList.remove('border-red-500', 'ring-red-500');
            el.classList.add('border-gray-300');
        });
        document.querySelectorAll('#register-form .text-red-600').forEach(el => el.classList.add('hidden'));

        showLogin();

    } catch (error) {
        console.error("❌ Erreur:", error);
        if (error.code === 'auth/email-already-in-use') {
            showToast("❌ Cet email est déjà utilisé.", "error");
        } else {
            showToast("❌ Erreur: " + error.message, "error");
        }
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-lock"></i> Créer mon compte';
    }
});

// ============================================================
// CONNEXION
// ============================================================
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById('login-email');
    const passwordInput = document.getElementById('login-password');
    const emailError = document.getElementById('login-email-error');
    const passwordError = document.getElementById('login-password-error');
    
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    emailInput.classList.remove('border-red-500', 'ring-red-500');
    emailInput.classList.add('border-gray-300');
    emailError.classList.add('hidden');
    emailError.innerText = '';
    passwordInput.classList.remove('border-red-500', 'ring-red-500');
    passwordInput.classList.add('border-gray-300');
    passwordError.classList.add('hidden');
    passwordError.innerText = '';

    let hasError = false;

    if (!email) {
        emailInput.classList.add('border-red-500', 'ring-red-500');
        emailInput.classList.remove('border-gray-300');
        emailError.classList.remove('hidden');
        emailError.innerText = 'Veuillez saisir votre email.';
        hasError = true;
    } else if (!email.endsWith('@esp.sn') && !email.endsWith('@ucad.edu.sn')) {
        emailInput.classList.add('border-red-500', 'ring-red-500');
        emailInput.classList.remove('border-gray-300');
        emailError.classList.remove('hidden');
        emailError.innerText = 'Veuillez utiliser votre email @esp.sn ou @ucad.edu.sn.';
        hasError = true;
    }

    if (!password) {
        passwordInput.classList.add('border-red-500', 'ring-red-500');
        passwordInput.classList.remove('border-gray-300');
        passwordError.classList.remove('hidden');
        passwordError.innerText = 'Veuillez saisir votre mot de passe.';
        hasError = true;
    } else if (password.length < 6) {
        passwordInput.classList.add('border-red-500', 'ring-red-500');
        passwordInput.classList.remove('border-gray-300');
        passwordError.classList.remove('hidden');
        passwordError.innerText = 'Le mot de passe doit contenir au moins 6 caractères.';
        hasError = true;
    }

    if (hasError) {
        return;
    }

    const btn = document.getElementById('btn-login');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Connexion...';

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            showModal(
                "📧 Email non vérifié",
                `Veuillez vérifier votre boîte mail :<br><strong>${email}</strong><br><br>
                📬 Un email de confirmation a été envoyé.<br><br>
                🔄 Après vérification, reconnectez-vous.`,
                "error"
            );
            await signOut(auth);
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Se connecter';
            return;
        }

        const etudiantStr = localStorage.getItem('esp_pay_user');
        if (etudiantStr) {
            const etudiant = JSON.parse(etudiantStr);
            if (etudiant.email === email) {
                chargerDashboard(etudiant);
            } else {
                emailInput.classList.add('border-red-500', 'ring-red-500');
                emailInput.classList.remove('border-gray-300');
                emailError.classList.remove('hidden');
                emailError.innerText = '❌ Les données de ce compte sont incorrectes. Veuillez vous réinscrire.';
                await signOut(auth);
            }
        } else {
            emailInput.classList.add('border-red-500', 'ring-red-500');
            emailInput.classList.remove('border-gray-300');
            emailError.classList.remove('hidden');
            emailError.innerText = '❌ Aucun profil trouvé pour cet email. Veuillez vous inscrire.';
            await signOut(auth);
        }

    } catch (error) {
        console.error("❌ Erreur:", error);
        
        let errorMessage = '';
        
        if (error.code === 'auth/user-not-found') {
            errorMessage = '❌ Aucun compte associé à cet email. Veuillez vous inscrire.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage = '❌ Mot de passe incorrect. Veuillez réessayer.';
        } else if (error.code === 'auth/invalid-credential') {
            errorMessage = '❌ Email ou mot de passe incorrect. Veuillez réessayer.';
        } else if (error.code === 'auth/too-many-requests') {
            errorMessage = '❌ Trop de tentatives. Veuillez réessayer plus tard.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = '❌ Format d\'email invalide. Veuillez vérifier votre saisie.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = '❌ Ce compte a été désactivé. Veuillez contacter l\'administration.';
        } else {
            errorMessage = '❌ Une erreur est survenue. Veuillez réessayer.';
        }

        emailInput.classList.add('border-red-500', 'ring-red-500');
        emailInput.classList.remove('border-gray-300');
        emailError.classList.remove('hidden');
        emailError.innerText = errorMessage;
        
        passwordInput.classList.add('border-red-500', 'ring-red-500');
        passwordInput.classList.remove('border-gray-300');

    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Se connecter';
    }
});

// ============================================================
// PAIEMENT (SIMULÉ)
// ============================================================
document.getElementById('btn-payer').addEventListener('click', async () => {
    const montant = parseInt(document.getElementById('amount-input').value);
    const operator = document.querySelector('input[name="operator"]:checked');

    if (!montant || montant < 5000) {
        showToast("Le montant minimum est de 5 000 FCFA.", "error");
        return;
    }
    if (!operator) {
        showToast("Sélectionnez un opérateur.", "error");
        return;
    }

    const btn = document.getElementById('btn-payer');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Traitement...';

    try {
        const user = auth.currentUser;
        if (!user) {
            showToast("Veuillez vous reconnecter.", "error");
            return;
        }

        const etudiantStr = localStorage.getItem('esp_pay_user');
        if (!etudiantStr) {
            showToast("Profil introuvable.", "error");
            return;
        }

        const etudiant = JSON.parse(etudiantStr);
        const transaction = {
            montant: montant,
            operateur: operator.value,
            date: new Date().toLocaleString('fr-FR'),
            id_transaction: "TXN-" + Date.now().toString().slice(-6)
        };

        etudiant.montant_deja_paye = (etudiant.montant_deja_paye || 0) + montant;
        etudiant.transactions = etudiant.transactions || [];
        etudiant.transactions.push(transaction);

        localStorage.setItem('esp_pay_user', JSON.stringify(etudiant));

        montantReelGlobal = etudiant.montant_deja_paye;
        if (!soldeMasque) {
            document.getElementById('solde-affiche').innerHTML = `${montantReelGlobal.toLocaleString()} <span class="text-sm font-bold">FCFA</span>`;
        }
        genererHistorique(etudiant.transactions);

        showModal(
            "✅ Paiement Réussi",
            `Votre versement de ${montant.toLocaleString()} FCFA via ${operator.value} a été enregistré.`,
            "success"
        );
        document.getElementById('amount-input').value = "";

    } catch (error) {
        console.error("❌ Erreur:", error);
        showToast("Erreur lors du paiement.", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-credit-card"></i> Procéder au paiement';
    }
});

// ============================================================
// MODIFICATION DU MOT DE PASSE (2 ÉTAPES)
// ============================================================
const stepCurrentPassword = document.getElementById('step-current-password');
const stepNewPassword = document.getElementById('step-new-password');
const currentPasswordInput = document.getElementById('settings-current-password');
const newPasswordInput = document.getElementById('settings-new-password');
const confirmPasswordInput = document.getElementById('settings-confirm-password');
const btnVerify = document.getElementById('btn-verify-password');
const btnUpdate = document.getElementById('btn-update-pwd');

btnVerify.addEventListener('click', async () => {
    const currentPwd = currentPasswordInput.value;

    if (!currentPwd) {
        currentPasswordInput.classList.add('border-red-500', 'ring-red-500');
        currentPasswordInput.classList.remove('border-gray-300');
        showToast("Veuillez saisir votre mot de passe actuel.", "error");
        return;
    }

    if (currentPwd.length < 6) {
        currentPasswordInput.classList.add('border-red-500', 'ring-red-500');
        currentPasswordInput.classList.remove('border-gray-300');
        showToast("Le mot de passe doit contenir au moins 6 caractères.", "error");
        return;
    }

    btnVerify.disabled = true;
    btnVerify.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Vérification...';

    try {
        const user = auth.currentUser;
        if (!user) {
            showToast("Veuillez vous reconnecter.", "error");
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, currentPwd);
        await reauthenticateWithCredential(user, credential);

        stepCurrentPassword.classList.add('hidden');
        stepNewPassword.classList.remove('hidden');
        currentPasswordInput.value = "";
        currentPasswordInput.classList.remove('border-red-500', 'ring-red-500');
        currentPasswordInput.classList.add('border-gray-300');
        showToast("✅ Mot de passe vérifié, vous pouvez maintenant le modifier.", "success");

    } catch (error) {
        console.error("❌ Erreur:", error);
        if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            currentPasswordInput.classList.add('border-red-500', 'ring-red-500');
            currentPasswordInput.classList.remove('border-gray-300');
            showToast("❌ Mot de passe actuel incorrect.", "error");
        } else {
            showToast("❌ Erreur: " + error.message, "error");
        }
    } finally {
        btnVerify.disabled = false;
        btnVerify.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Vérifier';
    }
});

btnUpdate.addEventListener('click', async () => {
    const newPwd = newPasswordInput.value;
    const confirmPwd = confirmPasswordInput.value;

    if (!newPwd || !confirmPwd) {
        if (!newPwd) {
            newPasswordInput.classList.add('border-red-500', 'ring-red-500');
            newPasswordInput.classList.remove('border-gray-300');
        }
        if (!confirmPwd) {
            confirmPasswordInput.classList.add('border-red-500', 'ring-red-500');
            confirmPasswordInput.classList.remove('border-gray-300');
        }
        showToast("Veuillez remplir tous les champs.", "error");
        return;
    }

    if (newPwd.length < 6) {
        newPasswordInput.classList.add('border-red-500', 'ring-red-500');
        newPasswordInput.classList.remove('border-gray-300');
        showToast("Le mot de passe doit contenir au moins 6 caractères.", "error");
        return;
    }

    if (newPwd !== confirmPwd) {
        confirmPasswordInput.classList.add('border-red-500', 'ring-red-500');
        confirmPasswordInput.classList.remove('border-gray-300');
        showToast("❌ Les mots de passe ne correspondent pas.", "error");
        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
        newPasswordInput.focus();
        return;
    }

    btnUpdate.disabled = true;
    btnUpdate.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Mise à jour...';

    try {
        const user = auth.currentUser;
        if (!user) {
            showToast("Veuillez vous reconnecter.", "error");
            return;
        }

        await updatePassword(user, newPwd);

        showModal("✅ Succès", "Votre mot de passe a bien été mis à jour.", "success");

        newPasswordInput.value = "";
        confirmPasswordInput.value = "";
        newPasswordInput.classList.remove('border-red-500', 'ring-red-500');
        newPasswordInput.classList.add('border-gray-300');
        confirmPasswordInput.classList.remove('border-red-500', 'ring-red-500');
        confirmPasswordInput.classList.add('border-gray-300');
        stepNewPassword.classList.add('hidden');
        stepCurrentPassword.classList.remove('hidden');

    } catch (error) {
        console.error("❌ Erreur:", error);
        if (error.code === 'auth/requires-recent-login') {
            showToast("Veuillez vous reconnecter avant de modifier le mot de passe.", "error");
            newPasswordInput.value = "";
            confirmPasswordInput.value = "";
            stepNewPassword.classList.add('hidden');
            stepCurrentPassword.classList.remove('hidden');
        } else {
            showToast("Erreur: " + error.message, "error");
        }
    } finally {
        btnUpdate.disabled = false;
        btnUpdate.innerHTML = '<i class="fa-solid fa-rotate mr-2"></i>Mettre à jour';
    }
});

// ============================================================
// FEEDBACK (stockage local)
// ============================================================
document.getElementById('feedback-form').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nom = document.getElementById('feedback-nom').value.trim();
    const email = document.getElementById('feedback-email').value.trim();
    const message = document.getElementById('feedback-message').value.trim();
    
    if (!nom || !email || !message) {
        showToast("Veuillez remplir tous les champs.", "error");
        return;
    }
    
    const feedbacks = JSON.parse(localStorage.getItem('esp_pay_feedbacks') || '[]');
    feedbacks.push({
        nom, email, message,
        date: new Date().toLocaleString('fr-FR')
    });
    localStorage.setItem('esp_pay_feedbacks', JSON.stringify(feedbacks));
    
    showModal("✅ Merci !", "Votre message a bien été envoyé. Nous vous répondrons dans les plus brefs délais.", "success");
    
    document.getElementById('feedback-nom').value = "";
    document.getElementById('feedback-email').value = "";
    document.getElementById('feedback-message').value = "";
});

// ============================================================
// AFFICHAGE / MASQUAGE DU SOLDE
// ============================================================
document.getElementById('btn-toggle-eye').addEventListener('click', () => {
    soldeMasque = !soldeMasque;
    const solde = document.getElementById('solde-affiche');
    const icon = document.getElementById('eye-icon');
    if (soldeMasque) {
        solde.innerHTML = "••••••• <span class='text-sm font-bold'>FCFA</span>";
        icon.className = "fa-solid fa-eye-slash";
    } else {
        solde.innerHTML = `${montantReelGlobal.toLocaleString()} <span class="text-sm font-bold">FCFA</span>`;
        icon.className = "fa-solid fa-eye";
    }
});

// ============================================================
// DÉCONNEXION (avec confirmation)
// ============================================================
const logoutModal = document.getElementById('logout-modal');
const logoutConfirm = document.getElementById('logout-confirm');
const logoutCancel = document.getElementById('logout-cancel');

document.getElementById('btn-logout').addEventListener('click', (e) => {
    e.preventDefault();
    logoutModal.classList.remove('hidden');
    logoutModal.classList.add('flex');
    setTimeout(() => {
        logoutModal.classList.remove('opacity-0');
        logoutModal.querySelector('div').classList.remove('scale-95');
    }, 10);
});

logoutCancel.addEventListener('click', () => {
    logoutModal.classList.add('opacity-0');
    logoutModal.querySelector('div').classList.add('scale-95');
    setTimeout(() => {
        logoutModal.classList.remove('flex');
        logoutModal.classList.add('hidden');
    }, 300);
});

logoutConfirm.addEventListener('click', async () => {
    try {
        logoutModal.classList.add('opacity-0');
        logoutModal.querySelector('div').classList.add('scale-95');
        setTimeout(() => {
            logoutModal.classList.remove('flex');
            logoutModal.classList.add('hidden');
        }, 300);
        
        await signOut(auth);
        dashboardCharge = false;
        showLogin();
        showToast("✅ Déconnecté avec succès.", "success");
    } catch (error) {
        console.error("❌ Erreur déconnexion:", error);
        showToast("❌ Erreur lors de la déconnexion.", "error");
    }
});

logoutModal.addEventListener('click', (e) => {
    if (e.target === logoutModal) {
        logoutCancel.click();
    }
});

// ============================================================
// SURVEILLANCE AUTH (PASSIVE)
// ============================================================
onAuthStateChanged(auth, (user) => {
    console.log("🔄 Auth:", user ? `Connecté: ${user.email}` : "Déconnecté");
    
    if (user) {
        const etudiantStr = localStorage.getItem('esp_pay_user');
        if (etudiantStr) {
            const etudiant = JSON.parse(etudiantStr);
            if (etudiant.email === user.email && user.emailVerified) {
                chargerDashboard(etudiant);
                return;
            }
        }
        showLogin();
    } else {
        dashboardCharge = false;
        showLogin();
    }
});

// ============================================================
// TOGGLES DES SECTIONS PARAMÈTRES
// ============================================================

function toggleSection(toggleId, contentId, arrowId) {
    const toggle = document.getElementById(toggleId);
    const content = document.getElementById(contentId);
    const arrow = document.getElementById(arrowId);

    if (toggle && content && arrow) {
        toggle.addEventListener('click', () => {
            content.classList.toggle('hidden');
            arrow.classList.toggle('rotate-90');
            arrow.textContent = content.classList.contains('hidden') ? '▶' : '▼';
        });
    }
}

toggleSection('theme-toggle', 'theme-content', 'theme-arrow');
toggleSection('password-toggle', 'password-content', 'password-arrow');
toggleSection('contact-toggle', 'contact-content', 'contact-arrow');
toggleSection('feedback-toggle', 'feedback-content', 'feedback-arrow');
toggleSection('help-toggle', 'help-content', 'help-arrow');

console.log("🚀 ESP Pay - Version complète");