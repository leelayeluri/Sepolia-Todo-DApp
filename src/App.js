import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// 1. YOUR CONTRACT DETAILS
const contractAddress = "0xddaE8088562b315E92077005Fbf1a86B68BFBe92"; 
const abi = [
  "function createTask(string _content) public",
  "function getTasks() public view returns (tuple(uint256 id, string content, bool completed)[])"
];

function App() {
  const [taskContent, setTaskContent] = useState("");
  const [taskList, setTaskList] = useState([]);
  const [status, setStatus] = useState("Initializing...");

  // Fetch tasks on load
  useEffect(() => {
    fetchTasks();
  }, []);

  // READ DATA: Uses a Public RPC to bypass browser security blocks (CSP)
  async function fetchTasks() {
    try {
      const publicProvider = new ethers.JsonRpcProvider("https://rpc.ankr.com/eth_sepolia");
      const contract = new ethers.Contract(contractAddress, abi, publicProvider);
      
      const data = await contract.getTasks();
      const items = data.map(t => ({
        id: t[0].toString(),
        content: t[1],
        completed: t[2]
      }));
      
      setTaskList(items);
      setStatus("Tasks loaded successfully");
    } catch (err) {
      console.error("Fetch failed:", err);
      setStatus("Error loading tasks. Check Console.");
    }
  }

  // WRITE DATA: Still uses MetaMask to sign the transaction
  async function addTask() {
    if (!taskContent || !window.ethereum) {
        alert("Please enter a task and ensure MetaMask is connected.");
        return;
    }
    try {
      setStatus("Confirming in MetaMask...");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, abi, signer);
      
      const tx = await contract.createTask(taskContent);
      setStatus("Transaction pending...");
      await tx.wait();
      
      setTaskContent("");
      setStatus("Task added! Refreshing list...");
      fetchTasks();
    } catch (err) {
      console.error("Transaction failed:", err);
      setStatus("Transaction failed. Ensure you are on Sepolia.");
    }
  }

  return (
    <div style={{ padding: "50px", textAlign: "center", fontFamily: "sans-serif", backgroundColor: "#f4f4f9", minHeight: "100vh" }}>
      <h1>Blockchain Todo List</h1>
      <p><strong>Status:</strong> {status}</p>
      
      <div style={{ marginBottom: "30px" }}>
        <input 
          value={taskContent} 
          placeholder="New Task..."
          onChange={e => setTaskContent(e.target.value)} 
          style={{ padding: "10px", width: "250px", borderRadius: "5px", border: "1px solid #ccc" }} 
        />
        <button onClick={addTask} style={{ padding: "10px 20px", marginLeft: "10px", cursor: "pointer", borderRadius: "5px", backgroundColor: "#007bff", color: "#fff", border: "none" }}>
          Add Task
        </button>
      </div>

      <button onClick={fetchTasks} style={{ marginBottom: "20px", padding: "5px 15px", cursor: "pointer" }}>
        Refresh UI
      </button>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        {taskList.length > 0 ? (
          taskList.map((t, i) => (
            <div key={i} style={{ backgroundColor: "#fff", border: "1px solid #ddd", margin: "5px", padding: "15px", width: "350px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", display: "flex", justifyContent: "space-between" }}>
              <span>{t.content}</span>
              <span>{t.completed ? "✅" : "⏳"}</span>
            </div>
          ))
        ) : (
          <p>No tasks found on Sepolia. Try adding one!</p>
        )}
      </div>
    </div>
  );
}

export default App;