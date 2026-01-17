// --- EarnMaster Pro Master Security & Admin Control ---

(function() {
    const userId = localStorage.getItem('currentUserId');
    const path = window.location.pathname;
    const currentPage = path.split("/").pop();
    const publicPages = ['login.html', 'register.html', 'forget.html', 'index.html', ''];

    // ১. লগইন প্রোটেকশন
    if (!userId && !publicPages.includes(currentPage)) {
        window.location.replace('login.html');
        return;
    }

    // ২. ফায়ারবেস থেকে সেটিংস আনা এবং সেশন চেক করা
    if (userId) {
        // ডাইনামিক ইম্পোর্ট (যাতে সব পেজে ফায়ারবেস লোড থাকে)
        import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js").then(m => {
            const { initializeApp } = m;
            import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js").then(f => {
                const { getFirestore, doc, onSnapshot } = f;

                const firebaseConfig = {
                    apiKey: "AIzaSyD-XRUDILxlkOQk4bbpkajLFaRmCVeMxEk",
                    authDomain: "test-54fa2.firebaseapp.com",
                    projectId: "test-54fa2",
                    appId: "1:496937911936:web:5f48c8712f58f2e26fc865"
                };
                const app = initializeApp(firebaseConfig);
                const db = getFirestore(app);

                // অ্যাডমিন সেটিংস রিয়েল-টাইম চেক করা
                onSnapshot(doc(db, "settings", "appConfig"), (snapshot) => {
                    if (snapshot.exists()) {
                        const config = snapshot.data();
                        const SESSION_LIMIT = config.totalMs; // অ্যাডমিনের দেওয়া সময়
                        const LOGOUT_MSG = config.alertMsg;   // অ্যাডমিনের দেওয়া মেসেজ

                        // সেশন চেক ফাংশন
                        const checkInactivity = () => {
                            const lastActivity = localStorage.getItem('lastActivity');
                            if (lastActivity && (Date.now() - lastActivity > SESSION_LIMIT)) {
                                alert(LOGOUT_MSG);
                                window.logoutUser();
                            }
                        };

                        // আগে কোনো টাইমার থাকলে ক্লিয়ার করে নতুন টাইমার শুরু
                        if (window.inactivityTimer) clearInterval(window.inactivityTimer);
                        window.inactivityTimer = setInterval(checkInactivity, 5000); // প্রতি ৫ সেকেন্ডে চেক করবে
                    }
                });

                // ইউজার ব্লকড কি না তা চেক করা
                onSnapshot(doc(db, "users", userId), (userSnap) => {
                    if (userSnap.exists() && userSnap.data().status === "blocked") {
                        alert("আপনার অ্যাকাউন্টটি ব্লক করা হয়েছে!");
                        window.logoutUser();
                    }
                });
            });
        });

        // ইউজারের অ্যাক্টিভিটি রিসেট করা
        const resetTimer = () => localStorage.setItem('lastActivity', Date.now());
        window.onload = resetTimer;
        document.onmousemove = resetTimer;
        document.onkeypress = resetTimer;
        document.onclick = resetTimer;
        document.onscroll = resetTimer;
    }

    // ৩. হ্যাকিং প্রোটেকশন (Inspect & Right Click Block)
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.onkeydown = e => {
        if (e.keyCode == 123 || (e.ctrlKey && e.shiftKey && (e.keyCode == 73 || e.keyCode == 74)) || (e.ctrlKey && e.keyCode == 85)) {
            return false;
        }
    };
})();

// ৪. মাস্টার লগআউট ফাংশন
window.logoutUser = function() {
    localStorage.clear();
    sessionStorage.clear();
    window.location.replace('login.html');
};