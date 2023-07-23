

export const isExcelFile = (file) => {
    const allowedExtensions = ['.xlsx', '.xls'];
    const fileName = file.name;
    const fileExtension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
    return allowedExtensions.includes(fileExtension);
}
