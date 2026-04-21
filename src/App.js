import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// UEL COURSEWORK DATA - SEPOLIA DEPLOYMENT
const contractAddress = "0x688e21d981D1a0B85288B0C93e5CCc010DA2482e";
const abi = [
  { "inputs": [{ "internalType": "string", "name": "_content", "type": "string" }], "name": "createTask", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "_id", "type": "uint256" }], "name": "toggleCompleted", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
  { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "tasks", "outputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "string", "name": "content", "type": "string" }, { "internalType": "bool", "name": "completed", "type": "bool" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "taskCount", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }
];

function App() {
  const [isEntered, setIsEntered] = useState(false);
  const [newItem, setNewItem] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = async () => {
    if (typeof window.ethereum === 'undefined') return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(contractAddress, abi, provider);
      const count = await contract.taskCount();
      const tempTasks = [];
      for (let i = 1; i <= Number(count); i++) {
        const task = await contract.tasks(i);
        tempTasks.push({ id: task[0], content: task[1], completed: task[2] });
      }
      setTasks(tempTasks);
    } catch (err) { console.error("Blockchain Sync Error:", err); }
  };

  useEffect(() => { if (isEntered) fetchTasks(); }, [isEntered]);

  const createTask = async () => {
    if (!newItem) return;
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.createTask(newItem);
      await tx.wait(); // WAITING FOR SEPOLIA MINING
      setNewItem("");
      fetchTasks();
    } catch (e) { console.error("Transaction Rejected:", e); }
    finally { setLoading(false); }
  };

  const toggleTask = async (id) => {
    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const tx = await contract.toggleCompleted(id);
      await tx.wait();
      fetchTasks();
    } catch (e) { console.error("Toggle Failed:", e); }
    finally { setLoading(false); }
  };

  if (!isEntered) {
    return (
      <div className="main-viewport">
        <div className="glass-container login-focus">
          <div className="scan-line"></div>
          <h1 className="neon-cyan">ENCRYPTED ACCESS</h1>
          <p className="node-id">CN6035 NODE: 0x688e...482e</p>
          <button className="initialize-btn" onClick={() => setIsEntered(true)}>AUTHORIZE WALLET</button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-viewport">
      {loading && (
        <div className="process-overlay">
          <div className="gear-3d">⚙️</div>
          <p className="loading-txt">MINING BLOCK ON SEPOLIA...</p>
        </div>
      )}

      <div className={`glass-container task-focus ${loading ? 'blurred' : ''}`}>
        <div className="panel-header">
          <h2 className="neon-magenta">SYSTEM_CORE_v2</h2>
          <span className="live-tag">TESTNET LIVE</span>
        </div>

        <div className="input-row">
          <input className="dark-input" type="text" placeholder="UPLOAD DATA..." value={newItem} onChange={(e) => setNewItem(e.target.value)} />
          <button className="add-task-btn" onClick={createTask}>+</button>
        </div>

        <div className="task-scroll">
          {tasks.map((task) => (
            <div key={Number(task.id)} className={`task-entry ${task.completed ? 'task-done' : ''}`} onClick={() => toggleTask(task.id)}>
              <span className="content">{task.content}</span>
              <div className="status-orb"></div>
            </div>
          ))}
        </div>
        <button className="disconnect-btn" onClick={() => setIsEntered(false)}>TERMINATE SESSION</button>
      </div>
    </div>
  );
}

export default App;