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

// variables for the simulation

// number of players in each epoch
    let numPlayers;
// price pot
    let numPot;
// number of epochs to run the simulation
    let numEpochs;
// fees in percentage
    let numFees;
// array to store the data of each epoch
    let epochData = [];

// function to initialize the variables
init = () => {
    numPot = 1000;
    numEpochs = 10;
    numFees = 1;
}

// function to randomly generate the number of players
generateNumPlayers = () => {
    numPlayers = Math.floor(Math.random() * 10) + 1;
    console.log("Number of players in epoch: " + numPlayers);
}

// function to randomize what slots each player buys
simBuySlots = () => {
    // generate a random number of slots for each player
    let numberSlots;
    numberSlots = Math.floor(Math.random() * 100) + 1;
    // generate what slots each player buys
    let slots = [];
    for (let i = 0; i < numberSlots; i++) {
        rSlots = Math.floor(Math.random() * 100) + 1;
        slots.push(rSlots);
    }
    return slots;
}

// function to start the game

startGame = () => {
    init();
    generateNumPlayers();
    // for each player buy slots
    for (let i = 0; i < numPlayers; i++) {
        let slots = simBuySlots();

        // create an array of players and their slots
        epochData.push({player: i+1, slots: slots});
        
        console.log(epochData);
    }
}

// calculate the winner
calculateWinner = () => {
//Flatten all slots into a single array
const allSlots = epochData.flatMap(player => player.slots);

//Count occurrences of each number
const counts = allSlots.reduce((acc, slot) => {
    acc[slot] = (acc[slot] || 0) + 1;
    return acc;
}, {});

//Identify unique numbers
const uniqueNumbers = Object.keys(counts).filter(key => counts[key] === 1).map(Number);

// Find the smallest unique number
const lowestUniqueNumber = uniqueNumbers.length > 0 ? Math.min(...uniqueNumbers) : "no unique number found";

console.log("Lowest unique bid: " + lowestUniqueNumber);

// Calculate the winner
const winner = epochData.find(player => player.slots.includes(lowestUniqueNumber));

console.log("Winner: Player " + winner.player);

}



startGame();
calculateWinner();