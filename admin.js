"use strict";
const API="https://cdauxkkksubujtzxouwo.supabase.co";
const KEY="sb_publishable_xggqWkbnIc7hNZF0G66eAw_DuKltCqY";
const APPROVERS=new Set(["dipizza00@gmail.com","ediwergraterol@gmail.com"]);
const STORE="dipizza_admin_session";
const $=id=>document.getElementById(id);
let session=null,enquiries=[],currentUser=null;
try{sessionStorage.removeItem(STORE);localStorage.removeItem(STORE)}catch{}
function saveSession(value){session=value}
function clearSession(){session=null;currentUser=null}
function show(view){$("accessView").hidden=view!=="access";$("recoveryView").hidden=view!=="recovery";$("pendingView").hidden=view!=="pending";$("adminView").hidden=view!=="admin"}
function setAuthTab(tab){$("loginForm").hidden=tab!=="login";$("registerForm").hidden=tab!=="register";$("forgotForm").hidden=tab!=="forgot";$("authTabs").hidden=tab==="forgot";$("loginMessage").textContent="";$("registerMessage").textContent="";$("forgotMessage").textContent=""}
function installPasswordToggles(){
  const openIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const closedIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 3 18 18M10.6 10.6a2 2 0 0 0 2.8 2.8"/><path d="M9.9 5.2A10.7 10.7 0 0 1 12 5c6.4 0 10 7 10 7a16.3 16.3 0 0 1-3.1 3.9M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1 0 2-.2 2.9-.5"/></svg>';
  document.querySelectorAll('input[type="password"]').forEach(input=>{
    const box=document.createElement("div");box.className="password-box";input.parentNode.insertBefore(box,input);box.append(input);
    const toggle=document.createElement("button");toggle.type="button";toggle.className="password-toggle";toggle.setAttribute("aria-label","Mostrar contraseña");toggle.setAttribute("aria-pressed","false");toggle.innerHTML=openIcon;
    toggle.addEventListener("click",()=>{const visible=input.type==="password";input.type=visible?"text":"password";toggle.setAttribute("aria-label",visible?"Ocultar contraseña":"Mostrar contraseña");toggle.setAttribute("aria-pressed",String(visible));toggle.innerHTML=visible?closedIcon:openIcon});
    box.append(toggle);
  });
}
installPasswordToggles();
function userHeaders(token,extra={}){return {apikey:KEY,Authorization:"Bearer "+token,...extra}}
async function rawJson(path,options={}){
  const headers={apikey:KEY,"Content-Type":"application/json",...(options.headers||{})};
  const response=await fetch(API+path,{...options,headers});
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(data.msg||data.message||data.error_description||data.error||"No se pudo completar la operación.");
  return data;
}
async function refreshSession(){
  if(!session?.refresh_token)throw new Error("Vuelve a iniciar sesión.");
  const data=await rawJson("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:JSON.stringify({refresh_token:session.refresh_token})});
  saveSession(data);return data;
}
async function api(path,options={}){
  if(!session?.access_token)throw new Error("Inicia sesión para continuar.");
  let response=await fetch(API+path,{...options,headers:userHeaders(session.access_token,{"Content-Type":"application/json",...(options.headers||{})})});
  if(response.status===401){await refreshSession();response=await fetch(API+path,{...options,headers:userHeaders(session.access_token,{"Content-Type":"application/json",...(options.headers||{})})})}
  const data=await response.json().catch(()=>null);
  if(!response.ok)throw new Error(data?.message||data?.error_description||"No se pudo completar la operación.");
  return data;
}
async function adminAction(action,extra={}){
  return api("/functions/v1/admin-access",{method:"POST",body:JSON.stringify({action,...extra})});
}
function errorText(err){
  if(String(err.message).includes("email_not_verified"))return "Confirma primero el correo enviado por Supabase y vuelve a iniciar sesión.";
  if(String(err.message).includes("Invalid login"))return "Correo o contraseña incorrectos. Si acabas de registrarte, confirma el correo y vuelve a entrar.";
  return err.message;
}
async function routeSession(){
  if(!session?.access_token){show("access");setAuthTab("login");return}
  try{
    const user=await api("/auth/v1/user");
    currentUser=user;session.user=user;saveSession(session);
    const access=await adminAction("request_access");
    if(access.state==="pending"){
      show("pending");
      $("pendingText").textContent=access.notificationSent===false
        ?"La solicitud quedó guardada, pero no se pudo confirmar el aviso por correo. Los propietarios pueden verla al entrar al panel."
        :"La solicitud está guardada. Se avisó a los propietarios; uno de ellos debe aprobarla.";
      return;
    }
    show("admin");
    $("signedIn").textContent="Sesión iniciada como "+user.email;
    $("approvals").hidden=!APPROVERS.has((user.email||"").toLowerCase());
    await Promise.all([loadEnquiries(),loadDates(),APPROVERS.has((user.email||"").toLowerCase())?loadApprovals():Promise.resolve()]);
  }catch(err){
    clearSession();show("access");setAuthTab("login");$("loginMessage").textContent=errorText(err);
  }
}
async function login(email,password){
  const data=await rawJson("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email,password})});
  if(!data.access_token)throw new Error("Confirma el correo de la cuenta antes de iniciar sesión.");
  saveSession(data);await routeSession();
}
$("showLogin").addEventListener("click",()=>setAuthTab("login"));
$("showRegister").addEventListener("click",()=>setAuthTab("register"));
$("showForgot").addEventListener("click",()=>{$("forgotEmail").value=$("loginEmail").value.trim();setAuthTab("forgot")});
$("backToLogin").addEventListener("click",()=>setAuthTab("login"));
$("resetBackToLogin").addEventListener("click",()=>{clearSession();show("access");setAuthTab("login")});
$("forgotForm").addEventListener("submit",async e=>{
  e.preventDefault();$("forgotMessage").className="error";$("forgotMessage").textContent="Enviando solicitud…";
  const email=$("forgotEmail").value.trim().toLowerCase();
  const redirectTo="https://dipizzacatering.com/admin.html";
  const query=new URLSearchParams({redirect_to:redirectTo});
  try{await rawJson("/auth/v1/recover?"+query.toString(),{method:"POST",body:JSON.stringify({email})});$("forgotMessage").className="success";$("forgotMessage").textContent="Si existe una cuenta con ese correo, recibirás un enlace para restablecer la contraseña."}
  catch(err){$("forgotMessage").className="error";$("forgotMessage").textContent=errorText(err)}
});
$("loginForm").addEventListener("submit",async e=>{
  e.preventDefault();$("loginMessage").textContent="Verificando…";
  try{await login($("loginEmail").value.trim(),$("loginPassword").value);$("loginPassword").value=""}
  catch(err){$("loginMessage").textContent=errorText(err)}
});
$("registerForm").addEventListener("submit",async e=>{
  e.preventDefault();$("registerMessage").textContent="";
  const email=$("registerEmail").value.trim().toLowerCase(),password=$("registerPassword").value;
  if(password!==$("registerPassword2").value){$("registerMessage").textContent="Las contraseñas no coinciden.";return}
  try{
    const data=await rawJson("/auth/v1/signup",{method:"POST",body:JSON.stringify({email,password})});
    $("registerPassword").value="";$("registerPassword2").value="";
    if(data.access_token){saveSession(data);await routeSession()}
    else{$("registerMessage").className="success";$("registerMessage").textContent="Cuenta creada. Confirma el correo de Supabase y después inicia sesión para solicitar acceso."}
  }catch(err){$("registerMessage").textContent=errorText(err)}
});
$("checkPending").addEventListener("click",routeSession);
async function logout(){
  try{if(session?.access_token)await api("/auth/v1/logout",{method:"POST"})}catch{}
  clearSession();show("access");setAuthTab("login");
}
$("logout").addEventListener("click",logout);$("pendingLogout").addEventListener("click",logout);
$("recoveryForm").addEventListener("submit",async e=>{
  e.preventDefault();$("recoveryMessage").className="error";$("recoveryMessage").textContent="";
  const password=$("recoveryPassword").value;
  if(password!==$("recoveryPassword2").value){$("recoveryMessage").textContent="Las contraseñas no coinciden.";return}
  try{await api("/auth/v1/user",{method:"PUT",body:JSON.stringify({password})});try{await api("/auth/v1/logout",{method:"POST"})}catch{}clearSession();$("recoveryForm").hidden=true;$("recoveryMessage").className="success";$("recoveryMessage").textContent="Contraseña actualizada. Ya puedes iniciar sesión con la nueva contraseña.";$("resetBackToLogin").hidden=false}
  catch(err){$("recoveryMessage").textContent=errorText(err)}
});
$("passwordForm").addEventListener("submit",async e=>{
  e.preventDefault();$("passwordMessage").textContent="";
  const password=$("newPassword").value;
  if(password!==$("newPassword2").value){$("passwordMessage").className="error";$("passwordMessage").textContent="Las contraseñas no coinciden.";return}
  try{await api("/auth/v1/user",{method:"PUT",body:JSON.stringify({password})});$("newPassword").value="";$("newPassword2").value="";$("passwordMessage").className="success";$("passwordMessage").textContent="Contraseña actualizada."}
  catch(err){$("passwordMessage").className="error";$("passwordMessage").textContent=errorText(err)}
});
function makePair(label,value){
  const dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=label;dd.textContent=value||"—";return [dt,dd];
}
function makeCard(row){
  const article=document.createElement("article");article.className="request";
  const head=document.createElement("div");head.className="request-head";
  const title=document.createElement("div"),h=document.createElement("h3"),time=document.createElement("time");
  h.textContent=row.name||"Sin nombre";time.textContent=new Date(row.created_at).toLocaleString("es-US",{dateStyle:"medium",timeStyle:"short"});title.append(h,time);head.append(title);article.append(head);
  const dl=document.createElement("dl");
  const values=[["Correo",row.email],["Teléfono",row.phone],["Empresa",row.company],["Evento",row.occasion],["Invitados",row.guests==null?"":String(row.guests)],["Lugar",row.venue],["Detalles",row.details]];
  for(const [label,value] of values){const pair=makePair(label,value);if(label==="Correo"&&value){const link=document.createElement("a");link.href="mailto:"+encodeURIComponent(value);link.textContent=value;pair[1].replaceChildren(link)}if(label==="Teléfono"&&value){const link=document.createElement("a");link.href="tel:"+value.replace(/[^+\d]/g,"");link.textContent=value;pair[1].replaceChildren(link)}dl.append(...pair)}
  article.append(dl);
  const form=document.createElement("div");form.className="request-controls";
  const dateWrap=document.createElement("div"),dateLabel=document.createElement("label"),eventDate=document.createElement("input");dateWrap.className="field";dateLabel.textContent="Fecha del evento";eventDate.type="date";eventDate.value=row.event_date||"";eventDate.required=row.status==="confirmed";dateWrap.append(dateLabel,eventDate);
  const statusWrap=document.createElement("div"),statusLabel=document.createElement("label"),status=document.createElement("select");statusWrap.className="field";statusLabel.textContent="Estado";status.append(new Option("Pendiente","new"),new Option("Presupuesto enviado","quoted"),new Option("Confirmado","confirmed"),new Option("Completado","done"),new Option("No concretado","lost"));status.value=row.status||"new";statusWrap.append(statusLabel,status);
  const quoteWrap=document.createElement("div"),quoteLabel=document.createElement("label"),quote=document.createElement("input");quoteWrap.className="field";quoteLabel.textContent="Total del presupuesto ($)";quote.type="number";quote.min="0";quote.step="0.01";quote.value=row.quote_total??"";quoteWrap.append(quoteLabel,quote);
  const notesWrap=document.createElement("div"),notesLabel=document.createElement("label"),notes=document.createElement("textarea");notesWrap.className="field";notesLabel.textContent="Notas internas";notes.value=row.notes||"";notesWrap.append(notesLabel,notes);
  const save=document.createElement("button");save.type="button";save.className="primary";save.textContent="Guardar cambios";
  const confirm=document.createElement("button");confirm.type="button";confirm.className="quiet";confirm.textContent=row.status==="confirmed"?"Reservación confirmada":"Confirmar reservación";confirm.disabled=row.status==="confirmed";
  const persist=async(forceConfirm=false,sourceButton=save)=>{
    const nextStatus=forceConfirm?"confirmed":status.value;
    if(nextStatus==="confirmed"&&!eventDate.value){eventDate.required=true;eventDate.reportValidity();return}
    eventDate.required=nextStatus==="confirmed";sourceButton.disabled=true;
    const update={status:nextStatus,event_date:eventDate.value||null,quote_total:quote.value===""?null:Number(quote.value),notes:notes.value};
    try{await api("/rest/v1/enquiries?id=eq."+encodeURIComponent(row.id),{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify(update)});Object.assign(row,update);status.value=row.status;save.textContent="Guardado";setTimeout(()=>save.textContent="Guardar cambios",1200);confirm.disabled=row.status==="confirmed";confirm.textContent=row.status==="confirmed"?"Reservación confirmada":"Confirmar reservación";renderUpcoming()}
    catch(err){alert(errorText(err))}finally{sourceButton.disabled=false}
  };
  save.addEventListener("click",()=>persist(false,save));confirm.addEventListener("click",()=>persist(true,confirm));
  const actionBox=document.createElement("div");actionBox.className="request-actions";actionBox.append(save,confirm);form.append(dateWrap,statusWrap,quoteWrap,notesWrap,actionBox);article.append(form);return article;
}
function renderEnquiries(){
  const status=$("statusFilter").value,q=$("search").value.trim().toLowerCase();
  const filtered=enquiries.filter(x=>(status==="all"||x.status===status)&&(!q||[x.id,x.name,x.email,x.company,x.phone,x.occasion,x.event_date,x.guests,x.venue,x.details,x.status,x.quote_total,x.notes].some(v=>String(v||"").toLowerCase().includes(q))));
  $("summary").textContent=filtered.length+" solicitud"+(filtered.length===1?"":"es")+" · "+enquiries.filter(x=>x.status==="new").length+" pendiente(s)";
  const list=$("requestList");list.replaceChildren();
  if(!filtered.length){const p=document.createElement("p");p.className="empty";p.textContent="No hay solicitudes con ese filtro.";list.append(p);return}
  filtered.forEach(x=>list.append(makeCard(x)));
}
async function loadEnquiries(){
  $("summary").textContent="Cargando consultas…";
  try{const all=[];let offset=0,batch;do{batch=await api("/rest/v1/enquiries?select=id,created_at,name,company,email,phone,occasion,event_date,guests,venue,details,status,notes,quote_total&order=created_at.desc&limit=500&offset="+offset);all.push(...batch);offset+=500}while(batch.length===500);enquiries=all;renderEnquiries();renderUpcoming()}
  catch(err){$("summary").textContent="No se pudieron cargar las consultas: "+errorText(err)}
}
function runConsultation(){
  const query=$("search").value.trim();
  if(query.toLowerCase()==="leave"){window.location.assign("/");return}
  renderEnquiries();
  $("requestList").scrollIntoView({behavior:"smooth",block:"start"});
}
function renderUpcoming(){
  const list=$("upcomingList");if(!list)return;list.replaceChildren();
  const today=new Date();today.setHours(0,0,0,0);
  const upcoming=enquiries.filter(row=>row.status==="confirmed"&&row.event_date).map(row=>{const date=new Date(row.event_date+"T00:00:00");return{row,date,days:Math.round((date-today)/86400000)}}).filter(item=>item.days>=0&&item.days<=30).sort((a,b)=>a.date-b.date);
  $("upcomingSummary").textContent=upcoming.length?upcoming.length+" reserva"+(upcoming.length===1?"":"s")+" confirmada"+(upcoming.length===1?"":"s")+" en los próximos 30 días":"Sin reservas confirmadas en los próximos 30 días.";
  if(!upcoming.length){const p=document.createElement("p");p.className="empty";p.textContent="Cuando confirmes una reserva con fecha, aparecerá aquí como recordatorio.";list.append(p);return}
  for(const item of upcoming){const card=document.createElement("article");card.className="request";const h=document.createElement("h3");h.textContent=item.row.name||"Evento";const when=document.createElement("p");when.className="summary";when.textContent=item.date.toLocaleDateString("es-US",{dateStyle:"full"})+" · "+(item.days===0?"Hoy":item.days===1?"Mañana":"En "+item.days+" días");const venue=document.createElement("p");venue.className="muted";venue.textContent=item.row.venue||"Lugar por confirmar";const open=document.createElement("button");open.type="button";open.className="quiet";open.textContent="Ver consulta";open.addEventListener("click",()=>{const term=item.row.id||item.row.email||item.row.name;$("statusFilter").value="all";$("search").value=term;runConsultation();});card.append(h,when,venue,open);list.append(card)}
}
function xmlEscape(value){return String(value??"").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&apos;")}
function exportEnquiries(){
  if(!enquiries.length){alert("No hay consultas cargadas para exportar.");return}
  const columns=[["ID",r=>r.id],["Fecha de ingreso",r=>r.created_at],["Cliente",r=>r.name],["Empresa",r=>r.company],["Correo",r=>r.email],["Teléfono",r=>r.phone],["Ocasión",r=>r.occasion],["Fecha del evento",r=>r.event_date],["Invitados",r=>r.guests],["Lugar",r=>r.venue],["Detalles",r=>r.details],["Estado",r=>r.status],["Total del presupuesto",r=>r.quote_total],["Notas internas",r=>r.notes]];
  const rowXml=cells=>"<Row>"+cells.map(value=>`<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`).join("")+"</Row>";
  const rows=[rowXml(columns.map(([label])=>label)),...enquiries.map(row=>rowXml(columns.map(([,get])=>get(row))))].join("");
  const xml=`<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Consultas"><Table>${rows}</Table></Worksheet></Workbook>`;
  const blob=new Blob(["\ufeff",xml],{type:"application/vnd.ms-excel;charset=utf-8"}),url=URL.createObjectURL(blob),link=document.createElement("a");
  link.href=url;link.download="dipizza-consultas-"+new Date().toISOString().slice(0,10)+".xls";document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function loadApprovals(){
  try{
    const data=await adminAction("list_requests"),pending=(data.requests||[]).filter(r=>r.status==="pending");
    $("approvalSummary").textContent=pending.length+" solicitud"+(pending.length===1?"":"es")+" pendiente(s)";
    const list=$("approvalList");list.replaceChildren();
    if(!pending.length){const p=document.createElement("p");p.className="empty";p.textContent="No hay solicitudes de acceso pendientes.";list.append(p);return}
    for(const item of pending){
      const card=document.createElement("article");card.className="request";
      const h=document.createElement("h3");h.textContent=item.email;
      const time=document.createElement("p");time.className="muted";time.textContent="Solicitada "+new Date(item.requested_at).toLocaleString("es-US",{dateStyle:"medium",timeStyle:"short"});
      const actions=document.createElement("div");actions.className="actions";
      for(const decision of ["approve","reject"]){const button=document.createElement("button");button.type="button";button.className=decision==="approve"?"primary":"danger";button.textContent=decision==="approve"?"Aprobar usuario":"Rechazar";
        button.addEventListener("click",async()=>{button.disabled=true;try{await adminAction("review_request",{requestId:item.id,decision});await loadApprovals()}catch(err){alert(errorText(err));button.disabled=false}});actions.append(button)}
      card.append(h,time,actions);list.append(card);
    }
  }catch(err){$("approvalSummary").textContent="No se pudo cargar la lista. Solo los correos propietarios pueden aprobar usuarios."}
}
function makeDateCard(row){
  const card=document.createElement("article");card.className="request";const text=document.createElement("span");text.textContent=new Date(row.day+"T12:00:00").toLocaleDateString("es-US",{dateStyle:"long"})+(row.reason?" · "+row.reason:"");
  const remove=document.createElement("button");remove.type="button";remove.className="danger";remove.textContent="Desbloquear";remove.addEventListener("click",async()=>{try{await api("/rest/v1/blocked_dates?day=eq."+encodeURIComponent(row.day),{method:"DELETE",headers:{Prefer:"return=minimal"}});await loadDates()}catch(err){alert(errorText(err))}});
  card.append(text,remove);$("dateList").append(card);
}
async function loadDates(){
  try{const rows=await api("/rest/v1/blocked_dates?select=day,reason&order=day.asc");const list=$("dateList");list.replaceChildren();if(!rows.length){const p=document.createElement("p");p.className="empty";p.textContent="No hay fechas bloqueadas.";list.append(p);return}rows.forEach(makeDateCard)}
  catch(err){$("dateMessage").className="error";$("dateMessage").textContent="No se pudieron cargar las fechas: "+errorText(err)}
}
$("dateForm").addEventListener("submit",async e=>{
  e.preventDefault();$("dateMessage").textContent="";
  try{await api("/rest/v1/blocked_dates?on_conflict=day",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({day:$("blockedDay").value,reason:$("blockedReason").value.trim()||null})});$("dateForm").reset();$("dateMessage").className="success";$("dateMessage").textContent="Fecha bloqueada.";await loadDates()}
  catch(err){$("dateMessage").className="error";$("dateMessage").textContent=errorText(err)}
});
$("refresh").addEventListener("click",loadEnquiries);$("search").addEventListener("input",renderEnquiries);$("search").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();runConsultation()}});$("searchButton").addEventListener("click",runConsultation);$("exportExcel").addEventListener("click",exportEnquiries);$("statusFilter").addEventListener("change",renderEnquiries);$("leaveAdmin").addEventListener("click",()=>window.location.assign("/"));
function initializeAuthPage(){
  const fromHash=new URLSearchParams(window.location.hash.replace(/^#/,""));
  const fromQuery=new URLSearchParams(window.location.search);
  for(const [key,value] of fromQuery)if(!fromHash.has(key))fromHash.set(key,value);
  if(fromHash.get("type")==="recovery"&&fromHash.get("access_token")){
    session={access_token:fromHash.get("access_token"),refresh_token:fromHash.get("refresh_token")||""};
    history.replaceState(null,document.title,window.location.pathname);
    show("recovery");return;
  }
  if(fromHash.has("error")||fromQuery.has("error")){history.replaceState(null,document.title,window.location.pathname);$("loginMessage").textContent="El enlace venció o ya fue usado. Solicita uno nuevo para continuar."}
  show("access");setAuthTab("login");
}
window.addEventListener("pagehide",()=>{
  const token=session?.access_token;
  if(token)fetch(API+"/auth/v1/logout",{method:"POST",headers:{apikey:KEY,Authorization:"Bearer "+token},keepalive:true}).catch(()=>{});
  clearSession();show("access");
});
initializeAuthPage();
