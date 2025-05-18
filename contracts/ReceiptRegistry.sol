// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ReceiptRegistry {
    mapping(bytes32 => Receipt) public receipts;
    address public owner;

    struct Receipt {
        string receiptId;
        bytes32 receiptHash;
        string currency;
        uint256 registrationTime;
    }

    event ReceiptRegistered(bytes32 receiptHash, string receiptId, address registeredBy, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    function storeReceipt(
        bytes32 _receiptHash,
        string memory _receiptId,
        bytes32 _currency
    ) public {
        require(bytes(_receiptId).length > 0, "Receipt ID cannot be empty.");
        require(_receiptHash != bytes32(0), "Receipt hash cannot be zero.");
        require(receipts[_receiptHash].registrationTime == 0, "Receipt already registered.");

        receipts[_receiptHash] = Receipt({
            receiptId: _receiptId,
            receiptHash: _receiptHash,
            currency: bytes32ToString(_currency),
            registrationTime: block.timestamp
        });

        emit ReceiptRegistered(_receiptHash, _receiptId, msg.sender, block.timestamp);
    }

    function getReceiptDetails(bytes32 _receiptHash)
        public
        view
        returns (string memory receiptId, bytes32 receiptHash, string memory currency, uint256 registrationTime)
    {
        require(receipts[_receiptHash].registrationTime > 0, "Receipt not found.");
        return (
            receipts[_receiptHash].receiptId,
            receipts[_receiptHash].receiptHash,
            receipts[_receiptHash].currency,
            receipts[_receiptHash].registrationTime
        );
    }

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
    bytes memory bytesString = new bytes(32);
    uint256 len = 0;
    for (uint256 i = 0; i < 32; i++) {
        bytes1 char = _bytes32[i]; // Access individual byte using index
        if (char != bytes1(0)) {
            bytesString[len] = char;
            len++;
        }
    }
    bytes memory resized = new bytes(len);
    for (uint256 i = 0; i < len; i++) {
        resized[i] = bytesString[i];
    }
    return string(resized);
}
}