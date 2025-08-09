// SPDX-License-Identifier: GPL3.0
pragma solidity ^0.8.20;

import "./Crowdfunding.sol";

contract CrowdfundingFactory {
    address[] public deployedProjects;
    mapping(address => address[]) public ownerProjects;
    mapping(address => bool) public isValidProject;

    event ProjectCreated(address projectAddress, address owner);

    function createProject(
        string memory name,
        string memory description,
        uint256 targetAmount,
        uint256 durationDays,
        uint256 maxParticipants
    ) external returns (address) {
        require(bytes(name).length > 0, "Project name cannot be empty");
        require(bytes(description).length > 0, "Project description cannot be empty");
        require(targetAmount > 0, "Target amount must be greater than 0");
        require(durationDays > 0, "Duration must be greater than 0");
        require(maxParticipants > 0, "Max participants must be greater than 0");
        
        Crowdfunding newProject = new Crowdfunding(name, description, targetAmount, durationDays, maxParticipants);
        address projectAddress = address(newProject);
        
        deployedProjects.push(projectAddress);
        ownerProjects[msg.sender].push(projectAddress);
        isValidProject[projectAddress] = true;
        
        emit ProjectCreated(projectAddress, msg.sender);
        return projectAddress;
    }

    function getAllProjects() external view returns (address[] memory) {
        return deployedProjects;
    }
    
    function getProjectsByOwner(address owner) external view returns (address[] memory) {
        return ownerProjects[owner];
    }
    
    function getProjectsCount() external view returns (uint256) {
        return deployedProjects.length;
    }
    
    function getProjectsPaginated(uint256 offset, uint256 limit) external view returns (address[] memory) {
        require(offset < deployedProjects.length, "Offset out of bounds");
        
        uint256 end = offset + limit;
        if (end > deployedProjects.length) {
            end = deployedProjects.length;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = deployedProjects[i];
        }
        
        return result;
    }
    
    function validateProject(address projectAddress) external view returns (bool) {
        return isValidProject[projectAddress];
    }
}