const express = require("express");
const { open } = require("sqlite");

const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();

app.use(express.json());

let db = null;

const initilizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (Error) {
    console.log(`DB Error:${Error.message}`);
    process.exit(1);
  }
};

initilizeDBAndServer();

//GET METHOD ALL CRICKET TEAMS
app.get("/players/", async (request, response) => {
  const playerDetailsQuery = `
    SELECT 
    * 
    FROM 
        cricket_team;`;
  const playerArray = await db.all(playerDetailsQuery);
  response.send(playerArray);
});

//POST method create a new team deatils

app.post("/players/", async (request, response) => {
  const playerTeamDetails = request.body;
  const { playerName, jerseyNumber, role } = playerTeamDetails;
  const addPlayerTeamQuery = `
    INSERT INTO cricket_team (player_name,jersey_number,role)
    VALUES 
    (
      '${playerName}',
       ${jerseyNumber},
      '${role}'
    );`;
  const dbResponse = await db.run(addPlayerTeamQuery);
  const playerId = dbResponse.lastID;
  response.send({ playerId: playerId });
  console.log("Player Added to Team");
});

//get only one team player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerQuery = `
    SELECT 
    *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const player = await db.get(playerQuery);
  response.send(player);
});

//put method update the player details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerTeam = request.body;
  const { playerName, jerseyNumber, role } = playerTeam;
  const updateTeamQuery = `
    UPDATE cricket_team
    SET
      player_name = '${playerName}',
      jersey_number = ${jerseyNumber},
      role = '${role}'
    WHERE
       player_id = ${playerId};`;
  await db.run(updateTeamQuery);
  response.send("Player Details Updated");
});

//DELETE METHOD player details deleted from DB.
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE 
       FROM 
    cricket_team
    WHERE 
       player_id = ${playerId};`;
  await db.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
