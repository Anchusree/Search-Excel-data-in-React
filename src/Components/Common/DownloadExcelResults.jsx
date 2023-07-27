
const keyRow =(results,getQtyResults)=>{

    const keyValue = results && results.map(({"Branch Name":BranchName, ItemCode,"Item Description": ItemDescription, DocCode, DocDate, Customer,Unit,Quantity,Rate,GrossAmount,Discount,NetAmount }) => ({
        BranchName,ItemCode,ItemDescription,DocCode,DocDate,Customer,Unit,Quantity,Rate,GrossAmount,Discount,NetAmount
    }));
    const lastRow = {
        BranchName:'',ItemCode:'',ItemDescription:'',DocCode:'',DocDate:'',Customer:'',
        Unit:'',Quantity:getQtyResults,Rate:'',GrossAmount:'',Discount:'',NetAmount:''
    }
    const newResult = [...keyValue, lastRow]
    return newResult
}


export const DownloadExcelResults = (showUnitSearch,showDateSearch,showItemSearch,searchResults,unitSelectedResults,dateSortResults,itemSelectedResults,selectedUnit,getQtyResults,XLSX)=>{
    if (searchResults.length === 0) {
        return;
    }
    let newResults

    if(showUnitSearch === false && selectedUnit === "All" && showItemSearch === false) {
        newResults = keyRow(searchResults,getQtyResults)
    }
    else if(selectedUnit === "All" && showItemSearch === true){
        newResults = keyRow(itemSelectedResults)
    }
    else if(showUnitSearch === true && unitSelectedResults && unitSelectedResults.length > 0 && showDateSearch === false && showItemSearch === false){
        newResults = keyRow(unitSelectedResults,getQtyResults)
    }
    else if(showDateSearch === true && dateSortResults && dateSortResults.length > 0 && showItemSearch === false){
        newResults = keyRow(dateSortResults,getQtyResults)
    }
    else if(showItemSearch === true && itemSelectedResults && itemSelectedResults.length > 0){
        newResults = keyRow(itemSelectedResults,getQtyResults)
    }

    const newData = [...keyValues, totalRow];
    const worksheet = XLSX.utils.json_to_sheet(newData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    // Download the file
    const downloadLink = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = downloadLink;
    link.download = selectedUnit ? 'salesdata.xlsx' : `${selectedUnit}-salesdata.xlsx`;
    link.click();

    // Cleanup
    setTimeout(() => {
        URL.revokeObjectURL(downloadLink);
    }, 100);
}