/* ==========================================================================
   AgroVida — main.js
   Solution section: Desktop / Mobile view toggle + prev/next pagination
   ========================================================================== */

   (function () {
    'use strict';
  
    /* ================================================================
       Solution image viewer
       "click to switch" toggles between Desktop and Mobile views.
       prev/next navigate pages within the current view.
       Desktop: 4 BackOffice screenshots (2 per page × 2 pages)
       Mobile:  6 Mobile screenshots (3 per page × 2 pages)
       ================================================================ */
    (function () {
      const views = {
        desktop: {
          label: 'Desktop',
          pages: [
            ['image/desktop1.png', 'image/desktop2.png'],
            ['image/desktop3.png', 'image/desktop4.png'],
          ],
          layout: 'desktop',
        },
        mobile: {
          label: 'Mobile',
          pages: [
            ['image/mobil1.jpg', 'image/mobil2.jpg', 'image/mobil3.jpg'],
            ['image/mobil4.jpg', 'image/mobil5.jpg', 'image/mobil6.jpg'],
          ],
          layout: 'mobile',
        },
      };
  
      let currentView = 'desktop';
      let currentPage = 0;
  
      const container  = document.getElementById('solutionImages');
      const btnPrev    = document.getElementById('solutionPrev');
      const btnNext    = document.getElementById('solutionNext');
      const btnSwitch  = document.getElementById('solutionSwitch');
      const viewLabel  = document.getElementById('solutionViewLabel');
  
      if (!container || !btnPrev || !btnNext) return;
  
      function render() {
        const view = views[currentView];
        const page = view.pages[currentPage];
  
        container.innerHTML = `<div class="solution__slide solution__slide--${view.layout}">
          ${page.map((src, i) => `<div class="solution__img-wrap solution__img-wrap--${view.layout}" data-index="${i}">
            <img src="${src}" alt="${view.label} view" class="solution__zoomable" />
            <span class="solution__zoom-hint">🔍</span>
          </div>`).join('')}
        </div>`;
  
        // Build flat list of all images in current view for lightbox nav
        allImages = views[currentView].pages.flat();
  
        // Bind click-to-zoom on each image
        container.querySelectorAll('.solution__zoomable').forEach((img) => {
          img.addEventListener('click', (e) => {
            const rect = img.getBoundingClientRect();
            openLightbox(img.src, rect);
          });
        });
  
        // Update prev/next visibility
        const totalPages = view.pages.length;
        btnPrev.style.opacity = currentPage === 0 ? '0.35' : '1';
        btnNext.style.opacity = currentPage === totalPages - 1 ? '0.35' : '1';
  
        // Update switch button label
        const nextView = currentView === 'desktop' ? 'Mobile' : 'Desktop';
        if (btnSwitch) btnSwitch.textContent = `Switch to ${nextView}`;
        if (viewLabel) viewLabel.textContent = view.label + ' View';
      }
  
      /* ── Lightbox ── */
      let allImages   = [];
      let lbCurrent   = 0;
  
      function buildLightbox() {
        if (document.getElementById('solutionLightbox')) return;
        const lb = document.createElement('div');
        lb.id = 'solutionLightbox';
        lb.innerHTML = `
          <div class="lb-backdrop"></div>
          <div class="lb-frame">
            <button class="lb-close" aria-label="Fermer">&#10005;</button>
            <button class="lb-arrow lb-arrow--prev" aria-label="Précédent">&#8249;</button>
            <div class="lb-img-wrap">
              <img class="lb-img" src="" alt="Vue agrandie" />
            </div>
            <button class="lb-arrow lb-arrow--next" aria-label="Suivant">&#8250;</button>
            <div class="lb-counter" id="lbCounter">1 / 1</div>
          </div>`;
        document.body.appendChild(lb);
  
        lb.querySelector('.lb-backdrop').addEventListener('click', closeLightbox);
        lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
        lb.querySelector('.lb-arrow--prev').addEventListener('click', () => lbNav(-1));
        lb.querySelector('.lb-arrow--next').addEventListener('click', () => lbNav(1));
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape')      closeLightbox();
          if (e.key === 'ArrowLeft')   lbNav(-1);
          if (e.key === 'ArrowRight')  lbNav(1);
        });
      }
  
      function openLightbox(src, originRect) {
        buildLightbox();
        lbCurrent = allImages.indexOf(src);
        if (lbCurrent < 0) lbCurrent = 0;
  
        const lb    = document.getElementById('solutionLightbox');
        const img   = lb.querySelector('.lb-img');
        const frame = lb.querySelector('.lb-frame');
  
        // Set origin for scale animation
        if (originRect) {
          const cx = originRect.left + originRect.width  / 2;
          const cy = originRect.top  + originRect.height / 2;
          frame.style.transformOrigin = `${cx}px ${cy}px`;
        } else {
          frame.style.transformOrigin = 'center center';
        }
  
        img.src = src;
        updateLbCounter(lb);
        lb.classList.add('lb--open');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => lb.classList.add('lb--visible'));
        });
      }
  
      function closeLightbox() {
        const lb = document.getElementById('solutionLightbox');
        if (!lb) return;
        lb.classList.remove('lb--visible');
        setTimeout(() => {
          lb.classList.remove('lb--open');
          document.body.style.overflow = '';
        }, 350);
      }
  
      function lbNav(delta) {
        const lb = document.getElementById('solutionLightbox');
        if (!lb || !allImages.length) return;
        lbCurrent = (lbCurrent + delta + allImages.length) % allImages.length;
        const img = lb.querySelector('.lb-img');
        // Slide animation
        img.classList.add(delta > 0 ? 'lb-img--exit-left' : 'lb-img--exit-right');
        setTimeout(() => {
          img.src = allImages[lbCurrent];
          img.classList.remove('lb-img--exit-left', 'lb-img--exit-right');
          img.classList.add(delta > 0 ? 'lb-img--enter-right' : 'lb-img--enter-left');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => img.classList.remove('lb-img--enter-right', 'lb-img--enter-left'));
          });
          updateLbCounter(lb);
        }, 180);
      }
  
      function updateLbCounter(lb) {
        const counter = lb.querySelector('#lbCounter');
        if (counter) counter.textContent = `${lbCurrent + 1} / ${allImages.length}`;
      }
  
      function goPage(delta) {
        const view = views[currentView];
        const total = view.pages.length;
        currentPage = Math.max(0, Math.min(total - 1, currentPage + delta));
        render();
      }
  
      function switchView() {
        currentView = currentView === 'desktop' ? 'mobile' : 'desktop';
        currentPage = 0;
        render();
      }
  
      btnPrev.addEventListener('click', () => goPage(-1));
      btnNext.addEventListener('click', () => goPage(1));
      if (btnSwitch) btnSwitch.addEventListener('click', switchView);
  
      render();
    })();
  
    /* ================================================================
       Nav colour switch — VERT par défaut (desktop/tablette)
       nav--dark sur hero image et team (fonds sombres)
       Sur mobile : toujours blanc via CSS, JS ignoré
       ================================================================ */
    (function () {
      const nav = document.querySelector('.nav');
      if (!nav) return;
  
      // Sections à fond SOMBRE → nav blanche via nav--dark
      const darkSections = document.querySelectorAll('.hero__frame, .solution');
  
      // Évite le flash "vert" au chargement (l'observer callback arrive après coup).
      // On initialise nav--dark si une section sombre est déjà visible.
      let darkCount = 0;
      darkSections.forEach((s) => {
        const r = s.getBoundingClientRect();
        const isVisible = r.bottom > 0 && r.top < window.innerHeight;
        if (isVisible) darkCount += 1;
      });
      nav.classList.toggle('nav--dark', darkCount > 0);
  
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          darkCount = Math.max(0, darkCount + (e.isIntersecting ? 1 : -1));
        });
        // Sur mobile le CSS gère tout, nav--dark n'est pas nécessaire
        nav.classList.toggle('nav--dark', darkCount > 0);
      }, { rootMargin: '0px 0px -95% 0px', threshold: 0 });
  
      darkSections.forEach((s) => observer.observe(s));
    })();
  
    /* ================================================================
       i18n — Traduction simple (FR/EN/PT) + persistance
       ================================================================ */
    (function () {
      const STORAGE_KEY = 'agrovida_lang';
  
      const translations = {
        fr: {
          'nav.contact': 'Contact',
          'nav.download': 'Télécharger',
          'hero.subtitle': 'présenté par Uddan IT',
          'value.heading': 'Agriculture intelligente<br />pour un avenir meilleur',
          'value.description':
            "AgroVida est une application intelligente qui aide les agriculteurs à améliorer la gestion au quotidien. Grâce à l’IA, aux prévisions météo et à des recommandations, elle augmente la productivité et soutient une agriculture durable.",
          'cards.knowledge.title': 'Plus de connaissances',
          'cards.knowledge.text':
            'Accédez, analysez et appliquez des données pour mieux comprendre vos cultures et prendre des décisions basées sur des preuves en temps réel.',
          'cards.control.title': 'Plus de contrôle',
          'cards.control.text':
            'Gérez vos activités agricoles avec des actions guidées et des informations en temps réel, pour garder le contrôle chaque jour.',
          'cards.decisions.title': 'Meilleures décisions',
          'cards.decisions.text':
            'Recevez des conseils concrets et des recommandations précises pour prendre des décisions rentables pour votre activité agricole.',
          'decisions.heading': 'Décisions<br />basées sur le contexte',
          'decisions.f1.title': 'Analyse basée sur la culture',
          'decisions.f1.text':
            'AgroVida analyse les bonnes informations pour votre ferme afin de comprendre le cycle de votre culture et prendre les meilleures décisions à chaque étape.',
          'decisions.f2.title': 'Météo &amp; conditions du terrain',
          'decisions.f2.text':
            'Nous prenons en compte les prévisions météo et l’état du terrain pour proposer les actions les plus adaptées et réagir plus vite aux changements.',
          'decisions.f3.title': 'Recommandations de précision',
          'decisions.f3.text':
            'Bénéficiez de recommandations basées sur l’IA, adaptées à vos cultures, votre sol et votre contexte local pour maximiser le rendement et limiter le gaspillage.',
          'analysis.a1.title': 'Scan santé des plantes',
          'analysis.a1.text':
            'Prenez une photo d’une plante pour évaluer rapidement son état général : stress, jaunissement ou autres anomalies visibles.',
          'analysis.a2.title': 'Identification des maladies',
          'analysis.a2.text':
            "L’IA détecte les maladies des plantes et identifie des problèmes comme les ravageurs, les carences nutritives ou les infections avec une meilleure précision.",
          'analysis.a3.title': 'Résolution du problème',
          'analysis.a3.text':
            'Fournit des recommandations claires et actionnables pour résoudre le problème et aider l’utilisateur à agir rapidement.',
          'team.label': 'Notre équipe',
          'team.heading': "Une Innovation<br />Centrée sur l'Humain",
          'team.p1':
            "Chez Uddan IT IT, nous concevons des solutions utiles avec un objectif clair : améliorer l’accès à la technologie agricole. Avec AgroVida, nous donnons aux agriculteurs des outils qui font une vraie différence au quotidien.",
          'team.p2':
            "Notre objectif est d’aider chaque utilisateur à prendre de meilleures décisions basées sur les données tout en réduisant les risques et les coûts. AgroVida devient un partenaire de confiance pour relever les défis de l’agriculture moderne.",
          'team.p3':
            "Nous croyons en une agriculture plus connectée et résiliente, où l’innovation soutient chaque étape de la gestion quotidienne. Nos solutions sont conçues pour anticiper les défis à toutes les phases de croissance.",
          'team.tagline': "La technologie au service de ceux qui cultivent l’avenir",
          'about.label': 'À propos de Uddan IT',
          'about.heading': 'Société de conseil IT spécialisée en solutions low-code Outsystems',
          'about.p1':
            "Avec des décennies d’expérience, Uddan IT IT est une société technologique axée sur l’innovation dans des secteurs clés comme le bien-être, la banque, l’énergie, l’assurance, la santé, l’alimentation et les ONG.",
          'about.p2':
            "Nous accompagnons nos clients dans leur transformation digitale et les aidons à atteindre des étapes de croissance continue grâce à une approche à la fois métier et technologique.",
          'about.p3':
            "Uddan IT dispose également d’un centre multi-technologies et d’un large portefeuille de services : intégrations, migrations et transition depuis des technologies legacy.",
          'contact.heading': 'Contact',
          'contact.sayHi': 'Écrivez-nous :',
          'contact.vat': 'TVA : LU 0000 000 000',
          'solution.title': 'Solution',
          'solution.desc': "Vous pouvez ici explorer la solution développée pour Agrovida à travers des images de l'application et du site web. Toutes les fonctionnalités ont été conçues pour optimiser les processus de travail et gagner du temps, offrant une expérience plus efficace et conviviale.",
          'solution.switch': 'cliquer pour changer',
          'form.nameLabel': 'Nom / Entreprise',
          'form.emailLabel': 'Email',
          'form.messageLabel': 'Votre message',
          'form.consent':
            'J’accepte les <a href="Terms_TERMOS%20E%20CONDI%C3%87%C3%95ES%2024022023.docx" target="_blank" rel="noopener"><strong><u>Conditions générales</u></strong></a> &amp; la <a href="Privacy_POL%C3%8DTICA%20DE%20PRIVACIDADE%2024022023.docx" target="_blank" rel="noopener"><strong><u>Politique de confidentialité</u></strong></a> relatives aux informations de ce formulaire.',
          'form.send': 'Envoyer',
        },
        en: {
          'nav.contact': 'Contact us',
          'nav.download': 'Download',
          'hero.subtitle': 'presented by Uddan IT ',
          'value.heading': 'Smart Agriculture<br />for a Better Future',
          'value.description':
            'AgroVida is a smart app that helps farmers improve daily management. Using AI, weather forecasts, and smart recommendations, it boosts productivity and supports sustainable farming.',
          'cards.knowledge.title': 'More Knowledge',
          'cards.knowledge.text':
            'Access, analyse and apply data to better understand your crops and make evidence-based farming decisions in real time.',
          'cards.control.title': 'More Control',
          'cards.control.text':
            "Manage your farm activities with guided commands and real-time insights, so you're in control every day.",
          'cards.decisions.title': 'Better Decisions',
          'cards.decisions.text':
            'Get real, actionable advice and precise recommendations tailored to help you make profitable decisions for your agricultural business.',
          'decisions.heading': 'Context-Based<br />Decisions',
          'decisions.f1.title': 'Crop-Based Analysis',
          'decisions.f1.text':
            'AgroVida analyses the right information for your farm so you can understand your crop cycle and make the best possible decisions in each phase.',
          'decisions.f2.title': 'Weather &amp; Field Conditions',
          'decisions.f2.text':
            'We take into account weather forecasts and field conditions to suggest the most appropriate actions, helping you anticipate and react faster to changing environments.',
          'decisions.f3.title': 'Precision Recommendations',
          'decisions.f3.text':
            'Benefit from AI-powered recommendations calibrated to your crops, your soil, and your local context for maximum yield and minimum waste.',
          'analysis.a1.title': 'Plant Health Scan',
          'analysis.a1.text':
            'Capture a photo of a plant to quickly assess its overall condition, including signs of stress, yellowing, or other visible abnormalities.',
          'analysis.a2.title': 'Disease Identification',
          'analysis.a2.text':
            'Uses AI to detect plant diseases and identify issues such as pests, nutrient deficiencies, or infections with improved accuracy.',
          'analysis.a3.title': 'Problem Solver',
          'analysis.a3.text':
            'Delivers clear, actionable recommendations to address the problem, helping users take the right steps quickly and effectively.',
          'team.label': 'Our Team',
          'team.heading': 'Human-Centred<br />Innovation',
          'team.p1':
            'At Uddan IT IT we design meaningful solutions with a clear purpose: improving accessibility to farming technology. With AgroVida, we empower farmers by providing tools that make a real difference in daily operations.',
          'team.p2':
            'Our goal is to help each user make better, data-driven decisions while reducing risks and costs. AgroVida becomes a trusted partner that supports farmers in meeting the challenges of modern farming with confidence.',
          'team.p3':
            'We believe in a more connected and resilient agriculture, where innovation supports every step of day-to-day farm management. Our solutions are designed with anticipation to detect key management needs and challenges.',
          'team.tagline': 'Technology serving those who grow the future',
          'about.label': 'About Uddan IT',
          'about.heading': 'IT Consulting Company Specialized in Outsystems Low-Code Solutions',
          'about.p1':
            'With decades of experience in the information technology industry, Uddan IT IT has established itself as a technology company focused on innovation in key sectors such as well-being, banking, energy, insurance, healthcare, food, and NGOs.',
          'about.p2':
            'We ensure applications are built from both business and technology perspectives, guiding our clients through digital transformation and continuous growth.',
          'about.p3':
            'Uddan IT also has a multi-technology center with a broad portfolio to support innovation and research, as well as integrations, migrations, and legacy technology transition.',
          'contact.heading': 'Get In Touch',
          'contact.sayHi': 'Say hi at:',
          
          'solution.title': 'Solution',
          'solution.desc': 'Here, you can explore the solution developed for Agrovida through images of the application and the website. All features have been designed to optimize work processes and save time, ensuring a more efficient and user-friendly experience.',
          'solution.switch': 'click to switch',
          'form.nameLabel': 'Name / Company',
          'form.emailLabel': 'Email',
          'form.messageLabel': 'Type your message',
          'form.consent':
            'I accept the <a href="Terms_TERMOS%20E%20CONDI%C3%87%C3%95ES%2024022023.docx" target="_blank" rel="noopener"><strong><u>Terms &amp; Conditions</u></strong></a> &amp; <a href="Privacy_POL%C3%8DTICA%20DE%20PRIVACIDADE%2024022023.docx" target="_blank" rel="noopener"><strong><u>Privacy Policy</u></strong></a> of this form\'s information.',
          'form.send': 'Send',
        },
        pt: {
          'nav.contact': 'Contacto',
          'nav.download': 'Transferir',
          'hero.subtitle': 'apresentado pela Uddan IT ',
          'value.heading': 'Agricultura inteligente<br />para um futuro melhor',
          'value.description':
            'AgroVida é uma aplicação inteligente que ajuda os agricultores a melhorar a gestão diária. Com IA, previsões meteorológicas e recomendações, aumenta a produtividade e apoia a agricultura sustentável.',
          'cards.knowledge.title': 'Mais conhecimento',
          'cards.knowledge.text':
            'Aceda, analise e aplique dados para compreender melhor as suas culturas e tomar decisões em tempo real.',
          'cards.control.title': 'Mais controlo',
          'cards.control.text':
            'Gira as atividades da sua exploração com ações guiadas e insights em tempo real, mantendo o controlo todos os dias.',
          'cards.decisions.title': 'Melhores decisões',
          'cards.decisions.text':
            'Receba conselhos práticos e recomendações precisas para tomar decisões mais rentáveis para o seu negócio agrícola.',
          'decisions.heading': 'Decisões<br />baseadas no contexto',
          'decisions.f1.title': 'Análise por cultura',
          'decisions.f1.text':
            'A AgroVida analisa a informação certa para a sua exploração para compreender o ciclo da cultura e tomar as melhores decisões em cada fase.',
          'decisions.f2.title': 'Meteorologia &amp; condições do campo',
          'decisions.f2.text':
            'Consideramos previsões meteorológicas e condições do campo para sugerir as ações mais adequadas e reagir mais rápido às mudanças.',
          'decisions.f3.title': 'Recomendações de precisão',
          'decisions.f3.text':
            'Beneficie de recomendações com IA ajustadas às suas culturas, ao seu solo e ao contexto local para maximizar o rendimento e reduzir desperdício.',
          'analysis.a1.title': 'Scan de saúde da planta',
          'analysis.a1.text':
            'Tire uma foto de uma planta para avaliar rapidamente o seu estado geral: stress, amarelecimento ou outras anomalias visíveis.',
          'analysis.a2.title': 'Identificação de doenças',
          'analysis.a2.text':
            'A IA deteta doenças e identifica problemas como pragas, deficiências nutricionais ou infeções com maior precisão.',
          'analysis.a3.title': 'Solução do problema',
          'analysis.a3.text':
            'Fornece recomendações claras e acionáveis para resolver o problema e ajudar o utilizador a agir rapidamente.',
          'team.label': 'A nossa equipa',
          'team.heading': 'Inovação<br />centrada no humano',
          'team.p1':
            'Na Uddan IT IT criamos soluções com propósito: melhorar o acesso à tecnologia agrícola. Com a AgroVida, capacitamos agricultores com ferramentas que fazem a diferença no dia a dia.',
          'team.p2':
            'O nosso objetivo é ajudar cada utilizador a tomar melhores decisões baseadas em dados, reduzindo riscos e custos. A AgroVida torna-se um parceiro de confiança para os desafios da agricultura moderna.',
          'team.p3':
            'Acreditamos numa agricultura mais conectada e resiliente, onde a inovação apoia cada etapa da gestão diária. As nossas soluções são desenhadas para antecipar desafios em todas as fases.',
          'team.tagline': 'Tecnologia ao serviço de quem cultiva o futuro',
          'about.label': 'Sobre a Uddan IT',
          'about.heading': 'Empresa de consultoria IT especializada em soluções low-code Outsystems',
          'about.p1':
            'Com décadas de experiência, a Uddan IT IT é uma empresa focada em inovação em setores como bem-estar, banca, energia, seguros, saúde, alimentação e ONGs.',
          'about.p2':
            'Apoiamos os nossos clientes na transformação digital, alinhando perspetivas de negócio e tecnologia para crescimento contínuo.',
          'about.p3':
            'A Uddan IT também tem um centro multi-tecnologia e um portfólio amplo: integrações, migrações e transição de tecnologias legacy.',
          'contact.heading': 'Contacte-nos',
          'contact.sayHi': 'Diga olá em:',
          'contact.vat': 'IVA: LU 0000 000 000',
          'solution.title': 'Solução',
          'solution.desc': 'Aqui pode explorar a solução desenvolvida para a Agrovida através de imagens da aplicação e do website. Todas as funcionalidades foram concebidas para otimizar os processos de trabalho e poupar tempo, garantindo uma experiência mais eficiente e intuitiva.',
          'solution.switch': 'clique para mudar',
          'form.nameLabel': 'Nome / Empresa',
          'form.emailLabel': 'Email',
          'form.messageLabel': 'Escreva a sua mensagem',
          'form.consent':
            'Aceito os <a href="Terms_TERMOS%20E%20CONDI%C3%87%C3%95ES%2024022023.docx" target="_blank" rel="noopener"><strong><u>Termos &amp; Condições</u></strong></a> e a <a href="Privacy_POL%C3%8DTICA%20DE%20PRIVACIDADE%2024022023.docx" target="_blank" rel="noopener"><strong><u>Política de Privacidade</u></strong></a> relativas às informações deste formulário.',
          'form.send': 'Enviar',
        },
      };
  
      function setText(el, value) {
        if (!el) return;
        // Support <br/> in translations by using innerHTML
        el.innerHTML = value;
      }
  
      function setLang(lang) {
        const dict = translations[lang] || translations.fr;
  
        document.documentElement.lang = lang;
  
        document.querySelectorAll('[data-i18n]').forEach((el) => {
          const key = el.getAttribute('data-i18n');
          if (!key) return;
          const value = dict[key];
          if (typeof value === 'string') setText(el, value);
        });
  
        // Update form placeholders to match labels (optional but feels natural)
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');
        if (nameInput && dict['form.nameLabel']) nameInput.placeholder = stripHtml(dict['form.nameLabel']);
        if (emailInput && dict['form.emailLabel']) emailInput.placeholder = stripHtml(dict['form.emailLabel']);
        if (messageInput && dict['form.messageLabel']) messageInput.placeholder = stripHtml(dict['form.messageLabel']);
  
        const current = document.querySelector('.nav__lang-current');
        if (current) current.textContent = lang.toUpperCase();
  
        try {
          localStorage.setItem(STORAGE_KEY, lang);
        } catch (_) {
          // ignore
        }
      }
  
      function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      }
  
      // Dropdown click behavior (works on mobile too)
      const dropdown = document.querySelector('.nav__lang-dropdown');
      const currentBtn = document.querySelector('.nav__lang-current');
      const menu = document.querySelector('.nav__lang-menu');
      const options = document.querySelectorAll('.nav__lang-option[data-lang]');
  
      function closeMenu() {
        if (!menu || !currentBtn) return;
        menu.style.opacity = '';
        menu.style.pointerEvents = '';
        menu.style.transform = '';
        currentBtn.setAttribute('aria-expanded', 'false');
      }
  
      function openMenu() {
        if (!menu || !currentBtn) return;
        menu.style.opacity = '1';
        menu.style.pointerEvents = 'auto';
        menu.style.transform = 'translateX(-50%) translateY(0)';
        currentBtn.setAttribute('aria-expanded', 'true');
      }
  
      function toggleMenu() {
        if (!menu || !currentBtn) return;
        const expanded = currentBtn.getAttribute('aria-expanded') === 'true';
        if (expanded) closeMenu();
        else openMenu();
      }
  
      if (currentBtn) {
        currentBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleMenu();
        });
      }
  
      options.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const lang = btn.getAttribute('data-lang') || 'fr';
          setLang(lang);
          closeMenu();
        });
      });
  
      document.addEventListener('click', () => closeMenu());
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMenu();
      });
  
      // Initialize from saved value or current button text
      let initial = 'fr';
      try {
        initial = localStorage.getItem(STORAGE_KEY) || initial;
      } catch (_) {
        // ignore
      }
      if (currentBtn && currentBtn.textContent) {
        const t = currentBtn.textContent.trim().toLowerCase();
        if (t === 'en' || t === 'fr' || t === 'pt') initial = t;
      }
      setLang(initial);
    })();
  
    /* ================================================================
       Contact — envoi via mailto (site statique)
       ================================================================ */
    (function () {
      const TO_EMAIL = 'yawokyeredarko57@gmail.com';
  
      const btn = document.querySelector('.form__submit');
      if (!btn) return;
  
      btn.addEventListener('click', (e) => {
        e.preventDefault();
  
        const name = (document.getElementById('name')?.value || '').trim();
        const email = (document.getElementById('email')?.value || '').trim();
        const message = (document.getElementById('message')?.value || '').trim();
        const consent = Boolean(document.getElementById('consent')?.checked);
  
        if (!name || !email || !message) {
          alert('Please fill in Name, Email, and Message before sending.');
          return;
        }
  
        if (!consent) {
          alert('Please accept the Terms & Conditions before sending.');
          return;
        }
  
        const subject = `AgroVida contact — ${name}`;
        const body =
          `Name / Company: ${name}\n` +
          `Email: ${email}\n\n` +
          `${message}\n`;
  
        const mailto =
          `mailto:${encodeURIComponent(TO_EMAIL)}` +
          `?subject=${encodeURIComponent(subject)}` +
          `&body=${encodeURIComponent(body)}`;
  
        window.location.href = mailto;
      });
    })();
  
  })();