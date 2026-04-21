// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DeReFundEscrow is Ownable, Pausable, ReentrancyGuard {
    enum CampaignStatus {
        Active,
        Cancelled,
        Completed
    }

    struct Milestone {
        string title;
        uint256 amount;
        string proofURI;
        bool proofSubmitted;
        bool approved;
        bool released;
        uint256 releasedAt;
    }

    address payable public immutable ngoWallet;
    uint256 public immutable targetAmount;
    uint256 public totalDonated;
    uint256 public totalReleased;
    CampaignStatus public status;

    Milestone[] private _milestones;
    mapping(address => uint256) public donations;

    event DonationReceived(address indexed donor, uint256 amount, uint256 totalDonated);
    event MilestoneAdded(uint256 indexed milestoneId, string title, uint256 amount);
    event ProofSubmitted(uint256 indexed milestoneId, string proofURI);
    event MilestoneApproved(uint256 indexed milestoneId);
    event FundsReleased(uint256 indexed milestoneId, address indexed ngoWallet, uint256 amount);
    event CampaignCancelled(uint256 remainingBalance);
    event RefundClaimed(address indexed donor, uint256 amount);
    event CampaignCompleted();

    modifier onlyNGO() {
        require(msg.sender == ngoWallet, "Only NGO wallet");
        _;
    }

    modifier onlyActive() {
        require(status == CampaignStatus.Active, "Campaign not active");
        _;
    }

    constructor(address payable _ngoWallet, uint256 _targetAmount, address _admin) Ownable(_admin) {
        require(_ngoWallet != address(0), "Invalid NGO wallet");
        require(_targetAmount > 0, "Target must be greater than zero");
        require(_admin != address(0), "Invalid admin");

        ngoWallet = _ngoWallet;
        targetAmount = _targetAmount;
        status = CampaignStatus.Active;
    }

    receive() external payable {
        donate();
    }

    function donate() public payable whenNotPaused onlyActive {
        require(msg.value > 0, "Donation must be greater than zero");
        require(totalDonated < targetAmount, "Campaign already fully funded");
        require(totalDonated + msg.value <= targetAmount, "Donation exceeds remaining target");

        donations[msg.sender] += msg.value;
        totalDonated += msg.value;

        emit DonationReceived(msg.sender, msg.value, totalDonated);
    }

    function addMilestone(string calldata title, uint256 amount) external onlyOwner onlyActive {
        require(bytes(title).length > 0, "Title required");
        require(amount > 0, "Amount required");
        require(totalMilestoneAmount() + amount <= targetAmount, "Milestones exceed target");

        _milestones.push(
            Milestone({
                title: title,
                amount: amount,
                proofURI: "",
                proofSubmitted: false,
                approved: false,
                released: false,
                releasedAt: 0
            })
        );

        emit MilestoneAdded(_milestones.length - 1, title, amount);
    }

    function submitProof(uint256 milestoneId, string calldata proofURI) external onlyNGO onlyActive {
        require(milestoneId < _milestones.length, "Milestone not found");
        require(bytes(proofURI).length > 0, "Proof URI required");

        Milestone storage milestone = _milestones[milestoneId];
        require(!milestone.released, "Milestone already released");

        milestone.proofURI = proofURI;
        milestone.proofSubmitted = true;

        emit ProofSubmitted(milestoneId, proofURI);
    }

    function approveAndRelease(uint256 milestoneId) external onlyOwner nonReentrant onlyActive {
        require(milestoneId < _milestones.length, "Milestone not found");

        Milestone storage milestone = _milestones[milestoneId];
        require(milestone.proofSubmitted, "Proof not submitted");
        require(!milestone.released, "Milestone already released");
        require(address(this).balance >= milestone.amount, "Insufficient escrow balance");

        milestone.approved = true;
        milestone.released = true;
        milestone.releasedAt = block.timestamp;
        totalReleased += milestone.amount;

        (bool sent, ) = ngoWallet.call{value: milestone.amount}("");
        require(sent, "Release failed");

        emit MilestoneApproved(milestoneId);
        emit FundsReleased(milestoneId, ngoWallet, milestone.amount);

        if (allMilestonesReleased() && totalReleased >= targetAmount) {
            status = CampaignStatus.Completed;
            emit CampaignCompleted();
        }
    }

    function cancelCampaign() external onlyOwner onlyActive {
        require(totalReleased == 0, "Cannot cancel after releases");

        status = CampaignStatus.Cancelled;
        emit CampaignCancelled(address(this).balance);
    }

    function claimRefund() external nonReentrant {
        require(status == CampaignStatus.Cancelled, "Campaign not cancelled");

        uint256 amount = donations[msg.sender];
        require(amount > 0, "No refund available");

        donations[msg.sender] = 0;
        (bool sent, ) = payable(msg.sender).call{value: amount}("");
        require(sent, "Refund failed");

        emit RefundClaimed(msg.sender, amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function getMilestone(uint256 milestoneId) external view returns (Milestone memory) {
        require(milestoneId < _milestones.length, "Milestone not found");
        return _milestones[milestoneId];
    }

    function milestoneCount() external view returns (uint256) {
        return _milestones.length;
    }

    function totalMilestoneAmount() public view returns (uint256 total) {
        for (uint256 i = 0; i < _milestones.length; i++) {
            total += _milestones[i].amount;
        }
    }

    function allMilestonesReleased() public view returns (bool) {
        if (_milestones.length == 0) {
            return false;
        }

        for (uint256 i = 0; i < _milestones.length; i++) {
            if (!_milestones[i].released) {
                return false;
            }
        }

        return true;
    }
}
