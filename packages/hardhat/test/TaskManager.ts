import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("TaskManager", function () {
  async function deployTaskManagerFixture() {
    const [owner, other] = await ethers.getSigners();
    const TaskManager = await ethers.getContractFactory("TaskManager");
    const taskManager = await TaskManager.deploy();
    return { taskManager, owner, other };
  }

  it("adds a task and changes the task count", async function () {
    const { taskManager } = await loadFixture(deployTaskManagerFixture);
    await taskManager.addTask("Finish the blockchain project");
    expect(await taskManager.getMyTaskCount()).to.equal(1);
    const tasks = await taskManager.getMyTasks();
    expect(tasks[0].text).to.equal("Finish the blockchain project");
    expect(tasks[0].completed).to.equal(false);
  });

  it("emits TaskCreated when a task is added", async function () {
    const { taskManager, owner } = await loadFixture(deployTaskManagerFixture);
    await expect(taskManager.addTask("Read lecture notes"))
      .to.emit(taskManager, "TaskCreated")
      .withArgs(owner.address, 0, "Read lecture notes");
  });

  it("rejects an empty task description", async function () {
    const { taskManager } = await loadFixture(deployTaskManagerFixture);
    await expect(taskManager.addTask(""))
      .to.be.revertedWith("Task text is empty");
  });

  it("allows the owner of a list to mark a task completed", async function () {
    const { taskManager } = await loadFixture(deployTaskManagerFixture);
    await taskManager.addTask("Submit report");
    await taskManager.toggleTask(0);
    const tasks = await taskManager.getMyTasks();
    expect(tasks[0].completed).to.equal(true);
  });

  it("does not expose another wallet's tasks", async function () {
    const { taskManager, other } = await loadFixture(deployTaskManagerFixture);
    await taskManager.addTask("Private task");
    expect(await taskManager.connect(other).getMyTaskCount()).to.equal(0);
  });
});
