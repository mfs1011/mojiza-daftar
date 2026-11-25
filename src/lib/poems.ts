import type { AnimalId, FruitKind } from './names.ts'
import type { ThingId } from './things.ts'

// She'r-topishmoqlar: bola she'rni tinglaydi va nima haqida ekanini rasmlardan topadi (hayvon va narsalar — "nima", "kim" faqat odamga).
// Matnlar ilova uchun yozilgan (original). Ovoz: voices/sher_<id> (Gemini TTS yoki ota-ona yozuvi).
// Matnni o'zgartirsangiz, ovozni qayta yarating: npm run gen:voices -- --only sher_<id> --force

export type RiddleAnswer = { k: 'animal'; id: AnimalId } | { k: 'fruit'; id: FruitKind } | { k: 'thing'; id: ThingId }

export interface Riddle {
  id: string
  answer: RiddleAnswer
  text: string
}

const A = (id: AnimalId): RiddleAnswer => ({ k: 'animal', id })
const F = (id: FruitKind): RiddleAnswer => ({ k: 'fruit', id })
const N = (id: ThingId): RiddleAnswer => ({ k: 'thing', id })

export const RIDDLES: Riddle[] = [
  {
    id: 'sigir',
    answer: A('sigir'),
    text: "Shoxi bor, dumi bor,\nBolalarga suti bor.\nErtalab «mo'» deydi,\nYashil o'tni yeydi.",
  },
  {
    id: 'mushuk',
    answer: A('mushuk'),
    text: "Mo'ylovi bor, ko'zi chaqnar,\nSichqonni poylab yotar.\nSut ichadi xursand bo'lib,\n«Miyov» deydi erkalanib.",
  },
  {
    id: 'it',
    answer: A('it'),
    text: "Hovlimizni qo'riqlaydi,\nBegona kelsa — vovullaydi.\nEgasini ko'rsa agar,\nDumin quvnoq likillatar.",
  },
  {
    id: 'xoroz',
    answer: A('xoroz'),
    text: "Tongda hammadan oldin turar,\n«Qu-qu-qu!» deb bizni uyg'otar.\nBoshida qizil toji bor,\nChiroyli rangdor dumi bor.",
  },
  {
    id: 'qoy',
    answer: A('qoy'),
    text: "Junlari oppoq-oppoq,\nXuddi bulutday yumshoq.\n«Ma-a-a» deb chaqiradi,\nYaylovda o'tlaydi.",
  },
  {
    id: 'ordak',
    answer: A('ordak'),
    text: "Ko'lda suzar chayqalib,\nQanotini qoqib-qoqib.\n«Vak-vak» deydi baland,\nBolalari ergashgan.",
  },
  {
    id: 'eshak',
    answer: A('eshak'),
    text: "Quloqlari uzun-uzun,\nYuk tashiydi kun bo'yi.\n«I-a, i-a!» deb baqirar,\nIshchan, sabrli o'zi.",
  },
  {
    id: 'echki',
    answer: A('echki'),
    text: "Soqoli bor, shoxi bor,\nQoyalarga chiqar u.\n«Me-e-e» deb ma'raydi,\nSutini ham beradi.",
  },
  {
    id: 'tarvuz',
    answer: F('tarvuz'),
    text: "Usti yashil, ichi qizil,\nUrug'lari qop-qora.\nYozda yesang shirin-shirin,\nTopchi, nima u, bola?",
  },
  {
    id: 'olma',
    answer: F('olma'),
    text: "Shoxda osilib turar,\nQip-qizil yuzi kular.\nBir tishlasang — «qars» etar,\nShirin sharbati oqar.",
  },
  {
    id: 'uzum',
    answer: F('uzum'),
    text: "Shingil-shingil osilgan,\nTok bargiga yashiringan.\nDonalari mayda-mayda,\nShirin-shakar har biri.",
  },
  {
    id: 'anor',
    answer: F('anor'),
    text: "Ichida yuzta qizil dur,\nUstida kichik toji bor.\nDonalari yoqutdek,\nTopib ber-chi, bu nima?",
  },
  {
    id: 'qovun',
    answer: F('qovun'),
    text: "Sap-sariq, xushbo'y, katta,\nPoliz ichida yotar.\nKuzda uni so'yamiz,\nAsaldek shirin bo'lar.",
  },
  // ---------- Yangi narsalar (things.ts) ----------
  {
    id: 'ot',
    answer: N('ot'),
    text: "Yoli bor, tuyog'i bor,\nUzun chiroyli dumi bor.\nChopsa, shamoldek uchar,\nUstiga chavandoz minar.",
  },
  {
    id: 'tuya',
    answer: N('tuya'),
    text: "Belida ikki tepa bor,\nSahroda u yurar uzoq.\nSuv ichmay ham chidaydi,\nYuk tashiydi u ko'p-ko'p.",
  },
  {
    id: 'quyon',
    answer: N('quyon'),
    text: "Qulog'i uzun-uzun,\nSakrab-sakrab chopar tez.\nSabzini juda yaxshi ko'rar,\nOq paxtadek mo'ynasi bor.",
  },
  {
    id: 'tovuq',
    answer: N('tovuq'),
    text: "Hovlida don cho'qiydi,\n«Qaq-qaq» deb chaqiradi.\nHar kuni bizga quvonib,\nOppoq tuxum qo'yadi.",
  },
  {
    id: 'joja',
    answer: N('joja'),
    text: "Mitti-mitti, sap-sariq,\nOnasining ortidan chopar.\n«Chiy-chiy» deydi ingichka,\nTuxumdan chiqqan kichkina.",
  },
  {
    id: 'goz',
    answer: N('goz'),
    text: "Oppoq patli, uzun bo'yin,\nHovuzda suzar o'ynab.\nTumshug'i to'q sariq,\n«G'aq-g'aq» deydi baqirib.",
  },
  {
    id: 'baliq',
    answer: N('baliq'),
    text: "Suvda suzar, oyog'i yo'q,\nQanot o'rnida suzgichi bor.\nTangachasi yaltirab,\nDaryoda o'ynab yurar.",
  },
  {
    id: 'kapalak',
    answer: N('kapalak'),
    text: "Rang-barang qanotlari,\nGuldan gulga uchadi.\nTovushsiz, yengil-yengil,\nBog'ni bezab yuradi.",
  },
  {
    id: 'ari',
    answer: N('ari'),
    text: "Yo'l-yo'l sariq libosi,\n«G'uv-g'uv» deb uchadi.\nGullardan shira yig'ib,\nShirin asal yasaydi.",
  },
  {
    id: 'toshbaqa',
    answer: N('toshbaqa'),
    text: "Uyini orqalab yurar,\nShoshilmaydi hech qachon.\nQo'rqsa, boshini yashirar,\nQattiq kosa ichiga.",
  },
  {
    id: 'ayiq',
    answer: N('ayiq'),
    text: "O'rmonda yashar, katta, kuchli,\nAsalni juda yaxshi ko'rar.\nQish bo'yi uyquga ketib,\nBahorda u uyg'onar.",
  },
  {
    id: 'fil',
    answer: N('fil'),
    text: "Eng katta hayvon — o'zi,\nQulog'i yelpig'ichdek.\nBurni uzun xartumdir,\nSuv separ u dush kabi.",
  },
  {
    id: 'sabzi',
    answer: N('sabzi'),
    text: "Yer ostida o'sadi,\nSochi yashil, o'zi sariq.\nQuyon uni yaxshi ko'rar,\nOshga solsak — mazali.",
  },
  {
    id: 'piyoz',
    answer: N('piyoz'),
    text: "Kiyimi yetti qavat,\nYechsang, ko'zing yoshlanar.\nOshga, sho'rvaga solamiz,\nTaomni u mazalar.",
  },
  {
    id: 'kartoshka',
    answer: N('kartoshka'),
    text: "Yer ostida yashirinar,\nQo'ng'ir po'sti yupqagina.\nQovursak ham, qaynatsak ham,\nBo'lar juda mazali.",
  },
  {
    id: 'pomidor',
    answer: N('pomidor'),
    text: "Yoz faslida qizarar,\nYumaloq va suvli o'zi.\nSalatga kesib solamiz,\nQizil, chiroyli yuzi.",
  },
  {
    id: 'bodring',
    answer: N('bodring'),
    text: "Uzunchoq, yashil, g'adir-budur,\nPolizda o'sar shoxida.\nYozda salatga solamiz,\n«Qarsillar» tishlaganda.",
  },
  {
    id: 'karam',
    answer: N('karam'),
    text: "Bargi ustma-ust o'ralgan,\nKatta, dumaloq boshi bor.\nYashil to'nni yechsang-yechsang,\nYana to'ni chiqaverar.",
  },
  {
    id: 'qalampir',
    answer: N('qalampir'),
    text: "Qizil, yaltiroq, chiroyli,\nIchi bo'sh, urug'i bor.\nDo'lma qilsak — mazali,\nSalatga ham yarashar.",
  },
  {
    id: 'oshqovoq',
    answer: N('oshqovoq'),
    text: "Poliz ichida yotar,\nKatta, dumaloq, to'q sariq.\nKuzda uzib olamiz,\nSomsasi juda shirin.",
  },
  {
    id: 'choynak',
    answer: N('choynak'),
    text: "Qorni katta, burni bor,\nDastasidan tutamiz.\nIssiq choyni quyamiz,\nMehmonlarga tutamiz.",
  },
  {
    id: 'piyola',
    answer: N('piyola'),
    text: "Kichkina, dumaloq idish,\nChoy quyamiz to'ldirib.\nIkki qo'llab tutamiz,\nIchamiz biz puflab-puflab.",
  },
  {
    id: 'non',
    answer: N('non'),
    text: "Tandirdan issiq chiqar,\nDumaloq, qizarib pishgan.\nDasturxonning ko'rki u,\nUni hurmat qilamiz.",
  },
  {
    id: 'doppi',
    answer: N('doppi'),
    text: "Boshga kiyar bobolar,\nQora-oq naqshi bor.\nTo'rt burchakli, chiroyli,\nO'zbekning go'zal kiyimi.",
  },
  {
    id: 'qoshiq',
    answer: N('qoshiq'),
    text: "Ovqat yeymiz u bilan,\nSho'rvani olib ichamiz.\nKattasi ham, kichigi ham,\nDasturxonda turadi.",
  },
  {
    id: 'soat',
    answer: N('soat'),
    text: "Tiq-tiq deydi tinmasdan,\nIkki mili aylanar.\nVaqtni bizga ko'rsatib,\nErtalab bizni uyg'otar.",
  },
  {
    id: 'kitob',
    answer: N('kitob'),
    text: "Varaqlari ko'p-ko'p,\nIchida rasm va ertak.\nOchsang, sirlarin aytar,\nAqlli do'stimiz u.",
  },
  {
    id: 'qalam',
    answer: N('qalam'),
    text: "Uchi o'tkir, ingichka,\nQog'ozga chizar chiziq.\nRasm chizar, yozuv yozar,\nMaktabga birga borar.",
  },
  {
    id: 'koptok',
    answer: N('koptok'),
    text: "Dumaloq, rang-barang,\nOtsang — sakrab ketadi.\nTepamiz, otamiz uni,\nHovlida o'ynatadi.",
  },
  {
    id: 'mashina',
    answer: N('mashina'),
    text: "To'rtta g'ildiragi bor,\nYo'lda chopar «biip» deb.\nHaydovchi rulni burar,\nBizni uyga eltar u.",
  },
  {
    id: 'velosiped',
    answer: N('velosiped'),
    text: "Ikki g'ildirak, bitta rul,\nPedalini aylantir.\nTez-tez chopar yo'lakda,\nQo'ng'irog'i «jiring-jir».",
  },
  {
    id: 'soyabon',
    answer: N('soyabon'),
    text: "Yomg'ir yog'sa, ochamiz,\nBoshimiz ustida turar.\nTomchilar «tiq-tiq» urilar,\nBizni quruq saqlar u.",
  },
  {
    id: 'quyosh',
    answer: N('quyosh'),
    text: "Osmonda porlab turar,\nHammani isitadi.\nErtalab chiqib keladi,\nKechqurun botib ketadi.",
  },
  {
    id: 'oy',
    answer: N('oy'),
    text: "Kechasi osmonda chiqar,\nGoh yumaloq, goh o'roq.\nYulduzlar bilan birga,\nTunni yoritib turar.",
  },
  {
    id: 'yulduz',
    answer: N('yulduz'),
    text: "Tunda osmonda chaqnar,\nMitti-mitti, son-sanoqsiz.\nKo'zlarini qisib-qisib,\nYerdagi bizga boqar.",
  },
  {
    id: 'bulut',
    answer: N('bulut'),
    text: "Osmonda suzib yurar,\nOppoq paxtadek yumshoq.\nGoh quyon, goh ayiq bo'lar,\nShamol uni haydar uzoq.",
  },
  {
    id: 'yomgir',
    answer: N('yomgir'),
    text: "Bulutdan tomchi tushar,\nYer, gullarni sug'orar.\nSoyabonni ochamiz,\nKo'lmak ham paydo bo'lar.",
  },
  {
    id: 'gul',
    answer: N('gul'),
    text: "Bahorda ochiladi,\nQip-qizil, chiroyli gul.\nAdirlarni bezatar,\nOnamizga sovg'a bu.",
  },
  {
    id: 'shifokor',
    answer: N('shifokor'),
    text: "Oq xalatli, mehribon,\nKasal bo'lsak, davolar.\n«A-a» deb og'zingni och, der,\nSog'lig'imizni saqlar.",
  },
  {
    id: 'oshpaz',
    answer: N('oshpaz'),
    text: "Oq qalpoq kiyib olgan,\nQozonda osh pishirar.\nMazali taom tayyorlab,\nHammani xursand qilar.",
  },
  {
    id: 'haydovchi',
    answer: N('haydovchi'),
    text: "Rulni mahkam tutadi,\nAvtobusni boshqarar.\nYo'lovchilarni manzilga\nEhtiyot bo'lib eltar.",
  },
  {
    id: 'dehqon',
    answer: N('dehqon'),
    text: "Ertalab dalaga borar,\nYerni haydab, ekin ekar.\nPaxta, bug'doy, mevalarni\nMehnat qilib yetishtirar.",
  },
  // ---------- Alifbo uchun qo'shimcha narsalar ----------
  {
    id: 'fonar',
    answer: N('fonar'),
    text: "Qorong'i tushsa yonadi,\nYo'limizni yoritadi.\nQo'lda ko'tarib yuramiz,\nChiroqchaga o'xshaydi.",
  },
  {
    id: 'gilam',
    answer: N('gilam'),
    text: "Polga to'shab qo'yamiz,\nUstida o'ynab yotamiz.\nNaqshlari rang-barang,\nYumshoq, issiq, chiroyli.",
  },
  {
    id: 'hakka',
    answer: N('hakka'),
    text: "Qora-oq patlari bor,\nDumi uzun, chiroyli.\nYaltiroq narsa ko'rsa,\nOlib qochadi tezda.",
  },
  {
    id: 'ilon',
    answer: N('ilon'),
    text: "Oyog'i yo'q, sudralar,\nUzun-uzun tanasi.\nVishillab tilini chiqarar,\nO'tlar ichida yashar.",
  },
  {
    id: 'ip',
    answer: N('ip'),
    text: "Dumaloq qilib o'ralgan,\nUchidan tortsang — cho'zilar.\nBuvijon undan to'qiydi\nIssiq paypoq, qo'lqop.",
  },
  {
    id: 'jirafa',
    answer: N('jirafa'),
    text: "Bo'yni uzun-uzun,\nTanasida dog'lari bor.\nDaraxt uchidagi bargni\nBemalol yeb olar.",
  },
  {
    id: 'joxori',
    answer: N('joxori'),
    text: "Sap-sariq donachalar\nQator-qator tizilgan.\nYashil to'nga o'ralgan,\nQaynatsak — shirin bo'lar.",
  },
  {
    id: 'limon',
    answer: N('limon'),
    text: "Sap-sariq va xushbo'y,\nTatib ko'rsang — juda nordon!\nChoyga bir tilim solsak,\nMazasi bo'lar boshqacha.",
  },
  {
    id: 'laylak',
    answer: N('laylak'),
    text: "Oyoqlari uzun, qizil,\nTumshug'i ham uzundir.\nTomda uya quradi,\nBir oyoqda turadi.",
  },
  {
    id: 'raketa',
    answer: N('raketa'),
    text: "Olovdan dumi bor,\nOsmonga uchib ketar.\nYulduzlar sari yo'l olar,\nOyga ham yetib borar.",
  },
  {
    id: 'ruchka',
    answer: N('ruchka'),
    text: "Qalamga o'xshaydi,\nLekin siyohi bor.\nDaftarga chiroyli\nHarflarni yozadi.",
  },
  {
    id: 'uy',
    answer: N('uy'),
    text: "Tomi bor, eshigi bor,\nIchida oila yashar.\nIssiq va xavfsiz bizga,\nHammamiz uni sevamiz.",
  },
  {
    id: 'uzuk',
    answer: N('uzuk'),
    text: "Barmoqqa taqib yurar,\nYaltiraydi tilladek.\nUstida kichik toshi,\nOnamning chiroyli bezagi.",
  },
  {
    id: 'vertolyot',
    answer: N('vertolyot'),
    text: "Tepasida parragi\nGir-gir aylanib turar.\nOsmonga tik ko'tarilar,\nQush kabi uchib yurar.",
  },
  {
    id: 'xurmo',
    answer: N('xurmo'),
    text: "Kuzda pishar, to'q sariq,\nBoshida yashil qalpog'i.\nYumshoq, shirin, asaldek,\nQishda ham bizga yoqar.",
  },
  {
    id: 'xalta',
    answer: N('xalta'),
    text: "Matodan tikilgan,\nIchiga narsa solamiz.\nBozorga ko'tarib borib,\nNon, meva olib kelamiz.",
  },
  {
    id: 'zebra',
    answer: N('zebra'),
    text: "Otga o'xshar, lekin\nOq-qora yo'l-yo'li bor.\nAfrika dalalarida\nChopib yurar u tez-tez.",
  },
  {
    id: 'zamburug',
    answer: N('zamburug'),
    text: "Yomg'irdan keyin o'rmonda\nBoshida qalpoq, bir oyoq.\nO'tlar orasida turar,\nSavatga terar bolalar.",
  },
  {
    id: 'narvon',
    answer: N('narvon'),
    text: "Devorga suyab qo'ysang,\nPog'onama-pog'ona chiqasan.\nTomga ham, daraxtga ham\nUnga tirmashib yetasan.",
  },
  {
    id: 'gildirak',
    answer: N('gildirak'),
    text: "Dumaloq, aylanadi,\nMashinani yurgizar.\nVelosipedda ikkita,\nYo'lda g'izillab chopar.",
  },
  {
    id: 'chumoli',
    answer: N('chumoli'),
    text: "Mitti-mitti, mehnatkash,\nOg'ir yukni ko'taradi.\nUyasi tuproq ostida,\nBirga-birga yashaydi.",
  },
  {
    id: 'shar',
    answer: N('shar'),
    text: "Puflasak — kattalashar,\nIpidan mahkam ushla!\nQo'yib yuborsang agar,\nOsmonga uchib ketar.",
  },
  {
    id: 'sher',
    answer: N('sher'),
    text: "Yoli bor, oltin rangli,\nHayvonlarning shohidir.\nBaland ovozda o'kirar,\nKuchli va jasur u.",
  },
]
