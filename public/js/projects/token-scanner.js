let globalTransfers=[];

document.addEventListener('DOMContentLoaded',function(){
  const scanMode=document.getElementById("scan-mode");
  const address2Group=document.getElementById("address2-group");
  const scanButton=document.getElementById("scan-button");
  const searchInput=document.getElementById("search-transfers");

  if(scanMode){
    scanMode.addEventListener("change",function(){
      if(this.value==="between"){
        address2Group.classList.remove("d-none");
      }else{
        address2Group.classList.add("d-none");
      }
    });
  }

  if(scanButton){
    scanButton.addEventListener("click",async function(){
      const token=document.getElementById("token-select").value;
      const mode=document.getElementById("scan-mode").value;
      const address=document.getElementById("address").value;
      const address2=document.getElementById("address2").value;
      const minAmount=document.getElementById("min-amount").value;

      if(!address){
        alert("Please enter an address to scan");
        return;
      }
      if(mode==="between"&&!address2){
        alert('Please enter a second address for "between" mode');
        return;
      }
      scanButton.textContent="Scanning...";
      scanButton.disabled=true;
      try {
        const response = await fetch("/api/transfers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            token: token,
            mode: mode,
            fromAddress: address,
            toAddress: mode === "between" ? address2 : address
          })
        });
        if(!response.ok)throw new Error("API error: "+response.status);
        const data=await response.json();
        let transfers=data.transfers||[];
        if(minAmount&&minAmount!==""){
          const min=parseFloat(minAmount);
          transfers=transfers.filter(t=>parseFloat(t.amount)>=min);
        }
        globalTransfers=transfers;
        displayResults(transfers,mode);
      }catch(error){
        console.error("Error scanning transfers:",error);
        const noResults=document.getElementById("no-results");
        noResults.classList.remove("d-none");
        noResults.innerHTML=`<p>Error: ${error.message||"Failed to fetch transfers"}</p>`;
        document.getElementById("results-stats").classList.add("d-none");
        document.getElementById("results-table").classList.add("d-none");
      }finally{
        scanButton.textContent="Scan Transfers";
        scanButton.disabled=false;
      }
    });
  }

  if(searchInput){
    searchInput.addEventListener("input",function(){
      const term=searchInput.value.toLowerCase();
      const mode=document.getElementById("scan-mode").value||"both";
      const filtered=globalTransfers.filter(t=>{
        const from=t.fromAddress||"";
        const to=t.toAddress||"";
        const hash=t.transactionHash||"";
        return (
          from.toLowerCase().includes(term)||
          to.toLowerCase().includes(term)||
          hash.toLowerCase().includes(term)
        );
      });
      displayResults(filtered,mode);
    });
  }
});

function displayResults(transfers,mode){
  const resultsStats=document.getElementById("results-stats");
  const resultsTable=document.getElementById("results-table");
  const resultsBody=document.getElementById("results-body");
  const noResults=document.getElementById("no-results");
  const fromCount=document.getElementById("from-count");
  const toCount=document.getElementById("to-count");
  const uniqueCount=document.getElementById("unique-count");

  let fromTotal=0;
  let toTotal=0;
  if(mode==="from"){
    fromTotal=transfers.length;
  }else if(mode==="to"){
    toTotal=transfers.length;
  }else if(mode==="both"){
    fromTotal=Math.floor(transfers.length*0.6);
    toTotal=transfers.length-fromTotal;
  }else if(mode==="between"){
    fromTotal=Math.floor(transfers.length*0.5);
    toTotal=transfers.length-fromTotal;
  }

  fromCount.textContent=fromTotal;
  toCount.textContent=toTotal;
  uniqueCount.textContent=transfers.length;

  if(transfers.length>0){
    resultsStats.classList.remove("d-none");
    resultsTable.classList.remove("d-none");
    noResults.classList.add("d-none");
    resultsBody.innerHTML="";
    transfers.forEach(t=>{
      const row=document.createElement("tr");
      const blockNum=t.blockNum?t.blockNum.replace("0x",""):"N/A";
      const fromAddr=shorten(t.fromAddress||"N/A");
      const toAddr=shorten(t.toAddress||"N/A");
      const amountStr=parseFloat(t.amount||"0").toFixed(6);
      const tokenSym=t.token||"";
      const txHash=shorten(t.transactionHash||"N/A");
      row.innerHTML=`
        <td>${blockNum}</td>
        <td title="${t.fromAddress||""}" class="truncate">${fromAddr}</td>
        <td title="${t.toAddress||""}" class="truncate">${toAddr}</td>
        <td>${amountStr} ${tokenSym}</td>
        <td>${tokenSym}</td>
        <td title="${t.transactionHash||""}" class="truncate">${txHash}</td>
      `;
      resultsBody.appendChild(row);
    });
  }else{
    resultsStats.classList.add("d-none");
    resultsTable.classList.add("d-none");
    noResults.classList.remove("d-none");
    noResults.innerHTML='<p>No transfers found matching your criteria.</p>';
  }
}

function shorten(addr){
  if(!addr||addr==="N/A")return"N/A";
  return addr.substring(0,6)+"..."+addr.substring(addr.length-4);
}