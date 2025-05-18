// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReceiptRegistry {
    struct Receipt {
        uint timestamp;
        bytes32 receiptHash;
        uint amount;
        string currency;
        address uploader;
    }

    mapping(bytes32 => Receipt) public receipts;
    address public owner; // State variable to store the owner

   constructor(address _owner) {
        //require(_owner != address(0), "ReceiptRegistry: Owner address cannot be zero");
        //owner = _owner;
    }

    function storeReceipt(bytes32 _receiptHash, uint _amount, string memory _currency) public {
        require(receipts[_receiptHash].timestamp == 0, "Receipt already recorded");
        receipts[_receiptHash] = Receipt(block.timestamp, _receiptHash, _amount, _currency, msg.sender);
        // Optionally emit an event
    }

    function verifyReceipt(bytes32 _receiptHashToCheck) public view returns (bool) {
        return receipts[_receiptHashToCheck].receiptHash == _receiptHashToCheck;
    }

    function getReceiptDetails(bytes32 _receiptHash) public view returns (uint, bytes32, uint, string memory, address) {
        require(receipts[_receiptHash].timestamp != 0, "Receipt not found");
        return (receipts[_receiptHash].timestamp, receipts[_receiptHash].receiptHash, receipts[_receiptHash].amount, receipts[_receiptHash].currency, receipts[_receiptHash].uploader);
    }
}