    // --- 翻訳データ ---
    const translations = {
    ja: {
        nav_home: "ホーム",
        nav_operator: "運営者について",
        nav_mission: "ミッション",
        nav_services: "サービス",
        nav_docs: "ドキュメント",
        nav_st: "ステータス",
        nav_it: "小学生向けIT検定",
        register: "登録",
        login: "ログイン",
        hero_title: "ryopc org",
        hero_desc: "世界中の誰もが、デジタルデバイスの正当なサポートを受けられる社会を目指します。",
        mission_title: "私たちのミッション",
        mission_body: "ryopCEO率いるryopcは、デジタル優先のグローバルな取り組みです。私たちはテクノロジーへのアクセスが基本的人権であると信じており、それを維持するためには公平で透明性のあるサポートが不可欠です。世界中の不正なサポート行為からユーザーを保護します。",
        services_title: "提供するサービス",
        services_body: "正当なデバイスガイダンスやデジタルリテラシーの提唱を含む、多層的なエコシステムを提供します。グローバルコミュニティの進化するニーズに応えるため、多様なデジタルソリューションを順次展開していく予定です。",
        btn_docs: "プロジェクトドキュメントを見る",
        cookie_text: "<strong>クッキーの使用について</strong><br>このサイトでは、チャットサポートの提供や体験向上のためにクッキーを使用します。同意することで、サポートサービスを利用できるようになります。",
        cookie_accept: "同意して利用開始",
        cookie_deny: "拒否",
        chat_btn: "チャットサポート",
        status_text: "ステータス: Open Source Collective (米国カリフォルニア州) への申請中",
        nav_note: "ブログ",
        contact_title: "お問い合わせ",
        contact_body: "プロジェクトに関するご質問やご相談は、以下のフォームよりお気軽にお問い合わせください。",
        label_name: "お名前",
        label_email: "メールアドレス",
        label_subject: "ご用件",
        label_message: "メッセージ内容",
        opt_general: "一般のお問い合わせ",
        opt_project: "プロジェクトへの参加",
        opt_other: "その他",
        btn_submit: "メッセージを送信"
    },
    en: {
        nav_home: "Home",
        nav_mission: "Mission",
        nav_services: "Services",
        nav_operator: "About the Operator",
        nav_docs: "Docs",
        nav_st: "Status",
        nav_it: "IT Certification for Elementary School Students",
        register: "Register",
        login: "Login",
        hero_title: "ryopc org",
        hero_desc: "Ensuring everyone, everywhere, has access to legitimate support for digital devices.",
        mission_title: "Our Mission",
        mission_body: "Led by ryopcCEO, ryopc is a digital-first global initiative. We believe that access to technology is a fundamental right, and fair, transparent support is essential to maintain it. We protect users from fraudulent support practices worldwide.",
        services_title: "Our Services",
        services_body: "We provide a multi-layered ecosystem including legitimate device guidance and digital literacy advocacy. We plan to sequentially launch diverse digital solutions to meet the evolving needs of the global community.",
        btn_docs: "View Project Documentation",
        cookie_text: "<strong>About the Use of Cookies</strong><br>This site uses cookies to provide chat support and improve your experience. By agreeing, you can use our chat service.",
        cookie_accept: "Accept",
        cookie_deny: "Deny",
        chat_btn: "Chat Support",
        status_text: "Status: Under application for Open Source Collective (Covina, CA, USA)",
        nav_note: "blog",
        contact_title: "Contact Us",
        contact_body: "If you have any questions or inquiries about the project, please feel free to contact us using the form below.",
        label_name: "Name",
        label_email: "Email Address",
        label_subject: "Subject",
        label_message: "Message",
        opt_general: "General Inquiry",
        opt_project: "Join the Project",
        opt_other: "Other",
        btn_submit: "Send Message"
    },
    pt: {
        nav_home: "Início",
        nav_mission: "Missão",
        nav_services: "Serviços",
        nav_st: "Estado",
        nav_operator: "Sobre o Operador",
        nav_docs: "Docs",
        nav_it: "Certificação IT para alunos do ensino básico",
        register: "Registrar",
        login: "Login",
        hero_title: "ryopc org",
        hero_desc: "Garantindo que todos, em todos os lugares, tenham acesso a suporte legítimo para dispositivos digitais.",
        mission_title: "Nossa Missão",
        mission_body: "Liderada por ryopcCEO, a ryopc é uma iniciativa global focada no digital. Acreditamos que o acesso à tecnologia é um direito fundamental, e o suporte justo e transparente é essencial para mantê-lo. Protegemos os usuários de práticas de suporte fraudulentas em todo o mundo.",
        services_title: "Nossos Serviços",
        services_body: "Oferecemos um ecossistema multifacetado que inclui orientação legítima de dispositivos e defesa da alfabetização digital. Planejamos lançar sequencialmente diversas soluções digitais para atender às necessidades da comunidade global.",
        btn_docs: "Ver Documentação do Projeto",
        cookie_text: "<strong>Sobre o uso de cookies</strong><br>Este site usa cookies para fornecer suporte por chat e melhorar sua experiência. Ao concordar, você poderá usar nosso serviço de chat.",
        cookie_accept: "Aceitar",
        cookie_deny: "Recusar",
        chat_btn: "Suporte por Chat",
        status_text: "Status: Em processo de candidatura para Open Source Collective (Covina, CA, EUA)",
        nav_note: "Blog",
        contact_title: "Contate-nos",
        contact_body: "Se você tiver alguma dúvida sobre o projeto, sinta-se à vontade para nos contatar usando o formulário abaixo.",
        label_name: "Nome",
        label_email: "Endereço de Email",
        label_subject: "Assunto",
        label_message: "Mensagem",
        opt_general: "Consulta Geral",
        opt_project: "Participar do Projeto",
        opt_other: "Outro",
        btn_submit: "Enviar Mensagem"
    }
};

    // --- ハンバーガーメニューの開閉処理 ---
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menuToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // --- 言語切り替え機能 ---
    function changeLanguage(lang) {
        document.documentElement.lang = lang;
        safeStorage.set("preferred_lang", lang);
        
        document.querySelectorAll('[data-t]').forEach(el => {
            const key = el.getAttribute('data-t');
            if (translations[lang] && translations[lang][key]) {
                el.innerHTML = translations[lang][key];
            }
        });

        const nameInput = document.getElementById('form_name');
        const emailInput = document.getElementById('form_email');
        const msgInput = document.getElementById('form_message');
        
        if (lang === 'ja') {
            if (nameInput) nameInput.placeholder = 'お名前を入力してください';
            if (emailInput) emailInput.placeholder = 'your.email@example.com';
            if (msgInput) msgInput.placeholder = 'メッセージをここに入力してください...';
        } else if (lang === 'pt') {
            if (nameInput) nameInput.placeholder = 'Seu Nome';
            if (emailInput) emailInput.placeholder = 'seu.email@exemplo.com';
            if (msgInput) msgInput.placeholder = 'Digite sua mensagem aqui...';
        } else {
            if (nameInput) nameInput.placeholder = 'Your Name';
            if (emailInput) emailInput.placeholder = 'your.email@example.com';
            if (msgInput) msgInput.placeholder = 'Type your message here...';
        }
    }

// --- セーフストレージ ---
    const safeStorage = {
        get: (key) => { try { return localStorage.getItem(key); } catch (e) { return window['fb_' + key] || null; } },
        set: (key, val) => { try { localStorage.setItem(key, val); } catch (e) { window['fb_' + key] = val; } }
    };

    // 画面が読み込まれたときの処理
    window.addEventListener('DOMContentLoaded', () => {
        const savedLang = safeStorage.get("preferred_lang") || 'ja';
        const langSelector = document.getElementById('langSelector');
        
        if (langSelector) {
            langSelector.value = savedLang;
            
            // メニューが切り替わったら、その言語に変える命令
            langSelector.addEventListener('change', (e) => {
                changeLanguage(e.target.value);
            });
        }
        
        // 最初に保存されている言語で文字を表示する命令
        changeLanguage(savedLang);
    });

    // --- お問い合わせフォームの送信制御 ---
    document.getElementById('contactForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();

        const form = this;
        const submitBtn = form.querySelector('.form-submit-btn');
        const originalBtnHtml = submitBtn.innerHTML;

        submitBtn.innerHTML = '<span>Sending...</span>';
        submitBtn.style.opacity = '0.6';
        submitBtn.style.pointerEvents = 'none';

        const formData = new FormData(form);

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                mode: 'no-cors'
            });

            const cardSection = document.getElementById('contact');
            if (cardSection) {
                cardSection.style.opacity = '0';
                setTimeout(() => {
                    cardSection.innerHTML = `
                        <h2 style="color: var(--primary);">Thank You!</h2>
                        <p style="font-size: 1.1rem; margin-top: 1.5rem;">メッセージは正常に送信されました。<br>リアルタイムにコックピット（PWA）へ通知されました。</p>
                        <div style="text-align: center; margin-top: 2rem;">
                            <div style="display:inline-block; width: 12px; height: 12px; background: var(--accent); border-radius:50%; box-shadow: 0 0 12px var(--accent);"></div>
                        </div>
                    `;
                    cardSection.style.opacity = '1';
                }, 400);
            }

        } catch (error) {
            console.error('Submission Error:', error);
            alert('送信中にエラーが発生しました。時間を置いて再度お試しください。');
            
            submitBtn.innerHTML = originalBtnHtml;
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'auto';
        }
    });

    // --- スクロールインジケーターの制御 ---
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        const progress = document.getElementById("scroll-progress");
        if (progress) progress.style.width = scrolled + "%";
    });
