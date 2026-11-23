"use client";

import { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth/Address";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type Task = { id: bigint; text: string; completed: boolean; createdAt: bigint };

export default function BlockTaskPage() {
  const [taskText, setTaskText] = useState("");
  const { address, isConnected } = useAccount();
  const { data: tasks, refetch } = useScaffoldReadContract({
    contractName: "TaskManager",
    functionName: "getMyTasks",
  });
  const { writeContractAsync: addTask, isMining: isAdding } = useScaffoldWriteContract("TaskManager");
  const { writeContractAsync: toggleTask, isMining: isToggling } = useScaffoldWriteContract("TaskManager");

  const taskList = useMemo(() => (tasks ?? []) as Task[], [tasks]);
  const completedCount = taskList.filter(task => task.completed).length;

  const submitTask = async () => {
    const value = taskText.trim();
    if (!value) return;
    await addTask({ functionName: "addTask", args: [value] });
    setTaskText("");
    await refetch();
  };

  const changeStatus = async (id: bigint) => {
    await toggleTask({ functionName: "toggleTask", args: [id] });
    await refetch();
  };

  return (
    <main className="min-h-screen bg-base-200 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">BLOCKCHAIN TODO</div>
          <h1 className="text-4xl font-bold">BlockTask</h1>
          <p className="mt-2 text-base-content/70">Ваш список задач хранится в блокчейне</p>
        </div>

        <section className="card bg-base-100 shadow-xl">
          <div className="card-body gap-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold">Мои задачи</h2>
                <p className="text-sm text-base-content/60">Всего: {taskList.length} · Выполнено: {completedCount}</p>
              </div>
              <div className="badge badge-outline">{isConnected ? "Кошелёк подключён" : "Кошелёк не подключён"}</div>
            </div>

            {isConnected ? <div className="text-sm text-base-content/60">Адрес: <Address address={address} /></div> :
              <div className="alert">Подключите MetaMask через кнопку Connect Wallet в верхней панели.</div>}

            <div className="join w-full">
              <input className="input input-bordered join-item w-full" placeholder="Например: подготовить отчёт" maxLength={200}
                value={taskText} onChange={event => setTaskText(event.target.value)} disabled={!isConnected || isAdding} />
              <button className="btn btn-primary join-item" onClick={submitTask} disabled={!isConnected || !taskText.trim() || isAdding}>
                {isAdding ? "Отправка..." : "Добавить"}
              </button>
            </div>

            <div className="space-y-3">
              {taskList.length === 0 ? <div className="rounded-xl border border-dashed p-8 text-center text-base-content/60">Пока задач нет. Добавьте первую задачу.</div> :
                taskList.map(task => <div key={task.id.toString()} className="flex items-center justify-between gap-3 rounded-xl border p-4">
                  <div className="min-w-0">
                    <p className={task.completed ? "break-words text-base-content/50 line-through" : "break-words font-medium"}>{task.text}</p>
                    <span className="text-xs text-base-content/50">Задача №{task.id.toString()}</span>
                  </div>
                  <button className={task.completed ? "btn btn-sm btn-ghost" : "btn btn-sm btn-success"}
                    disabled={isToggling} onClick={() => changeStatus(task.id)}>
                    {task.completed ? "Вернуть" : "Выполнено"}
                  </button>
                </div>)}
            </div>
            <p className="text-xs text-base-content/50">Добавление и изменение статуса требуют подтверждения транзакции в MetaMask.</p>
          </div>
        </section>
      </div>
    </main>
  );
}
