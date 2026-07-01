/* ===================== FIREBASE CONFIG ===================== */
/* TODO: Replace with your own Firebase project config (Firestore + Auth-anonymous enabled) */
const firebaseConfig = {
  apiKey: "AIzaSyAeupI3EuaNwcII_rDexSmQR8ais_csfSw",
  authDomain: "taxi-maintenance.firebaseapp.com",
  projectId: "taxi-maintenance",
  storageBucket: "taxi-maintenance.firebasestorage.app",
  messagingSenderId: "323446645683",
  appId: "1:323446645683:web:1016eadfaa260816a8e1c6"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

/* ===================== CONSTANTS ===================== */
const CAR_ID = "car1"; // single car for now; structure supports adding more later
const DRIVER_SALARY_PCT = 0.30;
const TOLL_GST_PCT = 0.05;
const DEFAULT_PINS = { owner: "1234", driver: "0000" };

let currentRole = "owner";
let currentLang = localStorage.getItem("lang") || "en";
let currentUser = null; // 'owner' | 'driver'

/* ===================== TRANSLATIONS ===================== */
const T = {
  en: {
    appname:"Taxi Tracker", tagline:"Revenue & Payout Tracker", owner:"Owner", driver:"Driver", login:"Login",
    date:"Date", leave:"Mark today as Leave", kmsec:"Kilometers", startkm:"Start KM", endkm:"End KM",
    revsec:"Revenue", trip:"Trip Payment (Total Fare, as per bill)", online:"— of which, Online / RedTaxi Credit",
    tollbill:"Toll in Bill (incl. GST)", tollbillhint:"If the customer's bill already includes a toll charge line, enter that amount (toll + its GST) here — it's excluded only when calculating driver salary.",
    expsec:"Expenses", fuel:"Fuel", fuelcash:"Fuel (Cash)", fuelcard:"Fuel (Card)",
    parking:"Parking (cash)", tollcollected:"Toll Collected (FASTag)",
    otherexp:"Other Expenses", addexpense:"Add Expense", otherexptotal:"Other Expenses Total",
    expamount:"Amount", expdesc:"Description",
    calcsec:"Auto Calculated", totalrev:"Total Revenue",
    salary30:"Driver Salary (30%)", salarybasehint:"Calculated on Total Revenue minus Toll-in-Bill",
    addtoll:"+ Toll Collected (FASTag)", deduct:"− Online, Fuel(Cash), Parking, Other Exp.",
    owneramt:"Owner Amount", paysec:"Owner Payment Status", unpaid:"Unpaid", paid:"Paid", cashpaid:"Cash Paid",
    upipaid:"UPI Paid", saveentry:"Save Entry", outstanding:"Total Outstanding (Unpaid)", monthpick:"Month",
    insurance:"Insurance", tyre:"Tyre Cost", redcomm:"RedTaxi Commission", maintbudget:"Maintenance (Budget)",
    maintactual:"Actual Maintenance", others:"Others", notes:"Notes", savemaint:"Save Maintenance",
    commhint:"RedTaxi settles commission 3x/month: 1–10 (paid 13th), 11–20 (paid 23rd), 21–end (paid 3rd next month). Enter the total commission for the month here.",
    today:"Today", revenue:"Revenue", salary:"Driver Salary", owneramount:"Owner Amount", status:"Status",
    thismonth:"This Month", totalrevenue:"Total Revenue", kmdriven:"KM Driven", fixedcosts:"EMI+Ins+Tyre+Maint+Others",
    profit:"Profit", paidtotal:"Owner Amount Paid", paidcash:"— Cash", paidupi:"— UPI", unpaidtotal:"Unpaid (Outstanding)",
    tab_entry:"Entry", tab_payout:"Payout", tab_maint:"Maintenance", tab_dash:"Dashboard",
    headerEntry:"Daily Entry", headerPayout:"Payout Details", headerMaint:"Maintenance", headerDash:"Dashboard",
    wrongPin:"Wrong PIN, try again", savedOk:"Saved successfully", fillRequired:"Please fill required fields",
    splitMismatch:"Cash + UPI must equal Owner Amount", markPaid:"Mark Paid", markUnpaid:"Mark Unpaid", edit:"Edit",
    leaveTag:"Leave Day", noEntries:"No entries yet", delete:"Delete", confirmDelete:"Delete this entry?",
    share:"Share", shareReceiptTitle:"Daily Payout", shareFailed:"Couldn't generate image", shareFallback:"Image downloaded — attach it on WhatsApp",
    srTripRev:"Trip Total (Fare)", srOnline:"Online/Credit (settled separately)", srFuelCash:"Fuel (Cash)", srParking:"Parking",
    srOtherExp:"Other Expenses", srTollCollected:"Toll Collected", srSalary:"Driver Salary (30%)",
    srHandover:"Handed Over To Owner",
    reportsec:"Reports & Export", expdaily:"Daily (Range)", expmonthly:"Monthly",
    startdate:"Start Date", enddate:"End Date", reportmonth:"Month",
    exportpdf:"Export PDF", exportexcel:"Export Excel",
  },
  ta: {
    appname:"டாக்ஸி கணக்கு", tagline:"வருமானம் & கொடுப்பனவு கணக்கு", owner:"உரிமையாளர்", driver:"டிரைவர்", login:"உள்நுழைய",
    date:"தேதி", leave:"இன்று லீவு", kmsec:"கிலோமீட்டர்", startkm:"தொடக்க KM", endkm:"முடிவு KM",
    revsec:"வருமானம்", trip:"டிரிப் பணம் (மொத்த கட்டணம், பில் படி)", online:"— இதில், ஆன்லைன் / RedTaxi கிரெடிட்",
    tollbill:"பில்லில் டோல் (GST உடன்)", tollbillhint:"வாடிக்கையாளர் பில்லில் ஏற்கனவே டோல் தொகை சேர்க்கப்பட்டிருந்தால், அந்த தொகையை (டோல் + அதன் GST) இங்கே உள்ளிடவும் — இது டிரைவர் சம்பளம் கணக்கிடும்போது மட்டும் கழிக்கப்படும்.",
    expsec:"செலவுகள்", fuel:"எரிபொருள்", fuelcash:"எரிபொருள் (கேஷ்)", fuelcard:"எரிபொருள் (கார்டு)",
    parking:"பார்க்கிங் (கேஷ்)", tollcollected:"வசூலித்த டோல் (FASTag)",
    otherexp:"மற்ற செலவுகள்", addexpense:"செலவு சேர்க்க", otherexptotal:"மற்ற செலவுகள் மொத்தம்",
    expamount:"தொகை", expdesc:"விவரம்",
    calcsec:"தானியங்கி கணக்கீடு", totalrev:"மொத்த வருமானம்",
    salary30:"டிரைவர் சம்பளம் (30%)", salarybasehint:"மொத்த வருமானம் கழித்தல் பில் டோல் அடிப்படையில் கணக்கிடப்படும்",
    addtoll:"+ வசூலித்த டோல் (FASTag)", deduct:"− ஆன்லைன், எரிபொருள்(கேஷ்), பார்க்கிங், மற்ற செலவுகள்",
    owneramt:"உரிமையாளர் தொகை", paysec:"கட்டண நிலை", unpaid:"செலுத்தப்படவில்லை", paid:"செலுத்தப்பட்டது", cashpaid:"கேஷ்",
    upipaid:"UPI", saveentry:"சேமிக்க", outstanding:"மொத்த நிலுவை", monthpick:"மாதம்",
    insurance:"இன்சூரன்ஸ்", tyre:"டயர் செலவு", redcomm:"RedTaxi கமிஷன்", maintbudget:"பராமரிப்பு (பட்ஜெட்)",
    maintactual:"உண்மையான பராமரிப்பு", others:"மற்றவை", notes:"குறிப்புகள்", savemaint:"சேமிக்க",
    commhint:"RedTaxi மாதம் 3 முறை கமிஷன் வசூலிக்கும்: 1–10 (13ம் தேதி), 11–20 (23ம் தேதி), 21–முடிவு (அடுத்த மாத 3ம் தேதி). மாத மொத்த கமிஷனை இங்கே உள்ளிடவும்.",
    today:"இன்று", revenue:"வருமானம்", salary:"டிரைவர் சம்பளம்", owneramount:"உரிமையாளர் தொகை", status:"நிலை",
    thismonth:"இந்த மாதம்", totalrevenue:"மொத்த வருமானம்", kmdriven:"ஓட்டிய KM", fixedcosts:"EMI+இன்சூரன்ஸ்+டயர்+பராமரிப்பு+மற்றவை",
    profit:"லாபம்", paidtotal:"செலுத்திய தொகை", paidcash:"— கேஷ்", paidupi:"— UPI", unpaidtotal:"நிலுவை",
    tab_entry:"உள்ளீடு", tab_payout:"கொடுப்பனவு", tab_maint:"பராமரிப்பு", tab_dash:"டாஷ்போர்டு",
    headerEntry:"தினசரி உள்ளீடு", headerPayout:"கொடுப்பனவு விவரம்", headerMaint:"பராமரிப்பு", headerDash:"டாஷ்போர்டு",
    wrongPin:"தவறான PIN, மீண்டும் முயற்சிக்கவும்", savedOk:"வெற்றிகரமாக சேமிக்கப்பட்டது", fillRequired:"தேவையான புலங்களை நிரப்பவும்",
    splitMismatch:"கேஷ் + UPI = உரிமையாளர் தொகைக்கு சமமாக இருக்க வேண்டும்", markPaid:"செலுத்தியதாக குறி", markUnpaid:"செலுத்தாததாக குறி", edit:"திருத்து",
    leaveTag:"லீவு நாள்", noEntries:"உள்ளீடுகள் இல்லை", delete:"நீக்கு", confirmDelete:"இந்த உள்ளீட்டை நீக்கவா?",
    share:"பகிர்", shareReceiptTitle:"தினசரி கொடுப்பனவு", shareFailed:"படம் உருவாக்க முடியவில்லை", shareFallback:"படம் டவுன்லோட் ஆனது — WhatsApp இல் இணைக்கவும்",
    srTripRev:"டிரிப் மொத்த கட்டணம்", srOnline:"ஆன்லைன்/கிரெடிட் (தனியாக தீர்வு)", srFuelCash:"எரிபொருள் (கேஷ்)", srParking:"பார்க்கிங்",
    srOtherExp:"மற்ற செலவுகள்", srTollCollected:"வசூலித்த டோல்", srSalary:"டிரைவர் சம்பளம் (30%)",
    srHandover:"உரிமையாளரிடம் ஒப்படைத்தது",
    reportsec:"அறிக்கை & ஏற்றுமதி", expdaily:"தினசரி (வரம்பு)", expmonthly:"மாதம் வாரியாக",
    startdate:"தொடக்க தேதி", enddate:"முடிவு தேதி", reportmonth:"மாதம்",
    exportpdf:"PDF ஏற்றுமதி", exportexcel:"Excel ஏற்றுமதி",
  }
};
function tr(key){ return (T[currentLang] && T[currentLang][key]) || T.en[key] || key; }

function applyTranslations(){
  document.querySelectorAll("[id^='t_']").forEach(el=>{
    const key = el.id.slice(2);
    if(T.en[key]) el.textContent = tr(key);
  });
  document.getElementById("langTaBtn").className = currentLang==="ta"?"on":"";
  document.getElementById("langEnBtn").className = currentLang==="en"?"on":"";
  document.getElementById("langTaBtn2").className = currentLang==="ta"?"on":"";
  document.getElementById("langEnBtn2").className = currentLang==="en"?"on":"";
  updateHeader();
  buildTabbar();
}
function setLang(l){ currentLang = l; localStorage.setItem("lang", l); applyTranslations(); renderActiveScreen(); }

/* ===================== LOGIN ===================== */
function selectRole(role){
  currentRole = role;
  document.getElementById("roleOwnerBtn").className = role==="owner" ? "sel":"";
  document.getElementById("roleDriverBtn").className = role==="driver" ? "sel":"";
}
async function doLogin(){
  const pin = document.getElementById("pinInput").value.trim();
  const errEl = document.getElementById("loginErr");
  errEl.style.display="none";
  try{
    if(!auth.currentUser){ await auth.signInAnonymously(); }
    const settingsDoc = await db.collection("settings").doc("pins").get();
    const pins = settingsDoc.exists ? settingsDoc.data() : DEFAULT_PINS;
    const correct = pins[currentRole] || DEFAULT_PINS[currentRole];
    if(pin !== correct){
      errEl.textContent = tr("wrongPin");
      errEl.style.display="block";
      return;
    }
    currentUser = currentRole;
    localStorage.setItem("taxiapp_role", currentRole);
    enterApp();
  }catch(e){
    errEl.textContent = e.message;
    errEl.style.display="block";
  }
}
function logout(){
  localStorage.removeItem("taxiapp_role");
  currentUser = null;
  document.getElementById("mainApp").style.display="none";
  document.getElementById("loginScreen").className="screen active";
  document.getElementById("pinInput").value="";
}

/* ===================== APP SHELL / TABS ===================== */
const TABS = {
  owner: [
    {id:"dash", icon:"📊", labelKey:"tab_dash"},
    {id:"payout", icon:"💰", labelKey:"tab_payout"},
    {id:"maint", icon:"🔧", labelKey:"tab_maint"},
  ],
  driver: [
    {id:"entry", icon:"📝", labelKey:"tab_entry"},
    {id:"payout", icon:"💰", labelKey:"tab_payout"},
  ]
};
let activeTab = "dash";
let pendingReload = false;
function maybeReload(){
  if(pendingReload && activeTab !== "entry"){
    pendingReload = false;
    window.location.reload();
  }
}

function buildTabbar(){
  const bar = document.getElementById("tabbar");
  bar.innerHTML = "";
  const tabs = TABS[currentUser] || TABS.owner;
  if(!tabs.find(t=>t.id===activeTab)) activeTab = tabs[0].id;
  tabs.forEach(t=>{
    const btn = document.createElement("button");
    btn.className = t.id===activeTab ? "active":"";
    btn.innerHTML = `<span class="e">${t.icon}</span><span>${tr(t.labelKey)}</span>`;
    btn.onclick = ()=> switchTab(t.id);
    bar.appendChild(btn);
  });
}
function switchTab(id){
  activeTab = id;
  buildTabbar();
  renderActiveScreen();
  maybeReload();
}
function updateHeader(){
  const map = {dash:"headerDash", payout:"headerPayout", maint:"headerMaint", entry:"headerEntry"};
  document.getElementById("headerTitle").textContent = tr(map[activeTab] || "headerDash");
  document.getElementById("headerSub").textContent = currentUser==="owner" ? tr("owner") : tr("driver");
}
function showScreen(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  const el = document.getElementById("screen_"+id);
  if(el) el.classList.add("active");
}

function enterApp(){
  document.getElementById("loginScreen").className="screen";
  document.getElementById("mainApp").style.display="block";
  applyTranslations();
  activeTab = (currentUser==="driver") ? "entry" : "dash";
  buildTabbar();
  renderActiveScreen();
}
function renderActiveScreen(){
  showScreen(activeTab);
  updateHeader();
  if(activeTab==="entry") initEntryScreen();
  if(activeTab==="payout") loadPayoutList();
  if(activeTab==="maint") initMaintScreen();
  if(activeTab==="dash") loadDashboard();
}

/* ===================== HELPERS ===================== */
function todayStr(){
  const d = new Date();
  return d.toISOString().slice(0,10);
}
function fmt(n){
  n = Number(n)||0;
  return "₹" + n.toLocaleString("en-IN", {maximumFractionDigits:0});
}
function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 1800);
}
function entryDocRef(dateStr){
  return db.collection("vehicles").doc(CAR_ID).collection("entries").doc(dateStr);
}
function maintDocRef(monthStr){ // monthStr like 2026-06
  return db.collection("vehicles").doc(CAR_ID).collection("maintenance").doc(monthStr);
}

/* ===================== DRIVER: DAILY ENTRY ===================== */
function initEntryScreen(){
  const dateInput = document.getElementById("entDate");
  if(!dateInput.value) dateInput.value = todayStr();
  dateInput.onchange = loadEntryForDate;
  ["tripPayment","onlinePayment","tollCharge","fuelCash","fuelCard","parking","tollCollected"].forEach(id=>{
    document.getElementById(id).oninput = recalcEntry;
  });
  loadEntryForDate();
}

/* ----- Other Expenses (repeatable rows) ----- */
let expRowSeq = 0;
function addExpenseRow(amount, desc){
  const id = "exp_" + (expRowSeq++);
  const wrap = document.createElement("div");
  wrap.className = "exp-row";
  wrap.id = id;
  wrap.innerHTML = `
    <input type="number" class="exp-amt" placeholder="${tr('expamount')}" value="${amount!==undefined?amount:''}" oninput="recalcEntry()">
    <input type="text" class="exp-desc" placeholder="${tr('expdesc')}" value="${desc!==undefined?desc.replace(/"/g,'&quot;'):''}" oninput="recalcEntry()">
    <button type="button" class="exp-remove" onclick="removeExpenseRow('${id}')">×</button>
  `;
  document.getElementById("otherExpList").appendChild(wrap);
  recalcEntry();
}
function removeExpenseRow(id){
  const el = document.getElementById(id);
  if(el) el.remove();
  recalcEntry();
}
function clearExpenseRows(){
  document.getElementById("otherExpList").innerHTML = "";
}
function getOtherExpenses(){
  const rows = document.querySelectorAll("#otherExpList .exp-row");
  const list = [];
  rows.forEach(row=>{
    const amount = Number(row.querySelector(".exp-amt").value) || 0;
    const desc = row.querySelector(".exp-desc").value || "";
    if(amount || desc) list.push({amount, desc});
  });
  return list;
}

async function loadEntryForDate(){
  const date = document.getElementById("entDate").value;
  const doc = await entryDocRef(date).get();
  const data = doc.exists ? doc.data() : null;
  document.getElementById("leaveToggle").checked = data ? !!data.leave : false;
  toggleLeaveMode();
  ["tripPayment","onlinePayment","parking","tollCollected"].forEach(id=>{
    document.getElementById(id).value = data && data[id]!==undefined ? data[id] : "";
  });
  // Toll base charge — new entries store tollCharge directly. Legacy entries only had
  // tollBill (a manually entered GST-inclusive total) — back-calculate an approx base for editing.
  if(data && data.tollCharge!==undefined){
    document.getElementById("tollCharge").value = data.tollCharge;
  } else if(data && data.tollBill!==undefined){
    document.getElementById("tollCharge").value = Math.round((data.tollBill/(1+TOLL_GST_PCT))*100)/100;
  } else {
    document.getElementById("tollCharge").value = "";
  }
  // Fuel cash/card — fall back to legacy single fuelAmount+fuelMode entries
  if(data && (data.fuelCash!==undefined || data.fuelCard!==undefined)){
    document.getElementById("fuelCash").value = data.fuelCash!==undefined ? data.fuelCash : "";
    document.getElementById("fuelCard").value = data.fuelCard!==undefined ? data.fuelCard : "";
  } else if(data && data.fuelAmount!==undefined){
    document.getElementById("fuelCash").value = data.fuelMode==="cash" ? data.fuelAmount : "";
    document.getElementById("fuelCard").value = data.fuelMode==="card" ? data.fuelAmount : "";
  } else {
    document.getElementById("fuelCash").value = "";
    document.getElementById("fuelCard").value = "";
  }
  clearExpenseRows();
  if(data && Array.isArray(data.otherExpenses) && data.otherExpenses.length){
    data.otherExpenses.forEach(e=> addExpenseRow(e.amount, e.desc));
  }
  document.getElementById("payStatus").value = (data && data.payStatus) || "unpaid";
  document.getElementById("cashPaid").value = data && data.cashPaid!==undefined ? data.cashPaid : "";
  document.getElementById("upiPaid").value = data && data.upiPaid!==undefined ? data.upiPaid : "";
  togglePaySplit();
  recalcEntry();
}
function toggleLeaveMode(){
  const isLeave = document.getElementById("leaveToggle").checked;
  document.getElementById("entryFields").style.display = isLeave ? "none" : "block";
}
function calcEntryValues(){
  const v = id=> Number(document.getElementById(id).value) || 0;
  const trip = v("tripPayment"), online = v("onlinePayment");
  const tollCharge = v("tollCharge");
  const tollBillTotal = Math.round(tollCharge * (1+TOLL_GST_PCT) * 100) / 100;
  const fuelCash = v("fuelCash"), fuelCard = v("fuelCard");
  const parking = v("parking"), tollCollected = v("tollCollected");
  const otherExpenses = getOtherExpenses();
  const otherExpTotal = otherExpenses.reduce((s,e)=> s + (Number(e.amount)||0), 0);

  const totalRevenue = trip;
  const salaryBase = Math.max(totalRevenue - tollBillTotal, 0);
  const salary = salaryBase * DRIVER_SALARY_PCT;
  const deductions = online + fuelCash + parking + otherExpTotal;
  const ownerAmount = totalRevenue - deductions - salary + tollCollected;

  return {trip, online, tollCharge, tollBillTotal, fuelCash, fuelCard, parking, tollCollected,
    otherExpenses, otherExpTotal, totalRevenue, salaryBase, salary, deductions, ownerAmount};
}
function recalcEntry(){
  const c = calcEntryValues();
  document.getElementById("calcRevenue").textContent = fmt(c.totalRevenue);
  document.getElementById("calcSalary").textContent = fmt(c.salary);
  document.getElementById("calcTollCollected").textContent = "+" + fmt(c.tollCollected);
  document.getElementById("calcDeduct").textContent = "−" + fmt(c.deductions);
  document.getElementById("calcOwnerAmt").textContent = fmt(c.ownerAmount);
  const gstEl = document.getElementById("tollGstReadout");
  if(gstEl) gstEl.textContent = `Incl. GST 5%: ₹${fmt(c.tollBillTotal)}`;
  const totalEl = document.getElementById("otherExpTotalVal");
  if(totalEl) totalEl.textContent = fmt(c.otherExpTotal);
}
function togglePaySplit(){
  const isPaid = document.getElementById("payStatus").value === "paid";
  document.getElementById("paySplitFields").style.display = isPaid ? "block":"none";
}
async function saveEntry(){
  const date = document.getElementById("entDate").value;
  if(!date){ showToast(tr("fillRequired")); return; }
  const isLeave = document.getElementById("leaveToggle").checked;
  let payload = { date, leave: isLeave, updatedAt: Date.now() };

  if(isLeave){
    await entryDocRef(date).set(payload, {merge:true});
    showToast(tr("savedOk"));
    return;
  }

  const c = calcEntryValues();
  const payStatus = document.getElementById("payStatus").value;
  const cashPaid = Number(document.getElementById("cashPaid").value)||0;
  const upiPaid = Number(document.getElementById("upiPaid").value)||0;

  if(payStatus==="paid"){
    if(Math.round(cashPaid+upiPaid) !== Math.round(c.ownerAmount) && (cashPaid+upiPaid) > c.ownerAmount){
      showToast(tr("splitMismatch")); return;
    }
  }

  payload = {
    ...payload,
    tripPayment: c.trip, onlinePayment: c.online,
    tollCharge: c.tollCharge, tollBillTotal: c.tollBillTotal,
    fuelCash: c.fuelCash, fuelCard: c.fuelCard, parking: c.parking, tollCollected: c.tollCollected,
    otherExpenses: c.otherExpenses, otherExpTotal: c.otherExpTotal,
    totalRevenue: c.totalRevenue, salaryBase: c.salaryBase, driverSalary: c.salary,
    ownerAmount: c.ownerAmount, payStatus, cashPaid: payStatus==="paid"?cashPaid:0,
    upiPaid: payStatus==="paid"?upiPaid:0,
    // legacy fields cleared so old dashboards/queries relying on them don't double count
    fuelAmount: c.fuelCash + c.fuelCard, fuelMode: null,
  };
  await entryDocRef(date).set(payload, {merge:true});
  showToast(tr("savedOk"));
}

/* ===================== PAYOUT DETAILS TAB ===================== */
function fuelCashCard(d){
  // New entries store fuelCash/fuelCard directly. Old entries (pre-update) only have fuelAmount+fuelMode.
  if(d.fuelCash!==undefined || d.fuelCard!==undefined){
    return { cash: d.fuelCash||0, card: d.fuelCard||0 };
  }
  if(d.fuelAmount!==undefined){
    return { cash: d.fuelMode==="cash" ? (d.fuelAmount||0) : 0, card: d.fuelMode==="card" ? (d.fuelAmount||0) : 0 };
  }
  return { cash:0, card:0 };
}
async function loadPayoutList(){
  const snap = await db.collection("vehicles").doc(CAR_ID).collection("entries")
    .orderBy("date","desc").limit(90).get();
  const list = document.getElementById("payoutList");
  list.innerHTML = "";
  let outstanding = 0;
  if(snap.empty){
    list.innerHTML = `<div class="empty">${tr("noEntries")}</div>`;
    document.getElementById("outstandingAmt").textContent = fmt(0);
    return;
  }
  snap.forEach(doc=>{
    const d = doc.data();
    if(d.leave){
      list.appendChild(renderLeaveItem(d));
      return;
    }
    if(d.payStatus==="unpaid") outstanding += (d.ownerAmount||0) - (d.cashPaid||0) - (d.upiPaid||0);
    list.appendChild(renderPayoutItem(d));
  });
  document.getElementById("outstandingAmt").textContent = fmt(outstanding);
}
function renderLeaveItem(d){
  const div = document.createElement("div");
  div.className = "history-item";
  div.innerHTML = `<div class="top"><span class="date">${d.date}</span><span class="badge leave">${tr("leaveTag")}</span></div>`;
  return div;
}
function renderPayoutItem(d){
  const div = document.createElement("div");
  div.className = "history-item";
  const statusBadge = d.payStatus==="paid" ? `<span class="badge paid">${tr("paid")}</span>` : `<span class="badge unpaid">${tr("unpaid")}</span>`;
  div.innerHTML = `
    <div class="top" onclick="openEditModal('${d.date}')" style="cursor:pointer;">
      <span class="date">${d.date}</span>
      ${statusBadge}
    </div>
    <div class="sub" onclick="openEditModal('${d.date}')" style="cursor:pointer;">
      <span>${tr("revenue")}: ${fmt(d.totalRevenue)}</span>
      <span>${tr("salary")}: ${fmt(d.driverSalary)}</span>
      <span>${tr("owneramount")}: ${fmt(d.ownerAmount)}</span>
      ${d.payStatus==="paid" ? `<span>${tr("cashpaid")}: ${fmt(d.cashPaid)}</span><span>${tr("upipaid")}: ${fmt(d.upiPaid)}</span>` : ""}
    </div>
    <div class="actions">
      <button class="share-btn" onclick="event.stopPropagation(); shareEntry('${d.date}')">📤 ${tr("share")}</button>
    </div>`;
  return div;
}
function closeModal(){ document.getElementById("editModalBg").classList.remove("show"); }
async function openEditModal(date){
  const doc = await entryDocRef(date).get();
  if(!doc.exists) return;
  const d = doc.data();
  const fc = fuelCashCard(d);
  const expTotal = d.otherExpTotal!==undefined ? d.otherExpTotal : (Array.isArray(d.otherExpenses) ? d.otherExpenses.reduce((s,e)=>s+(e.amount||0),0) : 0);
  const expRowsHtml = (d.otherExpenses||[]).map(e=>`<div class="row"><span class="lbl">— ${e.desc||tr("otherexp")}</span><span class="val">${fmt(e.amount)}</span></div>`).join("");
  const content = document.getElementById("editModalContent");
  content.innerHTML = `
    <h3 style="margin-bottom:14px;">${date}</h3>
    <div class="row"><span class="lbl">${tr("totalrev")}</span><span class="val">${fmt(d.totalRevenue)}</span></div>
    <div class="row"><span class="lbl">${tr("fuelcash")}</span><span class="val">${fmt(fc.cash)}</span></div>
    <div class="row"><span class="lbl">${tr("fuelcard")}</span><span class="val">${fmt(fc.card)}</span></div>
    <div class="row"><span class="lbl">${tr("parking")}</span><span class="val">${fmt(d.parking)}</span></div>
    <div class="row"><span class="lbl">${tr("tollbill")}</span><span class="val">${fmt(d.tollCharge!==undefined ? d.tollCharge : (d.tollBill!==undefined ? Math.round((d.tollBill/(1+TOLL_GST_PCT))*100)/100 : 0))} (+GST = ${fmt(d.tollBillTotal!==undefined ? d.tollBillTotal : d.tollBill)})</span></div>
    <div class="row"><span class="lbl">${tr("tollcollected")}</span><span class="val">${fmt(d.tollCollected)}</span></div>
    ${expRowsHtml}
    <div class="row"><span class="lbl">${tr("otherexptotal")}</span><span class="val">${fmt(expTotal)}</span></div>
    <div class="row"><span class="lbl">${tr("salary30")}</span><span class="val">${fmt(d.driverSalary)}</span></div>
    <div class="divider"></div>
    <div class="row"><span class="lbl" style="color:var(--accent2)">${tr("owneramt")}</span><span class="val" style="color:var(--accent2)">${fmt(d.ownerAmount)}</span></div>
    <div class="divider"></div>
    <label>${tr("paysec")}</label>
    <select id="modalPayStatus">
      <option value="unpaid" ${d.payStatus==="unpaid"?"selected":""}>${tr("unpaid")}</option>
      <option value="paid" ${d.payStatus==="paid"?"selected":""}>${tr("paid")}</option>
    </select>
    <div class="pay-split">
      <div style="flex:1;"><label>${tr("cashpaid")}</label><input type="number" id="modalCash" value="${d.cashPaid||0}"></div>
      <div style="flex:1;"><label>${tr("upipaid")}</label><input type="number" id="modalUpi" value="${d.upiPaid||0}"></div>
    </div>
    <button class="btn" style="margin-top:10px;" onclick="saveModalPayment('${date}')">${tr("saveentry")}</button>
    <button class="btn secondary" style="margin-top:10px;" onclick="shareEntry('${date}')">📤 ${tr("share")}</button>
    <button class="btn outline-red" style="margin-top:10px; background:transparent;" onclick="deleteEntry('${date}')">${tr("delete")}</button>
  `;
  document.getElementById("editModalBg").classList.add("show");
}
async function saveModalPayment(date){
  const payStatus = document.getElementById("modalPayStatus").value;
  const cashPaid = Number(document.getElementById("modalCash").value)||0;
  const upiPaid = Number(document.getElementById("modalUpi").value)||0;
  await entryDocRef(date).set({payStatus, cashPaid: payStatus==="paid"?cashPaid:0, upiPaid: payStatus==="paid"?upiPaid:0}, {merge:true});
  closeModal();
  showToast(tr("savedOk"));
  loadPayoutList();
  if(activeTab==="dash") loadDashboard();
}
async function deleteEntry(date){
  if(!confirm(tr("confirmDelete"))) return;
  await entryDocRef(date).delete();
  closeModal();
  loadPayoutList();
}

/* ===================== SHARE PAYOUT AS IMAGE (WhatsApp) ===================== */
function buildShareReceipt(d, date){
  const fc = fuelCashCard(d);
  const expTotal = d.otherExpTotal!==undefined ? d.otherExpTotal : (Array.isArray(d.otherExpenses) ? d.otherExpenses.reduce((s,e)=>s+(e.amount||0),0) : 0);
  const statusBg = d.payStatus==="paid" ? "background:#dcfce7;color:#16a34a;" : "background:#fee2e2;color:#dc2626;";
  const statusText = d.payStatus==="paid" ? tr("paid") : tr("unpaid");
  const cashPaid = d.cashPaid||0, upiPaid = d.upiPaid||0;
  const handoverRows = d.payStatus==="paid"
    ? `${cashPaid>0?`<div class="sr-row"><span>${tr("cashpaid")}</span><span>${fmt(cashPaid)}</span></div>`:""}
       ${upiPaid>0?`<div class="sr-row"><span>${tr("upipaid")}</span><span>${fmt(upiPaid)}</span></div>`:""}`
    : "";
  const node = document.getElementById("shareReceipt");
  node.innerHTML = `
    <div class="sr-head">
      <div class="sr-app">🚖 ${tr("appname")}</div>
      <div class="sr-date">${date}</div>
    </div>
    <div class="sr-row"><span>${tr("srTripRev")}</span><span>${fmt(d.tripPayment||0)}</span></div>
    <div class="sr-row"><span>${tr("srOnline")}</span><span>−${fmt(d.onlinePayment)}</span></div>
    <div class="sr-row"><span>${tr("srSalary")}</span><span>−${fmt(d.driverSalary)}</span></div>
    <div class="sr-row"><span>${tr("srFuelCash")}</span><span>−${fmt(fc.cash)}</span></div>
    <div class="sr-row"><span>${tr("srParking")}</span><span>−${fmt(d.parking)}</span></div>
    <div class="sr-row"><span>${tr("srOtherExp")}</span><span>−${fmt(expTotal)}</span></div>
    <div class="sr-row"><span>${tr("srTollCollected")}</span><span>+${fmt(d.tollCollected)}</span></div>
    <div class="sr-final"><span>${tr("owneramt")}</span><span>${fmt(d.ownerAmount)}</span></div>
    <div class="sr-status" style="${statusBg}">${statusText}</div>
    ${handoverRows ? `<div class="sr-handover-title">${tr("srHandover")}</div>${handoverRows}` : ""}
  `;
}
async function shareEntry(date){
  if(typeof html2canvas === "undefined"){ showToast(tr("shareFailed")); return; }
  const doc = await entryDocRef(date).get();
  if(!doc.exists) return;
  const d = doc.data();
  if(d.leave) return;
  buildShareReceipt(d, date);
  const node = document.getElementById("shareReceipt");
  try{
    const canvas = await html2canvas(node, {backgroundColor:"#ffffff", scale:2});
    canvas.toBlob(async (blob)=>{
      if(!blob){ showToast(tr("shareFailed")); return; }
      const file = new File([blob], `payout-${date}.png`, {type:"image/png"});
      if(navigator.canShare && navigator.canShare({files:[file]})){
        try{
          await navigator.share({files:[file], title: tr("shareReceiptTitle"), text: `${tr("owneramt")}: ${fmt(d.ownerAmount)} (${date})`});
        }catch(e){ /* user cancelled share sheet — not an error */ }
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `payout-${date}.png`; a.click();
        URL.revokeObjectURL(url);
        showToast(tr("shareFallback"));
      }
    }, "image/png");
  }catch(e){
    showToast(tr("shareFailed"));
  }
}

/* ===================== MAINTENANCE TAB ===================== */
function initMaintScreen(){
  const monthInput = document.getElementById("maintMonth");
  if(!monthInput.value) monthInput.value = new Date().toISOString().slice(0,7);
  loadMaintenance();
}
async function loadMaintenance(){
  const month = document.getElementById("maintMonth").value;
  const doc = await maintDocRef(month).get();
  const d = doc.exists ? doc.data() : {};
  ["emi","insurance","tyre","redtaxi","budget","actual","others"].forEach(k=>{
    document.getElementById("m_"+k).value = d[k] !== undefined ? d[k] : "";
  });
  document.getElementById("m_startKm").value = d.startKm !== undefined ? d.startKm : "";
  document.getElementById("m_endKm").value = d.endKm !== undefined ? d.endKm : "";
  document.getElementById("m_notes").value = d.notes || "";
}
async function saveMaintenance(){
  const month = document.getElementById("maintMonth").value;
  const payload = {};
  ["emi","insurance","tyre","redtaxi","budget","actual","others"].forEach(k=>{
    payload[k] = Number(document.getElementById("m_"+k).value)||0;
  });
  payload.startKm = Number(document.getElementById("m_startKm").value)||0;
  payload.endKm = Number(document.getElementById("m_endKm").value)||0;
  payload.notes = document.getElementById("m_notes").value || "";
  payload.month = month;
  await maintDocRef(month).set(payload, {merge:true});
  showToast(tr("savedOk"));
  if(activeTab==="dash") loadDashboard();
}

/* ===================== DASHBOARD ===================== */
function initDashboardScreen(){
  const dayPicker = document.getElementById("dashDayPicker");
  const monthPicker = document.getElementById("dashMonthPicker");
  if(!dayPicker.value) dayPicker.value = todayStr();
  if(!monthPicker.value) monthPicker.value = todayStr().slice(0,7);
  dayPicker.onchange = ()=> loadDashboardDay(dayPicker.value);
  monthPicker.onchange = ()=> loadDashboardMonth(monthPicker.value);

  const expStart = document.getElementById("expStartDate");
  const expEnd = document.getElementById("expEndDate");
  const expMonth = document.getElementById("expMonth");
  if(!expStart.value) expStart.value = todayStr();
  if(!expEnd.value) expEnd.value = todayStr();
  if(!expMonth.value) expMonth.value = todayStr().slice(0,7);

  loadDashboardDay(dayPicker.value);
  loadDashboardMonth(monthPicker.value);
}
async function loadDashboard(){
  initDashboardScreen();
}
async function loadDashboardDay(date){
  const todayDoc = await entryDocRef(date).get();
  const td = todayDoc.exists ? todayDoc.data() : null;
  if(td && !td.leave){
    const fc = fuelCashCard(td);
    document.getElementById("d_todayRev").textContent = fmt(td.totalRevenue);
    document.getElementById("d_todayFuel").textContent = fmt(fc.cash + fc.card);
    document.getElementById("d_todaySalary").textContent = fmt(td.driverSalary);
    document.getElementById("d_todayOwner").textContent = fmt(td.ownerAmount);
    document.getElementById("d_todayStatus").innerHTML = td.payStatus==="paid"
      ? `<span class="badge paid">${tr("paid")}</span>` : `<span class="badge unpaid">${tr("unpaid")}</span>`;
  } else if(td && td.leave){
    ["d_todayRev","d_todayFuel","d_todaySalary","d_todayOwner"].forEach(id=>document.getElementById(id).textContent="—");
    document.getElementById("d_todayStatus").innerHTML = `<span class="badge leave">${tr("leaveTag")}</span>`;
  } else {
    ["d_todayRev","d_todayFuel","d_todaySalary","d_todayOwner"].forEach(id=>document.getElementById(id).textContent=fmt(0));
    document.getElementById("d_todayStatus").innerHTML = `<span class="badge unpaid">${tr("noEntries")}</span>`;
  }
}
async function loadDashboardMonth(month){
  const snap = await db.collection("vehicles").doc(CAR_ID).collection("entries")
    .where("date",">=", month+"-01").where("date","<=", month+"-31").get();
  let mRev=0, mFuel=0, mSalary=0, mPaid=0, mPaidCash=0, mPaidUpi=0, mUnpaid=0;
  snap.forEach(doc=>{
    const d = doc.data();
    if(d.leave) return;
    const fc = fuelCashCard(d);
    mRev += d.totalRevenue||0;
    mFuel += fc.cash + fc.card;
    mSalary += d.driverSalary||0;
    if(d.payStatus==="paid"){
      mPaid += (d.cashPaid||0)+(d.upiPaid||0);
      mPaidCash += d.cashPaid||0;
      mPaidUpi += d.upiPaid||0;
    } else {
      mUnpaid += (d.ownerAmount||0) - (d.cashPaid||0) - (d.upiPaid||0);
    }
  });

  const maintDoc = await maintDocRef(month).get();
  const md = maintDoc.exists ? maintDoc.data() : {};
  const comm = md.redtaxi||0;
  const fixedCosts = (md.emi||0)+(md.insurance||0)+(md.tyre||0)+(md.actual||0)+(md.others||0);
  const kmTotal = Math.max((md.endKm||0)-(md.startKm||0), 0);
  const profit = mRev - mSalary - mFuel - comm - fixedCosts;

  document.getElementById("d_mRev").textContent = fmt(mRev);
  document.getElementById("d_mKm").textContent = kmTotal;
  document.getElementById("d_mFuel").textContent = fmt(mFuel);
  document.getElementById("d_mSalary").textContent = fmt(mSalary);
  document.getElementById("d_mComm").textContent = fmt(comm);
  document.getElementById("d_mFixed").textContent = fmt(fixedCosts);
  const profitEl = document.getElementById("d_mProfit");
  profitEl.textContent = fmt(profit);
  profitEl.className = "val " + (profit>=0?"profit-pos":"profit-neg");
  document.getElementById("d_mPaid").textContent = fmt(mPaid);
  document.getElementById("d_mPaidCash").textContent = fmt(mPaidCash);
  document.getElementById("d_mPaidUpi").textContent = fmt(mPaidUpi);
  document.getElementById("d_mUnpaid").textContent = fmt(mUnpaid);
}

/* ===================== REPORTS & EXPORT (PDF / Excel) ===================== */
let exportMode = "daily";
function setExportMode(mode){
  exportMode = mode;
  document.getElementById("expModeDaily").classList.toggle("on", mode==="daily");
  document.getElementById("expModeMonthly").classList.toggle("on", mode==="monthly");
  document.getElementById("exportDailyFields").style.display = mode==="daily" ? "block":"none";
  document.getElementById("exportMonthlyFields").style.display = mode==="monthly" ? "block":"none";
}
async function fetchReportEntries(){
  let startDate, endDate;
  if(exportMode==="daily"){
    startDate = document.getElementById("expStartDate").value;
    endDate = document.getElementById("expEndDate").value;
  } else {
    const month = document.getElementById("expMonth").value;
    startDate = month+"-01";
    endDate = month+"-31";
  }
  if(!startDate || !endDate){ showToast(tr("fillRequired")); return null; }
  const snap = await db.collection("vehicles").doc(CAR_ID).collection("entries")
    .where("date",">=",startDate).where("date","<=",endDate).orderBy("date","asc").get();
  const rows = [];
  snap.forEach(doc=>{
    const d = doc.data();
    if(d.leave){
      rows.push({date:d.date, leave:true});
      return;
    }
    const fc = fuelCashCard(d);
    const expTotal = d.otherExpTotal!==undefined ? d.otherExpTotal : (Array.isArray(d.otherExpenses)?d.otherExpenses.reduce((s,e)=>s+(e.amount||0),0):0);
    rows.push({
      date:d.date, leave:false,
      revenue:d.totalRevenue||0, salary:d.driverSalary||0,
      fuelCash:fc.cash, fuelCard:fc.card, parking:d.parking||0,
      tollCharge: d.tollCharge!==undefined?d.tollCharge:0,
      tollBillTotal: d.tollBillTotal!==undefined?d.tollBillTotal:(d.tollBill||0),
      tollCollected:d.tollCollected||0, otherExp:expTotal,
      ownerAmount:d.ownerAmount||0, payStatus:d.payStatus||"unpaid",
      cashPaid:d.cashPaid||0, upiPaid:d.upiPaid||0,
    });
  });
  return {rows, startDate, endDate};
}
function reportTotals(rows){
  const t = {revenue:0,salary:0,fuelCash:0,fuelCard:0,parking:0,tollCollected:0,otherExp:0,ownerAmount:0,cashPaid:0,upiPaid:0};
  rows.forEach(r=>{
    if(r.leave) return;
    t.revenue+=r.revenue; t.salary+=r.salary; t.fuelCash+=r.fuelCash; t.fuelCard+=r.fuelCard;
    t.parking+=r.parking; t.tollCollected+=r.tollCollected; t.otherExp+=r.otherExp;
    t.ownerAmount+=r.ownerAmount; t.cashPaid+=r.cashPaid; t.upiPaid+=r.upiPaid;
  });
  return t;
}
async function exportReport(kind){
  const result = await fetchReportEntries();
  if(!result) return;
  const {rows, startDate, endDate} = result;
  if(!rows.length){ showToast(tr("noEntries")); return; }
  const totals = reportTotals(rows);
  const title = exportMode==="daily" ? `${startDate} to ${endDate}` : startDate.slice(0,7);
  if(kind==="pdf") exportReportPDF(rows, totals, title);
  else exportReportExcel(rows, totals, title);
}
function exportReportPDF(rows, totals, title){
  if(typeof window.jspdf === "undefined"){ showToast(tr("shareFailed")); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({orientation:"landscape", unit:"pt"});
  doc.setFontSize(14);
  doc.text(`${tr("appname")} — ${tr("headerDash")} (${title})`, 30, 30);

  const head = [["Date","Revenue","Salary","Fuel(Cash)","Fuel(Card)","Parking","Toll Collected","Other Exp","Owner Amt","Status","Cash Paid","UPI Paid"]];
  const body = rows.map(r=> r.leave
    ? [r.date, tr("leaveTag"),"","","","","","","","","",""]
    : [r.date, r.revenue.toFixed(0), r.salary.toFixed(0), r.fuelCash.toFixed(0), r.fuelCard.toFixed(0),
       r.parking.toFixed(0), r.tollCollected.toFixed(0), r.otherExp.toFixed(0), r.ownerAmount.toFixed(0),
       r.payStatus, r.cashPaid.toFixed(0), r.upiPaid.toFixed(0)]
  );
  body.push(["TOTAL", totals.revenue.toFixed(0), totals.salary.toFixed(0), totals.fuelCash.toFixed(0),
    totals.fuelCard.toFixed(0), totals.parking.toFixed(0), totals.tollCollected.toFixed(0),
    totals.otherExp.toFixed(0), totals.ownerAmount.toFixed(0), "", totals.cashPaid.toFixed(0), totals.upiPaid.toFixed(0)]);

  doc.autoTable({ head, body, startY: 45, styles:{fontSize:8}, headStyles:{fillColor:[245,158,11]},
    footStyles:{fillColor:[30,41,59]}, didParseCell:(data)=>{
      if(data.row.index === body.length-1) data.cell.styles.fontStyle = "bold";
    }});
  doc.save(`report-${title.replace(/\s+/g,"_")}.pdf`);
}
function exportReportExcel(rows, totals, title){
  if(typeof XLSX === "undefined"){ showToast(tr("shareFailed")); return; }
  const data = rows.map(r=> r.leave
    ? {Date:r.date, Status:tr("leaveTag")}
    : {
      Date:r.date, Revenue:r.revenue, "Driver Salary":r.salary,
      "Fuel (Cash)":r.fuelCash, "Fuel (Card)":r.fuelCard, Parking:r.parking,
      "Toll Charge (base)":r.tollCharge, "Toll (incl. GST)":r.tollBillTotal,
      "Toll Collected":r.tollCollected, "Other Expenses":r.otherExp,
      "Owner Amount":r.ownerAmount, "Pay Status":r.payStatus,
      "Cash Paid":r.cashPaid, "UPI Paid":r.upiPaid,
    }
  );
  data.push({
    Date:"TOTAL", Revenue:totals.revenue, "Driver Salary":totals.salary,
    "Fuel (Cash)":totals.fuelCash, "Fuel (Card)":totals.fuelCard, Parking:totals.parking,
    "Toll Collected":totals.tollCollected, "Other Expenses":totals.otherExp,
    "Owner Amount":totals.ownerAmount, "Cash Paid":totals.cashPaid, "UPI Paid":totals.upiPaid,
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `report-${title.replace(/\s+/g,"_")}.xlsx`);
}

/* ===================== INIT / SERVICE WORKER ===================== */
window.addEventListener("load", ()=>{
  applyTranslations();
  const savedRole = localStorage.getItem("taxiapp_role");
  if(savedRole){
    currentUser = savedRole;
    auth.signInAnonymously().then(()=> enterApp()).catch(()=>{
      currentUser = null;
    });
  }
  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("service-worker.js").then((reg)=>{
      // If a new service worker is already waiting (found on this load), activate it now
      if(reg.waiting) reg.waiting.postMessage("SKIP_WAITING");

      // Watch for a new service worker being found (app updated on the server)
      reg.addEventListener("updatefound", ()=>{
        const newWorker = reg.installing;
        if(!newWorker) return;
        newWorker.addEventListener("statechange", ()=>{
          if(newWorker.state === "installed" && navigator.serviceWorker.controller){
            // New version installed and ready — activate it immediately, no driver action needed
            newWorker.postMessage("SKIP_WAITING");
          }
        });
      });

      // Periodically check for updates while the app is open (e.g. every 5 min)
      setInterval(()=> reg.update().catch(()=>{}), 5*60*1000);
      // Also check immediately whenever the app is brought to the foreground
      document.addEventListener("visibilitychange", ()=>{
        if(document.visibilityState === "visible") reg.update().catch(()=>{});
      });
    }).catch(()=>{});

    // Once the new service worker takes control, reload so the fresh app.js/index.html run.
    // Deferred if the driver is actively on the entry form, so an unsaved entry isn't wiped —
    // it reloads as soon as they switch tabs or the app is backgrounded instead.
    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", ()=>{
      if(refreshing) return;
      refreshing = true;
      if(activeTab === "entry"){ pendingReload = true; refreshing = false; return; }
      window.location.reload();
    });
    document.addEventListener("visibilitychange", ()=>{
      if(document.visibilityState === "hidden") maybeReload();
    });
  }
});
