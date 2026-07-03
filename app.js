// ---------- date ----------
document.getElementById('todayDate').textContent = new Date().toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' });

// ---------- nav switching ----------
const buttons = document.querySelectorAll('nav.index button');
buttons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    buttons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tool').forEach(t=>t.classList.remove('active'));
    document.getElementById('tool-'+btn.dataset.tool).classList.add('active');
  });
});

const fmt = n => n.toLocaleString('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 });
const fmt2 = n => n.toLocaleString('en-US', { style:'currency', currency:'USD', maximumFractionDigits:2 });

function resultBlock(container, items){
  container.innerHTML = items.map(it => `
    <div class="result-item ${it.cls||''}">
      <div class="r-label">${it.label}</div>
      <div class="r-value">${it.value}</div>
    </div>
  `).join('');
}

// ---------- 01 mortgage ----------
function calcMortgage(){
  const price = parseFloat(document.getElementById('m-price').value)||0;
  const down = parseFloat(document.getElementById('m-down').value)||0;
  const rate = parseFloat(document.getElementById('m-rate').value)||0;
  const years = parseFloat(document.getElementById('m-term').value)||1;
  const principal = Math.max(price-down,0);
  const n = years*12;
  const i = (rate/100)/12;
  let payment;
  if(i===0){ payment = principal/n; } else {
    payment = principal * (i * Math.pow(1+i,n)) / (Math.pow(1+i,n)-1);
  }
  const totalPaid = payment*n;
  const totalInterest = totalPaid-principal;
  resultBlock(document.getElementById('m-result'), [
    {label:'Monthly Payment (P&I)', value: isFinite(payment)? fmt2(payment): '—', cls:'primary'},
    {label:'Loan Amount', value: fmt(principal)},
    {label:'Total Interest Paid', value: isFinite(totalInterest)? fmt(totalInterest): '—'},
    {label:'Total of All Payments', value: isFinite(totalPaid)? fmt(totalPaid): '—'},
  ]);
}
['m-price','m-down','m-rate','m-term'].forEach(id=>document.getElementById(id).addEventListener('input',calcMortgage));

// ---------- 02 retirement ----------
function calcRetirement(){
  const p = parseFloat(document.getElementById('r-principal').value)||0;
  const monthly = parseFloat(document.getElementById('r-monthly').value)||0;
  const rate = parseFloat(document.getElementById('r-return').value)||0;
  const years = parseFloat(document.getElementById('r-years').value)||0;
  const n = years*12;
  const i = (rate/100)/12;
  let futureValuePrincipal = p * Math.pow(1+i, n);
  let futureValueContrib = i===0 ? monthly*n : monthly * ((Math.pow(1+i,n)-1)/i);
  const total = futureValuePrincipal + futureValueContrib;
  const totalContributed = p + monthly*n;
  const growth = total - totalContributed;
  resultBlock(document.getElementById('r-result'), [
    {label:'Future Value', value: fmt(total), cls:'primary'},
    {label:'Total Contributed', value: fmt(totalContributed)},
    {label:'Growth Earned', value: fmt(growth)},
  ]);
}
['r-principal','r-monthly','r-return','r-years'].forEach(id=>document.getElementById(id).addEventListener('input',calcRetirement));

// ---------- 03 debt payoff ----------
function calcDebt(){
  const balanceStart = parseFloat(document.getElementById('d-balance').value)||0;
  const rate = parseFloat(document.getElementById('d-rate').value)||0;
  const payment = parseFloat(document.getElementById('d-payment').value)||0;
  const i = (rate/100)/12;
  let balance = balanceStart;
  let months = 0;
  let totalInterest = 0;
  const minInterest = balance*i;
  if(payment <= minInterest && i>0){
    resultBlock(document.getElementById('d-result'), [
      {label:'Status', value:'Payment too low', cls:'negative primary'},
      {label:'Monthly Interest Charge', value: fmt2(minInterest)},
      {label:'Note', value:'Increase payment'},
    ]);
    return;
  }
  while(balance>0 && months<1200){
    const interest = balance*i;
    totalInterest += interest;
    balance = balance + interest - payment;
    months++;
    if(balance<0) balance=0;
  }
  const yrs = Math.floor(months/12);
  const mos = months%12;
  resultBlock(document.getElementById('d-result'), [
    {label:'Time to Payoff', value: `${yrs}y ${mos}m`, cls:'primary'},
    {label:'Total Interest Paid', value: fmt(totalInterest)},
    {label:'Total Paid', value: fmt(balanceStart+totalInterest)},
  ]);
}
['d-balance','d-rate','d-payment'].forEach(id=>document.getElementById(id).addEventListener('input',calcDebt));

// ---------- 04 budget ----------
function calcBudget(){
  const income = parseFloat(document.getElementById('b-income').value)||0;
  resultBlock(document.getElementById('b-result'), [
    {label:'Needs (50%)', value: fmt(income*0.5), cls:'primary'},
    {label:'Wants (30%)', value: fmt(income*0.3)},
    {label:'Savings & Debt (20%)', value: fmt(income*0.2)},
  ]);
}
document.getElementById('b-income').addEventListener('input',calcBudget);

// ---------- 05 AI token cost ----------
function calcAI(){
  const inTok = parseFloat(document.getElementById('a-input').value)||0;
  const outTok = parseFloat(document.getElementById('a-output').value)||0;
  const inPrice = parseFloat(document.getElementById('a-inprice').value)||0;
  const outPrice = parseFloat(document.getElementById('a-outprice').value)||0;
  const calls = parseFloat(document.getElementById('a-calls').value)||0;
  const costPerCall = (inTok/1e6)*inPrice + (outTok/1e6)*outPrice;
  const monthlyCost = costPerCall*calls;
  resultBlock(document.getElementById('a-result'), [
    {label:'Cost per Call', value: fmt2(costPerCall), cls:'primary'},
    {label:'Monthly Cost', value: fmt2(monthlyCost)},
    {label:'Annual Cost', value: fmt2(monthlyCost*12)},
  ]);
}
['a-input','a-output','a-inprice','a-outprice','a-calls'].forEach(id=>document.getElementById(id).addEventListener('input',calcAI));

// ---------- init ----------
calcMortgage(); calcRetirement(); calcDebt(); calcBudget(); calcAI();