
export const DownloadExcelResults = (showUnitSearch,searchResults,unitSelectedResults,selectedUnit,getQtyResults,XLSX)=>{
    if (searchResults.length === 0) {
        return;
    }
    let keyValues
    let totalRow

    if(!showUnitSearch) {
        keyValues = searchResults && searchResults.map(({"Branch Name":BranchName, ItemCode,"Item Description": ItemDescription, DocCode, DocDate, Customer,Unit,Quantity,Rate,GrossAmount,Discount,NetAmount }) => ({
            BranchName,ItemCode,ItemDescription,DocCode,DocDate,Customer,Unit,Quantity,Rate,GrossAmount,Discount,NetAmount
        }));
        totalRow = {
            BranchName:'',ItemCode:'',ItemDescription:'',DocCode:'',DocDate:'',Customer:'',
            Unit:'',Quantity:getQtyResults,Rate:'',GrossAmount:'',Discount:'',NetAmount:''
        };
    }
    if(unitSelectedResults && unitSelectedResults.length > 0){
        keyValues = unitSelectedResults && unitSelectedResults.map(({"Branch Name":BranchName, ItemCode,"Item Description": ItemDescription, DocCode, DocDate, Customer,Unit,Quantity,Rate,GrossAmount,Discount,NetAmount }) => ({
            BranchName,ItemCode,ItemDescription,DocCode,DocDate,Customer,Unit,Quantity,Rate,GrossAmount,Discount,NetAmount
        }));
        totalRow = {
            BranchName:'',ItemCode:'',ItemDescription:'',DocCode:'',DocDate:'',Customer:'',
            Unit:'',Quantity:getQtyResults,Rate:'',GrossAmount:'',Discount:'',NetAmount:''
        };
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