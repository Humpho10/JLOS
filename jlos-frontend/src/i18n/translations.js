// ============================================================
// Translation dictionary for the four languages offered in
// LangModal. Keys are looked up via the `t(key)` helper exposed
// from AppContext, which falls back to English if a string is
// missing for the active language.
//
// Coverage note: English and Kiswahili are solid. Luganda is a
// good-faith, fairly confident translation. Ateso (a Nilotic
// language with far less training data available) is a best
// effort only — treat those strings as a starting draft, not a
// substitute for review by a native Ateso speaker before any
// real-world/government use.
// ============================================================

export const translations = {
  // ---------- navbar ----------
  'nav.home': { English: 'Home', Luganda: 'Awaka', Kiswahili: 'Nyumbani', Ateso: 'Ka' },
  'nav.chat': { English: 'Ask Justice AI', Luganda: 'Buuza Justice AI', Kiswahili: 'Uliza Justice AI', Ateso: 'Ipuo Justice AI' },
  'nav.institutions': { English: 'Institutions', Luganda: 'Ebibiina', Kiswahili: 'Taasisi', Ateso: 'Ijo ka amus' },
  'nav.more': { English: 'More', Luganda: 'Ebirala', Kiswahili: 'Zaidi', Ateso: 'Ejaasi' },
  'nav.tagline': {
    English: 'Administering Justice · Maintaining Law & Order',
    Luganda: 'Okuwa Obwenkanya · Okukuuma Amateeka n’Obuteefu',
    Kiswahili: 'Kusimamia Haki · Kudumisha Sheria na Utaratibu',
    Ateso: 'Akiyar Ainakiyar · Akitodik Ilosit',
  },

  // ---------- hero ----------
  'hero.badge': { English: 'One Portal · 8 Institutions · All for You', Luganda: 'Omulyango Gumu · Ebibiina 8 · Byonna gy’oli', Kiswahili: 'Lango Moja · Taasisi 8 · Vyote kwa Ajili Yako', Ateso: 'Ekot Alomit · Ijo 8 · Ijo Kesi' },
  'hero.stat.institutions': { English: 'Institutions', Luganda: 'Ebibiina', Kiswahili: 'Taasisi', Ateso: 'Ijo' },
  'hero.stat.support': { English: 'Support', Luganda: 'Obuyambi', Kiswahili: 'Msaada', Ateso: 'Iyupun' },
  'hero.stat.free': { English: 'Free', Luganda: 'Ya Bwerere', Kiswahili: 'Bure', Ateso: 'Mam Ipei' },
  'hero.stat.freeSuffix': { English: 'To Use', Luganda: 'Okukozesa', Kiswahili: 'Kutumia', Ateso: 'Aitum' },
  'hero.or': { English: 'OR', Luganda: 'OBA', Kiswahili: 'AU', Ateso: 'KOSI' },
  'hero.chatWithAi': { English: 'Chat with Justice AI', Luganda: 'Yogera ne Justice AI', Kiswahili: 'Ongea na Justice AI', Ateso: 'Lokuta ka Justice AI' },
  'hero.heading': { English: 'Justice starts here.', Luganda: 'Obwenkanya butandikira wano.', Kiswahili: 'Haki huanzia hapa.', Ateso: 'Ainakiyar akitakanut kane.' },
  'hero.sub': {
    English: "Describe your issue and we'll connect you to the correct JLOS institution.",
    Luganda: 'Nnyonnyola ekizibu kyo tulikuyunga ku kibiina kya JLOS ekituufu.',
    Kiswahili: 'Eleza tatizo lako nasi tutakuunganisha na taasisi sahihi ya JLOS.',
    Ateso: 'Bal problem noi kani ka wok abu ijo ka JLOS naka epol.',
  },
  'hero.placeholder': { English: 'Describe your legal issue...', Luganda: 'Nnyonnyola ekizibu kyo eky’amateeka...', Kiswahili: 'Eleza tatizo lako la kisheria...', Ateso: 'Bal problem lu ilosit...' },
  'hero.examplesLabel': { English: 'Examples', Luganda: 'Ebyokulabirako', Kiswahili: 'Mifano', Ateso: 'Ilekaunet' },
  'hero.ex.complaint': { English: 'File a complaint', Luganda: 'Waayo Eyeekaayo', Kiswahili: 'Wasilisha Malalamiko', Ateso: 'Riong akwap' },
  'hero.ex.land': { English: 'Land dispute', Luganda: 'Empaka ez’Ettaka', Kiswahili: 'Mgogoro wa Ardhi', Ateso: 'Ikoku na akwap' },
  'hero.ex.human': { English: 'Human Rights', Luganda: 'Eddembe ly’Omuntu', Kiswahili: 'Haki za Binadamu', Ateso: 'Ainakiyar ka Itunga' },
  'hero.ex.legal': { English: 'Legal Aid', Luganda: 'Obuyambi bw’Amateeka', Kiswahili: 'Msaada wa Kisheria', Ateso: 'Akiyupun ka Ilosit' },
  'hero.findService': { English: 'Find Service', Luganda: 'Noonya Obuweereza', Kiswahili: 'Tafuta Huduma', Ateso: 'Yenut Akiyupun' },
  'hero.needHelp': { English: 'Need help?', Luganda: 'Weetaaga Obuyambi?', Kiswahili: 'Unahitaji Msaada?', Ateso: 'Ijenu iyupun?' },
  'hero.available': { English: 'Available 24/7', Luganda: 'Tetulaba 24/7', Kiswahili: 'Tunapatikana 24/7', Ateso: 'Iboisit 24/7' },
  'hero.askAi': { English: 'Ask Justice AI', Luganda: 'Buuza Justice AI', Kiswahili: 'Uliza Justice AI', Ateso: 'Ipuo Justice AI' },
  'hero.startHere': { English: 'Start Here', Luganda: 'Tandikira Wano', Kiswahili: 'Anzia Hapa', Ateso: 'Tandik Kane' },
  'hero.cardTitle': { English: 'How can we help you today?', Luganda: 'Tuyinza tutya okukuyamba leero?', Kiswahili: 'Tunawezaje kukusaidia leo?', Ateso: 'Ejai iyupun ijo lolo?' },
  'hero.cardSub': {
    English: "Describe your legal issue and we'll connect you to the right JLOS institution.",
    Luganda: 'Nnyonnyola ekizibu kyo eky’amateeka tulikuyunga ku kibiina kya JLOS ekituufu.',
    Kiswahili: 'Eleza tatizo lako la kisheria nasi tutakuunganisha na taasisi sahihi ya JLOS.',
    Ateso: 'Bal problem lu ilosit ka wok abu ijo ka JLOS naka epol.',
  },
  'hero.popularExamples': { English: 'Popular Examples', Luganda: 'Ebyokulabirako Ebisinga', Kiswahili: 'Mifano Maarufu', Ateso: 'Ilekaunet Iyongan' },
  'hero.getInstantAnswers': { English: 'Get instant answers', Luganda: 'Funa Eby’okuddamu Mangu', Kiswahili: 'Pata Majibu ya Papo Hapo', Ateso: 'Rot Isuban Anyakanut' },

  // ---------- quick services ----------
  'qs.browseServices': { English: 'Browse Services', Luganda: 'Laba Obuweereza', Kiswahili: 'Vinjari Huduma', Ateso: 'Yeng Akiyupun' },
  'qs.browseServices.sub': { English: 'Explore all services', Luganda: 'Laba obuweereza bwonna', Kiswahili: 'Chunguza huduma zote', Ateso: 'Yeng Akiyupun Kesi' },
  'qs.contactCentre': { English: 'Contact Centre', Luganda: 'Ekifo ky’Okutuukirira', Kiswahili: 'Kituo cha Mawasiliano', Ateso: 'Ekot na Akiswam' },
  'qs.contactCentre.sub': { English: 'Get support', Luganda: 'Funa obuyambi', Kiswahili: 'Pata msaada', Ateso: 'Rot Iyupun' },

  // ---------- page headers ----------
  'page.chat.title': { English: 'Justice AI Assistant', Luganda: 'Omuyambi Justice AI', Kiswahili: 'Msaidizi wa Justice AI', Ateso: 'Ejakait Justice AI' },
  'page.chat.sub': {
    English: "Describe your issue in your own words — we'll match you to the right institution, and hand you off to a person if you need one.",
    Luganda: 'Nnyonnyola ekizibu kyo mu bigambo byo — tulikutuusa ku kibiina ekituufu, era tulikuweereza omuntu bw’oba weetaaga.',
    Kiswahili: 'Eleza tatizo lako kwa maneno yako — tutakulinganisha na taasisi sahihi, na kukupatia mtu ikiwa unahitaji.',
    Ateso: 'Bal problem noi ka ibala lu ijo — wok abu ijo naka epol, ka iwok itunga ka ijenut.',
  },
  'page.institutions.title': { English: 'JLOS Institutions', Luganda: 'Ebibiina bya JLOS', Kiswahili: 'Taasisi za JLOS', Ateso: 'Ijo ka JLOS' },
  'page.institutions.sub': {
    English: 'All 8 institutions, one directory. Search by name or the service you need.',
    Luganda: 'Ebibiina byonna 8, mu kalulu kamu. Noonya erinnya oba obuweereza bw’oyagala.',
    Kiswahili: 'Taasisi zote 8, saraka moja. Tafuta kwa jina au huduma unayohitaji.',
    Ateso: 'Ijo ka 8 kesi, alomit. Yenut ka ekiring nu akiyupun ijenu.',
  },
  'page.more.title': { English: 'More', Luganda: 'Ebirala', Kiswahili: 'Zaidi', Ateso: 'Ejaasi' },
  'page.more.sub': {
    English: 'Access, language, support & help options.',
    Luganda: 'Okuyingira, olulimi, obuyambi n’endowooza z’obuyambi.',
    Kiswahili: 'Ufikiaji, lugha, msaada na chaguo za usaidizi.',
    Ateso: 'Ijenut, ateng, iyupun ka ijaasin.',
  },

  // ---------- more page items ----------
  'more.access.title': { English: 'Display & Accessibility', Luganda: 'Enkola y’Endabika n’Okutuukirira', Kiswahili: 'Onyesho na Ufikivu', Ateso: 'Akirwo ka Akijenut' },
  'more.access.desc': { English: 'Dark theme, audio read-aloud, text size', Luganda: 'Enkola enzikiza, okusomera waggulu, obunene bw’ennyukuta', Kiswahili: 'Mandhari meusi, kusoma kwa sauti, ukubwa wa maandishi', Ateso: 'Etem na risim, akibo, akirwo ka ikwerekwer' },
  'more.language.title': { English: 'Language', Luganda: 'Olulimi', Kiswahili: 'Lugha', Ateso: 'Ateng' },
  'more.language.currentSuffix': { English: '(current)', Luganda: '(ekikozesebwa kati)', Kiswahili: '(inayotumika)', Ateso: '(nakigeni)' },
  'more.faqs.title': { English: 'FAQs & User Manual', Luganda: 'Ebibuuzo ebisinga okubuuzibwa n’Ekawuula', Kiswahili: 'Maswali Yanayoulizwa Mara kwa Mara na Mwongozo', Ateso: 'FAQ ka Ebuk' },
  'more.faqs.desc': { English: 'Guides for using the portal', Luganda: 'Obulagirizi ku ky’okukozesa omulyango', Kiswahili: 'Miongozo ya kutumia lango', Ateso: 'Ijaasin ka akikobo ekot' },
  'more.support.title': { English: 'Support & About Us', Luganda: 'Obuyambi n’Ebitukwatako', Kiswahili: 'Msaada na Kuhusu Sisi', Ateso: 'Iyupun ka Ijo Lu' },
  'more.support.desc': { English: 'Contact the JLOS Secretariat', Luganda: 'Tuukirira Sekola ya JLOS', Kiswahili: 'Wasiliana na Sekretarieti ya JLOS', Ateso: 'Ikwan JLOS Sekretariat' },

  // ---------- footer ----------
  'footer.tagline': { English: 'Justice, Law & Order Sector', Luganda: 'Ekitongole ky’Obwenkanya, Amateeka n’Obuteefu', Kiswahili: 'Sekta ya Haki, Sheria na Utaratibu', Ateso: 'Sector ka Ainakiyar ka Ilosit' },
  'footer.desc': {
    English: 'A single entry point to justice services across all 8 JLOS institutions — administering justice and maintaining law and order for every Ugandan.',
    Luganda: 'Omulyango gumu ogutuusa ku buweereza bw’obwenkanya mu bibiina byonna 8 ebya JLOS — okuwa obwenkanya n’okukuuma amateeka n’obuteefu eri Omuganda yenna.',
    Kiswahili: 'Lango moja la huduma za haki katika taasisi zote 8 za JLOS — kusimamia haki na kudumisha sheria na utaratibu kwa kila Mganda.',
    Ateso: 'Ekot alomit ka akiyupun ka ainakiyar ijo 8 ka JLOS — akiyar ainakiyar ka akitodik ilosit ijo Uganda kesi.',
  },
  'footer.quickLinks': { English: 'Quick Links', Luganda: 'Emikutu Emyangu', Kiswahili: 'Viungo vya Haraka', Ateso: 'Ilinki Lu' },
  'footer.institutions': { English: 'Institutions', Luganda: 'Ebibiina', Kiswahili: 'Taasisi', Ateso: 'Ijo' },
  'footer.contact': { English: 'Contact & Support', Luganda: 'Okutuukirira n’Obuyambi', Kiswahili: 'Mawasiliano na Msaada', Ateso: 'Ikwan ka Iyupun' },
  'footer.faqs': { English: 'FAQs', Luganda: 'Ebibuuzo', Kiswahili: 'Maswali', Ateso: 'FAQ' },
  'footer.rights': { English: 'Government of Uganda. All rights reserved.', Luganda: 'Gavumenti ya Uganda. Eddembe lyonna likuumiddwa.', Kiswahili: 'Serikali ya Uganda. Haki zote zimehifadhiwa.', Ateso: 'Ateker Uganda. Ainakiyar kesi ejaikinit.' },

  // ---------- language modal ----------
  'lang.title': { English: 'Choose language', Luganda: 'Londa olulimi', Kiswahili: 'Chagua lugha', Ateso: 'Yenut ateng' },
  'lang.note': {
    English: 'Chat and audio read-aloud follow this setting.',
    Luganda: 'Okubuuliragana n’okusomera waggulu bigoberera enkola eno.',
    Kiswahili: 'Mazungumzo na usomaji wa sauti hufuata mpangilio huu.',
    Ateso: 'Chat ka akirwo kani atudi.',
  },
};
