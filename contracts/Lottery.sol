pragma solidity ^0.4.24;

contract Lottery {
    address public manager;
    address[] public participants;
    
    constructor() public {
        manager = msg.sender;
    }
    
    function enter() public payable {
        require(msg.value > 0.01 ether);
        
        participants.push(msg.sender);
    }
    
    modifier restricted() {
        require(msg.sender == manager);
        _;
    }
    
    function random() private view restricted returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.difficulty, now, participants)));
    }
    
    function pickWinner() public restricted {
        uint256 index = random() % participants.length;
        participants[index].transfer(address(this).balance);
        participants = new address[](0);
    }
    
    function getParticipants() public view returns (address[]) {
        return participants;
    }
    
}