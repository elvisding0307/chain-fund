// SPDX-License-Identifier: GPL3.0
pragma solidity ^0.8.20;

contract Crowdfunding {

    string name;
    string description;
    uint256 targetAmount;
    uint256 public currentAmount;
    uint256 endTimestamp;
    uint256 maxParticipants;
    uint256 participantsCount;

    address owner;
    address[] participants;
    mapping (address => uint256) fundAmount;
    
    uint256 constant ETH_TO_WEI = 10 ** 18;

    modifier onlyOwner(){
        require(owner == msg.sender, "Only owner is permitted!");
        _;
    }

    event Funded(address indexed funder, uint256 amount);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor(
        string memory _name,
        string memory _description,
        uint256 _targetAmount,
        uint256 _durationDays,
        uint256 _maxParticipants
    ) {
        name = _name;
        description = _description;
        targetAmount = _targetAmount * ETH_TO_WEI;
        endTimestamp = block.timestamp + _durationDays * 1 days;
        maxParticipants = _maxParticipants;
        owner = msg.sender;
    }

    function fund() payable public {
        uint256 remainAmount = targetAmount - currentAmount;
        uint256 amount = msg.value;
        require(amount <= remainAmount, "Can not fund more amount than the remain amount.");
        require(fundAmount[msg.sender] == 0, "You have already funded!");
        require(participantsCount < maxParticipants, "Participant count has reached max amount limit.");
        require(block.timestamp <= endTimestamp, "Fund has ended.");
        currentAmount += amount;
        participantsCount += 1;
        fundAmount[msg.sender] = amount;
        participants.push(msg.sender);
        emit Funded(msg.sender, amount);
    }

    function withdrawMoney() public onlyOwner{
        require(block.timestamp > endTimestamp, "Fund has not ended.");
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw.");
        payable(owner).transfer(balance);
        emit Withdrawn(owner, balance);
    }

    function getAllInformation() public view returns(
        string memory,
        string memory,
        uint256,
        uint256,
        uint256,
        uint256,
        uint256,
        address,
        bool
    ){
        return (
            name,
            description,
            targetAmount,
            currentAmount,
            endTimestamp,
            maxParticipants,
            participantsCount,
            owner,
            block.timestamp <= endTimestamp
        );
    }
    
    function getParticipants() public view returns (address[] memory) {
        return participants;
    }
    
    function getFundAmount(address participant) public view returns (uint256) {
        return fundAmount[participant];
    }
    
    function isActive() public view returns (bool) {
        return block.timestamp <= endTimestamp;
    }
}
