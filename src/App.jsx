import React, { useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { DownloadExcelResults } from './Components/Common/DownloadExcelResults';
import { formatDate, isExcelFile } from './Components/Common/Helper';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function App() {

  const [data2, setData2] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [getQtyResults, setQtyResults] = useState(0)
  const fileRef2 = useRef()
  const [fileData, setFileData] = useState(null)
  const [file2Name, setFile2Name] = useState(null);
  const [first10Lines_F2, setFirst10Lines_F2] = useState([]);//get 10 lines of data for display
  const [units, setUnits] = useState()
  const [selectedUnit, setSelectedUnit] = useState()
  const [unitSelectedResults, setUnitSelectedResults] = useState([])
  const [showUnitSearch, setShowUnitSearch] = useState(false)
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [dateSortResults, setDateSortResults] = useState([])
  const [showDateSearch, setShowDateSearch] = useState(false)
  const [totalresults,setTotalResults] = useState(0)


  const handleFileUpload2 = (e) => {
    const file = e.target.files[0];
    if (!file) return

    if (isExcelFile(file) && file.size != 0) {
      setFileData(file)
      setFile2Name(file.name)

    }
    else {
      alert("Upload valid excel file")
    }
  }

  const handleSearch = async () => {
    await setUnitSelectedResults()
    const results = []
    await data2.filter((dataitem) => {
      if (dataitem["Item Description"] &&
        (dataitem["Item Description"].toLowerCase().startsWith(searchTerm.toLowerCase()) ||
          dataitem["Item Description"].toLowerCase().includes(searchTerm.toLowerCase()))) {
        results.push(dataitem)
      }
    })
    //get unique units
    const uniqueUnitArray = new Set(results.map(item => item.Unit));
    // Convert the Set back to an array
    const uniqueUnitsArray = Array.from(uniqueUnitArray);
    await setUnits(uniqueUnitsArray)
    await setSearchResults(results)
    await setSelectedUnit("All")
    await getConsumption(results)
    await setTotalResults(results.length)
  }

  const getConsumption = async (results) => {
    if(results.length > 0){
      const quantityResults = []
      await results.map((dataitem) => quantityResults.push(dataitem.Quantity))
      let sum = quantityResults.reduce(function (a, b) {
        return a + b;
      })
      await setQtyResults(sum.toFixed(2))
    }
    else{
      await setQtyResults(0)
    }
   
  }

  const handleRemoveFile2 = () => {
    setFile2Name(null)
    fileRef2.current.value = ""
    setData2([])
    setSearchResults([])
    setUnitSelectedResults([])
    setFirst10Lines_F2([])
    setSearchTerm('')
    setShowUnitSearch(false)
    setUnits()
    setSelectedUnit()
    setFileData(null)
    setShowDateSearch(false)
    setDateSortResults([])
    setTotalResults(0)

  }

  const handleSelectedUnit = async () => {

    await setShowDateSearch(false)
    await setDateSortResults([])
    await setDateRange([null,null])

    if (selectedUnit === "All") {
      setShowUnitSearch(false)
      getConsumption(searchResults)
    }
    else {
      const results = []
      await searchResults.filter((dataitem) => {
        if (dataitem["Unit"] === selectedUnit) {
          results.push(dataitem)
        }
      })
      await setUnitSelectedResults(results)
      await setShowUnitSearch(true)
      await getConsumption(results)
      await setTotalResults(results.length)
    }
  }

  const submitFile = () => {
    if (isExcelFile(fileData)) {
      const reader = new FileReader();
      reader.readAsBinaryString(fileData);
      reader.onload = (e) => {
        const data1 = e.target.result;
        const workbook = XLSX.read(data1, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet, { defval: null });
        setData2(parsedData);
        setFirst10Lines_F2(parsedData.slice(0, 6));
      }
    }
  }

  const handleSelectedDate = async () => {
    if (dateRange.length === 0 || dateRange.length === 1) return

    const datesdata = []
    await dateRange.map(dates => {
      const formattedDate = formatDate(dates)//format date to dd/mm/yyyy
      datesdata.push(formattedDate)
    })
    const results = []
    await setShowDateSearch(true)

    if (selectedUnit === "All") {
      setShowUnitSearch(false)
      await searchResults.filter((dataitem) => {
        const itemDate = dataitem["DocDate"]
        if (itemDate >= datesdata[0] && itemDate <= datesdata[1]) {
          results.push(dataitem)
        }
      })
    }
    else {
      if (showUnitSearch) {
        if(unitSelectedResults.length > 0){
          await unitSelectedResults.filter((dataitem) => {
            const itemDate = dataitem["DocDate"]
            if (itemDate >= datesdata[0] && itemDate <= datesdata[1]) {
              results.push(dataitem)
            }
          })
        }
        
      }
    }
    await getConsumption(results)
    await setDateSortResults(results)
    await setTotalResults(results.length)
  }

  useEffect(() => {

  }, [selectedUnit, units, searchTerm])





  return (
    <div className='container-fluid'>
      <h1>Sales</h1>
      <br />
      <div style={{ display: "flex", justifyContent: "center", flexDirection: 'column' }}>
        <br />
        <div className="mb-3">
          <label htmlFor="formFile" className="form-label">Upload excel file (Sales Data)</label>
          <input className="form-control" type="file" id="formFile" accept=".xlsx,.xls"
            onChange={handleFileUpload2} multiple={false} ref={fileRef2} />
          {file2Name && (
            <>
              {file2Name}&nbsp;
              <button onClick={handleRemoveFile2} className='removefile'>X</button>
            </>
          )}
        </div>
        <div className="mb-3"><button type='button' onClick={submitFile} disabled={file2Name == null ? true : false} className='btn btn-info text-white' >Submit</button></div>
      </div>


      <div style={{ display: "flex" }}>

        {data2 && data2.length > 0 && (
          <div className='container'>
            <hr />
            <h2>Results</h2>
            <br />
            <div className='searchfield'>
              <input type="text" className="search-form-control" placeholder="Enter Item..."
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              <div className="input-group-append">
                <button className="input-group-text btn btn-primary" onClick={handleSearch} disabled={searchTerm == "" ? true : false}>Search</button>
              </div>
            </div>
            <br />
            <div style={{ width: "1000px", height: "300px", overflow: 'scroll', marginBottom: '5%' }} className='table-responsive'>
              <table className="table table-striped table-bordered">
                <thead>
                  <tr>
                    {Object.keys(first10Lines_F2[0]).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {first10Lines_F2.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, index) => (
                        <td key={index}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>


      {/* <br /><br /> */}
      {searchResults && searchResults.length > 0 && (
        <div className='container'>
          <h2>Search Results for "{searchTerm}"</h2>
          <br />
          <span className='totalresults'>Total Results : 
          {totalresults}</span>&nbsp;&nbsp;
          <span className='totalconsumption'>Total Sales Consumption :</span>
          <span className='countsales'>{`${getQtyResults} Sales`}</span>&nbsp;&nbsp;&nbsp;
          <button className='btn btn-danger' disabled={totalresults > 0 ? false : true }
          onClick={() => DownloadExcelResults(showUnitSearch,showDateSearch, searchResults, unitSelectedResults,dateSortResults, selectedUnit, getQtyResults, XLSX)}
          >Download Results</button>
          <br /><br />

          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>

            <div className="form-check">
              <input className="form-check-input" type="radio" name="unit" id="all"
                value="All" onChange={(e) => setSelectedUnit(e.target.value)} checked={selectedUnit === 'All'} />
              <label className="form-check-label" htmlFor="all">All</label>
            </div>
            {
              units && units.map((unit, index) =>
                <div className="form-check" key={index}>
                  <input className="form-check-input" type="radio" name={unit}
                    id={unit} checked={selectedUnit === unit}
                    onChange={(e) => setSelectedUnit(e.target.value)} value={unit} />
                  <label className="form-check-label" htmlFor={unit}>
                    {unit}
                  </label>
                </div>
              )
            }
            {
              units && (<button className='btn btn-secondary' onClick={handleSelectedUnit}>Sort by Unit</button>)
            }
            <DatePicker
              placeholderText='Sort by Date'
              dateFormat="dd/MM/yyyy"
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setDateRange(update);
              }}
              isClearable={true}
            />
            {
              <button className='btn btn-secondary' onClick={handleSelectedDate}>Sort by Date</button>
            }
          </div>
          <hr />
          <div style={{ width: "1000px", height: "500px", overflow: 'scroll', marginBottom: '10%' }} className="table-responsive">
            {
              showUnitSearch === true && showDateSearch === false && unitSelectedResults && unitSelectedResults.length > 0
                ?
                <table className="table table-striped table-bordered">
                  <thead>
                    <tr>
                      {Object.keys(unitSelectedResults[0]).map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {unitSelectedResults.map((search, index) => (
                      <tr key={index}>
                        {Object.values(search).map((cell, index) => (
                          <td key={index}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                :
                showDateSearch
                  ?
                    dateSortResults && dateSortResults.length > 0
                    ?
                    <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        {Object.keys(dateSortResults && dateSortResults[0]).map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dateSortResults && dateSortResults.map((search, index) => (
                        <tr key={index}>
                          {Object.values(search).map((cell, index) => (
                            <td key={index}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    :
                    <p className='noresult'>No Results Found!</p>
                
                  :
                  <table className="table table-striped table-bordered">
                    <thead>
                      <tr>
                        {Object.keys(searchResults[0]).map((header, index) => (
                          <th key={index}>{header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((search, index) => (
                        <tr key={index}>
                          {Object.values(search).map((cell, index) => (
                            <td key={index}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
            }

          </div>
        </div>
      )}

    </div>
  )
}

export default App
