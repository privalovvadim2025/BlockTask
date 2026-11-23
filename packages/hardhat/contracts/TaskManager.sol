// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title TaskManager
/// @notice Personal task lists stored on-chain. Each wallet sees only its own tasks.
contract TaskManager {
    struct Task {
        uint256 id;
        string text;
        bool completed;
        uint256 createdAt;
    }

    mapping(address => Task[]) private tasksByOwner;
    mapping(address => uint256) private nextTaskId;

    event TaskCreated(address indexed owner, uint256 indexed taskId, string text);
    event TaskStatusChanged(address indexed owner, uint256 indexed taskId, bool completed);

    /// @notice Add a task to the caller's list.
    function addTask(string calldata text) external {
        require(bytes(text).length > 0, "Task text is empty");
        require(bytes(text).length <= 200, "Task text is too long");

        uint256 taskId = nextTaskId[msg.sender];
        tasksByOwner[msg.sender].push(Task({
            id: taskId,
            text: text,
            completed: false,
            createdAt: block.timestamp
        }));
        nextTaskId[msg.sender] = taskId + 1;

        emit TaskCreated(msg.sender, taskId, text);
    }

    /// @notice Change completion status of a task belonging to the caller.
    function toggleTask(uint256 taskId) external {
        Task[] storage userTasks = tasksByOwner[msg.sender];
        require(taskId < userTasks.length, "Task does not exist");

        userTasks[taskId].completed = !userTasks[taskId].completed;
        emit TaskStatusChanged(msg.sender, taskId, userTasks[taskId].completed);
    }

    /// @notice Return all tasks belonging to the caller.
    function getMyTasks() external view returns (Task[] memory) {
        return tasksByOwner[msg.sender];
    }

    /// @notice Return number of tasks belonging to the caller.
    function getMyTaskCount() external view returns (uint256) {
        return tasksByOwner[msg.sender].length;
    }
}
