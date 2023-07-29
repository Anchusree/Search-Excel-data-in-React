

export const isExcelFile = (file) => {
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileName = file.name;
    const fileExtension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.includes(fileExtension);
}

export const formatDate = (dates)=>{
    const originalDate = new Date(dates);
    const day = originalDate.getDate();
    const month = originalDate.getMonth() + 1; // Months are zero-indexed, so add 1
    const year = originalDate.getFullYear();

    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate
}


export const totalResultsCount = (results)=>{
    return results.length
}

export const getFormatDateString = (itemDate)=>{
    const dateParts = itemDate.split("/");
    const formattedDateString = `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`;
    return new Date(formattedDateString)

}

export const getTotalQuantityByUnit = (results)=>
    results.reduce((accumulator, item) => {
        const { Unit, Quantity } = item;
        accumulator[Unit] = (accumulator[Unit] || 0) + Quantity;
        return accumulator;
      }, {});


export const getUniqueUnits = (results)=>{
    const uniqueUnitArray = new Set(results.map(item => item.Unit)); //get unique units
    const uniqueUnitsArray = Array.from(uniqueUnitArray);// Convert the Set back to an array
    return uniqueUnitsArray
}

export const getUniqueItems = (results)=>{
    const uniqueItemArray = new Set(results.map(item => item["Item Description"])); //get unique units
    const uniqueItemsArray = Array.from(uniqueItemArray);// Convert the Set back to an array
    return uniqueItemsArray
}

export const getConsumptionResult = (results)=>{
    const quantityResults = []
    results.map((dataitem) => quantityResults.push(dataitem.Quantity))
    let sum = quantityResults.reduce(function (a, b) {
    return a + b;
    })
    return sum
}

export const getUniqueProducts = (results)=>{
    const uniqueItemArray = new Set(results.map(item => item["Item Description"])); //get unique items
    const uniqueItemsArray = Array.from(uniqueItemArray);// Convert the Set back to an array
    const uniqueItemsWithChecked = uniqueItemsArray.map(item => ({ label:item,value:item }));
    return uniqueItemsWithChecked;
}