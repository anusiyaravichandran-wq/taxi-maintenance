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
const DEFAULT_PINS = { owner: "1234", driver: "0000" };

let currentRole = "owner";
let currentLang = localStorage.getItem("lang") || "en";
let currentUser = null; // 'owner' | 'driver'

/* ===================== TRANSLATIONS ===================== */
const T = {
  en: {
    appname:"Taxi Tracker", tagline:"Revenue & Payout Tracker", owner:"Owner", driver:"Driver", login:"Login",
    date:"Date", leave:"Mark today as Leave", kmsec:"Kilometers", startkm:"Start KM", endkm:"End KM",
    revsec:"Revenue", trip:"Trip Payment (Cash collected)", online:"Online / RedTaxi Credit Payment", discount:"Discount Given",
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
    srTripRev:"Trip + Online", srOnline:"Online/Credit (settled separately)", srFuelCash:"Fuel (Cash)", srParking:"Parking",
    srOtherExp:"Other Expenses", srTollCollected:"Toll Collected", srSalary:"Driver Salary (30%)",
  },
  ta: {
    appname:"டாக்ஸி கணக்கு", tagline:"வருமானம் & கொடுப்பனவு கணக்கு", owner:"உரிமையாளர்", driver:"டிரைவர்", login:"உள்நுழைய",
    date:"தேதி", leave:"இன்று லீவு", kmsec:"கிலோமீட்டர்", startkm:"தொடக்க KM", endkm:"முடிவு KM",
    revsec:"வருமானம்", trip:"டிரிப் பணம் (கேஷ்)", online:"ஆன்லைன் / RedTaxi கிரெடிட்", discount:"தள்ளுபடி",
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
    srTripRev:"டிரிப் + ஆன்லைன்", srOnline:"ஆன்லைன்/கிரெடிட் (தனியாக தீர்வு)", srFuelCash:"எரிபொருள் (கேஷ்)", srParking:"பார்க்கிங்",
    srOtherExp:"மற்ற செலவுகள்", srTollCollected:"வசூலித்த டோல்", srSalary:"டிரைவர் சம்பளம் (30%)",
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
  ["startKm","endKm","tripPayment","onlinePayment","discount","tollBill","fuelCash","fuelCard","parking","tollCollected"].forEach(id=>{
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
  ["startKm","endKm","tripPayment","onlinePayment","discount","tollBill","parking","tollCollected"].forEach(id=>{
    document.getElementById(id).value = data && data[id]!==undefined ? data[id] : "";
  });
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
  const trip = v("tripPayment"), online = v("onlinePayment"), discount = v("discount");
  const tollBill = v("tollBill");
  const fuelCash = v("fuelCash"), fuelCard = v("fuelCard");
  const parking = v("parking"), tollCollected = v("tollCollected");
  const otherExpenses = getOtherExpenses();
  const otherExpTotal = otherExpenses.reduce((s,e)=> s + (Number(e.amount)||0), 0);

  const totalRevenue = trip + online - discount;
  const salaryBase = Math.max(totalRevenue - tollBill, 0);
  const salary = salaryBase * DRIVER_SALARY_PCT;
  const deductions = online + fuelCash + parking + otherExpTotal;
  const ownerAmount = totalRevenue - deductions - salary + tollCollected;

  return {trip, online, discount, tollBill, fuelCash, fuelCard, parking, tollCollected,
    otherExpenses, otherExpTotal, totalRevenue, salaryBase, salary, deductions, ownerAmount};
}
function recalcEntry(){
  const c = calcEntryValues();
  document.getElementById("calcRevenue").textContent = fmt(c.totalRevenue);
  document.getElementById("calcSalary").textContent = fmt(c.salary);
  document.getElementById("calcTollCollected").textContent = "+" + fmt(c.tollCollected);
  document.getElementById("calcDeduct").textContent = "−" + fmt(c.deductions);
  document.getElementById("calcOwnerAmt").textContent = fmt(c.ownerAmount);
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
    startKm: Number(document.getElementById("startKm").value)||0,
    endKm: Number(document.getElementById("endKm").value)||0,
    tripPayment: c.trip, onlinePayment: c.online, discount: c.discount, tollBill: c.tollBill,
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
    <div class="row"><span class="lbl">${tr("tollbill")}</span><span class="val">${fmt(d.tollBill)}</span></div>
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
  const node = document.getElementById("shareReceipt");
  node.innerHTML = `
    <div class="sr-head">
      <div class="sr-app">🚖 ${tr("appname")}</div>
      <div class="sr-date">${date}</div>
    </div>
    <div class="sr-row"><span>${tr("srTripRev")}</span><span>${fmt((d.tripPayment||0)+(d.onlinePayment||0))}</span></div>
    <div class="sr-row"><span>${tr("srOnline")}</span><span>−${fmt(d.onlinePayment)}</span></div>
    <div class="sr-row"><span>${tr("srSalary")}</span><span>−${fmt(d.driverSalary)}</span></div>
    <div class="sr-row"><span>${tr("srFuelCash")}</span><span>−${fmt(fc.cash)}</span></div>
    <div class="sr-row"><span>${tr("srParking")}</span><span>−${fmt(d.parking)}</span></div>
    <div class="sr-row"><span>${tr("srOtherExp")}</span><span>−${fmt(expTotal)}</span></div>
    <div class="sr-row"><span>${tr("srTollCollected")}</span><span>+${fmt(d.tollCollected)}</span></div>
    <div class="sr-final"><span>${tr("owneramt")}</span><span>${fmt(d.ownerAmount)}</span></div>
    <div class="sr-status" style="${statusBg}">${statusText}</div>
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
  document.getElementById("m_notes").value = d.notes || "";
}
async function saveMaintenance(){
  const month = document.getElementById("maintMonth").value;
  const payload = {};
  ["emi","insurance","tyre","redtaxi","budget","actual","others"].forEach(k=>{
    payload[k] = Number(document.getElementById("m_"+k).value)||0;
  });
  payload.notes = document.getElementById("m_notes").value || "";
  payload.month = month;
  await maintDocRef(month).set(payload, {merge:true});
  showToast(tr("savedOk"));
  if(activeTab==="dash") loadDashboard();
}

/* ===================== DASHBOARD ===================== */
async function loadDashboard(){
  const today = todayStr();
  const month = today.slice(0,7);

  // Today
  const todayDoc = await entryDocRef(today).get();
  const td = todayDoc.exists ? todayDoc.data() : null;
  if(td && !td.leave){
    document.getElementById("d_todayRev").textContent = fmt(td.totalRevenue);
    document.getElementById("d_todayFuel").textContent = fmt(td.fuelAmount);
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

  // Month aggregation
  const snap = await db.collection("vehicles").doc(CAR_ID).collection("entries")
    .where("date",">=", month+"-01").where("date","<=", month+"-31").get();
  let mRev=0, mFuel=0, mSalary=0, mPaid=0, mPaidCash=0, mPaidUpi=0, mUnpaid=0, kmTotal=0;
  snap.forEach(doc=>{
    const d = doc.data();
    if(d.leave) return;
    mRev += d.totalRevenue||0;
    mFuel += d.fuelAmount||0;
    mSalary += d.driverSalary||0;
    kmTotal += Math.max((d.endKm||0)-(d.startKm||0), 0);
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
    navigator.serviceWorker.register("service-worker.js").catch(()=>{});
  }
});
