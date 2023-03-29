import React, { useEffect, useState } from 'react';
import ProcessLogsCard from '../ProcessLogsCard/ProcessLogsCard';
import ProcessLogsSelector from '../ProcessLogsSelector/ProcessLogsSelector';
import { ContainerType, RowsDataType } from '../../../types';
import { useAppSelector, useAppDispatch } from '../../reducers/hooks';

import { createAlert } from '../../reducers/alertReducer';
import useHelper from '../../helpers/commands';
import useSurvey from '../../helpers/dispatch';
import { buildOptionsObj } from '../../helpers/logs';

import { CSVLink } from 'react-csv';

import styles from './ProcessLogs.module.scss';
import globalStyles from '../global.module.scss';

/**
 * @module | Metrics.tsx
 * @description | Provides process logs for running containers & additional configuration options
**/


// TODO: add a second dropdown for time frame selection

type CSVData = string[];

const ProcessLogs = (): JSX.Element => {
  const { runningList, stoppedList } = useAppSelector(
    (state) => state.containers
  );
  const { stdout, stderr } = useAppSelector(
    (state) => state.logs.containerLogs
  );

  const runningBtnList = getContainerNames(runningList);

  const [btnIdList, setBtnIdList] = useState<object>(runningBtnList);
  const [timeFrameNum, setTimeFrameNum] = useState<string>();
  console.log(timeFrameNum);
  const [timeFrame, setTimeFrame] = useState<string>();
  console.log('hi', timeFrame);
  const [rows, setRows] = useState([] as any[]);
  const [csvData, setCsvData] = useState([
    ['container', 'type', 'time', 'message'],
  ] as any[]);
  const [counter, setCounter] = useState(0);

  const { getContainerLogsDispatcher } = useSurvey();
  const { getLogs } = useHelper();
  const dispatch = useAppDispatch();

  useEffect(() => {
    tableData();
  }, [counter, csvData.length]);

  function getContainerNames(containerList: ContainerType[]): {
    name: string;
    value: boolean;
  }{
    const newObj = {};
    containerList.forEach(({ Names }) => {
      newObj[Names] = false;
    });
    return newObj;
  }

  // takes in a btnIdList, passes that into buildObptionObj, then passes that into getLogs
  const handleGetLogs = async (idList: object) => {
    const idArr = Object.keys(idList).filter((el) => idList[el] === true);

    dispatch(createAlert('Loading process log information...', 5, 'success'));

    const optionsObj = buildOptionsObj(idArr, createTimeFrameStr(timeFrameNum, timeFrame));
    const containerLogs = await getLogs(optionsObj);

    getContainerLogsDispatcher(containerLogs);
    setCounter(counter + 1);

    return containerLogs;
  };
  
  // create the time frame string to be used in the docker logs command (e.g. 'docker logs <containerName> --since <timeFrameStr>')
  const createTimeFrameStr = (num, option) => option === 'd' ? `${num * 24}h` : `${num}${option}`;

  // Handle checkboxes
  const handleCheck = (name: string) => {
    const newBtnIdList = { ...btnIdList };

    if (newBtnIdList[name]) {
      newBtnIdList[name] = false;
    } else {
      newBtnIdList[name] = true;
    }

    setBtnIdList(newBtnIdList);
  };

  // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   console.log('e.target.value: ', e.target.value);
  //   setTimeFrame(e.target.value);
  // };

  const tableData = () => {
    const newRows: RowsDataType[] = [];
    const newCSV: CSVData[] = [];

    if (stdout.length) {
      stdout.forEach((log: { [k: string]: any }) => {
        const currCont = runningList.find(
          (el: ContainerType) => el.Names === log['containerName']
        );
        if (currCont) {
          newRows.push({
            container: currCont.Names,
            type: 'stdout',
            time: log['timeStamp'],
            message: log['logMsg'],
            id: Math.random() * 100,
          });
          newCSV.push([
            currCont.Names,
            'stdout',
            log['timeStamp'],
            log['logMsg'],
          ]);
        }
      });
    }
    if (stderr.length) {
      stderr.forEach((log: { [k: string]: any }, index: any) => {
        const currCont = runningList.find(
          (el: ContainerType) => el.Names === log['containerName']
        );
        if (currCont) {
          newRows.push({
            container: currCont.Names,
            type: 'stderr',
            time: log['timeStamp'],
            message: log['logMsg'],
            id: parseInt(index),
          });
          newCSV.push([
            currCont.Names,
            'stderr',
            log['timeStamp'],
            log['logMsg'],
          ]);
        }
      });
    }
    setRows(newRows as keyof typeof setRows);
    setCsvData([['container', 'type', 'time', 'message'], ...newCSV]);
  };


  return (
    <div className={styles.wrapper}>
      <div className={styles.runningContainersHolder}>
        <div className={styles.runningLeft}>
          <h2>RUNNING CONTAINERS</h2>
          <div>Count: {runningList.length}</div>
          <p>
            Please choose the running container(s) you would like to view
            process logs for.
          </p>
          <ProcessLogsSelector
            containerList={runningList}
            handleCheck={handleCheck}
            btnIdList={btnIdList}
          />

          <div className={styles.runningButtons}>
            <button
              className={globalStyles.button1}
              type="button"
              id="getlogs-btn"
              onClick={() => {
                handleGetLogs(btnIdList);
              }}
            >
              GET LOGS
            </button>
            <button className={globalStyles.button2} type="button">
              <CSVLink data={csvData}>DOWNLOAD CSV</CSVLink>
            </button>
          </div>
        </div>
        <div className={styles.runningRight}>
          <h2>TIME FRAME SELECTION</h2>
          <p>
            Please specify a timeframe that you would like to see process logs within.
          </p>
          
          {/* TODO: rename labels if neccessary */}
          <label htmlFor='num'>NUM</label>
          <input
            onChange={(e) => setTimeFrameNum(e.target.value)}
            className={globalStyles.inputShort}
            type="text"
            id="num"
          />
         
          <label htmlFor='logOption'>TIME FRAME:</label>
          <input onChange={(e) => setTimeFrame(e.target.value)} type="radio" name="logOption" value='m'/>Minutes
          <input onChange={(e) => setTimeFrame(e.target.value)} type="radio" name="logOption" value='h'/>Hours
          <input onChange={(e) => setTimeFrame(e.target.value)} type="radio" name="logOption" value='d'/>Days
          
        </div>
      </div>
      <div className={styles.logsHolder}>
        <h2>CONTAINER PROCESS LOGS</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>CONTAINER</th>
              <th>LOG TYPE</th>
              <th>TIMESTAMP</th>
              <th>MESSAGE</th>
            </tr>
          </thead>
          {rows.length > 0 ?
            rows.map((row, i) => {
              return (
                <tbody key={`${row - i}`}>
                  <tr>
                    <td>{row.container}</td>
                    <td>{row.type}</td>
                    <td>{row.time}</td>
                    <td>{row.message}</td>
                  </tr>
                </tbody>
              );
            })
            :
            <tbody>
              <tr>
                <td>Nothing</td>
                <td>to</td>
                <td>see</td>
                <td>here</td>
              </tr>
            </tbody>
          }
        </table>
      </div>
      <div className={styles.stoppedContainersHoler}>
        <h2>STOPPED CONTAINERS</h2>
        <div>Count: {stoppedList.length}</div>

        <div className={styles.cardHolder}>
          {stoppedList.map(
            (container: ContainerType, index: number): JSX.Element => (
              <ProcessLogsCard
                key={index}
                index={index}
                container={container}
                status="Stopped"
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default ProcessLogs;
