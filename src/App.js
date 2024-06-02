import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './App.css';
import InputBox from './InputBox';
import Button from './Button';

function App() {
  const [numProcesses, setNumProcesses] = useState('');
  const [arrivalTimes, setArrivalTimes] = useState('');
  const [burstTimes, setBurstTimes] = useState('');
  const [results, setResults] = useState(null);
  const [ganttChart, setGanttChart] = useState(null);

  const handleNumProcessesChange = (e) => {
    setNumProcesses(e.target.value);
    clearInputs();
  };

  const handleArrivalTimesChange = (e) => {
    setArrivalTimes(e.target.value.replace(/[^\d\s]+/g, ''));
  };

  const handleBurstTimesChange = (e) => {
    setBurstTimes(e.target.value.replace(/[^\d\s]+/g, ''));
  };

  const clearInputs = () => {
    setArrivalTimes('');
    setBurstTimes('');
    setResults(null);
    setGanttChart(null);
  };

  const validateInputs = () => {
    if (!numProcesses || !arrivalTimes || !burstTimes) {
      showErrorAlert('Please fill in all fields.');
      return false;
    }

    const arrivalTimesArray = arrivalTimes.trim().split(/\s+/).map(Number);
    const burstTimesArray = burstTimes.trim().split(/\s+/).map(Number);

    if (arrivalTimesArray.length !== parseInt(numProcesses) || burstTimesArray.length !== parseInt(numProcesses)) {
      showErrorAlert(`Arrival times must have exactly ${numProcesses} values and burst times must have exactly ${numProcesses} values.`);
      return false;
    }

    if (arrivalTimesArray.some(isNaN) || burstTimesArray.some(isNaN)) {
      showErrorAlert('Please enter valid arrival and burst times.');
      return false;
    }

    return true;
  };

  const calculateSJF = () => {
    if (!validateInputs()) {
      return;
    }

    const numProcessesInt = parseInt(numProcesses);
    const arrivalTimesArray = arrivalTimes.split(' ').map(Number);
    const burstTimesArray = burstTimes.split(' ').map(Number);

    const pid = [];
    const at = [];
    const bt = [];
    const ct = [];
    const ta = [];
    const wt = [];
    const visited = Array(numProcessesInt).fill(false);

    let st = 0;
    let tot = 0;
    let avgwt = 0;
    let avgta = 0;

    for (let i = 0; i < numProcessesInt; i++) {
      pid.push(i + 1);
      at.push(arrivalTimesArray[i]);
      bt.push(burstTimesArray[i]);
    }

    let ganttData = [];
    while (tot < numProcessesInt) {
      let minBt = Infinity;
      let selectedProcess = -1;

      for (let i = 0; i < numProcessesInt; i++) {
        if (!visited[i] && at[i] <= st && bt[i] < minBt) {
          minBt = bt[i];
          selectedProcess = i;
        }
      }

      if (selectedProcess === -1) {
        st++;
        ganttData.push({ id: 0, start: st - 1, end: st });
      } else {
        ct[selectedProcess] = st + bt[selectedProcess];
        st += bt[selectedProcess];
        ta[selectedProcess] = ct[selectedProcess] - at[selectedProcess];
        wt[selectedProcess] = ta[selectedProcess] - bt[selectedProcess];
        avgwt += wt[selectedProcess];
        avgta += ta[selectedProcess];
        visited[selectedProcess] = true;
        tot++;

        ganttData.push({ id: pid[selectedProcess], start: st - bt[selectedProcess], end: st });
      }
    }

    setResults({
      pid,
      at,
      bt,
      ct,
      ta,
      wt,
      avgta: (avgta / numProcessesInt).toFixed(2),
      avgwt: (avgwt / numProcessesInt).toFixed(2),
      avgct: ((st - 1) / numProcessesInt).toFixed(2),
    });
    setGanttChart(ganttData);
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
    });
  };

  const renderGanttChart = () => {
    const taskWidth = 70;
    const chartHeight = 50;
    const filteredGanttChart = ganttChart.filter(task => task.id !== 0);

    return (
      <div className="gantt-chart-container" style={{ display: 'flex', height: `${chartHeight}px` }}>
        {filteredGanttChart.map((task, index) => (
          <div
            key={index}
            className="task"
            style={{
              width: `${taskWidth}px`,
              height: '100%',
              backgroundColor: getRandomColor(),
            }}
          >
            {`P${task.id}`}
          </div>
        ))}
      </div>
    );
  };

  const getRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  return (
    <div className="container">
      <h1>Shortest Job First (SJF) CPU Scheduling Non-Preemptive Algorithm</h1>
      <div className="input-container">
        <InputBox
          label="Number of Processes"
          placeholder="Enter number of processes"
          value={numProcesses}
          onChange={handleNumProcessesChange}
          type="number"
        />
        <InputBox
          label="Arrival Times"
          placeholder="Example: 1 2 3 4"
          value={arrivalTimes}
          onChange={handleArrivalTimesChange}
          type="text"
        />
        <InputBox
          label="Burst Times"
          placeholder="Example: 2 4 6 8"
          value={burstTimes}
          onChange={handleBurstTimesChange}
          type="text"
        />
        <Button className="button-calculate-sjf" onClick={calculateSJF}>Calculate</Button>
      </div>
      {results && (
        <div id="results">
          <div className="table-container">
            <h1>Output:</h1>
            <table>
              <thead>
                <tr>
                  <th>Process ID</th>
                  <th>Arrival Time</th>
                  <th>Burst Time</th>
                  <th>Completion Time</th>
                  <th>Turnaround Time</th>
                  <th>Waiting Time</th>
                </tr>
              </thead>
              <tbody>
                {results.pid.map((processId, index) => (
                  <tr key={processId}>
                    <td>{processId}</td>
                    <td>{results.at[index]}</td>
                    <td>{results.bt[index]}</td>
                    <td>{results.ct[index]}</td>
                    <td>{results.ta[index]}</td>
                    <td>{results.wt[index]}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"></td>
                  <td>Average CT: {results.avgct}</td>
                  <td>Average TAT: {results.avgta}</td>
                  <td>Average WT: {results.avgwt}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <h1>Gantt Chart</h1>
          {renderGanttChart()}
        </div>
      )}
    </div>
  );
}

export default App;
