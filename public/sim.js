// this file runs the simulation

// Main mecanics of the game:
// This is a simuation of a game where the players buy numbered slots where the lowest unique number wins a pot price.

// The game has the following rules:
// each slot is numbered from 1 and upwards (no upper limit)
// slot 1 cost 1, slot 2 cost 2, slot 3 cost 3, and so on
// slots are bought by players hidden from the other players
// each slot can be bought by any number of players
// each player can buy as many slots as they want
// there is no upper limit to the number of slots a player can buy
// there is no upper limit to the number of players
// there is no upper limit to the number of slots
// the game runs in rounds that are time based (1 day)
// players can buy slots at any time until the round ends
// when the round ends, the game checks for the lowest unique number
// if there is no unique number, the round ends and the game starts a new round
// if there is a unique number, the player that bought that slot wins the pot
// the fist epoch has a fixed pot price set initaly in the simulation (numPot starting value)
// after each epoch the pot price is increased by the earnings of the previous epoch (numPot + earnings of the previous epoch - fees)

export function runSimulation(numEpochs, initialPot, winnerPercentage, feePercentage, numPlayers) {
    let simulation = initSimulation(numEpochs, initialPot, winnerPercentage, feePercentage, numPlayers);
    let numPot = simulation.initialPot;
    let winnersPercentage = simulation.winnerPercentage;

    // Debugging
    console.log("Epochs: " + simulation.numEpochs);
    console.log("Starting Pot: " + simulation.initialPot);
    console.log("Winner gets: " + simulation.winnerPercentage + "%");
    console.log("Protocol fee: " +simulation.feePercentage + "%");
    console.log("Players: " + simulation.numPlayers);

    let resultsSummary = {
        simulationData: [],
        totalFees: 0,
        totalWinnings: 0,
    };

    for (let epoch = 0; epoch < simulation.numEpochs; epoch++) {
        //let numPlayers = Math.floor(Math.random() * 10) + 1;
        let players = simBuySlotsForAllPlayers(numPlayers, numPot);
        let stats = calculateWinnerAndStats(players);

        let totalCosts = players.reduce((acc, player) => acc + player.costs, 0);
        let fees = totalCosts * simulation.feePercentage / 100;
        let winnersEarnings = numPot * winnersPercentage / 100; // Calculate the winner's earnings

        // Calculate the pot size after this epoch's transactions
        let potSizeAfter = numPot - winnersEarnings + (totalCosts - fees);

        simulation.epochData.push({
            epoch: epoch + 1,
            players: players.map(player => ({
                ...player,
                earnings: player.id === (stats.winner ? stats.winner : -1) ? winnersEarnings : 0
            })),
            stats,
            fees,
            potSizeBefore: numPot,
            winnersEarnings,
            potSizeAfter,
        });

        // Update the pot for the next epoch to be the pot size after adjustments
        numPot = potSizeAfter;
    }

    // After completing all epochs, calculate the summary totals
    resultsSummary.totalFees = simulation.epochData.reduce((acc, epoch) => acc + epoch.fees, 0);
    resultsSummary.totalWinnings = simulation.epochData.reduce((acc, epoch) => acc + epoch.winnersEarnings, 0);
    resultsSummary.simulationData = simulation.epochData;

    // Return the detailed simulation data for rendering
    return resultsSummary;
}

function weightedRandomSelect(maxNumber) {
    let bias = 10; // Increase for more bias towards lower numbers
    let randomNumber = Math.pow(Math.random(), bias) * maxNumber;
    return Math.floor(randomNumber) + 1; // +1 to adjust for zero indexing
}

// simulation of players buying slots - totaly random for now
// todo: add a strategies for players to buy slots
function simBuySlotsForAllPlayers(numPlayers, currentPotSize) {
    let players = [];
    let budget = 0.1;
    for (let i = 0; i < numPlayers; i++) {
        let playerBudget = budget * currentPotSize;
        let slotsSet = new Set(); // Use a Set to ensure uniqueness
        let totalCost = 0;

        while (true) {
            let slotCost = weightedRandomSelect(currentPotSize/15, 10);
            if (totalCost + slotCost > playerBudget) {
                break;
            }
            slotsSet.add(slotCost);
            totalCost += slotCost;
        }

        // Convert the Set back to an array and sort it in ascending order
        let slots = Array.from(slotsSet).sort((a, b) => a - b);

        players.push({
            id: i + 1, // Assign an ID for easier reference
            slots,
            costs: totalCost,
        });
    }
    return players;
};


export function accumulatePlayerData(simulationData) {
    let playerData = {};

    simulationData.forEach((epoch, epochIndex) => {
        epoch.players.forEach(player => {
            if (!playerData[player.id]) {
                playerData[player.id] = {
                    costs: Array(simulationData.length).fill(null),
                    earnings: Array(simulationData.length).fill(null),
                };
            }
            playerData[player.id].costs[epochIndex] = player.costs;
            playerData[player.id].earnings[epochIndex] = player.earnings || 0;
        });
    });

    return playerData;
}

export function generatePlayerDatasets(playerData) {
    let datasets = [];
    Object.keys(playerData).forEach(playerId => {
        const player = playerData[playerId];
        const netEarnings = []; // Initialize an array to hold cumulative net earnings
        let cumulativeNet = 0; // Initialize a variable to keep track of cumulative net earnings
        for (let i = 0; i < player.earnings.length; i++) {
            cumulativeNet += (player.earnings[i] || 0) - (player.costs[i] || 0);
            netEarnings.push(cumulativeNet);
        }
        datasets.push({
            label: `Player ${playerId} Net Earnings`,
            data: netEarnings,
            borderColor: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
            fill: false,
        });
    });
    return datasets;
}


function calculateWinnerAndStats(players) {
    const allSlots = players.flatMap(player => player.slots);
    const counts = allSlots.reduce((acc, slot) => {
        acc[slot] = (acc[slot] || 0) + 1;
        return acc;
    }, {});

    const uniqueNumbers = Object.keys(counts).filter(key => counts[key] === 1).map(Number);
    const lowestUniqueNumber = uniqueNumbers.length > 0 ? Math.min(...uniqueNumbers) : null;
    const winner = lowestUniqueNumber ? players.find(player => player.slots.includes(lowestUniqueNumber)).id : null;

    return {
        lowestUniqueNumber,
        winner,
    };
}

function initSimulation(numEpochs, initialPot, winnerPercentage, feePercentage, numPlayers) {
    return {
        numEpochs,
        initialPot,
        winnerPercentage,
        feePercentage,
        numPlayers,
        epochData: [],
    };
}

