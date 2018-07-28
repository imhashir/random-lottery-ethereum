const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');

const provider = ganache.provider();
const web3 = new Web3(provider);

const { interface, bytecode } = require('../compile');

let fetchedAccounts;
let lottery;

beforeEach(async () => {
	// Fetching list of accounts
	fetchedAccounts = await web3.eth.getAccounts();

	// Deploying contract
	lottery = await new web3.eth.Contract(JSON.parse(interface))
		.deploy({data: bytecode, arguments: []})
		.send({from: fetchedAccounts[0], gas: '1000000'});
	lottery.setProvider(provider);
});

describe('Contract Test', () => {
	it('Deploy a Contract', () => {
		assert.ok(lottery.options.address);
	})

	it('Manager is Valid', async () => {
		const address = await lottery.methods.manager().call();
		assert.equal(address, fetchedAccounts[0]);
	})

	it('Taking part - 1', async () => {
		await lottery.methods.enter().send({
			from: fetchedAccounts[1], 
			value: web3.utils.toWei('0.1', 'ether')
		});

		const players = await lottery.methods.getParticipants().call({
			from: fetchedAccounts[0]
		})
		assert.equal(players[0], fetchedAccounts[1]);
	})

	it('Taking part and Choosing Winner by Manager', async () => {
		await lottery.methods.enter().send({
			from: fetchedAccounts[1], 
			value: web3.utils.toWei('0.1', 'ether')
		});

		await lottery.methods.enter().send({
			from: fetchedAccounts[2], 
			value: web3.utils.toWei('0.1', 'ether')
		});

		await lottery.methods.pickWinner().send({
			from: fetchedAccounts[0]
		});

		const participants = await lottery.methods.getParticipants().call({
			from: fetchedAccounts[0]
		});

		assert.equal(participants.length, 0);
	})

	it('Pick Winner by someone other than Manager', async () => {
		try {
			await lottery.methods.pickWinner().send({
				from: fetchedAccounts[1]
			});
			assert(false);
		} catch (err) {
			assert(err);
		}
	})

	it('Fails on less than required ETH', async () => {
		try{
			await lottery.methods.enter().send({
				from: fetchedAccounts[1], 
				value: web3.utils.toWei('0.00001', 'ether')
			});
			assert(false);
		} catch(err) {
			assert(err);
		}
	})
	
})