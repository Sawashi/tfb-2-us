import {
	Typography,
	Button,
	Space,
	Modal,
	Spin,
	Result,
	Row,
	Col,
	Input,
	InputNumber,
} from "antd";
import React, { useState, useRef, use, useEffect } from "react";
import "./index.css";
import { finished } from "stream";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	BarElement,
	CategoryScale,
	LinearScale,
	Tooltip,
	Legend,
} from "chart.js";

// Register the necessary components for Chart.js
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Skill {
	name: string;
	times: number;
}

const SkillChart: React.FC<{ skills: Array<Skill> }> = ({ skills }) => {
	// Prepare data for the chart
	const labels = skills.map((skill) => skill.name); // Skill names
	const data = skills.map((skill) => skill.times); // Number of times a skill is used

	const chartData = {
		labels,
		datasets: [
			{
				label: "Skill Usage",
				data,
				backgroundColor: "rgba(75, 192, 192, 0.6)",
				borderColor: "rgba(75, 192, 192, 1)",
				borderWidth: 1,
			},
		],
	};

	const options = {
		responsive: true,
		scales: {
			y: {
				beginAtZero: true,
			},
		},
	};

	return <Bar data={chartData} options={options} />;
};
const { Title } = Typography;
interface Player {
	name: string;
	number: number;
	defense: number;
	skillname: string[];
}
interface MatchLog {
	matchNumber: number;
	logFromMatch: string[];
}
interface scoreAPlayer {
	name: string;
	score: number;
}
interface scoreAMatch {
	matchNumber: number;
	score: scoreAPlayer[];
}
interface Skill {
	name: string;
	times: number;
}
const HomeList: React.FC = () => {
	const [playerName, setPlayerName] = useState<string>("");
	const [playerNumber, setPlayerNumber] = useState<number>(0);
	const [playerList, setPlayerList] = useState<Array<Player>>([]);
	const [matchLogs, setMatchLogs] = useState<Array<MatchLog>>([]);
	const [matchNumber, setMatchNumber] = useState<number>(1);
	const [scoreBoard, setScoreBoard] = useState<Array<scoreAMatch>>([]);
	const [skillCount, setSkillCount] = useState<Array<Skill>>([]);
	const [ghostPlayer, setGhostPlayer] = useState<Player[]>([]);
	const [numberOfPlayerToGenerate, setNumberOfPlayerToGenerate] =
		useState<number>(0);
	const skillMap = new Map([
		["Neymar Rainbow Flick", 6],
		["El Tornado", 6],
		["Waka Waka", 5],
		["Sombrero Flick", 5],
		["Okocha Sombrero Flick", 4],
		["Bolasie Flick", 4],
		["Fake Pass", 3],
		["Ball Roll Chop", 3],
		["Ball Roll Cut", 3],
		["Ball Hop", 2],
		["Simple Rainbow", 2],
	]);
	//Store player score each match
	const playerTechniqueScoreMap = new Map();
	playerList.forEach((player) => {
		playerTechniqueScoreMap.set(player.name, 0);
	});
	//Store number of time a skill is used
	const skillCountMap = new Map([
		["Neymar Rainbow Flick", 0],
		["El Tornado", 0],
		["Waka Waka", 0],
		["Sombrero Flick", 0],
		["Okocha Sombrero Flick", 0],
		["Bolasie Flick", 0],
		["Fake Pass", 0],
		["Ball Roll Chop", 0],
		["Ball Roll Cut", 0],
		["Ball Hop", 0],
		["Simple Rainbow", 0],
	]);
	function getRandomKey() {
		const keys = Array.from(skillMap.keys());
		const randomIndex = Math.floor(Math.random() * keys.length);
		return keys[randomIndex];
	}
	const onPlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setPlayerName(e.target.value);
	};
	const onPlayerNumberChange = (value: number | null) => {
		if (value !== null) {
			setPlayerNumber(value);
		}
	};
	const isPlayerNumberExist = (number: number) => {
		return playerList.some((player) => player.number === number);
	};
	const addPlayer = () => {
		if (playerName === "") {
			alert("Player name cannot be empty");
			return;
		}
		if (isPlayerNumberExist(playerNumber)) {
			alert("Player number already exist");
			return;
		}
		const newPlayer: Player = {
			name: playerName,
			number: playerNumber,
			defense: 0,
			skillname: [],
		};
		const defense = Math.floor(Math.random() * 5) + 1;
		newPlayer.defense = defense;
		const keys = Array.from(skillMap.keys());
		for (let i = 0; i < 5; i++) {
			const randomIndex = Math.floor(Math.random() * keys.length);
			const key = keys[randomIndex];
			newPlayer.skillname.push(key);
			keys.splice(randomIndex, 1);
		}
		setPlayerList([...playerList, newPlayer]);
		setPlayerName("");
		setPlayerNumber(0);
		const nameInput = document.getElementById(
			"player_name_input"
		) as HTMLInputElement;
		nameInput.value = "";
		const numberInput = document.getElementById(
			"player_number_input"
		) as HTMLInputElement;
		numberInput.value = "";
	};
	const removePlayer = (index: number) => {
		const newPlayerList = playerList.filter((_, i) => i !== index);
		setPlayerList(newPlayerList);
	};
	const checkPassing = (techniqueScore: number, defenseScore: number) => {
		const defensiveRatio = defenseScore / (techniqueScore + defenseScore);
		return Math.random() < defensiveRatio ? 0 : 1;
	};
	const ifGhostPlayerIsExisted = (player: Player) => {
		//check if the player is already exist in the ghostPlayer
		return ghostPlayer.some((ghost) => ghost.number === player.number);
	};
	const playAMatch = () => {
		//create a new match log
		const newMatchLog: MatchLog = {
			matchNumber: matchNumber,
			logFromMatch: [],
		};
		setMatchNumber(matchNumber + 1);
		//play the match
		let players = [...playerList];
		const penaltyOrder: Player[] = [];
		//Random select a player that havent been a ghost before to take penalty first
		// const firstPenalty = Math.floor(Math.random() * players.length);
		let firstPenalty = Math.floor(Math.random() * players.length);
		while (ifGhostPlayerIsExisted(players[firstPenalty])) {
			console.log("Player is already a ghost player, select another player");
			firstPenalty = Math.floor(Math.random() * players.length);
		}
		newMatchLog.logFromMatch.push(
			`${players[firstPenalty].name} (${players[firstPenalty].number}) is the first ghost player, plus 10 to score!`
		);
		//add 10 to the player score
		playerTechniqueScoreMap.set(
			players[firstPenalty].name,
			(playerTechniqueScoreMap.get(players[firstPenalty].name) || 0) + 10
		);
		//add the player to ghost player
		ghostPlayer.push(players[firstPenalty]);
		let ghostPlayerDefense = players[firstPenalty].defense;
		//remove the player from the list
		players.splice(firstPenalty, 1);
		//Random select a player to start passing
		let currentPlayerIndex = Math.floor(Math.random() * players.length);
		while (players.length > 1) {
			const currentPlayer = players[currentPlayerIndex];
			//get another player different with currentPlayer to pass to
			let nextPlayerIndex = Math.floor(Math.random() * players.length);
			while (nextPlayerIndex === currentPlayerIndex) {
				nextPlayerIndex = Math.floor(Math.random() * players.length);
			}
			const nextPlayer = players[nextPlayerIndex];
			//get a random skill from currentPlayer
			const randomSkillIndex = Math.floor(
				Math.random() * currentPlayer.skillname.length
			);
			const randomSkill = currentPlayer.skillname[randomSkillIndex];
			const skillPoint = skillMap.get(randomSkill) || 0;
			//increase the skill count
			skillCountMap.set(randomSkill, (skillCountMap.get(randomSkill) || 0) + 1);
			console.log(skillCountMap);
			//pass the ball, if the ghost player defense is higher than the skill point, the ratio pass will fail
			const passResult = checkPassing(skillPoint, ghostPlayerDefense);
			if (passResult === 0) {
				//Failed to pass
				newMatchLog.logFromMatch.push(
					`=>${currentPlayer.name} (${currentPlayer.number}) tried to use ${randomSkill} pass to ${nextPlayer.name} (${nextPlayer.number}) but failed`
				);
				//add currentPlayer to penalty order
				penaltyOrder.push(currentPlayer);
				//remove currentPlayer from players
				players.splice(currentPlayerIndex, 1);
				//change the ghost player
				ghostPlayerDefense = currentPlayer.defense;
				newMatchLog.logFromMatch.push(
					`=>${currentPlayer.name} (${currentPlayer.number}) is the ghost player now!`
				);
				//change the current player
				//get the get the new index of next player due to the array is changed
				nextPlayerIndex = players.findIndex(
					(player) => player.number === nextPlayer.number
				);
				currentPlayerIndex = nextPlayerIndex;
			} else {
				newMatchLog.logFromMatch.push(
					`=>${currentPlayer.name} (${currentPlayer.number}) used ${randomSkill} to pass to ${nextPlayer.name} (${nextPlayer.number}) successfully | +${skillPoint} points`
				);
				//add the skill point to the player
				playerTechniqueScoreMap.set(
					currentPlayer.name,
					(playerTechniqueScoreMap.get(currentPlayer.name) || 0) + skillPoint
				);
				//change the current player
				currentPlayerIndex = nextPlayerIndex;
			}
		}
		//The last two players, put the current player to penalty order then put the last player to penalty order
		penaltyOrder.push(players[0]);
		//based on penalty order, add penalty score to the player by (10 - index - 1)
		penaltyOrder.forEach((player, index) => {
			console.log(player.name + ": " + (10 - index - 1));
			playerTechniqueScoreMap.set(
				player.name,
				(playerTechniqueScoreMap.get(player.name) || 0) + 10 - index - 1
			);
		});
		setMatchLogs([...matchLogs, newMatchLog]);
		const score: scoreAPlayer[] = [];
		playerTechniqueScoreMap.forEach((value, key) => {
			score.push({ name: key, score: value });
		});
		score.sort((a, b) => b.score - a.score);
		const newScore: scoreAMatch = {
			matchNumber: newMatchLog.matchNumber,
			score: score,
		};
		setScoreBoard([...scoreBoard, newScore]);
		//Update state of skill count based on the skill count map
		const newSkillCount: Skill[] = [];
		skillCountMap.forEach((value, key) => {
			newSkillCount.push({ name: key, times: value });
		});
		//sort the skill count
		newSkillCount.sort((a, b) => a.times - b.times);
		setSkillCount(newSkillCount);
	};
	const quickDemo = () => {
		console.log(`Add ${numberOfPlayerToGenerate} players`);

		const updatedPlayerList = [...playerList];

		for (let i = 0; i < numberOfPlayerToGenerate; i++) {
			const newPlayer: Player = {
				name: `Player ${i + 1}`,
				number: i + 1,
				defense: 0,
				skillname: [],
			};

			const defense = Math.floor(Math.random() * 5) + 1;
			newPlayer.defense = defense;

			// Select 5 random skills
			const keys = Array.from(skillMap.keys());
			for (let j = 0; j < 5; j++) {
				const randomIndex = Math.floor(Math.random() * keys.length);
				const key = keys[randomIndex];
				newPlayer.skillname.push(key);
				keys.splice(randomIndex, 1);
			}

			updatedPlayerList.push(newPlayer);
		}

		setPlayerList(updatedPlayerList);
	};

	const resetTheGame = () => {
		setPlayerList([]);
		setMatchLogs([]);
		setMatchNumber(1);
		setScoreBoard([]);
		setNumberOfPlayerToGenerate(0);
		playerTechniqueScoreMap.clear();
		skillCountMap.clear();
		setSkillCount([]);
	};
	const onGeneratePlayerNumberChange = (value: number | null) => {
		if (value !== null) {
			setNumberOfPlayerToGenerate(value);
		}
	};
	return (
		<>
			<Title level={2}>Simulator match</Title>
			<Row gutter={16}>
				<Col className="gutter-row" span={6}>
					<b>Create new player</b>
					<hr />
					<Input
						addonBefore="Player name"
						placeholder="Enter a value"
						id="player_name_input"
						onChange={onPlayerNameChange}
						value={playerName}
					/>
					<br />
					<br />
					<InputNumber
						min={0}
						addonBefore="Jersey number"
						placeholder="Enter a value"
						id="player_number_input"
						onChange={onPlayerNumberChange}
						value={playerNumber}
					/>
					<br />
					<br />
					<Button type="primary" onClick={addPlayer}>
						Add player
					</Button>
					<br />
					<br />
					<Button type="primary" onClick={playAMatch}>
						Play a match
					</Button>
					<hr />
					<b>Debug</b>
					<InputNumber
						min={0}
						addonBefore="Number to generate"
						placeholder="Enter a value"
						onChange={onGeneratePlayerNumberChange}
						value={numberOfPlayerToGenerate}
					/>
					<br />
					<br />
					<Button type="primary" onClick={quickDemo}>
						Quick demo
					</Button>
					<br />
					<br />
					<Button onClick={resetTheGame} danger>
						Reset the game
					</Button>

					<hr />
					{/* show skill + skill points */}
					<b>Skill points</b>
					<Space direction="vertical">
						{Array.from(skillMap.keys()).map((key, index) => (
							<p key={index}>
								{key} - {skillMap.get(key)}
							</p>
						))}
					</Space>
				</Col>
				<Col className="gutter-row" span={6}>
					<b>Player list</b>
					<hr />
					{playerList.map((player, index) => (
						<div key={index}>
							<p>
								{player.name} - {player.number}
							</p>
							<p>Defense: {player.defense}</p>
							<p>Skills: {player.skillname.join(", ")}</p>
							<Button onClick={() => removePlayer(index)}>Remove</Button>
							<hr />
						</div>
					))}
				</Col>
				<Col className="gutter-row" span={6}>
					<b>Match logs</b>
					<hr />
					<Space direction="vertical" id="match_log_container">
						{matchLogs.map((log, index) => (
							<div key={index}>
								<div>
									<b>Match {log.matchNumber}</b>
								</div>
								{log.logFromMatch.map((log, index) => (
									<p key={index}>{log}</p>
								))}
							</div>
						))}
					</Space>
				</Col>
				<Col className="gutter-row" span={6}>
					<b>Result</b>
					<hr />
					<b>Skill count</b>
					<Space direction="vertical">
						{skillCount.map((skill, index) => (
							<p key={index}>
								{skill.name} - {skill.times}
							</p>
						))}
					</Space>
					<hr />
					<b>Score board</b>
					<br />
					<Space direction="vertical">
						{scoreBoard.map((score, matchIndex) => (
							<div key={matchIndex}>
								<p>
									<b>Match {score.matchNumber}</b>
								</p>
								{score.score.map((player, playerIndex) => (
									<p
										key={playerIndex}
										style={{
											fontWeight: playerIndex < 3 ? "bold" : "normal",
											color:
												playerIndex < 3
													? playerIndex === 0
														? "gold"
														: playerIndex === 1
														? "silver"
														: "bronze"
													: "inherit",
										}}
									>
										{player.name} - {player.score}
									</p>
								))}
							</div>
						))}
					</Space>
				</Col>
			</Row>
			<SkillChart skills={skillCount} />
		</>
	);
};

export default HomeList;
