

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

