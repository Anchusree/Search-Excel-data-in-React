import React, { useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { DownloadExcelResults } from './Components/Common/DownloadExcelResults';
import { calculateResult, getConsumptionResult, getFormatDateString, getTotalQuantityByUnit, getUniqueProducts, getUniqueUnits, isExcelFile } from './Components/Common/Helper';
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
  const [calculateInput, setCalculateInput] = useState(0)
  const [selectOperation, setSelectOperation] = useState('')
  const [calculationResult, setCalculationResult] = useState(0)
  const [message, setMessage] = useState('')

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

    if (searchTerm.trim().length < 3) {
      await setMessage("Search should not be less than 3 characters")
      return
    }

    await setMessage('')
    await handleRemoveResults()
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

  const handleRemoveResults = () => {
    setSearchResults([])
    setUnitSelectedResults([])
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
    setCalculationResult(0)
    setSelectOperation('')
    setCalculateInput(0)
  }

  const handleRemoveFile2 = () => {
    setFile2Name(null)
    fileRef2.current.value = ""
    setData2([])
    setSearchResults([])
    setUnitSelectedResults([])
    setFirst10Lines_F2([])
    setSearchTerm('')
    handleRemoveResults()
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
    await setCalculationResult(0)
    await setSelectOperation('')
    await setCalculateInput(0)
    await setInputValues({})
    await setTotalUnitInKg(0)

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

  const handleUnitCalculate = async () => {

    const result = {};
    for (const key in unitPerKgList) {
      if (unitPerKgList.hasOwnProperty(key) && inputValues.hasOwnProperty(key)) {
        // Multiply the values from both objects with the matching key
        result[key] = unitPerKgList[key] * parseFloat(inputValues[key]);
      }
    }
    let sum = 0;
    for (const key in result) {
      if (result.hasOwnProperty(key)) {
        sum += result[key];
      }
    }
    await setTotalUnitInKg(sum.toFixed(3))
  }

  const handleInputChange = (event, key, val) => {
    const updatedInputValues = { ...inputValues };
    if (key === "KG") {
      updatedInputValues["KG"] = "1"
    }
    else {
      if (updatedInputValues[key] !== "" && event.target.value === '' || /^\d+(\.\d*)?$/.test(event.target.value)) {
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
            await setTotalResults(searchResults.length)
            await getConsumption(searchResults)
            const quantityUnit = getTotalQuantityByUnit(searchResults)
            await setQtyBasedUnits(quantityUnit)
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
        await setCalculationResult(0)
        await setSelectOperation('')
        await setCalculateInput(0)
        await setInputValues({})
        await setTotalUnitInKg(0)

      }
    }
    else {
      await setShowItemSearch(false)
      await setItemSelectedResults([])
      await setCalculationResult(0)
      await setSelectOperation('')
      await setCalculateInput(0)
      await setInputValues({})
      await setTotalUnitInKg(0)
      if (selectedUnit === "All") {
        await setTotalResults(searchResults.length)
        await getConsumption(searchResults)
        const quantityUnit = getTotalQuantityByUnit(searchResults)
        await setQtyBasedUnits(quantityUnit)
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

  const handleTotalCalculation = () => {
    if (selectOperation != '' && calculateInput > 0 && totalUnitInKg > 0) {
      const numValue = parseFloat(calculateInput);
      const total = parseFloat(totalUnitInKg)
      const totalResult = calculateResult(total, selectOperation, numValue)
      setCalculationResult(totalResult)
    }
  }

  function renderTable(headers, data) {
    return (
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            {headers.map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((cell, index) => (
                <td key={index}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
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
        <div className="mb-3">
          <button type='button' onClick={submitFile} disabled={file2Name == null ? true : false} className='btn btn-info text-white' >Submit</button>
        </div>
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
            {message && <p style={{ margin: '8px', color: 'red' }}>{message}</p>}
            <br />
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
                {totalUnitInKg > 0
                  ?
                  <div>
                    <span className='totalconsumption'>Total Sales By Unit( in Kg) : <span style={{ color: '#146c43' }}>{totalUnitInKg}</span></span>
                    <br />
                    <p className='calculate'>Calculate in Box:</p>
                    <span className='totalcalculate'>{totalUnitInKg} &nbsp;
                      <select style={{ textAlign: 'center', fontSize: '18px' }} value={selectOperation} onChange={(e) => setSelectOperation(e.target.value)} >
                        <option value="">Choose</option>
                        <option value="+">+</option>
                        <option value="-">-</option>
                        <option value="*">*</option>
                        <option value="/">/</option>
                      </select>&nbsp;
                      <input type='number' placeholder='Enter input value' min="0" value={calculateInput} onChange={(e) => setCalculateInput(e.target.value)} />
                      <input type='submit' value="Submit" className='calculatesubmit' onClick={handleTotalCalculation} />
                    </span>
                    <br />
                    {
                      calculationResult > 0
                        ?
                        <span className='totalconsumption'>Total : <span style={{ color: 'darkcyan' }}>{calculationResult}</span></span>
                        :
                        null
                    }
                  </div>
                  :
                  null
                }
              </div>
              :
              null
          }

          <hr />
          <div style={{ width: "1000px", height: "500px", overflow: 'auto', marginBottom: '13%' }} className="table-responsive">
            {
              showUnitSearch === true && showDateSearch === false && showItemSearch === false && unitSelectedResults && unitSelectedResults.length > 0
                ?
                renderTable(Object.keys(unitSelectedResults[0]), unitSelectedResults)
                :
                showDateSearch === true
                  ?
                  dateSortResults && dateSortResults.length > 0
                    ?
                    renderTable(Object.keys(dateSortResults[0]), dateSortResults)
                    :
                    <p className='noresult'>No Results Found!</p>
                  :

                  showItemSearch
                    ?
                    itemSelectedResults && itemSelectedResults.length > 0
                      ?
                      renderTable(Object.keys(itemSelectedResults[0]), itemSelectedResults)
                      :
                      <p className='noresult'>No Results Found!</p>
                    :
                    renderTable(Object.keys(searchResults[0]), searchResults)
                    
            }
          </div>
        </div>
      )
        :
        noresult
          ?
          <div style={{ marginBottom: '26%' }}>
            <h3>Search Results for "{searchTerm}"</h3>
            <br />
            <p className='noresult'>No Results Found!</p>
          </div>
          :
          data2 && data2.length > 0 && (
            <div style={{ width: "1000px", height: "300px", overflow: 'auto', marginBottom: '5%' }} className='table-responsive'>
              {renderTable(Object.keys(first10Lines_F2[0]), first10Lines_F2)}
            </div>
          )
      }
    </div>
  )
}

export default App
