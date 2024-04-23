const express = require('express')
const app = express()
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
app.use(express.json())
let db = null
const dbPath = path.join(__dirname, 'covid19India.db')

const initaliseDBabdServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('server is running on 3000')
    })
  } catch (e) {
    console.log(`this is the error ${e.message}`)
    process.exit(1)
  }
}
initaliseDBabdServer()

//Returns a list of all states in the state table

app.get('/states/', async (request, response) => {
  const getAllState = `SELECT * FROM state`
  const allstatesResult = await db.all(getAllState)
  response.send(allstatesResult)
})

//Returns a state based on the state ID
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const getStateOnId = `SELECT * FROM state WHERE state_id = ${stateId}`
  const specificState = await db.get(getStateOnId)
  response.send(specificState)
})

// Create a district in the district table, district_id is auto-incremented
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const CreateDistrictQuery = `INSERT INTO district (district_name,state_id,cases,cured,active,deaths)
  VALUES
  (
    '${districtName}',
    ${stateId},
    ${cases},
    ${cured},
    ${active},
    ${deaths}
  );`
  const dbResponse = await db.run(CreateDistrictQuery)
  response.send('District Successfully Added')
})

// Returns a district based on the district ID

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const getspecificDistrict = `SELECT * FROM district WHERE district_id = ${districtId}`
  const dbResponse = await db.get(getspecificDistrict)
  response.send(dbResponse)
})

// Deletes a district from the district table based on the district ID
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const deleteDistrict = `DELETE FROM district WHERE district_id = ${districtId}`
  await db.run(deleteDistrict)
  response.send('District Removed')
})

// Updates the details of a specific district based on the district ID

app.put('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const updateQuery = `UPDATE district SET 
   district_name = '${districtName}',
    state_id= ${stateId},
   cases=  ${cases},
   cured =  ${cured},
   active =  ${active},
   deaths =  ${deaths}
   WHERE district_id = ${districtId};`
  await db.run(updateQuery)
  response.send('District Details Updated')
})

// Returns the statistics of total cases, cured, active, deaths of a specific state based on state ID

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const getStatisticsOfCase = `
  SELECT sum(cases) as totalCases,sum(cured) as totalCured,sum(active) as totalActive ,sum(deaths) as totalDeaths FROM district WHERE state_id = ${stateId};`
  const stats = await db.get(getStatisticsOfCase)
  // response.send({totalCases: stats['sum(cases)']})
  response.send(stats)
})

// Returns an object containing the state name of a district based on the district ID
app.get('/districts/:districtId/details/', async (request, response) => {
  const {districtId} = request.params
  const getStateIdFromDistrictId = `SELECT state_id FROM district WHERE district_id = ${districtId}`
  const stateIdObject = await db.get(getStateIdFromDistrictId)
  const getStateName = `SELECT state_name as stateName FROM state WHERE state_id = ${stateIdObject.state_id} `
  const resultResponse = await db.get(getStateName)
  response.send(resultResponse)
})

module.exports = app
