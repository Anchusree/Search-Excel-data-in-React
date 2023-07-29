import React, { useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { DownloadExcelResults } from './Components/Common/DownloadExcelResults';
import { getConsumptionResult, getFormatDateString, getTotalQuantityByUnit, getUniqueProducts, getUniqueUnits, isExcelFile } from './Components/Common/Helper';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MultiSelect } from "react-multi-select-component";

function App() {

  const [data2, setData2] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [getQtyResults, setQtyResults] = useState(0)
  const fileRef2 = useRef()
  const [fileData, setFileData] = useState(null)
  const [file2Name, setFile2Name] = useState(null);
  const [first10Lines_F2, setFirst10Lines_F2] = useState([]);//get 5 lines of data for display
  const [units, setUnits] = useState()
  const [selectedUnit, setSelectedUnit] = useState("All")
  const [unitSelectedResults, setUnitSelectedResults] = useState([])
  const [showUnitSearch, setShowUnitSearch] = useState(false)
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [dateSortResults, setDateSortResults] = useState([])
  const [showDateSearch, setShowDateSearch] = useState(false)
  const [totalresults, setTotalResults] = useState(0)
  const [showCalculate, setShowCalculate] = useState(true)
  const [qtyBasedUnits, setQtyBasedUnits] = useState([])
  const [inputValues, setInputValues] = useState({});
  const [unitPerKgList, setUnitPerKgList] = useState({})
  const [totalUnitInKg, setTotalUnitInKg] = useState(0)
  const [itemSelectedResults, setItemSelectedResults] = useState([])
  const [showItemSearch, setShowItemSearch] = useState(false)
  const [noresult, setNoResult] = useState(false)
  const [selected, setSelected] = useState([]);
  const [options, setOptions] = useState([])

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
    await setShowCalculate(true)
    await setSelected([])
    const results = []
    await data2.filter((dataitem) => {
      if (dataitem["Item Description"] &&
        (dataitem["Item Description"].toLowerCase().startsWith(searchTerm.toLowerCase()) ||
          dataitem["Item Description"].toLowerCase().includes(searchTerm.toLowerCase()))) {
        results.push(dataitem)
        setNoResult(false)
      }
      else {
        setNoResult(true)
      }
    })
    const uniqueUnitsArray = getUniqueUnits(results)
    const uniqueProductsArray = getUniqueProducts(results)

    await setOptions(uniqueProductsArray)
    await setUnits(uniqueUnitsArray)
    await setSearchResults(results)
    await setSelectedUnit("All")
    await getConsumption(results)
    await setTotalResults(results.length)

    if (selectedUnit === "All") {
      const quantityUnit = getTotalQuantityByUnit(results)
      setQtyBasedUnits(quantityUnit)
      await setTotalResults(results.length)
    }
  }
  const getConsumption = async (results) => {
    if (results.length > 0) {
      const qtyresult = getConsumptionResult(results)
      await setQtyResults(qtyresult.toFixed(2))
      await setTotalResults(results.length)
    }
    else {
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
    setDateRange([null, null])
    setQtyBasedUnits([])
    setInputValues({})
    setShowCalculate(false)
    setTotalUnitInKg(0)
    setUnitPerKgList({})
    setQtyResults(0)
    setShowItemSearch(false)
    setItemSelectedResults([])
    setOptions([])
    setNoResult(false)
  }

  const handleSelectedUnit = async () => {

    let uniqueItemsOptions = null

    await setShowDateSearch(false)
    await setShowItemSearch(false)
    await setDateSortResults([])
    await setDateRange([null, null])
    await setInputValues({})
    await setTotalUnitInKg(0)
    await setOptions([])
    await setSelected([])


    if (selectedUnit === "All") {
      setShowUnitSearch(false)
      getConsumption(searchResults)
      setShowCalculate(true)
      const quantityUnit = getTotalQuantityByUnit(searchResults)
      await setQtyBasedUnits(quantityUnit)
      uniqueItemsOptions = getUniqueProducts(searchResults)
      await setOptions(uniqueItemsOptions)
      await setTotalResults(searchResults.length)
    }
    else {
      setShowCalculate(false)
      setQtyBasedUnits([])
      const results = []
      await searchResults.filter((dataitem) => {
        if (dataitem["Unit"] === selectedUnit) {
          results.push(dataitem)
        }
      })
      uniqueItemsOptions = getUniqueProducts(results)
      await setUnitSelectedResults(results)
      await setShowUnitSearch(true)
      await getConsumption(results)
      await setTotalResults(results.length)
      await setOptions(uniqueItemsOptions)
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
    const results = []
    let uniqueItemOptions = null
    await setShowDateSearch(true)
    await setShowItemSearch(false)
    await setSelected([])

    if (selectedUnit === "All") {
      setShowUnitSearch(false)
      await searchResults.filter((dataitem) => {
        const itemDate = dataitem["DocDate"]
        const dateObject = getFormatDateString(itemDate)
        if (dateObject >= startDate && dateObject <= endDate) {
          results.push(dataitem)
        }
      })
      uniqueItemOptions = getUniqueProducts(results)
    }
    else {
      if (showUnitSearch) {
        if (unitSelectedResults.length > 0) {
          await unitSelectedResults.filter((dataitem) => {
            const itemDate = dataitem["DocDate"]
            const dateObject = getFormatDateString(itemDate)
            if (dateObject >= startDate && dateObject <= endDate) {
              results.push(dataitem)
            }
          })
          uniqueItemOptions = getUniqueProducts(results)
        }
      }
    }

    await getConsumption(results)
    await setDateSortResults(results)
    await setTotalResults(results.length)
    await setOptions(uniqueItemOptions)
    const quantityUnit = getTotalQuantityByUnit(results)
    await setQtyBasedUnits(quantityUnit)
  }

  const handleUnitCalculate = () => {
    const result = {};
    for (const key in unitPerKgList) {
      if (unitPerKgList.hasOwnProperty(key) && inputValues.hasOwnProperty(key)) {
        // Multiply the values from both objects with the matching key
        result[key] = unitPerKgList[key] * inputValues[key];
      }
    }
    let sum = 0;
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        sum += result[key];
      }
    }
    setTotalUnitInKg(sum.toFixed(2))
  }

  const handleInputChange = (event, key, val) => {
    const updatedInputValues = { ...inputValues };
    if (key === "KG") {
      updatedInputValues["KG"] = 1
    }
    else {
      if (updatedInputValues[key] !== "") {
        updatedInputValues[key] = event.target.value
      }
      else {
        updatedInputValues[key] = null
      }
    }
    setInputValues(updatedInputValues);
    const updatedValues = { ...unitPerKgList };
    updatedValues[key] = val
    setUnitPerKgList(updatedValues)
  }

  const areInputValuesValid = () => {
    if (Object.keys(inputValues).length === 0) return true
    for (const key in inputValues) {
      if (inputValues.hasOwnProperty(key)) {
        if (inputValues[key] === null || isNaN(inputValues[key])) {
          return true
        }
      }
    }
    return false;
  };



  const handleSortProduct = async () => {

    const selectedResults = []
    if (selected.length > 0) {
      await selected.map(select => selectedResults.push(select.value))

      if (selectedResults.length > 0) {
        await setShowItemSearch(true)
        const results = []
        if (selectedUnit === "All") {
          if (showDateSearch) {
            if (dateSortResults.length > 0) {
              await dateSortResults && dateSortResults.filter((dataitem) => {
                if (selectedResults.includes(dataitem["Item Description"])) {
                  results.push(dataitem)
                }
              })
              setShowDateSearch(false)
            }
          }
          else {
            await searchResults.filter((dataitem) => {
              if (selectedResults.includes(dataitem["Item Description"])) {
                results.push(dataitem)
              }
            })
          }
        }
        else {
          if (showDateSearch && dateSortResults.length > 0) {
            await dateSortResults && dateSortResults.filter((dataitem) => {
              if (selectedResults.includes(dataitem["Item Description"])) {
                results.push(dataitem)
              }
            })
            setShowDateSearch(false)
          }
          else {
            if (unitSelectedResults.length > 0) {
              await unitSelectedResults.filter((dataitem) => {
                if (selectedResults.includes(dataitem["Item Description"])) {
                  results.push(dataitem)
                }
              })
            }
          }
        }
        await setItemSelectedResults(results)
        await getConsumption(results)
        await setTotalResults(results.length)
        const quantityUnit = getTotalQuantityByUnit(results)
        await setQtyBasedUnits(quantityUnit)
      }
    }
    else {
      await setShowItemSearch(false)
      await setItemSelectedResults([])
      if (selectedUnit === "All") {
        await setTotalResults(searchResults.length)
        await getConsumption(searchResults)
      }
      else if (showUnitSearch) {
        await setTotalResults(unitSelectedResults.length)
        await getConsumption(unitSelectedResults)

      }
      else if (showDateSearch) {
        await setTotalResults(dateSortResults.length)
        await getConsumption(dateSortResults)
      }
    }
  }

  useEffect(() => {
    return () => { }
  }, [selectedUnit, units, searchTerm, qtyBasedUnits, totalresults])


  return (
    <div className='container-fluid'>
      <h1>Sales</h1>
      <br />
      <div style={{ display: "flex", justifyContent: "center", flexDirection: 'column' }}>
        <br />
        <div className="mb-3">
          <label htmlFor="formFile" className="form-label">Upload excel file</label>
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
      {searchResults && searchResults.length > 0 ? (
        <div className='container'>
          <h2>Search Results for "{searchTerm}"</h2>
          <br />
          <div className='head2'>
            <span className='totalresults'>Total Results : {totalresults}</span>&nbsp;&nbsp;
            <span className='totalconsumption'>Total Sales Consumption :  {`${getQtyResults} Sales`}</span>
            <button className='btn btn-danger' disabled={totalresults > 0 ? false : true}
              onClick={() => DownloadExcelResults(showUnitSearch, showDateSearch, showItemSearch, searchResults, unitSelectedResults, dateSortResults, itemSelectedResults, selectedUnit, getQtyResults, XLSX)}
            >Download Results</button>
          </div>
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
                    checked={selectedUnit === unit}
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
              className="dateinput"
            />
            {
              <button className='btn btn-secondary' disabled={startDate === null ? true : false}
                onClick={handleSelectedDate}>Sort by Date</button>
            }
          </div>
          <br />
          <div className='filteritem'>
            <h6>Filter Items: </h6>
            <pre>{JSON.stringify(selected.value)}</pre>
            <MultiSelect
              options={options}
              value={selected}
              onChange={setSelected}
              labelledBy="Select"
              className="multiselect"
            />
            <button className='btn btn-secondary'
              onClick={handleSortProduct}>Sort by Item</button>
          </div>

          {
            showCalculate && (Object.keys(qtyBasedUnits).length > 0) ?
              <div className="horizontal-list">
                <h6>Total Counts :</h6>
                <ul>
                  {
                    qtyBasedUnits && (Object.keys(qtyBasedUnits).length > 0) &&
                    Object.entries(qtyBasedUnits).map(([key, val], index) =>
                      <div key={key} style={{ display: 'flex', marginBottom: '5px', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontWeight: 600 }}>{key} : {val.toFixed(2)}</span> &nbsp;
                        <input
                          type="number"
                          placeholder='Enter input'
                          id={key}
                          value={inputValues[key] || ''}
                          onChange={(event) => handleInputChange(event, key, val)}
                          min="0"
                          className='dateinput'
                        />
                      </div>
                    )
                  }
                </ul>
                <button type='submit' className='btn btn-success calculatebtn' disabled={areInputValuesValid()}
                  onClick={() => handleUnitCalculate()}>Calculate</button>
                {totalUnitInKg > 0 ? <span className='totalconsumption'>Total Sales By Unit(Kg) : {totalUnitInKg}</span> : null}
              </div>
              :
              null
          }

          <hr />
          <div style={{ width: "1000px", height: "500px", overflow: 'scroll', marginBottom: '10%' }} className="table-responsive">
            {
              showUnitSearch === true && showDateSearch === false && showItemSearch === false && unitSelectedResults && unitSelectedResults.length > 0
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
                showDateSearch === true
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

                  showItemSearch
                    ?
                    itemSelectedResults && itemSelectedResults.length > 0
                      ?
                      <table className="table table-striped table-bordered">
                        <thead>
                          <tr>
                            {Object.keys(itemSelectedResults && itemSelectedResults[0]).map((header, index) => (
                              <th key={index}>{header}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {itemSelectedResults && itemSelectedResults.map((search, index) => (
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
      )
        :
        noresult
          ?
          <div style={{ marginBottom: '26%' }}>
            <h2>Search Results for "{searchTerm}"</h2>
            <br />
            <p className='noresult'>No Results Found!</p>
          </div>
          :
          null
      }
    </div>
  )
}

export default App
